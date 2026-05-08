# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Astro dev server
npm run build        # Type-check + Astro build
npm run preview      # Preview production build locally
npm run lint         # ESLint with auto-fix
npm run test         # Run Vitest unit tests
npm run type-check   # TypeScript validation only
npm run deploy       # Build + deploy to GitHub Pages
npm run ui:preview   # Screenshot an HTML mockup and send to Syamim's Telegram
                     # Usage: npm run ui:preview -- --file scripts/mockup.html --label "Title"
                     # (scripts/ is gitignored — mockup.html is a local-only working file)
node --env-file=.env scripts/firestore-export.mjs  # Re-export Firestore data (Phase A1, one-time — local script, not in git)
```

## Architecture

This is an **Astro 6 + TypeScript personal portfolio website** deployed to GitHub Pages.
It uses a static-first, island architecture — the site shell is built at deploy time;
all content is read from Firebase Firestore at runtime via Vue islands, so any change
in Firebase appears on the live site immediately without redeployment.

**Core Stack:**
- Astro 6 (static site generator, island architecture)
- TypeScript (strict mode enabled in Phase A7 hardening)
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Vue 3 (Composition API — islands only, not the site shell)
- Firebase Firestore (all content — runtime reads via Vue islands, no build-time fetch)
- Firebase SDK v10+ (modular, tree-shakeable; Firestore + Auth)
- Zod (runtime schema validation — all Firestore payloads validated before reaching UI)
- lucide-vue-next (tree-shakeable icons)
- motion-v (scroll-triggered animations, respects `prefers-reduced-motion`)
- EmailJS (contact form, client-side only)
- ApexCharts + vue3-apexcharts (photography statistics charts)
- Vitest + @vue/test-utils (unit testing)

## Project Structure

```
src/
├── pages/               # Astro page routes (static shells — no data fetching here)
│   ├── index.astro      # Photography Journey — mounts PhotographyJourney.vue island
│   ├── photography.astro # Full gallery — mounts GalleryGrid.vue + GalleryLightbox.vue
│   ├── portfolio.astro  # Mounts PortfolioSection.vue island
│   ├── services.astro   # Mounts ServicesSection.vue island
│   ├── about.astro      # Mounts AboutMe.vue island
│   ├── contact.astro    # Mounts ContactForm.vue island
│   └── 404.astro
├── layouts/
│   ├── BaseLayout.astro  # <head>, meta, body wrapper
│   └── PageLayout.astro  # Header (with ThemeToggle island), nav, main, footer
├── components/
│   ├── islands/          # Vue island components (all client JS lives here)
│   │   ├── PhotographyJourney.vue  # client:visible — stats charts + featured photos
│   │   ├── GalleryGrid.vue         # client:visible — paginated photo grid
│   │   ├── GalleryLightbox.vue     # client:visible — lightbox viewer
│   │   ├── PortfolioSection.vue    # client:visible — experience + projects
│   │   ├── ServicesSection.vue     # client:visible — service offerings
│   │   ├── AboutMe.vue             # client:visible — profile, gear, boardgames
│   │   ├── ContactForm.vue         # client:load — EmailJS form
│   │   └── ThemeToggle.vue         # client:load — reads/writes localStorage
│   └── ...               # Astro components (no client JS, pure markup)
├── lib/
│   ├── firebase.ts       # Firebase app init + Firestore instance (safe to commit)
│   ├── composables/      # Firestore data composables (all content reads)
│   │   ├── useStatistics.ts  # Photography stats for charts
│   │   ├── useGallery.ts     # Paginated gallery photos
│   │   ├── usePortfolio.ts   # Experience sections + personal projects
│   │   ├── useServices.ts    # Service offerings
│   │   └── useAboutMe.ts     # Profile, gear, boardgames, social media
│   └── utils/            # Shared helpers (formatting, sorting, etc.)
├── styles/
│   └── global.css        # Tailwind base + custom design tokens
export/                   # Firestore export JSON (Phase A1 archive — read-only after A1)
public/                   # Static assets (images, og-image.jpg, robots.txt)
scripts/
├── ui-preview.mjs        # Screenshots an HTML file and sends desktop + mobile to Telegram
├── firestore-export.mjs  # Re-export Firestore data (one-time, Phase A1)
├── github-mcp-wrapper.mjs # MCP server wrapper for GitHub API
└── agents/               # Agent-only automation (not for developer use)
    ├── ai-review.mjs     # CI-gated auto-merge for phase PRs
    ├── create-pr.mjs     # Create a GitHub PR via App auth
    ├── merge-pr.mjs      # Merge a PR via App auth
    ├── check-ci.mjs      # Poll CI status for a PR
    ├── update-handoff.mjs # Update HANDOFF.md on main via API
    └── push-handoff.mjs  # Push HANDOFF.md changes to a branch
