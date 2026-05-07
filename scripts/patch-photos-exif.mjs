/**
 * Patch favourite photo documents in Firestore with EXIF fields that were
 * missing from the initial upload (aperture, shutter_speed, focal_length).
 *
 * Reads firebase_doc_id + EXIF labels from the local manifest and sends a
 * field-masked PATCH for each favourite document.
 *
 * Usage:
 *   node scripts/patch-photos-exif.mjs           # dry run (shows what would change)
 *   node scripts/patch-photos-exif.mjs --write   # apply updates to Firestore
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { loadManifest } from "./photography-manifest-lib.mjs";

const CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const MANIFEST_PATH = ".private-data/photo-manifest.json";
const PROJECT_ID = "portfolio-9e62d";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
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

function encodeValue(value) {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  return { nullValue: null };
}

async function patchDocument(accessToken, docPath, fields, updateMaskFields) {
  const mask = updateMaskFields.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
  const url = `${FIRESTORE_BASE}/${docPath}?${mask}`;
  const body = {
    name: `projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`,
    fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, encodeValue(v)])),
  };
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH failed for ${docPath}: ${res.status} ${await res.text()}`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const write = process.argv.includes("--write");
  const manifestPath = path.resolve(MANIFEST_PATH);
  const manifest = await loadManifest(manifestPath);

  const favourites = manifest.records.filter(
    (r) => r.favourite === true && r.firebase_doc_id,
  );

  console.log(`Favourites with doc ID : ${favourites.length}`);
  console.log(`Mode                   : ${write ? "write" : "dry-run"}`);
  console.log("");

  const creds = write ? await loadServiceAccount(CREDENTIALS_PATH) : null;
  const accessToken = write ? await fetchAccessToken(creds) : null;

  let patched = 0;
  let skipped = 0;

  for (const record of favourites) {
    const aperture = typeof record.aperture_label === "string" ? record.aperture_label : null;
    const shutter_speed = typeof record.shutter_speed_label === "string" ? record.shutter_speed_label : null;
    const focal_length =
      typeof record.focal_length_35mm_label === "string"
        ? Number.parseFloat(record.focal_length_35mm_label)
        : null;

    if (!aperture && !shutter_speed && focal_length === null) {
      skipped++;
      continue;
    }

    const fields = {};
    const maskFields = [];
    if (aperture) { fields.aperture = aperture; maskFields.push("aperture"); }
    if (shutter_speed) { fields.shutter_speed = shutter_speed; maskFields.push("shutter_speed"); }
    if (focal_length !== null && Number.isFinite(focal_length)) {
      fields.focal_length = focal_length;
      maskFields.push("focal_length");
    }

    const file = String(record.file_path).split(/[/\\]/).pop();
    const docPath = `photos/${record.firebase_doc_id}`;

    console.log(`  ${write ? "PATCH" : "would patch"} ${file}  →  ${docPath}`);
    console.log(`    aperture=${aperture}  shutter=${shutter_speed}  focal=${focal_length}`);

    if (write) {
      await patchDocument(accessToken, docPath, fields, maskFields);
    }
    patched++;
  }

  console.log("");
  console.log(`Patched  : ${patched}`);
  console.log(`Skipped  : ${skipped} (no EXIF data in manifest)`);
  if (!write) {
    console.log("");
    console.log("Dry run only. Re-run with --write to apply updates.");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
