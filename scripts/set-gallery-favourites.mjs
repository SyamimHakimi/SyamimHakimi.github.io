/**
 * Bulk-mark the curated favourite photos in the local manifest.
 *
 * Replaces the entire favourite selection from scratch:
 *   - Matched entries → favourite: true + title set
 *   - All other entries → favourite cleared (false)
 *
 * Usage:
 *   node scripts/set-gallery-favourites.mjs           # dry run
 *   node scripts/set-gallery-favourites.mjs --write   # persist to manifest
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { loadManifest, saveManifest } from "./photography-manifest-lib.mjs";

const DEFAULT_MANIFEST_PATH = ".private-data/photo-manifest.json";
const CREDENTIALS_PATH = "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const PROJECT_ID = "portfolio-9e62d";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Auth helpers ──────────────────────────────────────────────────────────────

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64")
    .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function loadServiceAccount(p) {
  return JSON.parse(await readFile(p, "utf8"));
}

function createJwtAssertion(creds) {
  const iat = Math.floor(Date.now() / 1000);
  const hdr = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const pay = base64UrlEncode(JSON.stringify({
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: creds.token_uri ?? "https://oauth2.googleapis.com/token",
    iat,
    exp: iat + 3600,
  }));
  const unsigned = `${hdr}.${pay}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64UrlEncode(signer.sign(creds.private_key))}`;
}

async function fetchAccessToken(creds) {
  const r = await fetch(creds.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createJwtAssertion(creds),
    }),
  });
  if (!r.ok) throw new Error(`OAuth failed: ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
}

async function patchFavourite(accessToken, docId, value) {
  const url = `${FIRESTORE_BASE}/photos/${docId}?updateMask.fieldPaths=favourite`;
  const body = {
    name: `projects/${PROJECT_ID}/databases/(default)/documents/photos/${docId}`,
    fields: { favourite: { booleanValue: value } },
  };
  const r = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH failed for ${docId}: ${r.status} ${await r.text()}`);
}

async function patchFavouriteAndTitle(accessToken, docId, title) {
  const url = `${FIRESTORE_BASE}/photos/${docId}?updateMask.fieldPaths=favourite&updateMask.fieldPaths=title`;
  const body = {
    name: `projects/${PROJECT_ID}/databases/(default)/documents/photos/${docId}`,
    fields: { favourite: { booleanValue: true }, title: { stringValue: title } },
  };
  const r = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH failed for ${docId}: ${r.status} ${await r.text()}`);
}

// ── Curated list ─────────────────────────────────────────────────────────────

const FAVOURITES = [
  // 959_FUJI
  { folder: "959_FUJI", file: "DSCF9388.JPG", title: "hard worker" },
  { folder: "959_FUJI", file: "DSCF9432.JPG", title: "target spotted" },
  { folder: "959_FUJI", file: "DSCF9450.JPG", title: "pounce" },
  { folder: "959_FUJI", file: "DSCF9459.JPG", title: "personal space" },
  { folder: "959_FUJI", file: "DSCF9492.JPG", title: "fluff" },
  { folder: "959_FUJI", file: "DSCF9568.JPG", title: "starbucks" },
  { folder: "959_FUJI", file: "DSCF9996.JPG", title: "detective work" },
  // 960_FUJI
  { folder: "960_FUJI", file: "DSCF0012.JPG", title: "pink bud" },
  { folder: "960_FUJI", file: "DSCF0023.JPG", title: "morning breeze" },
  { folder: "960_FUJI", file: "DSCF0054.JPG", title: "oreo" },
  { folder: "960_FUJI", file: "DSCF0097.JPG", title: "crawlers" },
  { folder: "960_FUJI", file: "DSCF0191.JPG", title: "early season" },
  { folder: "960_FUJI", file: "DSCF0296.JPG", title: "out" },
  { folder: "960_FUJI", file: "DSCF0483.JPG", title: "white door" },
  { folder: "960_FUJI", file: "DSCF0542.JPG", title: "mee kuah" },
  { folder: "960_FUJI", file: "DSCF0581.JPG", title: "isolate" },
  { folder: "960_FUJI", file: "DSCF0708.JPG", title: "morning grub" },
  { folder: "960_FUJI", file: "DSCF0713.JPG", title: "sunshine" },
  { folder: "960_FUJI", file: "DSCF0730.JPG", title: "coconut" },
  { folder: "960_FUJI", file: "DSCF0805.JPG", title: "two bird" },
  { folder: "960_FUJI", file: "DSCF0819.JPG", title: "red bud" },
  { folder: "960_FUJI", file: "DSCF0861.JPG", title: "field walk" },
  // 961_FUJI
  { folder: "961_FUJI", file: "DSCF1239.JPG", title: "calm river" },
  { folder: "961_FUJI", file: "DSCF1783.JPG", title: "fish frenzy" },
  { folder: "961_FUJI", file: "DSCF1981.JPG", title: "hunt mode" },
  { folder: "961_FUJI", file: "DSCF1992.JPG", title: "grass eater" },
  { folder: "961_FUJI", file: "DSCF1996.JPG", title: "swirl" },
  // 962_FUJI
  { folder: "962_FUJI", file: "DSCF2004.JPG", title: "pounce" },
  { folder: "962_FUJI", file: "DSCF2010.JPG", title: "cat life" },
  { folder: "962_FUJI", file: "DSCF2088.JPG", title: "tin lake" },
  { folder: "962_FUJI", file: "DSCF2104.JPG", title: "tree shade" },
  { folder: "962_FUJI", file: "DSCF2105.JPG", title: "white bridge" },
  { folder: "962_FUJI", file: "DSCF2111.JPG", title: "travelling lizard" },
  { folder: "962_FUJI", file: "DSCF2579.JPG", title: "spotlight" },
  { folder: "962_FUJI", file: "DSCF2705.JPG", title: "jackfruit" },
  { folder: "962_FUJI", file: "DSCF2722.JPG", title: "observer" },
  { folder: "962_FUJI", file: "DSCF2748.JPG", title: "hypnotizing duck" },
  { folder: "962_FUJI", file: "DSCF2804.JPG", title: "carrot parrot" },
  { folder: "962_FUJI", file: "DSCF2841.JPG", title: "onlooker" },
  { folder: "962_FUJI", file: "DSCF2971.JPG", title: "small road" },
  { folder: "962_FUJI", file: "DSCF2975.JPG", title: "hibiscus" },
  { folder: "962_FUJI", file: "DSCF2997.JPG", title: "white dress" },
  // 963_FUJI
  { folder: "963_FUJI", file: "DSCF3012.JPG", title: "pink trumpets" },
  { folder: "963_FUJI", file: "DSCF3016.JPG", title: "serene stroll" },
  { folder: "963_FUJI", file: "DSCF3046.JPG", title: "red pastel" },
  { folder: "963_FUJI", file: "DSCF3047.JPG", title: "pink pastel" },
  { folder: "963_FUJI", file: "DSCF3085.JPG", title: "sunkissed" },
  { folder: "963_FUJI", file: "DSCF3101.JPG", title: "high tea" },
  { folder: "963_FUJI", file: "DSCF3130.JPG", title: "peak" },
  { folder: "963_FUJI", file: "DSCF3173.JPG", title: "hidden sunrise" },
  { folder: "963_FUJI", file: "DSCF3209.JPG", title: "strawberry" },
  { folder: "963_FUJI", file: "DSCF3264.JPG", title: "western imitation" },
  { folder: "963_FUJI", file: "DSCF3278.JPG", title: "crossroad" },
  { folder: "963_FUJI", file: "DSCF3282.JPG", title: "grey pillar" },
  { folder: "963_FUJI", file: "DSCF3289.JPG", title: "vast cloud" },
  { folder: "963_FUJI", file: "DSCF3304.JPG", title: "laksa penang" },
  { folder: "963_FUJI", file: "DSCF3381.JPG", title: "ride around" },
  { folder: "963_FUJI", file: "DSCF3526.JPG", title: "fun sunset" },
  { folder: "963_FUJI", file: "DSCF3597.JPG", title: "lakeside mall" },
  { folder: "963_FUJI", file: "DSCF3599.JPG", title: "novel gal" },
  { folder: "963_FUJI", file: "DSCF3786.JPG", title: "blue lighthouse" },
  { folder: "963_FUJI", file: "DSCF3836.JPG", title: "little friends" },
  { folder: "963_FUJI", file: "DSCF3874.JPG", title: "afternoon wave" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a normalised lookup key: "959_FUJI/DSCF9388.JPG" (lowercase) */
