/**
 * One-shot script to add a new project + techstack to Firestore.
 * Usage: node --env-file=.env scripts/add-project.mjs [--write]
 *
 * Dry-run by default — pass --write to commit to Firestore.
 * Uses PATCH (idempotent upsert) with stable hardcoded IDs.
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";

const PROJECT_ID = "nas-raspberry-pi-2026";

const PROJECT_DATA = {
  title: "Self-hosted NAS",
  subtitle: "My photo archive",
  description:
    "Cloud storage limits and subscription fees got old fast. Built my own NAS on a Raspberry Pi to keep my photos and files at home — accessible from anywhere via Tailscale, managed through Immich for a proper photo library experience.",
  "date-from": "2026-01-31T00:00:00.000Z",
};

const TECHSTACK_ITEMS = [
  {
    id: "nas-tech-raspberry-pi",
    data: {
      title: "Raspberry Pi",
      link: "https://www.raspberrypi.com/",
      sorting: 1,
    },
  },
  {
    id: "nas-tech-immich",
    data: {
      title: "Immich",
      link: "https://immich.app/",
      sorting: 2,
    },
  },
  {
    id: "nas-tech-tailscale",
    data: {
      title: "Tailscale",
      link: "https://tailscale.com/",
      sorting: 3,
    },
  },
];

// ── Firestore helpers ─────────────────────────────────────────────────────────

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
    throw new Error(`OAuth token exchange failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()).access_token;
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
    return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { mapValue: { fields: encodeFirestoreFields(value) } };
}

function encodeFirestoreFields(data) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, encodeFirestoreValue(v)]),
  );
}

async function upsertDocument(accessToken, projectId, collectionPath, docId, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}/${docId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: encodeFirestoreFields(data) }),
  });
  if (!response.ok) {
    throw new Error(
      `Firestore upsert failed for ${collectionPath}/${docId}: ${response.status} ${await response.text()}`,
    );
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const write = process.argv.includes("--write");
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH;

console.log(`Mode: ${write ? "WRITE" : "DRY RUN"}\n`);
console.log(`[Project]`);
console.log(`  path : projects/${PROJECT_ID}`);
console.log(`  data :`, JSON.stringify(PROJECT_DATA, null, 4).split("\n").join("\n         "));
console.log();
console.log(`[Techstack] (projects/${PROJECT_ID}/techstack)`);
for (const item of TECHSTACK_ITEMS) {
  console.log(`  ${item.id} →`, JSON.stringify(item.data));
}
console.log();

if (!write) {
  console.log("Dry run complete. Pass --write to commit to Firestore.");
  process.exit(0);
}

const credentials = await loadServiceAccount(credentialsPath);
const accessToken = await fetchAccessToken(credentials);
const firestoreProjectId = credentials.project_id;

await upsertDocument(accessToken, firestoreProjectId, "projects", PROJECT_ID, PROJECT_DATA);
console.log(`✓ Upserted projects/${PROJECT_ID}`);

for (const item of TECHSTACK_ITEMS) {
  await upsertDocument(
    accessToken,
    firestoreProjectId,
    `projects/${PROJECT_ID}/techstack`,
    item.id,
    item.data,
  );
  console.log(`✓ Upserted techstack/${item.id} (${item.data.title})`);
}

console.log("\nAll documents written to Firestore.");
