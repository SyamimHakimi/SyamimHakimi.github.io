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
  "Content-Type": "application/json",
  "User-Agent": "portfolio-agents-mcp",
};

const [title, head, ...bodyLines] = process.argv.slice(2);
const body = bodyLines.join("\n");

const res = await fetch(
  "https://api.github.com/repos/SyamimHakimi/SyamimHakimi.github.io/pulls",
  {
    method: "POST",
    headers: H,
    body: JSON.stringify({ title, head, base: "main", body }),
  },
);
const pr = await res.json();
if (pr.html_url) {
  console.log(`PR created: ${pr.html_url} — #${pr.number}`);
} else {
  console.error("Failed:", JSON.stringify(pr));
  process.exit(1);
}
