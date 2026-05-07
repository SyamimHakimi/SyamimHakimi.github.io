/**
 * One-shot script to clean boardgame names and update tags in Firestore.
 * Usage: node scripts/update-boardgames.mjs [--write]
 *
 * Dry-run by default — pass --write to commit to Firestore.
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";

const UPDATES = [
  {
    id: "iUMxdCoiU8NB3Ex0ZnSf",
    fields: { name: "Heat: Pedal to the Metal", tags: "Racing, Sports" },
  },
  {
    id: "GKlcZy0a4IWIS0JdPV0u",
    fields: { name: "The Castles of Burgundy", tags: "Strategy, Tile Placement" },
  },
  {
    id: "OgsLzWztrdNiE3LaxVeJ",
    fields: { name: "A Fake Artist Goes to New York", tags: "Bluffing, Party Game" },
  },
  {
    id: "KgYbh2JVPGOmbPNunWbT",
    fields: { tags: "Cooperative, Real-time" },
  },
  {
    id: "bGXg5p2sGc4FuQkTHFl6",
    fields: { name: "Deception: Murder in Hong Kong", tags: "Social Deduction, Bluffing" },
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
  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
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

async function patchDocument(accessToken, projectId, docId, fields) {
  const mask = Object.keys(fields)
    .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
    .join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/favourite-boardgames/${docId}?${mask}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, { stringValue: v }]),
      ),
    }),
  });
  if (!response.ok) {
    throw new Error(`Firestore PATCH failed for ${docId}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

// ── Main ──────────────────────────────────────────────────────────────────────

const write = process.argv.includes("--write");
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH;

console.log(`Mode: ${write ? "WRITE" : "DRY RUN"}\n`);
for (const { id, fields } of UPDATES) {
  console.log(`favourite-boardgames/${id}`);
  for (const [k, v] of Object.entries(fields)) {
    console.log(`  ${k}: ${JSON.stringify(v)}`);
  }
}
console.log();

if (!write) {
  console.log("Dry run complete. Pass --write to commit to Firestore.");
  process.exit(0);
}

const credentials = await loadServiceAccount(credentialsPath);
const accessToken = await fetchAccessToken(credentials);

for (const { id, fields } of UPDATES) {
  await patchDocument(accessToken, credentials.project_id, id, fields);
  console.log(`✓ Updated ${id}`);
}

console.log("\nDone.");
