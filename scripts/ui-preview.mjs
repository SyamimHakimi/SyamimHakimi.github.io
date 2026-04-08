/**
 * ui-preview.mjs
 *
 * Renders an HTML file or inline HTML string to screenshots (desktop + mobile)
 * and sends them to Telegram.
 *
 * Usage:
 *   node scripts/ui-preview.mjs --file path/to/mockup.html --label "Home page"
 *   node scripts/ui-preview.mjs --file path/to/mockup.html --label "Home page" --mobile-only
 *   node scripts/ui-preview.mjs --file path/to/mockup.html --label "Home page" --desktop-only
 *
 * Env vars (or edit the CONFIG block below):
 *   TELEGRAM_TOKEN   — bot token
 *   TELEGRAM_CHAT_ID — chat/user ID
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// ── CONFIG ────────────────────────────────────────────────────────────────────
const TELEGRAM_TOKEN   = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('Error: TELEGRAM_TOKEN and TELEGRAM_CHAT_ID must be set in .env');
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const VIEWPORTS = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Mobile',  width: 390,  height: 844  },
];
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };
  return {
    file:        get('--file'),
    label:       get('--label') || 'UI Preview',
    mobileOnly:  args.includes('--mobile-only'),
    desktopOnly: args.includes('--desktop-only'),
  };
}

async function sendPhoto(imagePath, caption) {
  const { FormData, File } = await import('formdata-node');
  const { fileFromPath } = await import('formdata-node/file-from-path');

  const form = new FormData();
  form.set('chat_id', TELEGRAM_CHAT_ID);
  form.set('caption', caption);
  form.set('photo', await fileFromPath(imagePath));

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`,
    { method: 'POST', body: form }
  );
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram error: ${JSON.stringify(json)}`);
  return json;
}

async function sendMessage(text) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
    }
  );
  return res.json();
}

async function screenshot(htmlPath, viewport) {
  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForLoadState('networkidle');

  const outPath = join(tmpdir(), `ui-preview-${viewport.name}-${Date.now()}.png`);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  return outPath;
}

async function main() {
  const { file, label, mobileOnly, desktopOnly } = parseArgs();

  if (!file) {
    console.error('Usage: node scripts/ui-preview.mjs --file <path> [--label "Title"]');
    process.exit(1);
  }

  const htmlPath = file.startsWith('/') || /^[A-Za-z]:/.test(file)
    ? file
    : join(process.cwd(), file);

  const viewports = VIEWPORTS.filter(v => {
    if (mobileOnly)  return v.name === 'Mobile';
    if (desktopOnly) return v.name === 'Desktop';
    return true;
  });

  console.log(`📸 Sending "${label}" (${viewports.map(v => v.name).join(' + ')}) to Telegram…`);
  await sendMessage(`🎨 *${label}*\n_Rendering ${viewports.map(v => `${v.name} (${v.width}px)`).join(' and ')}…_`);

  for (const viewport of viewports) {
    console.log(`  → ${viewport.name} ${viewport.width}×${viewport.height}`);
    const imgPath = await screenshot(htmlPath, viewport);
    await sendPhoto(imgPath, `${label} — ${viewport.name} (${viewport.width}×${viewport.height})`);
    unlinkSync(imgPath);
  }

  console.log('✅ Done.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
