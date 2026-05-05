/**
 * One-shot script to insert new experience items into Firestore.
 * Usage: node --env-file=.env scripts/add-experience-items.mjs [--write]
 *
 * Dry-run by default — pass --write to commit to Firestore.
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";

const ITEMS_TO_ADD = [
  {
    collection: "experience/ai/item",
    id: "1934af05-95b3-4d4f-bc2f-9e545acff874",
    data: {
      title: "Claude Code",
      description:
        "Anthropic's AI coding assistant used for code generation, refactoring, and agentic task automation directly in the terminal.",
      link: "https://claude.ai/code",
      "date-from": "2025-01-31T00:00:00.000Z",
    },
  },
  {
    collection: "experience/ai/item",
    id: "b9b7e5e6-c521-4de9-9ddf-a11a89a3b24b",
    data: {
      title: "Codex",
      description:
        "OpenAI's cloud-based coding agent used for automated code review, pull request analysis, and background engineering tasks.",
      link: "https://openai.com/codex",
      "date-from": "2025-01-31T00:00:00.000Z",
    },
  },
];

// ── Firestore helpers (same pattern as update-photography-stats.mjs) ─────────

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

async function createDocument(accessToken, projectId, collectionPath, docId, data) {
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
      `Firestore create failed for ${collectionPath}/${docId}: ${response.status} ${await response.text()}`,
    );
  }
  return response.json();
}

// ── Main ──────────────────────────────────────────────────────────────────────

const write = process.argv.includes("--write");
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH;

console.log(`Mode: ${write ? "WRITE" : "DRY RUN"}\n`);

for (const item of ITEMS_TO_ADD) {
  console.log(`[${item.data.title}]`);
  console.log(`  collection : ${item.collection}`);
  console.log(`  id         : ${item.id}`);
  console.log(`  data       :`, JSON.stringify(item.data, null, 4).split("\n").join("\n             "));
  console.log();
}

if (!write) {
  console.log("Dry run complete. Pass --write to commit to Firestore.");
  process.exit(0);
}

const credentials = await loadServiceAccount(credentialsPath);
const accessToken = await fetchAccessToken(credentials);
const projectId = credentials.project_id;

for (const item of ITEMS_TO_ADD) {
  await createDocument(accessToken, projectId, item.collection, item.id, item.data);
  console.log(`✓ Upserted ${item.collection}/${item.id} (${item.data.title})`);
}

console.log("\nAll items written to Firestore.");
