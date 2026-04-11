# AGENTS.md — Shared Agent Coordination Rules

This file is read by **both Claude Code and Codex CLI**. It defines the shared rules,
project context, and coordination protocol for the portfolio modernization project.

---

## Project Overview

**SyamimHakimi.github.io** is a personal portfolio website being rebuilt as an
**Astro 6 static site** with Tailwind CSS 4, Vue 3 islands, and Firebase Firestore
for runtime content. It is deployed to GitHub Pages.

All editable content (portfolio, services, about, photography, statistics) is stored
in Firestore and fetched at runtime by Vue islands — no static content files, no
redeployment needed for content changes.

The previous codebase was a Vue 3 SPA built on the KeenThemes admin template. That
codebase is being replaced, not incrementally upgraded. See `CLAUDE.md` for the full
target architecture.

---

## Agent Roles

Both agents are **co-planners, co-architects, and code reviewers**. Neither agent's
proposal or completed work is final until the other has reviewed and agreed.
Phase ownership is decided jointly — it is not predetermined by role.

| Agent  | Tool             |
|--------|------------------|
| Claude | Claude Code CLI  |
| Codex  | OpenAI Codex CLI |

Either agent may propose architecture changes, challenge the other's approach, request
a scope change, or reject a code review. Disagreements are recorded in `HANDOFF.md`.
Syamim has final say on unresolved disagreements and all merges to `main`.

---

## Coordination Files

| File         | Purpose                                              |
|--------------|------------------------------------------------------|
| `AGENTS.md`  | This file — shared rules, read-only during execution |
| `HANDOFF.md` | Live task board — both agents read and write this    |
| `CLAUDE.md`  | Full architecture reference for the Astro target     |

---

## Model and Tool Assignments

| Task type                                          | Model / Tool       | ID / Invocation             |
|----------------------------------------------------|--------------------|-----------------------------|
| Planning, architecture, feature design             | Opus               | `claude-opus-4-6`           |
| Code writing, refactoring, debugging               | Latest (Sonnet)    | `claude-sonnet-4-6`         |
| Documentation writing (JSDoc, comments, guides)    | Base (Haiku)       | `claude-haiku-4-5-20251001` |
| UI/UX design — layouts, components, design system  | `ui-ux-pro-max`    | `/ui-ux-pro-max` skill      |

**UI/UX rule:** Any task involving visual components, layouts, colour systems,
typography, spacing, or interactive design patterns **must** go through `ui-ux-pro-max`
before implementation. Applies to Claude. Codex flags UI/UX work for Claude.

This includes motion, responsive behaviour, loading/empty/error states, navigation
patterns, and any later frontend hotfix that materially changes the user experience.
Claude executes the skill, but both agents treat the approved `ui-ux-pro-max` output
as the design source of truth rather than an optional recommendation.

**UI preview workflow:** After `ui-ux-pro-max` produces a design, Claude must:
1. Save the output as `scripts/<phase>-<component>.html`
2. Run `npm run ui:preview -- --file scripts/<file>.html --label "<Phase> — <Component>"`
3. This sends desktop + mobile screenshots to Syamim's Telegram for review
4. Wait for Syamim's feedback before proceeding to implementation

Syamim reviews designs on Telegram and replies with approval or change requests.
No island or layout implementation begins until the preview has been reviewed.

For every frontend redesign pass, Claude must also record the `ui-ux-pro-max` prompt,
design rationale, and approved interaction states in `HANDOFF.md` or the phase design
doc before implementation. If Syamim requests visual changes, the revision goes back
through `ui-ux-pro-max`; Claude and Codex must not freestyle redesign revisions directly.
The approved mockup becomes the implementation baseline and the Gate 4 review baseline.

Phases requiring `ui-ux-pro-max` + Telegram preview:
- **Phase A3** — Route and layout rebuild
- **Phase A4** — Design system and Tailwind build
- **Phase A5** — Vue island component design

The same requirement applies to any later user-facing redesign or UX-affecting fix,
even if it falls outside A3-A5.

---

## Ping-Pong Collaboration Protocol

Every planning input, architecture proposal, or feature design must go through at least
one full ping-pong cycle before any decision is treated as agreed.

1. Agent A writes input in `HANDOFF.md`, ends entry with:
   `→ CODEX: please review and respond` (or `→ CLAUDE: ...`)