```

## Data Model

There are **no Astro content collections**. All content is stored in Firebase Firestore
and read at runtime by Vue islands. Syamim can update any content in the Firebase console
and it will appear on the site immediately — no redeployment required.

Firestore data is accessed exclusively through composables in `src/lib/composables/`.
TypeScript interfaces for all data models live alongside their composables.

| Composable          | Firestore Collection(s)                                           | Consumed by                |
|---------------------|-------------------------------------------------------------------|----------------------------|
| `useStatistics()`   | `statistics`                                                      | `PhotographyJourney.vue`   |
| `useGallery()`      | `photos`                                                          | `GalleryGrid.vue`, `GalleryLightbox.vue` |
| `usePortfolio()`    | `experience/{platforms,protocols,frameworks,languages}/item`, `projects/XYdqe9OyXNSUEzZ8kqwn` (singleton + `techstack` subcollection) | `PortfolioSection.vue`     |
| `useServices()`     | `services`                                                        | `ServicesSection.vue`      |
| `useAboutMe()`      | `profile/ddIhV8IxV5DjciJY7UxW` (singleton), `photography-gears`, `favourite-boardgames`, `social-media` | `AboutMe.vue`         |

The `export/` directory is a one-time Phase A1 archive of Firestore data (JSON snapshots).
It is **read-only after Phase A1** and is never read at runtime or build time.

## Vue Islands

Vue is used **only** where a feature requires client state, browser APIs, or a
third-party interactive library. Every island reads its own data from Firestore.
The rule: no Vue island unless genuinely needed.

| Island                    | Directive        | Composable          | Reason                                  |
|---------------------------|------------------|---------------------|-----------------------------------------|
| `PhotographyJourney.vue`  | `client:visible` | `useStatistics()`   | ApexCharts needs browser canvas         |
| `GalleryGrid.vue`         | `client:visible` | `useGallery()`      | Paginated state + Firestore reads       |
| `GalleryLightbox.vue`     | `client:visible` | —                   | Interactive image viewer (browser APIs) |
| `PortfolioSection.vue`    | `client:visible` | `usePortfolio()`    | Runtime Firestore reads                 |
| `ServicesSection.vue`     | `client:visible` | `useServices()`     | Runtime Firestore reads                 |
| `AboutMe.vue`             | `client:visible` | `useAboutMe()`      | Runtime Firestore reads                 |
| `ContactForm.vue`         | `client:load`    | —                   | EmailJS requires browser fetch          |
| `ThemeToggle.vue`         | `client:load`    | —                   | Reads/writes localStorage on mount      |

## Data Flow

All content flows: Firebase Firestore → Vue island composable → rendered UI (runtime).

No content is fetched at build time. Astro pages are pure structural shells — they mount
Vue islands but perform no data fetching themselves.

Theme persists to `localStorage` (key: `theme`). `BaseLayout.astro` includes an inline
`<script>` in `<head>` that reads `localStorage.theme` and sets `data-theme="dark"` on
`<html>` before first paint to prevent a flash of wrong theme. `ThemeToggle.vue` then
manages subsequent toggles. All dark-mode CSS must use `[data-theme="dark"]` as the selector.

Tailwind's `dark:` variant must be wired to this attribute in `src/styles/global.css`:
```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```
Without this override, Tailwind defaults to `prefers-color-scheme` and `dark:` utilities
will not respond to the `data-theme` attribute toggle.

## Routing

All routes are real URL paths (no hash routing). Astro generates static HTML for each
page at build time. The default route `/` is the Photography Journey landing page (`src/pages/index.astro`).
The full gallery lives at `/photography` (`src/pages/photography.astro`).

## Environment Variables

Astro exposes env vars to the client only if prefixed with `PUBLIC_`. Server-only vars
have no prefix and are never sent to the browser.

| Prefix    | Accessible in          | Example                          |
|-----------|------------------------|----------------------------------|
| `PUBLIC_` | Client (Vue islands)   | `PUBLIC_EMAILJS_SERVICE_ID`      |
| *(none)*  | Server / build time only | `FIREBASE_SERVICE_ACCOUNT_KEY` |

Required vars are documented in `.env.example`.
Firebase client config (public API keys) lives in `src/lib/firebase.ts` — safe to commit.
Do not use the old `VITE_APP_` prefix; it is not the Astro convention.

## Testing

Vitest is configured in `vitest.config.ts`. Tests live alongside source files as
`*.test.ts` / `*.test.vue` or under `src/__tests__/`.

Run `npm test` before marking any phase REVIEW READY.

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`. Astro builds to `dist/` with
`output: 'static'` and the `site` + `base` config set for GitHub Pages.

