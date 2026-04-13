# syamim.

Personal portfolio website for Syamim Hakimi — photography, software engineering, and everything in between.

**Live site:** [syamimhakimi.github.io](https://syamimhakimi.github.io)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 6](https://astro.build) — static shell, island architecture |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Components | [Vue 3](https://vuejs.org) Composition API — islands only |
| Content | [Firebase Firestore](https://firebase.google.com/docs/firestore) — runtime reads, no build-time fetch |
| Validation | [Zod](https://zod.dev) — all Firestore payloads validated at the boundary |
| Charts | [ApexCharts](https://apexcharts.com) + vue3-apexcharts |
| Animations | [motion-v](https://motion.dev) — scroll-triggered, respects `prefers-reduced-motion` |
| Contact | [EmailJS](https://www.emailjs.com) — fully client-side, no backend |
| Testing | [Vitest](https://vitest.dev) + [@vue/test-utils](https://test-utils.vuejs.org) |
| Deployment | GitHub Pages via GitHub Actions |

---

## Pages

| Route | Description |
|---|---|
| `/` | Photography Journey — stats charts and featured photos |
| `/photography` | Full gallery — paginated grid with theme filter and lightbox |
| `/portfolio` | Experience timeline and personal projects |
| `/services` | Service offerings |
| `/about` | Profile, photography gear, favourite boardgames, and social links |
| `/contact` | Contact form via EmailJS |

---

## Local Development

```bash
npm install
npm run dev        # Start dev server at localhost:4321
npm run build      # Type-check + production build
npm run preview    # Preview the production build locally
npm run lint       # ESLint with auto-fix
npm run test       # Run Vitest unit tests
npm run type-check # TypeScript validation only
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Firebase client config (public API keys) is committed directly in `src/lib/firebase.ts` — it is safe to do so for client-side Firebase projects. Only secrets (EmailJS keys, service account credentials) live in `.env`.

---

## Architecture

The site uses a **static-first, island architecture**:

- Astro builds static HTML for every page at deploy time — fast first paint, no server required.
- All content lives in Firebase Firestore and is fetched at runtime by Vue islands, so any update in the Firebase console appears on the live site immediately without redeployment.
- Vue is used **only** where a feature genuinely needs client-side state or browser APIs — charts, the photo gallery, the lightbox, the contact form, and the theme toggle.

```
src/
├── pages/          # Astro routes — static shells, no data fetching
├── layouts/        # BaseLayout (head/meta) + PageLayout (nav/footer)
├── components/
│   ├── islands/    # Vue island components (all client JS lives here)
│   └── ui/         # Shared Astro/Vue UI components
├── lib/
│   ├── firebase.ts           # Firebase app + Firestore instance
│   ├── composables/          # Firestore data composables
│   └── utils/                # Shared helpers
└── styles/
    └── global.css            # Tailwind base + design tokens
```

---

## Deployment

Deployments are handled automatically by GitHub Actions on every push to `main`:

1. **Validate** — lint, type-check, test, build
2. **Deploy site** — Astro build → GitHub Pages
3. **Deploy rules** — Firestore security rules + indexes
4. **Notify** — Telegram notification on success or failure

Required GitHub Actions secrets:

| Secret | Purpose |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON for deploying Firestore rules |
| `TELEGRAM_TOKEN` | Telegram bot token for deploy notifications |
| `TELEGRAM_CHAT_ID` | Telegram chat ID for deploy notifications |