2. Agent B responds (agree / disagree / modify), ends with:
   `→ CLAUDE: please confirm or raise objections` (or `→ CODEX: ...`)
3. Cycle continues until both agents write `AGREED` on the item.
4. No item is decided until both agents have written `AGREED`.

Applies to: architecture questions, phase plans, code review change requests, and any
mid-execution scope changes. Syamim is not in the ping-pong loop — only Gate 2 plan approval requires Syamim's action.
After both agents write APPROVED at Gate 4, the owning agent merges and deletes the branch.

---

## Workflow: Four Gates Per Phase

```
GATE 1 — Architecture Agreement
  Both agents ping-pong all open questions until AGREED.
  → Produces: AGREED on platform, tech choices, phase ownership

GATE 2 — Per-Phase Plan Confirmation
  Detailed plan per phase: files touched, packages, unit test expectations,
  documentation expectations, acceptance criteria. Both agents ping-pong until AGREED.
  For any user-facing frontend work, Gate 2 must also define the required
  `ui-ux-pro-max` deliverables: mockup files, required states, Telegram preview,
  and approval record.
  Syamim writes APPROVED before execution begins.
  → Produces: APPROVED status per phase

GATE 3 — Execution
  Owning agent creates branch, writes code, tests, and docs.
  For frontend work, the required `ui-ux-pro-max` design pass and Telegram approval
  happen before implementation starts.
  Opus for any planning decisions that arise mid-execution.
  Sonnet for code writing. Haiku for documentation. ui-ux-pro-max for UI/UX.
  → Produces: code complete, tests passing, docs written

GATE 4 — Cross-Agent Local Review + Auto-merge
  The reviewing agent (not the owner) reviews the diff against acceptance criteria.
  Review happens locally via the agent's CLI — no API keys needed in CI.

  If reviewer is Codex (reviewing Claude's work):
    - Claude marks HANDOFF.md status REVIEW READY, writes diff summary + "→ CODEX: please review"
    - Syamim opens Codex CLI; Codex reads the diff and acceptance criteria
    - Codex writes APPROVED or REQUEST CHANGES in HANDOFF.md Gate 4
    - If REQUEST CHANGES: Claude fixes, writes "→ CODEX: fixes applied"; Codex re-reviews
    - Repeat until Codex writes APPROVED

  If reviewer is Claude (reviewing Codex's work):
    - Codex marks HANDOFF.md status REVIEW READY, writes diff summary + "→ CLAUDE: please review"
    - Claude reads git diff main...HEAD and acceptance criteria from HANDOFF.md
    - Claude writes APPROVED or REQUEST CHANGES in HANDOFF.md Gate 4
    - If REQUEST CHANGES: Codex fixes, writes "→ CLAUDE: fixes applied"; Claude re-reviews
    - Repeat until Claude writes APPROVED

  Once reviewer writes APPROVED:
    - Owning agent opens PR against main
    - .github/workflows/ai-review.yml waits for CI (lint, type-check, test, build) to pass
    - CI passes → PR squash-merged, HANDOFF.md updated to MERGED, branch deleted
  → Produces: MERGED (branch deleted, HANDOFF.md updated to MERGED)
```

No gate can be skipped. An agent that begins execution before APPROVED is in violation.

---

## Unit Test Requirements

Every phase that writes or modifies logic must include unit tests.

**What to test:**
- All Vue island components: prop validation, emitted events, key conditional rendering
- All utility functions and composables in `src/lib/`
- Firestore runtime schema validation: test valid and invalid fixture data against the Zod validators
- Any function with non-trivial branching logic

**What not to test:**
- Third-party library internals
- Astro pages with no logic (pure content rendering)
- One-liner pass-throughs

**Test file convention:** `foo.ts` → `foo.test.ts`, placed alongside source or in `src/__tests__/`

**Minimum expectation:** Every new function or composable has at least one test.
Every bug fix has a regression test. Reviewer checks coverage at Gate 4.

---

## Documentation Requirements

Every phase that writes or modifies code must include documentation.

