/**
 * auto-merge.mjs — CI-gated auto-merge for phase branches
 *
 * Called by .github/workflows/ai-review.yml when a PR is opened on a phase branch.
 * AI peer review is performed locally by the owning agent BEFORE the PR is opened.
 *
 * Flow:
 *   1. Detect phase number from branch name
 *   2. Post a "waiting for CI" comment
 *   3. Poll until CI checks pass, then squash-merge the PR
 *   4. Update HANDOFF.md status to MERGED on the merge commit
 *   5. Delete the remote phase branch
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// ── Environment ──────────────────────────────────────────────────────────────

const {
  GITHUB_TOKEN,
  PR_NUMBER,
  PR_TITLE,
  HEAD_BRANCH,
  REPO,
} = process.env;

const GH_API = 'https://api.github.com';
const GH_HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'portfolio-auto-merge',
  'Content-Type': 'application/json',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract phase number from branch name, e.g. 'feat/phase-a3-...' → 3 */
function getPhaseNumber(branch) {
  const match = branch.match(/phase-a(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/** Sleep for ms milliseconds. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── GitHub API calls ──────────────────────────────────────────────────────────

/** Post a comment on the PR. */
async function postComment(body) {
  const res = await fetch(`${GH_API}/repos/${REPO}/issues/${PR_NUMBER}/comments`, {
    method: 'POST',
    headers: GH_HEADERS,
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`Post comment failed ${res.status}: ${await res.text()}`);
  return (await res.json()).id;
}

/**
 * Poll every 30 s for up to ~5 min waiting for CI checks to complete, then merge.
 * Returns true on success, false on timeout.
 */
async function mergeWhenReady(maxAttempts = 10, delayMs = 30_000) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${GH_API}/repos/${REPO}/pulls/${PR_NUMBER}/merge`, {
      method: 'PUT',
      headers: GH_HEADERS,
      body: JSON.stringify({
        merge_method: 'squash',
        commit_title: PR_TITLE,
        commit_message: `Auto-merged after CI passed — Phase A${getPhaseNumber(HEAD_BRANCH)}`,
      }),
    });

    if (res.ok) return true;

    const data = await res.json();

    // 405 = checks pending / not mergeable yet — retry
    if (res.status === 405 || data.message?.includes('not mergeable')) {
      console.log(`Attempt ${i + 1}/${maxAttempts} — CI pending, retrying in ${delayMs / 1000}s…`);
      await sleep(delayMs);
      continue;
    }

    throw new Error(`Merge failed ${res.status}: ${JSON.stringify(data)}`);
  }
  return false;
}

/** Delete the remote phase branch after a successful merge. */
async function deleteBranch() {
  const ref = `heads/${HEAD_BRANCH}`;
  const res = await fetch(`${GH_API}/repos/${REPO}/git/refs/${ref}`, {
    method: 'DELETE',
    headers: GH_HEADERS,
  });
  if (res.status !== 204) {
    console.warn(`Branch delete returned ${res.status} — may already be deleted`);
  }
}

// ── HANDOFF.md update ─────────────────────────────────────────────────────────

/** Update HANDOFF.md phase tracker row: REVIEW READY → MERGED */
function updateHandoff(handoff, phaseNum) {
  return handoff.replace(
    new RegExp(`(\\| A${phaseNum} \\|[^\\n]+\\|) REVIEW READY(\\s*\\|)`, 'i'),
    `$1 MERGED$2`
  );
}

/** Commit the updated HANDOFF.md to main after the squash merge. */
function commitAndPushToMain(content, phaseNum) {
  writeFileSync('HANDOFF.md', content, 'utf8');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync('git config user.name "github-actions[bot]"');
  execSync('git add HANDOFF.md');
  execSync(
    `git commit -m "chore(handoff): mark Phase A${phaseNum} MERGED [skip ci]"`,
    { stdio: 'inherit' }
  );
  execSync('git push origin HEAD:main', { stdio: 'inherit' });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Auto-merge — PR #${PR_NUMBER} — branch: ${HEAD_BRANCH}`);

  const phaseNum = getPhaseNumber(HEAD_BRANCH);
  if (phaseNum === null) {
    console.log('Not a phase branch — skipping');
    return;
  }

  console.log(`Phase A${phaseNum} — waiting for CI before merging…`);

  await postComment(
    `> :hourglass: **CI checks in progress** — will squash-merge automatically once all checks are green.\n` +
    `> *AI peer review was completed locally before this PR was opened.*`
  );

  const merged = await mergeWhenReady();

  if (merged) {
    console.log('PR merged — updating HANDOFF.md on main…');

    execSync('git fetch origin main', { stdio: 'inherit' });
    execSync('git checkout main', { stdio: 'inherit' });
    execSync('git pull origin main', { stdio: 'inherit' });

    const handoff = readFileSync('HANDOFF.md', 'utf8');
    const updated = updateHandoff(handoff, phaseNum);
    commitAndPushToMain(updated, phaseNum);

    await deleteBranch();
    console.log(`Phase A${phaseNum} complete — branch deleted, HANDOFF.md updated to MERGED`);
  } else {
    await postComment(
      `> :warning: **Auto-merge timed out** — CI checks did not pass within the allotted time.\n` +
      `> Please merge manually once all checks are green.`
    );
  }
}

main().catch((err) => {
  console.error('Fatal error in auto-merge:', err);
  process.exit(1);
});
