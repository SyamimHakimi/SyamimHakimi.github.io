# Deployment Runbook

## Overview

This site deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

## Required GitHub Actions Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON content of a Firebase service account key. Used to deploy Firestore rules. Generate at: Firebase console → Project Settings → Service Accounts → Generate new private key. Paste the full JSON as a single-line string. |
| `TELEGRAM_TOKEN` | Telegram bot token from @BotFather. Used to send deploy notifications. |
| `TELEGRAM_CHAT_ID` | Your personal Telegram user/chat ID. The bot must have received at least one message from you before it can send messages. |

## Workflow Jobs

```
push to main
  └── validate (lint + test + build)
        └── deploy-site (Astro → GitHub Pages)
              ├── deploy-rules (Firestore rules — isolated, won't revert site on failure)
              └── notify (Telegram — continue-on-error: true)
```

### Job 1: validate

Re-runs lint, type-check, test, and build on the merge commit. This is intentional — the merge commit may differ from the PR HEAD that `ci.yml` validated.

### Job 2: deploy-site

Builds the Astro static site and deploys to GitHub Pages. Requires the `github-pages` environment to be configured in repo Settings → Environments.

### Job 3: deploy-rules

Deploys `firestore.rules` using `firebase-tools`. Isolated from the site deploy — a rules failure does not revert the live site. If this job fails, fix `firestore.rules` and push again (or re-run the job manually).

Skipped if `FIREBASE_SERVICE_ACCOUNT` is not set.

### Job 4: notify

Sends a Telegram message on success or failure. `continue-on-error: true` means a missing or invalid Telegram secret will not fail the workflow or block the site deploy.

## Manual Deploy Steps

If the workflow is unavailable, deploy manually:

```bash
npm run build
npx firebase-tools deploy --only firestore:rules --project portfolio-9e62d
```

For GitHub Pages: push to `main` and let the workflow handle it.

## Firestore Index Deployment

Firestore composite indexes are declared in `firestore.indexes.json` and wired via `firebase.json`. They are deployed separately from the rules job. To deploy indexes:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json \
  npx firebase-tools deploy --only firestore:indexes --project portfolio-9e62d
```

## Content Updates

All content is stored in Firebase Firestore and read at runtime by Vue islands. To update content:

1. Go to the [Firebase console](https://console.firebase.google.com)
2. Open project `portfolio-9e62d`
3. Edit documents in the relevant collection
4. Changes appear on the live site immediately — no redeployment required

See `docs/content-governance.md` for collection ownership and schema documentation.

## GitHub Pages Tradeoffs

This site deliberately accepts certain tradeoffs in exchange for zero-cost, zero-ops hosting on GitHub Pages.

### Runtime content dependency

All portfolio content is fetched from Firebase Firestore at runtime by Vue islands. This means:

- **If Firestore is unavailable**, islands show an error state — the page shell and navigation still render from static HTML.
- **First-visit latency** includes a Firestore round-trip for each island. Islands use `client:visible` to defer fetches until the user scrolls to them, limiting simultaneous requests.
- **No SSR content indexing** — search engines see the static HTML shell. Islands render client-side, so their content is not included in the initial HTML response. For a personal portfolio this is acceptable; public-facing product content would require SSR or static generation.

### SEO limits

- Page titles, descriptions, and Open Graph tags are set statically in `BaseLayout.astro` and are fully crawlable.
- Island content (experience items, services, about text) is rendered client-side and not visible to crawlers that do not execute JavaScript.
- Mitigation: all critical identity information (name, contact, purpose) is in the static shell meta tags.

### Fallback behavior

- If a Vue island fails to mount (JS error, network timeout), the surrounding static layout remains intact.
- Each island shows a user-facing error message with the failure reason. There is no automatic retry — users must refresh.
- Firebase Firestore SDK includes offline persistence for browsers that support it, reducing the impact of short network interruptions on repeat visits.

### Upgrade path

If SEO requirements grow, the island architecture supports a migration to Astro SSR (with an adapter) or static pre-rendering with `getStaticProps`-equivalent patterns, without changing the Vue island components themselves.
