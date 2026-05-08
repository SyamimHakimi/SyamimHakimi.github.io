/**
 * Wipe all photo data from Firebase — Firestore collection AND Storage objects.
 *
 * Deletes:
 *   - Every document in the Firestore `photos` collection
 *   - Every object in Firebase Storage (root-level legacy PNGs + photos/ prefix)
 *
 * Usage:
 *   node scripts/wipe-photos.mjs          # dry run — lists what would be deleted
 *   node scripts/wipe-photos.mjs --write  # actually deletes everything
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  loadManifest,
  saveManifest,
} from "./photography-manifest-lib.mjs";

const CREDENTIALS_PATH = "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const BUCKET = "portfolio-9e62d.firebasestorage.app";
const MANIFEST_PATH = ".private-data/photo-manifest.json";
const FIRESTORE_BATCH_SIZE = 400; // well under the 500-write Firestore commit limit

// ── Auth ─────────────────────────────────────────────────────────────────────

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64")
    .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function loadServiceAccount(p) {
  return JSON.parse(await readFile(p, "utf8"));
}

function createJwtAssertion(credentials) {
  const iat = Math.floor(Date.now() / 1000);
  const hdr = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const pay = base64UrlEncode(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.full_control",
    aud: credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    iat,
    exp: iat + 3600,
  }));
  const unsigned = `${hdr}.${pay}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64UrlEncode(signer.sign(credentials.private_key))}`;
}

async function fetchAccessToken(credentials) {
  const r = await fetch(
    credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createJwtAssertion(credentials),
      }),
    },
  );
  if (!r.ok) throw new Error(`OAuth failed: ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

/**
 * List all document names in a Firestore collection (paginated).
 *
 * @param {string} token
 * @param {string} projectId
 * @param {string} collectionId
 * @returns {Promise<string[]>} full resource names
 */
async function listCollectionDocs(token, projectId, collectionId) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionId}`;
  const names = [];
  let pageToken = "";

  do {
    const url = pageToken ? `${base}?pageToken=${encodeURIComponent(pageToken)}&pageSize=300` : `${base}?pageSize=300`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`List failed: ${r.status} ${await r.text()}`);
    const data = await r.json();
    for (const doc of data.documents ?? []) {
      names.push(doc.name);
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return names;
}

/**
 * Batch-delete Firestore documents using the commit API.
 * Firestore commit accepts up to 500 writes per request.
 *
 * @param {string} token
 * @param {string} projectId
 * @param {string[]} docNames  full resource names
 */
async function batchDeleteFirestoreDocs(token, projectId, docNames) {
  for (let i = 0; i < docNames.length; i += FIRESTORE_BATCH_SIZE) {
    const batch = docNames.slice(i, i + FIRESTORE_BATCH_SIZE);
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ writes: batch.map((name) => ({ delete: name })) }),
      },
    );
    if (!r.ok) throw new Error(`Batch delete failed: ${r.status} ${await r.text()}`);
    console.log(`  Deleted Firestore docs ${i + 1}–${Math.min(i + FIRESTORE_BATCH_SIZE, docNames.length)}`);
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/**
 * List all object names in a Storage bucket under a given prefix.
 *
 * @param {string} token
 * @param {string} bucket
 * @param {string} prefix
 * @returns {Promise<string[]>}
 */
async function listStorageObjects(token, bucket, prefix) {
  const objects = [];
  let pageToken = "";

  do {
    const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o?prefix=${encodeURIComponent(prefix)}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Storage list failed: ${r.status} ${await r.text()}`);
    const data = await r.json();
    for (const item of data.items ?? []) {
      objects.push(item.name);
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return objects;
}

/**
 * Delete a single Storage object.
 *
 * @param {string} token
 * @param {string} bucket
 * @param {string} objectName
 */
async function deleteStorageObject(token, bucket, objectName) {
  const r = await fetch(
    `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(objectName)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!r.ok && r.status !== 404) {
    throw new Error(`Storage delete failed for ${objectName}: ${r.status} ${await r.text()}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const write = process.argv.includes("--write");

  const credentials = await loadServiceAccount(CREDENTIALS_PATH);
  const token = await fetchAccessToken(credentials);
  const projectId = credentials.project_id;

  // --- Firestore ---
  console.log("Listing Firestore photos collection ...");
  const firestoreDocs = await listCollectionDocs(token, projectId, "photos");
  console.log(`  Found ${firestoreDocs.length} document(s)`);
  for (const name of firestoreDocs) {
    const id = name.split("/").pop();
    console.log(`  - photos/${id}`);
  }

  // --- Storage ---
  // List ALL objects — legacy images are at bucket root (e.g. 0020-3.png),
  // newer uploads are under photos/ prefix. No prefix filter needed.
  console.log("\nListing Storage objects (all) ...");
  const storageObjects = await listStorageObjects(token, BUCKET, "");
  console.log(`  Found ${storageObjects.length} object(s)`);
  for (const name of storageObjects) {
    console.log(`  - ${name}`);
  }

  if (!write) {
    console.log("\nDry run only. Re-run with --write to delete everything above.");
    return;
  }

  // --- Delete Firestore docs ---
  if (firestoreDocs.length > 0) {
    console.log("\nDeleting Firestore documents ...");
    await batchDeleteFirestoreDocs(token, projectId, firestoreDocs);
    console.log(`  ✓ ${firestoreDocs.length} Firestore document(s) deleted`);
  }

  // --- Delete Storage objects ---
  if (storageObjects.length > 0) {
    console.log("\nDeleting Storage objects ...");
    for (const name of storageObjects) {
      await deleteStorageObject(token, BUCKET, name);
      console.log(`  ✓ Deleted ${name}`);
    }
  }

  // Reset manifest upload state so subsequent uploads don't treat wiped photos as already uploaded
  const manifestPath = path.resolve(MANIFEST_PATH);
  const manifest = await loadManifest(manifestPath);
  const UPLOAD_FIELDS = new Set(["uploaded", "firebase_doc_id", "storage_path", "download_url", "storage_download_token"]);
  const clearedRecords = manifest.records.map((r) =>
    Object.fromEntries(Object.entries(r).filter(([k]) => !UPLOAD_FIELDS.has(k))),
  );
  await saveManifest(manifestPath, clearedRecords);
  console.log("\nManifest upload state cleared.");

  console.log("\nWipe complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
