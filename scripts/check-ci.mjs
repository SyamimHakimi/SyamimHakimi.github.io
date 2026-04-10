import { readFileSync } from "fs";
import { createSign } from "crypto";

const APP_ID = process.env.GITHUB_APP_ID;
const PEM_PATH = process.env.GITHUB_APP_PRIVATE_KEY_PATH;

function base64url(buf) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
function signJwt(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const h = base64url(
    Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })),
  );
  const p = base64url(
    Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })),
  );
  const s = createSign("RSA-SHA256");
  s.update(`${h}.${p}`);
  return `${h}.${p}.${base64url(s.sign(privateKey))}`;
}
async function getToken(jwt) {
  const H = {
    Authorization: `Bearer ${jwt}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-agents-mcp",
  };
  const [inst] = await (
    await fetch("https://api.github.com/app/installations", { headers: H })
  ).json();
  return (
    await (
      await fetch(
        `https://api.github.com/app/installations/${inst.id}/access_tokens`,
        { method: "POST", headers: H },
      )
    ).json()
  ).token;
}

const token = await getToken(signJwt(APP_ID, readFileSync(PEM_PATH, "utf8")));
const H = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "portfolio-agents-mcp",
};

const PR = process.argv[2];
if (!PR) {
  console.error("Usage: node --env-file=.env scripts/check-ci.mjs <pr-number>");
  process.exit(1);
}

const REPO = "https://api.github.com/repos/SyamimHakimi/SyamimHakimi.github.io";

// Fetch PR to get actual head branch
const prRes = await fetch(`${REPO}/pulls/${PR}`, { headers: H });
const pr = await prRes.json();
if (!prRes.ok) {
  console.error("Could not fetch PR:", pr.message);
  process.exit(1);
}
console.log(
  `PR #${PR}: ${pr.state} | mergeable: ${pr.mergeable_state} | branch: ${pr.head.ref}`,
);

// Query CI runs for the PR's actual head branch
const runs = await (
  await fetch(
    `${REPO}/actions/runs?branch=${encodeURIComponent(pr.head.ref)}&per_page=5`,
    { headers: H },
  )
).json();
for (const r of runs.workflow_runs || []) {
  console.log(` - ${r.name} | ${r.status} | ${r.conclusion || "pending"}`);
}
