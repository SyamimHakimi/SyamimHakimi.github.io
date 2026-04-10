import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const APP_ID = process.env.GITHUB_APP_ID;
const PEM_PATH = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
const REPO = 'https://api.github.com/repos/SyamimHakimi/SyamimHakimi.github.io';

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function signJwt() {
  const now = Math.floor(Date.now() / 1000);
  const h = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const p = base64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: APP_ID }));
  const s = createSign('RSA-SHA256'); s.update(`${h}.${p}`);
  return `${h}.${p}.${base64url(s.sign(readFileSync(PEM_PATH, 'utf8')))}`;
}
async function getToken(jwt) {
  const H = { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'portfolio-agents-mcp' };
  const [inst] = await (await fetch('https://api.github.com/app/installations', { headers: H })).json();
  return (await (await fetch(`https://api.github.com/app/installations/${inst.id}/access_tokens`, { method: 'POST', headers: H })).json()).token;
}

const token = await getToken(signJwt());
const H = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', 'User-Agent': 'portfolio-agents-mcp' };

const getRes = await fetch(`${REPO}/contents/HANDOFF.md?ref=main`, { headers: H });
const file = await getRes.json();
const localContent = readFileSync('HANDOFF.md', 'utf8');

const putRes = await fetch(`${REPO}/contents/HANDOFF.md`, {
  method: 'PUT', headers: H,
  body: JSON.stringify({
    message: 'chore(handoff): mark Phase A2 MERGED, advance gate 3 to A3 [skip ci]',
    content: Buffer.from(localContent).toString('base64'),
    sha: file.sha,
    branch: 'main',
    committer: { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' },
  }),
});
const result = await putRes.json();
if (result.content) { console.log('HANDOFF.md updated on main:', result.content.sha); }
else { console.error('Failed:', JSON.stringify(result)); process.exit(1); }
