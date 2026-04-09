# Firestore Export Archive

This directory is the immutable Phase A1 snapshot of the live Firestore content that powers the legacy portfolio app.

## Generation

- Script: `node --env-file=.env scripts/firestore-export.mjs`
- Required environment variable: `GOOGLE_APPLICATION_CREDENTIALS` (set in `.env`)
- Expected credential: path to a Firebase service account JSON file (never commit the file)

The export script authenticates with the Firestore REST API, decodes Firestore value types into plain JSON, and writes one file per agreed content area.

## Files

- `profile.json`
  - Singleton profile document from `profile/ddIhV8IxV5DjciJY7UxW`
- `services.json`
  - All service timeline items from `services`
- `portfolio.json`
  - Experience collections grouped by `platforms`, `protocols`, `frameworks`, and `languages`
- `projects.json`
  - Personal projects singleton document plus its `techstack` subcollection
- `boardgames.json`
  - Favourite boardgames from `favourite-boardgames`
- `photography-gear.json`
  - Camera and lens entries from `photography-gears`
- `social-media.json`
  - Social profile links from `social-media`
- `photos.json`
  - Photo gallery documents from `photos`
- `statistics.json`
  - Statistics documents from the `statistics` collection

## Intended Use

- Reference archive during the Astro migration
- Shape validation source for Phase A2 data model work
- Human-readable backup of runtime content at the time of export

This directory is not a runtime data source and should not be wired into the Astro app.