| Code type               | Required documentation                                                     |
|-------------------------|----------------------------------------------------------------------------|
| Astro page              | Comment at top describing the page purpose and which island/composable(s) it hosts |
| Astro layout            | JSDoc on props (title, description, slot contracts)                        |
| Vue island component    | JSDoc on props, emits, and why it is an island (not static Astro)          |
| Firestore data model / validator | TSDoc on each field explaining type and expected values            |
| Utility / helper        | JSDoc with `@param` and `@returns`                                         |
| New env variable        | Entry in `.env.example` with a comment explaining the expected value       |
| `astro.config.mjs` change | Inline comment explaining the config option and why it was set           |

**Style:** TSDoc (`/** */`) for public API. Inline `//` only for non-obvious logic.
Comments explain *why*, not *what*. No comments on self-evident code.

---

## Code Review Protocol (Gate 4)

**Owning agent — before requesting review:**
1. `npm test` passes, `npm run build` exits 0, `npm run lint:check` exits 0
2. Documentation written for all new/modified public API, no new `any` types
3. Update `HANDOFF.md` status to `REVIEW READY`, add a brief change summary
4. Write `→ CODEX: please review` or `→ CLAUDE: please review` at the end of the Gate 4 section

**Reviewing agent — how to review:**
1. Run `git diff main...<branch>` to get the full diff
2. Read the phase plan and every acceptance criterion from `HANDOFF.md`
3. For frontend work, also read the approved `ui-ux-pro-max` mockup/design record
   and review against it
4. For each criterion, state MET or NOT MET with file + line reference where relevant
5. For frontend work, explicitly confirm whether the implementation matches the
   approved mockup and interaction states
6. Write `APPROVED` or `REQUEST CHANGES` with specifics in the HANDOFF.md Gate 4 section
7. If REQUEST CHANGES: end with `→ <OWNER>: please address the above`

**Loop until APPROVED, then owning agent opens the PR:**
- Opening the PR triggers `.github/workflows/ai-review.yml`
- The workflow waits for CI (lint, type-check, test, build) to pass
- CI green → squash-merge into `main`, `HANDOFF.md` updated to `MERGED`, branch deleted
- No AI API keys in CI — review is local, merge is automated

---

## Branching Strategy

This project uses **GitHub Flow**: `main` is always deployable; all work happens on
short-lived branches merged back via PR. There is no `develop` branch.

**Branch types:**

| Prefix | Use |
|--------|-----|
| `feat/` | New capability (most phases) |
| `fix/` | Bug fix within or outside a phase |
| `docs/` | Documentation-only phase (e.g. A0) |
| `refactor/` | Restructuring with no behaviour change |
| `chore/` | Tooling, deps, CI config (e.g. A6, A7) |
| `hotfix/` | Urgent production fix — bypasses Gate 2, still needs Gate 4 |

**Naming pattern:** `<type>/phase-a<N>-<short-description>`
- All lowercase, hyphens as separators, no spaces
- Keep `<short-description>` under 30 characters
- Agent identity goes in the PR body, not the branch name

**Examples:**
```
docs/phase-a0-architecture-spike
feat/phase-a1-baseline-audit-firestore-export
feat/phase-a2-firebase-sdk-data-models
feat/phase-a3-route-layout-rebuild
feat/phase-a4-design-system-tailwind
feat/phase-a5-vue-islands
chore/phase-a6-seo-hosting-security
chore/phase-a7-testing-performance-hardening
hotfix/fix-gallery-pagination-cursor
```

Always create a new branch before starting. Never commit directly to `main`.

---

## Handoff Protocol

**Starting a phase** (after APPROVED):
1. `git checkout -b <type>/phase-a<N>-<short-description>`
2. Update phase entry in `HANDOFF.md`: STATUS → `IN PROGRESS`
3. Commit the `HANDOFF.md` update as the first commit

**Finishing a phase:**
1. `npm test` — all tests pass
2. `npm run build` — exits 0
3. `npm run lint:check` — exits 0
4. Self-check documentation requirements
5. Update `HANDOFF.md`: STATUS → `REVIEW READY`, add change summary, tag reviewer
6. Push branch and open a PR against `main` — do NOT merge yet; wait for Gate 4 APPROVED

**Merging a phase** (after both agents write APPROVED at Gate 4):
1. Owning agent merges the PR into `main`
2. Owning agent deletes the phase branch (remote + local)
3. Owning agent updates `HANDOFF.md`: STATUS → `MERGED`

**Reviewing a phase:**
1. Read the phase plan in `HANDOFF.md`
2. Review all changed files on the branch
3. Write `APPROVED` or `REQUEST CHANGES` with specifics in the Gate 4 section

