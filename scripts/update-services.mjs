/**
 * One-shot script to recategorize all service items in Firestore.
 * Updates group, sorting, and title for 13 items; deletes 1 dropped item.
 * Usage: node scripts/update-services.mjs          (dry run)
 *        node scripts/update-services.mjs --write  (write to Firestore)
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";

// ── Target state ─────────────────────────────────────────────────────────────

const UPDATES = [
  // Group 1 — Product Delivery
  { id: "2eQDNhBrJruiMRiHOzav", title: "Custom Web Application",        group: 1, sorting: 1 },
  { id: "EvwaDjqM084yic95zN0B", title: "Dashboard & Analytics UI",      group: 1, sorting: 2 },
  { id: "YCWvI3O5VcYSdpuxqWp4", title: "Form Engineering & Validation", group: 1, sorting: 3 },
  { id: "QIQ5JKlCUbqSOLsny1P2", title: "Authentication & Access Control", group: 1, sorting: 4 },

  // Group 2 — API, Data & Platform
  { id: "tRyZp8lmgxTviPHDrVrt", title: "REST API Design",               group: 2, sorting: 1 },
  { id: "9Ox1Hb6rt7ecexVRRCms", title: "Third-Party API Integration",   group: 2, sorting: 2 },
  { id: "tS8ohMfN82VjZ7weIBHV", title: "Database Schema Design",        group: 2, sorting: 3 },
  { id: "KjH9DO941ZTvPiJihwha", title: "Data Migration",                group: 2, sorting: 4 },
  { id: "5aDEMQl7DwuSzTBR5MEK", title: "Data Mapping & Transformation", group: 2, sorting: 5 },
  { id: "4jRUlyJgmrBTc3GNOsZp", title: "Business Flow Analysis",        group: 2, sorting: 6 },

  // Group 3 — Review & Hardening
  { id: "lyxyW2F7M6l1MV8ZimmR", title: "Performance Optimisation",             group: 3, sorting: 1 },
  { id: "O7HTF8L22IIFW6KAjoKE", title: "Security Review & Implementation",     group: 3, sorting: 2 },
  { id: "ibjNzcJVdbZ3ljeuiTCR", title: "API Documentation & Contracts",        group: 3, sorting: 3 },
];

const DELETE_ID = "c3aa2iKiYvzmYDljFEXh"; // "Providing Postman Requests" — dropped

// ── Auth helpers ──────────────────────────────────────────────────────────────

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64")
    .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function createJwtAssertion(creds) {
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: creds.token_uri ?? "https://oauth2.googleapis.com/token",
    iat,
    exp: iat + 3600,
  };
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body   = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64UrlEncode(signer.sign(creds.private_key))}`;
}

async function fetchAccessToken(creds) {
  const res = await fetch(creds.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createJwtAssertion(creds),
    }),
  });
  if (!res.ok) throw new Error(`OAuth failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

function docUrl(projectId, docId) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/services/${docId}`;
}

async function patchService(token, projectId, { id, title, group, sorting }) {
  const url = docUrl(projectId, id) +
    "?updateMask.fieldPaths=title&updateMask.fieldPaths=group&updateMask.fieldPaths=sorting";
  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        title:   { stringValue: title },
        group:   { integerValue: String(group) },
        sorting: { integerValue: String(sorting) },
      },
    }),
  });
  if (!res.ok) throw new Error(`PATCH ${id} failed: ${res.status} ${await res.text()}`);
}

async function deleteService(token, projectId, docId) {
  const res = await fetch(docUrl(projectId, docId), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`DELETE ${docId} failed: ${res.status} ${await res.text()}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const write = process.argv.includes("--write");

console.log(`Mode: ${write ? "WRITE" : "DRY RUN"}\n`);

for (const { id, title, group, sorting } of UPDATES) {
  console.log(`  [G${group} #${sorting}] ${title.padEnd(40)} id: ${id}`);
}
console.log(`\n  [DELETE]  Providing Postman Requests          id: ${DELETE_ID}`);

if (!write) {
  console.log("\nDry run complete. Pass --write to apply changes.");
  process.exit(0);
}

console.log("\nApplying...");

const creds = JSON.parse(await readFile(CREDENTIALS_PATH, "utf8"));
const token = await fetchAccessToken(creds);

for (const update of UPDATES) {
  await patchService(token, creds.project_id, update);
  console.log(`  ✓ ${update.title}`);
}

await deleteService(token, creds.project_id, DELETE_ID);
console.log(`  ✓ deleted Providing Postman Requests`);

console.log("\nDone.");
