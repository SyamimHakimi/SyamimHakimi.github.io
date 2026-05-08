import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

const creds = JSON.parse(await readFile("portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json", "utf8"));
const issuedAt = Math.floor(Date.now() / 1000);
const payload = { iss: creds.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: creds.token_uri, iat: issuedAt, exp: issuedAt + 3600 };
const enc = (s) => Buffer.from(s).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const unsigned = enc(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + enc(JSON.stringify(payload));
const signer = createSign("RSA-SHA256"); signer.update(unsigned); signer.end();
const jwt = unsigned + "." + enc(signer.sign(creds.private_key));

const tokenRes = await fetch(creds.token_uri, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) });
const { access_token } = await tokenRes.json();

const url = `https://firestore.googleapis.com/v1/projects/${creds.project_id}/databases/(default)/documents/services?pageSize=50`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } });
const data = await res.json();

const GROUP_NAMES = { 1: "Product Delivery", 2: "Platform and Data", 3: "Hardening and Review" };
const byGroup = {};

for (const doc of data.documents ?? []) {
  const f = doc.fields;
  const id = doc.name.split("/").pop();
  const group = Number(f.group?.integerValue ?? 0);
  if (!byGroup[group]) byGroup[group] = [];
  byGroup[group].push({ id, title: f.title?.stringValue, sorting: Number(f.sorting?.integerValue ?? 0), description: f.description?.stringValue });
}

for (const [groupId, items] of Object.entries(byGroup).sort(([a],[b]) => a - b)) {
  console.log(`\n── Group ${groupId}: ${GROUP_NAMES[groupId] ?? "Unknown"} ──`);
  for (const item of items.sort((a, b) => a.sorting - b.sorting)) {
    console.log(`  [${item.sorting}] ${item.title}`);
    console.log(`       ${item.description}`);
    console.log(`       id: ${item.id}`);
  }
}
