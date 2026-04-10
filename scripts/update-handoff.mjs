import { readFileSync } from 'fs';
import { createSign } from 'crypto';

const APP_ID   = process.env.GITHUB_APP_ID;
const PEM_PATH = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
const REPO     = 'https://api.github.com/repos/SyamimHakimi/SyamimHakimi.github.io';

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function signJwt(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const h = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const p = base64url(Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })));
  const s = createSign('RSA-SHA256'); s.update(`${h}.${p}`);
  return `${h}.${p}.${base64url(s.sign(privateKey))}`;
}
async function getToken(jwt) {
  const H = { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'portfolio-agents-mcp' };
  const [inst] = await (await fetch('https://api.github.com/app/installations', { headers: H })).json();
  return (await (await fetch(`https://api.github.com/app/installations/${inst.id}/access_tokens`, { method: 'POST', headers: H })).json()).token;
}

const token = await getToken(signJwt(APP_ID, readFileSync(PEM_PATH, 'utf8')));
const H = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', 'User-Agent': 'portfolio-agents-mcp' };

// Get current HANDOFF.md from main
const getRes = await fetch(`${REPO}/contents/HANDOFF.md?ref=main`, { headers: H });
const file = await getRes.json();
let content = Buffer.from(file.content, 'base64').toString('utf8');

// The [message] and [from→to] args
const [,, message, ...pairs] = process.argv;
for (const pair of pairs) {
  const sep = pair.indexOf('→');
  if (sep === -1) { console.warn(`Skipping malformed pair (no → separator): ${pair}`); continue; }
  const from = pair.slice(0, sep);
  const to   = pair.slice(sep + 1);
  // Use .replace() (first occurrence only) to avoid mutating repeated status text elsewhere.
  content = content.replace(from, to);
}

const putRes = await fetch(`${REPO}/contents/HANDOFF.md`, {
  method: 'PUT', headers: H,
  body: JSON.stringify({
    message,
    content: Buffer.from(content).toString('base64'),
    sha: file.sha,
    branch: 'main',
    committer: { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' },
  }),
});
const result = await putRes.json();
if (result.content) { console.log('HANDOFF.md updated on main'); }
else { console.error('Failed:', JSON.stringify(result)); process.exit(1); }
