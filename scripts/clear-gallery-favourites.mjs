/**
 * Clear the `favourite` flag on every document in the `photos` collection.
 *
 * Finds all docs where `favourite == true` and patches them to `favourite: false`
 * using the Firestore REST API with an updateMask so no other fields are touched.
 *
 * Usage:
 *   node scripts/clear-gallery-favourites.mjs          # dry run — lists affected docs
 *   node scripts/clear-gallery-favourites.mjs --write  # actually clears the flags
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createSign } from "node:crypto";
import { loadManifest, saveManifest } from "./photography-manifest-lib.mjs";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const DEFAULT_MANIFEST_PATH = ".private-data/photo-manifest.json";

// ── Args ────────────────────────────────────────────────────────────────────

const write = process.argv.includes("--write");

// ── Auth helpers (same JWT → OAuth pattern as other update scripts) ──────────

/**
 * @param {string | Buffer} input
 * @returns {string}
 */
function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

/**
 * @param {string} credentialsPath
 * @returns {Promise<Record<string, string>>}
 */
async function loadServiceAccount(credentialsPath) {
  const raw = await readFile(credentialsPath, "utf8");
  const credentials = JSON.parse(raw);
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Service account JSON is missing client_email or private_key.");
  }
  return credentials;
}

/**
 * @param {Record<string, string>} credentials
 * @returns {string}
 */
function createJwtAssertion(credentials) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  return `${unsignedToken}.${base64UrlEncode(signer.sign(credentials.private_key))}`;
}

/**
 * @param {Record<string, string>} credentials
 * @returns {Promise<string>}
 */
async function fetchAccessToken(credentials) {
  const response = await fetch(
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
  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.status} ${await response.text()}`);
  }
  const payload = await response.json();
  return payload.access_token;
}

// ── Firestore helpers ────────────────────────────────────────────────────────

/**
 * Run a structured query and return all matching document names + fields.
 *
 * @param {string} accessToken
 * @param {string} projectId
 * @returns {Promise<Array<{ name: string, id: string }>>}
 */
async function queryFavouritePhotos(accessToken, projectId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "photos" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "favourite" },
          op: "EQUAL",
          value: { booleanValue: true },
        },
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`runQuery failed: ${response.status} ${await response.text()}`);
  }

  const results = await response.json();

  // Each result is either { document: { name, fields } } or { skippedResults }
  return results
    .filter((r) => r.document?.name)
    .map((r) => {
      const name = r.document.name;
      // Extract the doc ID from the full resource name
      const id = name.split("/").pop();
      return { name, id };
    });
}

/**
 * Patch a single photo document to set favourite: false.
 * Uses updateMask so no other fields are touched.
 *
 * @param {string} accessToken
 * @param {string} documentName  — full resource name
 * @returns {Promise<void>}
 */
async function clearFavourite(accessToken, documentName) {
  const url = `https://firestore.googleapis.com/v1/${documentName}?updateMask.fieldPaths=favourite`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        favourite: { booleanValue: false },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `PATCH failed for ${documentName}: ${response.status} ${await response.text()}`,
    );
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const credentials = await loadServiceAccount(DEFAULT_CREDENTIALS_PATH);
  const accessToken = await fetchAccessToken(credentials);
  const projectId = credentials.project_id;

  console.log("Querying photos collection for favourite: true ...");
  const docs = await queryFavouritePhotos(accessToken, projectId);

  if (docs.length === 0) {
    console.log("No documents found with favourite: true in Firestore.");
  } else {
    console.log(`Found ${docs.length} document(s) with favourite: true:`);
    for (const doc of docs) {
      console.log(`  - ${doc.id}`);
    }
  }

  if (!write) {
    console.log("\nDry run only. Re-run with --write to clear all favourite flags.");
    return;
  }

  const clearedIds = new Set();

  if (docs.length > 0) {
    console.log("\nClearing favourite flags ...");
    for (const doc of docs) {
      await clearFavourite(accessToken, doc.name);
      clearedIds.add(doc.id);
      console.log(`  cleared: ${doc.id}`);
    }
  }

  // Sync manifest — clear ALL manifest favourites (uploaded and local-only) so a later
  // upload-photos-from-manifest run does not reintroduce photos the user just cleared.
  const manifestPath = path.resolve(DEFAULT_MANIFEST_PATH);
  const manifest = await loadManifest(manifestPath);
  const updatedRecords = manifest.records.map((r) =>
    r.favourite === true ? { ...r, favourite: false } : r,
  );
  await saveManifest(manifestPath, updatedRecords);
  console.log("Manifest favourite flags cleared.");

  console.log(`\nDone. ${docs.length} document(s) updated.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
