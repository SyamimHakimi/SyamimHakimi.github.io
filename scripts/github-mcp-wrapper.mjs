/**
 * github-mcp-wrapper.mjs
 *
 * Generates a GitHub App installation access token and starts @github/mcp-server
 * with that token. Runs every time Claude Code starts the MCP server, so the
 * token is always fresh (installation tokens expire after 1 hour).
 *
 * Required env vars (read from .env via --env-file or set in environment):
 *   GITHUB_APP_ID               — numeric App ID from GitHub App settings
 *   GITHUB_APP_PRIVATE_KEY_PATH — absolute path to the .pem private key file
 */

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { createSign } from 'crypto';

const APP_ID        = process.env.GITHUB_APP_ID;
const PEM_PATH      = process.env.GITHUB_APP_PRIVATE_KEY_PATH;

if (!APP_ID || !PEM_PATH) {
  process.stderr.write('github-mcp-wrapper: GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY_PATH must be set\n');
  process.exit(1);
}

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function signJwt(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header  = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })));
  const sign    = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = base64url(sign.sign(privateKey));
  return `${header}.${payload}.${sig}`;
}

async function getInstallationToken(jwt) {
  // Get the first installation (the one on SyamimHakimi.github.io)
  const instRes = await fetch('https://api.github.com/app/installations', {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'portfolio-agents-mcp',
    },
  });

  if (!instRes.ok) {
    const body = await instRes.text();
    throw new Error(`Failed to list installations: ${instRes.status} ${body}`);
  }

  const installations = await instRes.json();
  if (!installations.length) throw new Error('No installations found for this GitHub App');

  const installationId = installations[0].id;

  const tokenRes = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'portfolio-agents-mcp',
      },
    }
  );

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Failed to get installation token: ${tokenRes.status} ${body}`);
  }

  const { token } = await tokenRes.json();
  return token;
}

async function main() {
  const privateKey = readFileSync(PEM_PATH, 'utf8');
  const jwt        = signJwt(APP_ID, privateKey);
  const token      = await getInstallationToken(jwt);

  // Start @github/mcp-server with the installation token
  const child = spawn(
    'npx',
    ['-y', '@github/mcp-server'],
    {
      stdio: 'inherit',
      env: { ...process.env, GITHUB_PERSONAL_ACCESS_TOKEN: token },
    }
  );

  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch(err => {
  process.stderr.write(`github-mcp-wrapper error: ${err.message}\n`);
  process.exit(1);
});
