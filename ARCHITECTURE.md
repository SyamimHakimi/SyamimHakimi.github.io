# ARCHITECTURE.md — SyamimHakimi.github.io

This document is the authoritative architecture reference for the Astro 6 rebuild.
It is produced by Phase A0 and remains stable across all subsequent phases.
For commands and quick-start guidance, see `CLAUDE.md`.
For agent coordination rules, see `AGENTS.md`.

---

## Overview

**SyamimHakimi.github.io** is a personal portfolio and photography website.

| Concern       | Decision                                                              |
|---------------|-----------------------------------------------------------------------|
| Framework     | Astro 6 — static shell, island architecture                           |
| Hosting       | GitHub Pages — static files only, no server-side runtime              |
| Styling       | Tailwind CSS 4 via `@tailwindcss/vite`                                |
| Interactivity | Vue 3 islands (Composition API) — only where browser APIs are needed  |
| Content       | Firebase Firestore — all content fetched at runtime, no build-time fetch |
| Icons         | lucide-vue-next — tree-shakeable SVG icons                            |
| Animations    | motion-v — scroll-triggered, respects `prefers-reduced-motion`        |
| Contact       | EmailJS — fully client-side, no backend required                      |
| Auth          | Firebase Auth — scaffolded in Phase A2 for future admin editing flows |
| Validation    | Zod — all Firestore payloads validated at runtime before reaching UI  |
| Testing       | Vitest + @vue/test-utils                                              |
| TypeScript    | Strict mode — enabled in Phase A7                                     |

---

## Project Structure

```
/
├── src/
│   ├── pages/                   # Astro page routes — static HTML shells only
│   │   ├── index.astro          # / — Photography Journey
│   │   ├── photography.astro    # /photography — Full gallery
│   │   ├── portfolio.astro      # /portfolio — Experience + projects
│   │   ├── services.astro       # /services — Service offerings
│   │   ├── about.astro          # /about — Profile, gear, boardgames
│   │   ├── contact.astro        # /contact — EmailJS form
│   │   └── 404.astro            # /404 — Error page
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro     # <head>, meta tags, body wrapper
│   │   └── PageLayout.astro     # Header (+ ThemeToggle island), nav, main, footer
│   │
│   ├── components/
│   │   ├── islands/             # Vue islands — all client-side JS lives here
│   │   │   ├── PhotographyJourney.vue
│   │   │   ├── GalleryGrid.vue
│   │   │   ├── GalleryLightbox.vue
│   │   │   ├── PortfolioSection.vue
│   │   │   ├── ServicesSection.vue
│   │   │   ├── AboutMe.vue
│   │   │   ├── ContactForm.vue
│   │   │   └── ThemeToggle.vue
│   │   └── *.astro              # Static Astro components — no client JS
│   │
│   ├── lib/
│   │   ├── firebase.ts          # Firebase app init + Firestore instance
│   │   ├── composables/         # Firestore data composables (one per content domain)
│   │   │   ├── useStatistics.ts
│   │   │   ├── useGallery.ts
│   │   │   ├── usePortfolio.ts
│   │   │   ├── useServices.ts
│   │   │   └── useAboutMe.ts
│   │   └── utils/               # Shared helpers (formatting, sorting, etc.)
│   │
│   └── styles/
│       └── global.css           # Tailwind base + custom design tokens
│
├── public/                      # Static assets served as-is
├── export/                      # One-time Firestore JSON archive (Phase A1, read-only after)
├── archive/legacy-vue-app/      # Previous Vue SPA — archived in Phase A2, never modified
├── scripts/                     # Developer tooling (ui-preview, mcp wrapper)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # PR validation: lint + type-check + test + build
│   │   └── deploy.yml           # Main branch deploy: validate → site → rules → notify
│   └── pull_request_template.md
├── astro.config.mjs
├── tailwind.config.mjs          # (if needed; Tailwind 4 may be config-file-free)
├── tsconfig.json
└── vitest.config.ts
```

---

## Route Map

| Route          | Page file              | Vue island(s) mounted                            |
|----------------|------------------------|--------------------------------------------------|
| `/`            | `index.astro`          | `PhotographyJourney.vue`                         |
| `/photography` | `photography.astro`    | `GalleryGrid.vue`, `GalleryLightbox.vue`         |
| `/portfolio`   | `portfolio.astro`      | `PortfolioSection.vue`                           |
| `/services`    | `services.astro`       | `ServicesSection.vue`                            |
| `/about`       | `about.astro`          | `AboutMe.vue`                                    |
| `/contact`     | `contact.astro`        | `ContactForm.vue`                                |
| `/404`         | `404.astro`            | —                                                |

All routes are real URL paths — no hash routing. Astro generates a static HTML file
for each route at build time. The page files are pure structural shells; they mount
islands but perform no data fetching themselves.

