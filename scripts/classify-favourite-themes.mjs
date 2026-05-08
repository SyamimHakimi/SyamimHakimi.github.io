/**
 * Run CLIP zero-shot image classification on all favourite photos that do not
 * yet have a theme_suggested value, then optionally write results back to the
 * manifest and patch the Firestore `theme` field on each document.
 *
 * Classification uses the Firebase Storage download_url stored in the manifest
 * so no local image files are needed.
 *
 * Usage:
 *   node scripts/classify-favourite-themes.mjs           # dry run (preview only)
 *   node scripts/classify-favourite-themes.mjs --write   # save manifest + patch Firestore
 *   node scripts/classify-favourite-themes.mjs --all     # re-classify even if theme exists
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pipeline } from "@huggingface/transformers";
import {
  loadManifest,
  saveManifest,
} from "./photography-manifest-lib.mjs";

const CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const MANIFEST_PATH = ".private-data/photo-manifest.json";
const PROJECT_ID = "portfolio-9e62d";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CLIP_MODEL = "Xenova/clip-vit-base-patch32";
const THEME_LABELS = [
  "Portrait",
  "Street",
  "Travel",
  "Architecture",
  "Nature",
  "Event",
  "Abstract",
];
const MIN_SCORE = 0.0; // keep all predictions; filter manually if needed

// ── Auth helpers ────────────────────────────────────────────────────────────

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

async function loadServiceAccount(credentialsPath) {
  const raw = await readFile(credentialsPath, "utf8");
  const creds = JSON.parse(raw);
  if (!creds.client_email || !creds.private_key) {
    throw new Error("Service account JSON missing client_email or private_key.");
  }
  return creds;
}

function createJwtAssertion(creds) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: creds.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64UrlEncode(signer.sign(creds.private_key))}`;
}

async function fetchAccessToken(creds) {
  const res = await fetch(creds.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createJwtAssertion(creds),
    }),
  });
  if (!res.ok) throw new Error(`OAuth failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

// ── Firestore helpers ───────────────────────────────────────────────────────

async function patchTheme(accessToken, docId, theme) {
  const docPath = `photos/${docId}`;
  const url = `${FIRESTORE_BASE}/${docPath}?updateMask.fieldPaths=theme`;
  const body = {
    name: `projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`,
    fields: { theme: { stringValue: theme } },
  };
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH failed for ${docId}: ${res.status} ${await res.text()}`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const write = process.argv.includes("--write");
  const reclassifyAll = process.argv.includes("--all");

  const manifestPath = path.resolve(MANIFEST_PATH);
  const manifest = await loadManifest(manifestPath);

  // All uploaded favourites are targets:
  //   - already classified (theme_suggested set) → sync existing value to Firestore, skip CLIP
  //   - theme_final set → sync override to Firestore, skip CLIP
  //   - unclassified (no theme_suggested) → run CLIP then sync
  //   - --all → run CLIP for everyone regardless
  const targets = manifest.records.filter(
    (r) => r.favourite === true && r.firebase_doc_id,
  );

  const clipTargets = targets.filter(
    (r) => reclassifyAll || (!r.theme_final && !r.theme_suggested),
  );

  console.log(`Favourites to classify : ${targets.length} (${clipTargets.length} via CLIP, ${targets.length - clipTargets.length} sync only)`);
  console.log(`Mode                   : ${write ? "write" : "dry-run"}`);

  let classifier = null;
  if (clipTargets.length > 0) {
    console.log("Loading CLIP model…");
    classifier = await pipeline(
      "zero-shot-image-classification",
      CLIP_MODEL,
      { dtype: "fp32" },
    );
    console.log("Model ready. Classifying…\n");
  }

  const creds = write ? await loadServiceAccount(CREDENTIALS_PATH) : null;
  const accessToken = write ? await fetchAccessToken(creds) : null;

  const results = [];

  for (const record of targets) {
    const file = String(record.file_path).split("\\").at(-1);

    // Sync theme_final overrides to Firestore without re-running CLIP
    if (record.theme_final && !reclassifyAll) {
      console.log(`  ${file}  →  ${record.theme_final}  (theme_final override)`);
      if (write && record.firebase_doc_id) {
        await patchTheme(accessToken, String(record.firebase_doc_id), record.theme_final);
      }
      continue;
    }

    // Already classified — sync theme_suggested to Firestore without re-running CLIP
    if (record.theme_suggested && !reclassifyAll) {
      console.log(`  ${file}  →  ${record.theme_suggested}  (already classified, syncing)`);
      if (write && record.firebase_doc_id) {
        await patchTheme(accessToken, String(record.firebase_doc_id), record.theme_suggested);
      }
      continue;
    }

    if (!record.download_url) {
      console.error(`  SKIP ${file}: no download_url`);
      continue;
    }

    let label = null;
    let score = null;

    try {
      const predictions = await classifier(
        String(record.download_url),
        THEME_LABELS,
        { hypothesis_template: "This is a photo of {}." },
      );
      const top = Array.isArray(predictions) ? predictions[0] : null;
      if (top && top.score >= MIN_SCORE) {
        label = top.label;
        score = top.score;
      }
    } catch (err) {
      console.error(`  ERROR classifying ${file}: ${err.message}`);
    }

    const scoreStr = score !== null ? score.toFixed(3) : "n/a";
    console.log(`  ${file}  →  ${label ?? "(none)"}  (${scoreStr})`);

    results.push({ record, label, score });

    if (write && label && record.firebase_doc_id) {
      // Respect manual theme_final override — it takes precedence over CLIP prediction
      const effectiveTheme = record.theme_final ?? label;
      await patchTheme(accessToken, String(record.firebase_doc_id), effectiveTheme);
    }
  }

  if (write) {
    // Update manifest with theme_suggested and theme_suggestion_score
    const updatedRecords = manifest.records.map((r) => {
      const result = results.find((res) => res.record === r);
      // Skip records not in this run, and preserve existing theme when classification failed
      if (!result || result.label === null) return r;
      return {
        ...r,
        theme_suggested: result.label,
        theme_suggestion_score: result.score,
        theme_model: CLIP_MODEL,
      };
    });
    await saveManifest(manifestPath, updatedRecords);
    console.log("\nManifest updated.");
  } else {
    console.log("\nDry run only. Re-run with --write to save results.");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
