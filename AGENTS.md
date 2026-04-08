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

**UI preview workflow:** After `ui-ux-pro-max` produces a design, Claude must:
1. Save the output as `scripts/<phase>-<component>.html`
2. Run `npm run ui:preview -- --file scripts/<file>.html --label "<Phase> — <Component>"`
3. This sends desktop + mobile screenshots to Syamim's Telegram for review
4. Wait for Syamim's feedback before proceeding to implementation

Syamim reviews designs on Telegram and replies with approval or change requests.
No island or layout implementation begins until the preview has been reviewed.

Phases requiring `ui-ux-pro-max` + Telegram preview:
- **Phase A3** — Route and layout rebuild
- **Phase A4** — Design system and Tailwind build
- **Phase A5** — Vue island component design

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
mid-execution scope changes. Syamim is not in the ping-pong loop — only Gate 2 approval
and final merge require Syamim's action.

---

## Workflow: Four Gates Per Phase

```
GATE 1 — Architecture Agreement
  Both agents ping-pong all open questions until AGREED.
  → Produces: AGREED on platform, tech choices, phase ownership

GATE 2 — Per-Phase Plan Confirmation
  Detailed plan per phase: files touched, packages, unit test expectations,
  documentation expectations, acceptance criteria. Both agents ping-pong until AGREED.
  Syamim writes APPROVED before execution begins.
  → Produces: APPROVED status per phase

GATE 3 — Execution
  Owning agent creates branch, writes code, tests, and docs.
  Opus for any planning decisions that arise mid-execution.
  Sonnet for code writing. Haiku for documentation. ui-ux-pro-max for UI/UX.
  → Produces: REVIEW READY + branch pushed

GATE 4 — Peer Code Review
  Non-owning agent reviews branch: correctness, tests, docs, scope, acceptance criteria.
  Writes APPROVED or REQUEST CHANGES in HANDOFF.md.
  If REQUEST CHANGES: owning agent addresses, pings back, reviewer re-reviews.
  Both APPROVED → MERGE READY. Syamim merges.
  → Produces: MERGE READY
```

No gate can be skipped. An agent that begins execution before APPROVED is in violation.

---

## Unit Test Requirements

Every phase that writes or modifies logic must include unit tests.

**What to test:**
- All Vue island components: prop validation, emitted events, key conditional rendering
- All utility functions and composables in `src/lib/`
- Content collection schema validation: test valid and invalid fixture data
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
| Astro page              | Comment at top describing what collection it queries and the page purpose  |
| Astro layout            | JSDoc on props (title, description, slot contracts)                        |
| Vue island component    | JSDoc on props, emits, and why it is an island (not static Astro)          |
| Content collection schema | TSDoc on each field explaining type and expected values                  |
| Utility / helper        | JSDoc with `@param` and `@returns`                                         |
| New env variable        | Entry in `.env.example` with a comment explaining the expected value       |
| `astro.config.mjs` change | Inline comment explaining the config option and why it was set           |

**Style:** TSDoc (`/** */`) for public API. Inline `//` only for non-obvious logic.
Comments explain *why*, not *what*. No comments on self-evident code.

---

## Code Review Protocol (Gate 4)

1. Non-owning agent checks out the branch and reviews all changed files
2. Reviewer checks: acceptance criteria met, tests pass, docs present, no scope creep,
   no new `any` types, `npm run build` and `npm run lint` pass
3. Reviewer writes verdict in the phase's Gate 4 section in `HANDOFF.md`:
   - `APPROVED` — ready to merge
   - `REQUEST CHANGES` — list each issue with file + line reference
4. If REQUEST CHANGES: owning agent addresses, pings reviewer, reviewer re-reviews
5. Both APPROVED → MERGE READY → Syamim merges

Reviewer should complete review in the same working session when notified.

---

## Branch Naming Convention

```
claude/phase-<slug>     # Branches owned by Claude
codex/phase-<slug>      # Branches owned by Codex
```

Always create a new branch before starting. Never commit directly to `main`.

---

## Handoff Protocol

**Starting a phase** (after APPROVED):
1. `git checkout -b <agent>/phase-<slug>`
2. Update phase entry in `HANDOFF.md`: STATUS → `IN PROGRESS`
3. Commit the `HANDOFF.md` update as the first commit

**Finishing a phase:**
1. `npm test` — all tests pass
2. `npm run build` — exits 0
3. `npm run lint` — exits 0
4. Self-check documentation requirements
5. Update `HANDOFF.md`: STATUS → `REVIEW READY`, add change summary, tag reviewer
6. Do NOT merge — push branch and wait for Gate 4

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
6. **`npm run build`, `npm run lint`, and `npm test` must all pass before REVIEW READY.**
7. **Do not add dependencies** without listing them in the phase plan first.
8. **Do not remove dependencies** without verifying no remaining imports.
9. **Do not introduce `any` types.**
10. **Commit messages:** `<type>(phase-A<N>): <description>`
    e.g. `feat(phase-A4): add Tailwind dark mode token system`

---

## Phase Dependency Order

```
Phase A0 (architecture spike + docs update)
└── Phase A1 (baseline audit + Firestore export)
    ├── Phase A2 (Firebase SDK + data models)  ← Claude
    │   └── Phase A3 (route + layout rebuild) ← Claude + ui-ux-pro-max
    │       ├── Phase A4 (design system)      ← Claude + ui-ux-pro-max
    │       │   ├── Phase A5 (Vue islands)    ← Claude + ui-ux-pro-max
    │       │   └── Phase A6 (SEO + hosting)  ← Codex
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
- [ ] `npm run lint` exits 0
- [ ] No new `any` types
- [ ] `HANDOFF.md` updated to REVIEW READY with change summary

**MERGE READY** — reviewing agent has independently verified all above and written
`APPROVED` in `HANDOFF.md`.