**Blocked:**
1. Set STATUS to `BLOCKED`, write reason and what is needed
2. Move to next available APPROVED phase

---

## Hard Rules

1. **Never commit to `main` directly.**
2. **Never begin a phase without APPROVED status.**
3. **Never touch files owned by the other agent's active phase.**
4. **Every phase must include unit tests for all new/modified logic.**
5. **Every phase must include documentation for all new/modified public API.**
6. **`npm run build`, `npm run lint:check`, and `npm test` must all pass before REVIEW READY.**
7. **Do not add dependencies** without listing them in the phase plan first.
8. **Do not remove dependencies** without verifying no remaining imports.
9. **Do not introduce `any` types.**
10. **Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org/):

    ```
    <type>(<scope>): <subject>          ← 72 chars max, imperative mood, lowercase
    <blank line>
    <body>                              ← optional; explain WHY, wrap at 72 chars
    <blank line>
    <footer>                            ← optional; Closes #N, BREAKING CHANGE:, Co-Authored-By:
    ```

    **Types:** `feat` `fix` `docs` `style` `refactor` `test` `chore` `ci` `perf` `build`
    **Scope:** phase slug, e.g. `phase-a4`, or component name, e.g. `gallery-grid`
    **Breaking change:** append `!` after type/scope — `feat(phase-a2)!:` — and add
    `BREAKING CHANGE: <description>` footer
    **Examples:**
    ```
    feat(phase-a4): add tailwind dark mode token system
    fix(gallery-grid): correct cursor reset on filter change
    docs(phase-a0): add architecture decision record for firestore runtime model
    chore(phase-a6): split deploy.yml into isolated jobs with failure policy
    ```

---

## Phase Dependency Order

**Note:** Phase A1 and A6 ownership was reassigned from Codex to Claude by Syamim
(project owner) on 2026-04-09, before either phase began execution. This supersedes
the original plan. Gate 4 reviewer for both phases is Codex.

```
Phase A0 (architecture spike + docs update)
└── Phase A1 (baseline audit + Firestore export)  ← Claude
    ├── Phase A2 (Firebase SDK + data models)  ← Claude
    │   └── Phase A3 (route + layout rebuild) ← Claude + ui-ux-pro-max
    │       ├── Phase A4 (design system)      ← Claude + ui-ux-pro-max
    │       │   ├── Phase A5 (Vue islands)    ← Claude + ui-ux-pro-max
    │       │   └── Phase A6 (SEO + hosting)  ← Claude
    │       │       └── Phase A7 (testing + hardening) ← Codex
    │       └── Phase A5 can run alongside A4 after A3 lands
```

---

## Protected Files

Do not modify these without explicit coverage in the approved phase plan:

- `export/` — Firestore export archive, read-only after Phase A1 commits it
- `.github/workflows/deploy.yml` — only Phase A6 is permitted to modify this
- `.github/workflows/ci.yml` — created pre-execution; only Phase A6 is permitted to modify this
- `.env` — environment variables, never committed
- `AGENTS.md` — read-only during Gates 2, 3, and 4, **with one explicit exception:**
  Phase A0 is the sole phase permitted to modify `AGENTS.md` and `CLAUDE.md` as
  part of its architecture documentation scope. The pre-execution updates to both
  files (already made during planning) are considered part of Phase A0's deliverables
  and do not violate this rule. After Phase A0 is marked DONE, `AGENTS.md` reverts
  to read-only for all remaining phases.

---

## Definition of Done

**REVIEW READY** — owning agent has verified:
- [ ] Changes match confirmed phase plan (no scope creep)
- [ ] Unit tests written and passing (`npm test`)
- [ ] Documentation written for all new/modified public API
- [ ] `npm run build` exits 0
- [ ] `npm run lint:check` exits 0
- [ ] No new `any` types
- [ ] `HANDOFF.md` updated to REVIEW READY with change summary and review request
- [ ] Reviewing agent has written `APPROVED` in the Gate 4 section
- [ ] PR opened — CI + auto-merge handles the rest

**MERGED** — reviewing agent wrote APPROVED, owning agent opened the PR, CI passed,
PR squash-merged automatically, branch deleted, `HANDOFF.md` updated to `MERGED`.
