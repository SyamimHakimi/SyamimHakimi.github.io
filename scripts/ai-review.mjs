/**
 * ai-review.mjs — Automated AI peer review for phase branches
 *
 * Called by .github/workflows/ai-review.yml on PR open/synchronize.
 * Flow:
 *   1. Detect phase number from branch name
 *   2. Determine reviewing agent (Codex or Claude) from phase ownership
 *   3. Extract phase plan + acceptance criteria from HANDOFF.md
 *   4. Get the PR diff
 *   5. Call the appropriate AI API
 *   6. Post verdict as a PR comment
 *   7. Commit Gate 4 result to HANDOFF.md on the branch
 *   8. If APPROVED: poll for CI to pass, then merge PR + delete branch
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// ── Environment ──────────────────────────────────────────────────────────────

const {
  OPENAI_API_KEY,
  ANTHROPIC_API_KEY,
  GITHUB_TOKEN,
  PR_NUMBER,
  PR_NODE_ID,
  PR_TITLE,
  HEAD_BRANCH,
  BASE_SHA,
  HEAD_SHA,
  REPO,
} = process.env;

const GH_API = 'https://api.github.com';
const GH_HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'portfolio-ai-review',
  'Content-Type': 'application/json',
};

// ── Phase ownership ───────────────────────────────────────────────────────────
// Maps phase number → { owner, reviewer }
// Source of truth: HANDOFF.md Phase Tracker

const PHASE_MAP = {
  0: { owner: 'Claude', reviewer: 'Codex'  },
  1: { owner: 'Codex',  reviewer: 'Claude' },
  2: { owner: 'Claude', reviewer: 'Codex'  },
  3: { owner: 'Claude', reviewer: 'Codex'  },
  4: { owner: 'Claude', reviewer: 'Codex'  },
  5: { owner: 'Claude', reviewer: 'Codex'  },
  6: { owner: 'Codex',  reviewer: 'Claude' },
  7: { owner: 'Codex',  reviewer: 'Claude' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract phase number from branch name, e.g. 'feat/phase-a3-...' → 3 */
