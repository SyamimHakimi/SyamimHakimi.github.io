/**
 * Recompute theme statistics from the local manifest and write only
 * statistics/theme-stats to Firestore. All other stat documents are
 * left untouched.
 *
 * Usage:
 *   node --env-file=.env scripts/write-theme-stats.mjs [--write] [--manifest <path>]
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

import { loadManifest } from "./photography-manifest-lib.mjs";
import { buildDerivedStatistics } from "./photography-stats-lib.mjs";
import { manifestRecordsToStatsRecords } from "./photography-manifest-lib.mjs";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const DEFAULT_MANIFEST_PATH = ".private-data/photo-manifest.json";

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

async function loadServiceAccount(credentialsPath) {
  const raw = await readFile(credentialsPath, "utf8");
  const credentials = JSON.parse(raw);
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Service account JSON missing client_email or private_key.");
  }
  return credentials;
}

function createJwtAssertion(credentials) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const encodedHeader = base64UrlEncode(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  );
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  return `${unsignedToken}.${base64UrlEncode(signer.sign(credentials.private_key))}`;
}

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
    throw new Error(
      `OAuth token exchange failed: ${response.status} ${await response.text()}`,
    );
  }
  const payload = await response.json();
  return payload.access_token;
}

function encodeFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: { values: value.map((item) => encodeFirestoreValue(item)) },
    };
  }
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, encodeFirestoreValue(v)]),
      ),
    },
  };
}

async function writeDocument(accessToken, projectId, documentPath, data) {
  const documentName = `projects/${projectId}/databases/(default)/documents/${documentPath}`;
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: documentName,
              fields: Object.fromEntries(
                Object.entries(data)
                  .filter(([, v]) => v !== undefined)
                  .map(([k, v]) => [k, encodeFirestoreValue(v)]),
              ),
            },
          },
        ],
      }),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Firestore write failed for ${documentPath}: ${response.status} ${await response.text()}`,
    );
  }
}

async function main() {
  let write = false;
  let manifestPath = DEFAULT_MANIFEST_PATH;
  let credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH;

  for (let i = 0; i < process.argv.length; i += 1) {
    if (process.argv[i] === "--write") write = true;
    if (process.argv[i] === "--manifest") manifestPath = process.argv[i + 1];
    if (process.argv[i] === "--credentials")
      credentialsPath = process.argv[i + 1];
  }

  const manifest = await loadManifest(manifestPath);
  const statsRecords = manifestRecordsToStatsRecords(manifest.records);
  const batch = buildDerivedStatistics(statsRecords);

  console.log(`Manifest records: ${manifest.records.length}`);
  console.log(`Records with theme: ${statsRecords.filter((r) => r.themeLabel).length}`);
  console.log("");
  console.log("statistics/theme-stats");
  console.log(JSON.stringify(batch.themeStats, null, 2));

  if (!write) {
    console.log("");
    console.log("Dry run. Re-run with --write to update Firestore.");
    return;
  }

  const credentials = await loadServiceAccount(credentialsPath);
  const accessToken = await fetchAccessToken(credentials);
  await writeDocument(
    accessToken,
    credentials.project_id,
    "statistics/theme-stats",
    batch.themeStats,
  );
  console.log("");
  console.log("statistics/theme-stats updated successfully.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