function lookupKey(folder, file) {
  return `${folder}/${file}`.toLowerCase();
}

/** Extract folder and filename from a manifest file_path string.
 * Splits on both backslash and forward slash so the script runs correctly
 * on Windows, macOS, and Linux regardless of how the path was stored. */
function keyFromFilePath(filePath) {
  const parts = String(filePath).replaceAll("\\", "/").split("/");
  const file = parts.at(-1) ?? "";
  const folder = parts.at(-2) ?? "";
  return `${folder}/${file}`.toLowerCase();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const write = process.argv.includes("--write");
  const manifestPath = path.resolve(DEFAULT_MANIFEST_PATH);
  const manifest = await loadManifest(manifestPath);

  // Build lookup map: key → title
  const favouriteMap = new Map(
    FAVOURITES.map((entry) => [lookupKey(entry.folder, entry.file), entry.title]),
  );

  const matched = [];
  const notFound = [];
  const reFavourited = []; // uploaded records where favourite or title changed

  const updatedRecords = manifest.records.map((record) => {
    const key = keyFromFilePath(record.file_path);
    const title = favouriteMap.get(key);

    if (title !== undefined) {
      matched.push({ key, title });
      // Track if this already-uploaded record needs a Firestore sync
      if (record.firebase_doc_id && (record.favourite !== true || record.title !== title)) {
        reFavourited.push({ record, title });
      }
      return { ...record, favourite: true, title };
    }

    // Set favourite: false explicitly so downstream tools can filter by boolean false
    return { ...record, favourite: false };
  });

  // Report any entries in FAVOURITES that had no manifest match
  for (const entry of FAVOURITES) {
    const key = lookupKey(entry.folder, entry.file);
    if (!matched.some((m) => m.key === key)) {
      notFound.push(key);
    }
  }

  console.log(`Manifest path : ${manifestPath}`);
  console.log(`Total records : ${manifest.records.length}`);
  console.log(`Favourites    : ${FAVOURITES.length} in list, ${matched.length} matched`);
  console.log(`Mode          : ${write ? "write" : "dry-run"}`);
  console.log("");

  console.log("Matched:");
  for (const { key, title } of matched) {
    console.log(`  ✓  ${key}  →  "${title}"`);
  }

  if (notFound.length > 0) {
    console.log("");
    console.log("NOT FOUND in manifest (check filenames):");
    for (const key of notFound) {
      console.log(`  ✗  ${key}`);
    }
    console.error(`\nERROR: ${notFound.length} FAVOURITES entry(ies) not found in manifest. Fix filenames before running --write.`);
    process.exitCode = 1;
    return;
  }

  // Records that were uploaded but are no longer in the favourite list — need Firestore sync
  const deFavourited = manifest.records.filter(
    (r) => r.favourite === true && r.firebase_doc_id && !favouriteMap.has(keyFromFilePath(r.file_path)),
  );
  if (reFavourited.length > 0) {
    console.log("");
    console.log(`Newly favourited / title changed (uploaded, will patch Firestore): ${reFavourited.length}`);
    for (const { record, title } of reFavourited) {
      console.log(`  + ${keyFromFilePath(record.file_path)}  →  "${title}"  (${record.firebase_doc_id})`);
    }
  }

  if (deFavourited.length > 0) {
    console.log("");
    console.log(`De-favourited (uploaded, will patch Firestore): ${deFavourited.length}`);
    for (const r of deFavourited) {
      console.log(`  - ${keyFromFilePath(r.file_path)}  (${r.firebase_doc_id})`);
    }
  }

  if (!write) {
    console.log("");
    console.log("Dry run only. Re-run with --write to update the manifest.");
    return;
  }

  // Patch Firestore first — manifest is saved only after all remote updates succeed
  // so failures are retryable on the next run.
  if (reFavourited.length > 0 || deFavourited.length > 0) {
    const creds = await loadServiceAccount(CREDENTIALS_PATH);
    const token = await fetchAccessToken(creds);

    if (reFavourited.length > 0) {
      console.log("Patching Firestore for newly favourited photos ...");
      for (const { record, title } of reFavourited) {
        await patchFavouriteAndTitle(token, String(record.firebase_doc_id), title);
        console.log(`  ✓ favourite: true + title → photos/${record.firebase_doc_id}`);
      }
    }

    if (deFavourited.length > 0) {
      console.log("Patching Firestore for de-favourited photos ...");
      for (const r of deFavourited) {
        await patchFavourite(token, String(r.firebase_doc_id), false);
        console.log(`  ✓ favourite: false → photos/${r.firebase_doc_id}`);
      }
    }
  }

  await saveManifest(manifestPath, updatedRecords);
  console.log("");
  console.log("Manifest updated.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
