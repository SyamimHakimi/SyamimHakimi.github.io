/**
 * One-shot script to delete specific Firestore documents by path.
 * Usage: node --env-file=.env scripts/delete-firestore-docs.mjs [--write]
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";

const DOCS_TO_DELETE = [
  "experience/platforms/item/a937dca3-d7eb-4299-9afb-cdba8de146cd",
  "experience/platforms/item/02224930-ce21-41c9-81b0-ddb838780015",
  "experience/languages/item/27f48600-ca5a-49cc-970a-a970e292e91a",
  "experience/languages/item/8578c477-de4a-4d71-a3f4-861a63116c92",
  "experience/platforms/item/5dda797a-d48d-4e76-933f-495bd9d16a21",
];

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64")
    .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function loadServiceAccount(credentialsPath) {
  const raw = await readFile(credentialsPath, "utf8");
  return JSON.parse(raw);
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
  return (await response.json()).access_token;
}

async function deleteDocument(accessToken, projectId, docPath) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    if (response.status === 404) return;
    const text = await response.text();
    throw new Error(`Delete failed for ${docPath}: ${response.status} ${text}`);
  }
}

const write = process.argv.includes("--write");
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH;

console.log(`Mode: ${write ? "WRITE (DELETE)" : "DRY RUN"}\n`);
for (const path of DOCS_TO_DELETE) {
  console.log(`  will delete: ${path}`);
}
console.log();

if (!write) {
  console.log("Dry run complete. Pass --write to delete from Firestore.");
  process.exit(0);
}

const credentials = await loadServiceAccount(credentialsPath);
const accessToken = await fetchAccessToken(credentials);
const projectId = credentials.project_id;

for (const docPath of DOCS_TO_DELETE) {
  await deleteDocument(accessToken, projectId, docPath);
  console.log(`✓ Deleted ${docPath}`);
}

console.log("\nAll duplicate documents deleted.");
