/**
 * One-shot script to update the personal project description in Firestore.
 * Usage: node --env-file=.env scripts/update-project-description.mjs [--write]
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";

const PROJECT_DOC_ID = "XYdqe9OyXNSUEzZ8kqwn";

const NEW_DESCRIPTION =
  "A personal space to showcase my work and document my photography journey — built and maintained entirely by me.";

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
  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()).access_token;
}

async function updateDescription(accessToken, projectId, description) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/projects/${PROJECT_DOC_ID}` +
    `?updateMask.fieldPaths=description`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: { description: { stringValue: description } } }),
  });
  if (!response.ok) {
    throw new Error(`Update failed: ${response.status} ${await response.text()}`);
  }
}

const write = process.argv.includes("--write");
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH;

console.log(`Mode: ${write ? "WRITE" : "DRY RUN"}\n`);
console.log(`  document  : projects/${PROJECT_DOC_ID}`);
console.log(`  field     : description`);
console.log(`  new value : ${NEW_DESCRIPTION}\n`);

if (!write) {
  console.log("Dry run complete. Pass --write to update Firestore.");
  process.exit(0);
}

const credentials = await loadServiceAccount(credentialsPath);
const accessToken = await fetchAccessToken(credentials);

await updateDescription(accessToken, credentials.project_id, NEW_DESCRIPTION);
console.log("✓ Description updated.");
