/**
 * One-shot script to update profile fields in Firestore.
 * Usage: node scripts/update-profile.mjs [--write]
 *
 * Dry-run by default — pass --write to commit to Firestore.
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";

const PROFILE_DOC_ID = "ddIhV8IxV5DjciJY7UxW";

const UPDATES = {
  "Residing Country": "Kuala Lumpur, Malaysia",
  Hobbies: "Boardgames, Photography",
};

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

function firestoreFieldPath(name) {
  return /^[a-zA-Z_][a-zA-Z_0-9]*$/u.test(name) ? name : `\`${name}\``;
}

async function patchDocument(accessToken, projectId, docPath, fields) {
  const fieldPaths = Object.keys(fields)
    .map((f) => `updateMask.fieldPaths=${encodeURIComponent(firestoreFieldPath(f))}`)
    .join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?${fieldPaths}`;
  const body = {
    fields: Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, { stringValue: v }]),
    ),
  };
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Firestore PATCH failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

// ── Main ──────────────────────────────────────────────────────────────────────

const write = process.argv.includes("--write");

console.log(`Mode: ${write ? "WRITE" : "DRY RUN"}\n`);
console.log(`Document: profile/${PROFILE_DOC_ID}`);
console.log("Fields to update:");
for (const [key, value] of Object.entries(UPDATES)) {
  console.log(`  ${key}: ${JSON.stringify(value)}`);
}
console.log();

if (!write) {
  console.log("Dry run complete. Pass --write to commit to Firestore.");
  process.exit(0);
}

const credentials = await loadServiceAccount(DEFAULT_CREDENTIALS_PATH);
const accessToken = await fetchAccessToken(credentials);
await patchDocument(accessToken, credentials.project_id, `profile/${PROFILE_DOC_ID}`, UPDATES);
console.log("✓ Profile updated in Firestore.");