function getPhaseNumber(branch) {
  const match = branch.match(/phase-a(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract a phase section from HANDOFF.md.
 * Returns up to 4000 chars to stay within API context limits.
 */
function extractPhasePlan(handoff, phaseNum) {
  const section = new RegExp(
    `(### Phase A${phaseNum} —[\\s\\S]*?)(?=\\n### Phase A|\\n---\\s*\\n\\[|$)`,
    'i'
  );
  const match = handoff.match(section);
  if (!match) return `Phase A${phaseNum} plan not found in HANDOFF.md.`;
  return match[1].length > 4000 ? match[1].slice(0, 4000) + '\n...(truncated)' : match[1];
}

/** Get the git diff between base and head, truncated to ~12 KB. */
function getDiff() {
  try {
    const diff = execSync(`git diff ${BASE_SHA}...${HEAD_SHA}`, {
      maxBuffer: 1024 * 1024 * 20,
    }).toString();
    return diff.length > 12000 ? diff.slice(0, 12000) + '\n\n...(diff truncated at 12 KB)' : diff;
  } catch {
    return '(could not generate diff)';
  }
}

/** Sleep for ms milliseconds. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── AI API calls ──────────────────────────────────────────────────────────────

async function callOpenAI(system, user) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}

async function callAnthropic(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  return (await res.json()).content[0].text;
}

// ── GitHub API calls ──────────────────────────────────────────────────────────

/** Post a comment on the PR. Returns the new comment ID. */
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
 * Attempt to merge the PR via the REST API.
 * Polls every 30 s for up to ~5 min waiting for CI checks to complete.
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
        commit_message: `Automated merge after AI peer review — Phase A${getPhaseNumber(HEAD_BRANCH)}`,
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

    // Any other error is fatal
    throw new Error(`Merge failed ${res.status}: ${JSON.stringify(data)}`);
  }
  return false; // timed out
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

/**
 * Update HANDOFF.md in-place:
 *   - Gate 4 section: replace reviewer's `___` with the verdict
 *   - Phase tracker row: set status to MERGED if approved
 */
function updateHandoff(handoff, phaseNum, reviewer, verdict, commentId) {
  const verdictLine =
    verdict === 'APPROVED'
      ? 'APPROVED'
      : `REQUEST CHANGES — see [PR #${PR_NUMBER} comment](https://github.com/${REPO}/pull/${PR_NUMBER}#issuecomment-${commentId})`;

  // Update Gate 4 review line for this reviewer in this phase's section
  // Matches: "Codex review: ___" or "Claude review: ___" inside the phase section
  let updated = handoff.replace(
    new RegExp(`(### Phase A${phaseNum} [\\s\\S]*?${reviewer} review: )___`, 'i'),
    `$1${verdictLine}`
  );

  // Update phase tracker row status: REVIEW READY → MERGED (only on APPROVED)
  if (verdict === 'APPROVED') {
    updated = updated.replace(
      new RegExp(`(\\| A${phaseNum} \\|[^\\n]+\\|) REVIEW READY(\\s*\\|)`, 'i'),
      `$1 MERGED$2`
    );
  }

  return updated;
}

/** Commit the updated HANDOFF.md to the PR branch and push. */
function commitAndPush(content) {
  writeFileSync('HANDOFF.md', content, 'utf8');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync('git config user.name "github-actions[bot]"');
  execSync('git add HANDOFF.md');
  execSync(
    `git commit -m "chore(review): update HANDOFF.md Gate 4 result [skip-review]"`,
    { stdio: 'inherit' }
  );
  execSync(`git push origin HEAD:${HEAD_BRANCH}`, { stdio: 'inherit' });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`AI review — PR #${PR_NUMBER} — branch: ${HEAD_BRANCH}`);

  const phaseNum = getPhaseNumber(HEAD_BRANCH);
  if (phaseNum === null) {
    console.log('Not a phase branch — skipping');
    return;
  }

  const phaseInfo = PHASE_MAP[phaseNum];
  if (!phaseInfo) {
    console.log(`Unknown phase A${phaseNum} — skipping`);
    return;
  }

  const { owner, reviewer } = phaseInfo;
  console.log(`Phase A${phaseNum}: owner=${owner}, reviewer=${reviewer}`);

  // ── Gather context ────────────────────────────────────────────────────────
  const handoff   = readFileSync('HANDOFF.md', 'utf8');
  const phasePlan = extractPhasePlan(handoff, phaseNum);
  const diff      = getDiff();

  // ── Build review prompt ───────────────────────────────────────────────────
  const system = `You are ${reviewer}, an AI agent performing a peer code review for a personal portfolio website rebuild. You are reviewing work produced by ${owner} for Phase A${phaseNum}.

Your role is to verify that the changes satisfy the phase plan and acceptance criteria. Be concise, specific, and actionable.

Always end your response with exactly one of these two lines:
VERDICT: APPROVED
VERDICT: REQUEST CHANGES`;

  const user = `## Phase A${phaseNum} — Plan and Acceptance Criteria

${phasePlan}

## Changes (git diff)

\`\`\`diff
${diff}
\`\`\`

Review the changes against every acceptance criterion above. Note each criterion as MET or NOT MET. Then state your verdict.`;

  // ── Call AI API ───────────────────────────────────────────────────────────
  let response;
  try {
    if (reviewer === 'Codex') {
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY secret is not set');
      response = await callOpenAI(system, user);
    } else {
      if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY secret is not set');
      response = await callAnthropic(system, user);
    }
  } catch (err) {
    await postComment(
      `## :robot: AI Peer Review — Error\n\n` +
      `:warning: Automated review failed: **${err.message}**\n\n` +
      `Please trigger a manual review or check the Actions log.`
    );
    process.exit(1);
  }

  // ── Parse verdict ─────────────────────────────────────────────────────────
  const verdictMatch = response.match(/VERDICT:\s*(APPROVED|REQUEST CHANGES)/i);
  const verdict      = verdictMatch ? verdictMatch[1].toUpperCase() : 'REQUEST CHANGES';
  const isApproved   = verdict === 'APPROVED';
  const icon         = isApproved ? ':white_check_mark:' : ':x:';
  const modelId      = reviewer === 'Codex' ? 'gpt-4o' : 'claude-sonnet-4-6';

  console.log(`Verdict: ${verdict}`);

  // ── Post PR comment ───────────────────────────────────────────────────────
  const commentBody =
    `## ${icon} AI Peer Review — ${reviewer} — Phase A${phaseNum}\n\n` +
    `${response}\n\n` +
    `---\n*Automated review · ${reviewer} · \`${modelId}\`*`;

  const commentId = await postComment(commentBody);
  console.log(`Posted comment #${commentId}`);

  // ── Update HANDOFF.md ─────────────────────────────────────────────────────
  const updatedHandoff = updateHandoff(handoff, phaseNum, reviewer, verdict, commentId);
  commitAndPush(updatedHandoff);
  console.log('HANDOFF.md Gate 4 updated and pushed');

  // ── Merge if approved ─────────────────────────────────────────────────────
  if (isApproved) {
    console.log('Waiting for CI checks to pass before merging…');
    await postComment(
      `> :hourglass: **Waiting for CI checks to pass** — will merge automatically once all checks are green.`
    );

    const merged = await mergeWhenReady();
    if (merged) {
      console.log('PR merged successfully');
      await deleteBranch();
      console.log('Branch deleted');
    } else {
      await postComment(
        `> :warning: **Auto-merge timed out** — CI checks did not pass within the allotted time.\n` +
        `> Please merge manually once checks are green.`
      );
    }
  }
}

main().catch((err) => {
  console.error('Fatal error in ai-review.mjs:', err);
  process.exit(1);
});