---

## Vue Islands

Vue is used **only** where a feature requires client state, browser APIs, or an
interactive third-party library. Every island is self-contained: it owns its data
fetching via a composable and renders its own loading/empty/error/retry states.

| Island                   | Directive        | Composable        | Reason for island                         |
|--------------------------|------------------|-------------------|-------------------------------------------|
| `PhotographyJourney.vue` | `client:visible` | `useStatistics()` | ApexCharts requires browser canvas API    |
| `GalleryGrid.vue`        | `client:visible` | `useGallery()`    | Paginated state + Firestore reads         |
| `GalleryLightbox.vue`    | `client:visible` | —                 | Interactive viewer, browser DOM APIs      |
| `PortfolioSection.vue`   | `client:visible` | `usePortfolio()`  | Runtime Firestore reads                   |
| `ServicesSection.vue`    | `client:visible` | `useServices()`   | Runtime Firestore reads                   |
| `AboutMe.vue`            | `client:visible` | `useAboutMe()`    | Runtime Firestore reads                   |
| `ContactForm.vue`        | `client:load`    | —                 | EmailJS requires browser fetch on mount   |
| `ThemeToggle.vue`        | `client:load`    | —                 | Reads/writes `localStorage` on mount      |

**`client:visible`** — hydrates only when the island scrolls into the viewport.
Used for all content islands to avoid loading Firestore data for off-screen sections.

**`client:load`** — hydrates immediately on page load.
Used for `ContactForm` (must be ready before the user reaches it).

**Theme flash prevention** — `ThemeToggle.vue` uses `client:load`, but Vue hydration
runs after first paint, which is too late to prevent a flash of wrong theme for users
with a saved preference. `BaseLayout.astro` must include an inline `<script>` in
`<head>` that reads `localStorage.theme` and sets `data-theme="dark"` (or removes the
attribute) on `<html>` synchronously before any paint occurs. The Vue island then takes
over for subsequent toggles. All CSS dark-mode rules must use `[data-theme="dark"]` as
the selector to match this contract.

**Tailwind dark-variant wiring** — Tailwind CSS 4's `dark:` variant defaults to
`prefers-color-scheme` and does **not** react to a `data-theme` attribute unless
explicitly overridden. Phase A4 must add the following to `src/styles/global.css`:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

This makes every `dark:` utility class activate when any ancestor element carries
`data-theme="dark"`, which is set on `<html>` by the pre-paint inline script.

**Rule:** No Vue island is added unless the feature genuinely requires client state
or a browser API. Pure markup sections are Astro components.

---

## Data Flow

```
Firebase Firestore
      │
      ▼  (runtime, on island mount)
Composable (useXxx.ts)
      │  getDocs() / onSnapshot()
      ▼
Zod validator
      │  parse() — throws on invalid shape
      ▼
Typed data (TypeScript interface)
      │
      ▼
Vue island template → rendered UI
```

All content flows at runtime — nothing is fetched at build time. Astro pages are
static HTML shells. Firestore changes appear on the live site immediately without
redeployment.

### Composables

| Composable        | Firestore collection(s)                                          | Data returned                              |
|-------------------|------------------------------------------------------------------|--------------------------------------------|
| `useStatistics()` | `statistics`                                                     | Photography stats for ApexCharts           |
| `useGallery()`    | `photos`                                                         | Paginated photos with cursor-based queries |
| `usePortfolio()`  | `experience/{platforms,protocols,frameworks,languages}/item`, `projects/XYdqe9OyXNSUEzZ8kqwn` (singleton + `techstack` subcollection) | Experience sections + personal projects    |
| `useServices()`   | `services`                                                       | Service types and offerings                |
| `useAboutMe()`    | `profile/ddIhV8IxV5DjciJY7UxW` (singleton), `photography-gears`, `favourite-boardgames`, `social-media` | Profile, gear, boardgames, social links    |

All composables use the Firebase SDK v10+ modular API (`getDocs` / `onSnapshot`)
directly — no VueFire dependency. Local persistence uses
`initializeFirestore({ localCache: persistentLocalCache() })` (the v10+ replacement
for the deprecated `enableIndexedDbPersistence()`).

---

## Firestore Data Model

### Security model

- **Public reads** — all content collections are readable without authentication.
  The site is a public portfolio; no login is required to view any content.
- **Restricted writes** — all writes require Firebase Auth. Editing happens via the
  Firebase console today; a lightweight admin UI is planned for later.
- Rules are deployed via `firebase deploy --only firestore:rules` in Phase A6.

### Collections