## Mandatory Workflows

### PR Workflow (ALL changes)

Every change must go through a feature branch and PR — direct push to `main` is blocked.

```bash
# 1. Create feature branch
git checkout -b feat/<description>

# 2. Commit changes, then run Codex review (MANDATORY gate before PR)
codex review --base main

# 3. Fix any P1/P2 findings from Codex, then create PR
node --env-file=.env .github/scripts/agents/create-pr.mjs "title" "feat/<description>" "body"

# 4. Poll CI until green
node --env-file=.env .github/scripts/agents/check-ci.mjs <PR#>

# 5. Merge once CI passes
node --env-file=.env .github/scripts/agents/merge-pr.mjs <PR#>

# 6. Sync local main
git checkout main && git pull origin main
```

**Never skip the Codex review.** It is a mandatory gate before `create-pr.mjs` for ALL changes.

### UI / Visual Change Workflow

If a task changes how anything **looks, feels, moves, or is interacted with**, this full workflow is required — no shortcuts.

```
1. Invoke UIUXProMax skill (Skill tool: "ui-ux-pro-max:ui-ux-pro-max")
2. Run domain search for design guidance:
     cd "C:\Users\Syamim\.claude\plugins\cache\ui-ux-pro-max-skill\ui-ux-pro-max\2.5.0"
     py src/ui-ux-pro-max/scripts/search.py "<keywords>" --domain <domain> -n 8
3. Produce mockup HTML (scripts/mockup.html)
4. Send to Telegram for approval:
     npm run ui:preview -- --file scripts/mockup.html --label "Description"
5. Wait for Syamim's approval — do NOT implement before approval
6. Implement the approved design
7. Run Codex review (see PR Workflow above)
8. Create PR → poll CI → merge
```

**Do NOT implement UI changes before completing steps 1–5.**
**Do NOT run UIUXProMax mid-implementation as a post-hoc check — it must come first.**

#### UIUXProMax script path (Windows)

- Script: `C:\Users\Syamim\.claude\plugins\cache\ui-ux-pro-max-skill\ui-ux-pro-max\2.5.0\src\ui-ux-pro-max\scripts\search.py`
- Always use `py` (not `python3`) — `python3` is not in PATH on this machine
- Always `cd` to the `2.5.0` directory before running; never guess the path
- The Skill tool loads the ruleset into context; the Python script runs domain queries — both steps are needed

### Firebase / Firestore Updates

The service account key is at `portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json` (project root).
Scripts use this file directly — no `GOOGLE_APPLICATION_CREDENTIALS` env var needed.
Follow the same JWT → OAuth → Firestore REST pattern used in the local `scripts/update-photography-stats.mjs`.
Always do a dry run first (`node script.mjs`) before writing (`node script.mjs --write`).