| Collection / Document  | Purpose                                 |
|------------------------|-----------------------------------------|
| `photos`               | Portfolio photos, paginated             |
| `statistics`           | Photography stats for charts            |
| `experience/{category}/item` | Experience items grouped by category (platforms, protocols, frameworks, languages) |
| `projects/XYdqe9OyXNSUEzZ8kqwn` | Singleton projects document + `techstack` subcollection |
| `services`             | Service offerings                       |
| `profile/ddIhV8IxV5DjciJY7UxW` | Singleton profile document              |
| `photography-gears`    | Camera and lens entries                 |
| `favourite-boardgames` | Favourite boardgames list               |
| `social-media`         | Social profile links                    |

Document shapes are defined as TypeScript interfaces with Zod validators in Phase A2.
The `export/` directory is the canonical shape reference during development — JSON
snapshots are produced by Phase A1 and committed to `export/` before Phase A2 begins.

---

## GitHub Pages Deployment

Astro is configured for static export targeting GitHub Pages:

```js
// astro.config.mjs
export default defineConfig({
  output: 'static',
  site: 'https://syamimhakimi.github.io',
  base: '/',           // no subdirectory — repo is the user Pages site
});
```

Build output goes to `dist/`. GitHub Actions deploys `dist/` to the `gh-pages` branch
(or uses the Actions Pages deploy method) on every push to `main`.

### Tradeoffs

| Concern | Tradeoff |
|---------|----------|
| SEO | Page shells are static HTML (good), but visible content requires JS (Firestore fetch). Crawlers that don't execute JS will see empty content areas. Acceptable for a portfolio; not suitable for content that needs full indexing. |
| Runtime dependency | Every page load depends on Firebase. If Firestore is unavailable, islands show error states. The static shell always loads. |
| Cold start | First visit fetches Firestore data over the network. Local IndexedDB persistence (`persistentLocalCache`) makes repeat visits faster. |

---

## Environment Variables

Astro exposes env vars to the browser only if prefixed with `PUBLIC_`. All Firebase
client config (API keys, project ID) is safe to commit and uses `PUBLIC_` — these
are not secrets.

| Variable | Scope | Purpose |
|----------|-------|---------|
| `PUBLIC_FIREBASE_API_KEY` | Client | Firebase project API key |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase Auth domain |
| `PUBLIC_FIREBASE_PROJECT_ID` | Client | Firestore project ID |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Firebase Storage bucket |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase Cloud Messaging |
| `PUBLIC_FIREBASE_APP_ID` | Client | Firebase App ID |
| `PUBLIC_EMAILJS_SERVICE_ID` | Client | EmailJS service identifier |
| `PUBLIC_EMAILJS_TEMPLATE_ID` | Client | EmailJS template identifier |
| `PUBLIC_EMAILJS_PUBLIC_KEY` | Client | EmailJS public key |
| `GOOGLE_APPLICATION_CREDENTIALS` | Local only | Path to service account JSON (Phase A1 export script) |
| `FIREBASE_SERVICE_ACCOUNT` | GitHub Actions secret | Full JSON content of service account (Phase A6 deploy) |
| `TELEGRAM_TOKEN` | GitHub Actions secret | Telegram bot token (deploy notifications) |
| `TELEGRAM_CHAT_ID` | GitHub Actions secret | Telegram chat ID (deploy notifications) |

`GOOGLE_APPLICATION_CREDENTIALS` and `FIREBASE_SERVICE_ACCOUNT` reference the same
service account key file — different formats for different contexts. See Phase A1 in
`HANDOFF.md` for the full explanation.

All vars are documented in `.env.example`.

---

## Runtime UX Requirements

Every Firestore-backed island must implement all four states:

| State | Trigger | Required UI |
|-------|---------|-------------|
| **Loading** | Firestore fetch in progress | Skeleton screen matching the layout of the loaded state — no spinners, no blank white space |
| **Empty** | Fetch succeeded, collection has no documents | Friendly message explaining no content is available yet |
| **Error** | Fetch failed (network, rules, etc.) | Error message + visible retry button; does not crash the page |
| **Retry** | User clicks retry after error | Re-triggers the composable fetch; shows loading state again |

Loading skeletons must match the approximate layout of the populated state to prevent
layout shift when data arrives.

All animations (motion-v) must be skipped when `prefers-reduced-motion: reduce` is set.

---

## Content Editing Workflow

**Current (Phase A2 onwards):** Edit content directly in the Firebase console.
Changes appear on the live site immediately — no redeployment required.

**Future (post-Phase A7):** A lightweight admin UI (separate from this repo or a
protected route) will provide a friendlier editing interface. Firebase Auth is
scaffolded in Phase A2 to avoid a breaking refactor later.

Firestore security rules enforce that writes require authentication regardless of
editing method. The console bypasses rules for the project owner; the future admin UI
will use Firebase Auth.
