# Scripts

Scripts for managing photo ingestion, content updates, and Firebase data from the command line.
All Firestore/Storage scripts use the Firebase REST API with a service account — no Firebase Admin SDK required.

---

## Prerequisites

- Node.js 22+
- Service account JSON at the repo root: `portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json`
- `.private-data/photo-manifest.json` — created automatically on first stats run

---

## Photo ingest workflow

Run these steps in order when importing photos from a new SD card.

### 1. Scan and update statistics

Scan a new DCIM folder, extract EXIF metadata, and append stats to Firestore.

```bash
# Dry run (no --write) — check numbers before committing
node scripts/update-photography-stats.mjs --dir "D:/DCIM/972_FUJI" --mode append --save-manifest

# Write to Firestore when happy
node scripts/update-photography-stats.mjs --dir "D:/DCIM/972_FUJI" --mode append --save-manifest --write
```

> **Important:** In append mode the manifest saves even on dry run. Running `--write` a second time for the same batch will double-count — don't do it.

### 2. Mark favourites in the manifest

Edit `scripts/set-gallery-favourites.mjs` to add/remove entries in the `FAVOURITES` array (folder, file, title). Then run:

```bash
node scripts/set-gallery-favourites.mjs           # dry run
node scripts/set-gallery-favourites.mjs --write   # save to manifest
```

### 3. Upload favourite photos

Upload marked favourites to Firebase Storage and create their Firestore `photos` documents.

```bash
node scripts/upload-photos-from-manifest.mjs           # dry run
node scripts/upload-photos-from-manifest.mjs --write   # upload + create docs
```

### 4. Classify themes with CLIP

Run CLIP zero-shot classification on uploaded favourites to populate the `theme` field. Uses Firebase Storage download URLs — no local files needed.

```bash
node scripts/classify-favourite-themes.mjs           # dry run (preview predictions)
node scripts/classify-favourite-themes.mjs --write   # save to manifest + patch Firestore
node scripts/classify-favourite-themes.mjs --all     # re-classify even if theme already set
```

> The CLIP model (`Xenova/clip-vit-base-patch32`, ~350 MB) downloads automatically on first run and is cached locally.
> Default labels: `Portrait · Street · Travel · Architecture · Nature · Event · Abstract`

### 5. Write theme stats to Firestore

Push theme counts from the full manifest to `statistics/theme-stats`.

```bash
node scripts/write-theme-stats.mjs           # dry run
node scripts/write-theme-stats.mjs --write   # write
```

---

## Script reference

### Photo pipeline

#### `update-photography-stats.mjs`

Scans a local image directory, extracts EXIF metadata, and updates Firestore statistics. Can also classify themes via CLIP during the scan (requires local files).

```
node scripts/update-photography-stats.mjs --dir <path> [options]
```

| Flag | Default | Description |
|---|---|---|
| `--dir <path>` | *(required unless `--manifest-only`)* | Directory of images to scan |
| `--mode overwrite\|append` | `overwrite` | `append` adds onto existing stats; `overwrite` rebuilds from the scanned directory only |
| `--write` | off | Write to Firestore (default is dry run) |
| `--save-manifest` | off | Save results to the local manifest |
| `--manifest-only` | off | Build stats from the manifest without scanning a directory |
| `--classify-themes` | off | Run CLIP zero-shot classification on each image (requires local files) |
| `--theme-labels <csv>` | `Portrait,Street,...` | Comma-separated CLIP labels |
| `--theme-model <id>` | `Xenova/clip-vit-base-patch32` | Hugging Face model ID |
| `--theme-min-score <n>` | `0` | Minimum CLIP confidence to keep a prediction |
| `--fallback-file-mtime` | off | Use file modified time when EXIF date is missing |
| `--manifest <path>` | `.private-data/photo-manifest.json` | Manifest file path |
| `--credentials <path>` | default JSON | Firebase service account JSON |

**Firestore documents written (with `--write`):**

| Document | Content |
|---|---|
| `statistics/stats` | `total_photos`, `total_outings` |
| `statistics/photo-stats` | Per-month photo counts |
| `statistics/focal-stats` | Per-focal-length counts |
| `statistics/lens_stats` | Per-lens counts |
| `statistics/theme-stats` | Only when `--classify-themes` is set |
| `statistics/generated-state` | Internal processed-hashes state |

#### `set-gallery-favourites.mjs`

Marks the curated list of favourite photos in the manifest. Edit the `FAVOURITES` array at the top of the file to add entries (`folder`, `file`, `title`). Clears the favourite flag on all other records.

```
node scripts/set-gallery-favourites.mjs           # dry run
node scripts/set-gallery-favourites.mjs --write   # persist to manifest
```

#### `upload-photos-from-manifest.mjs`

Uploads photos from the manifest to Firebase Storage (resized to max 2000px) and upserts their `photos` Firestore documents. Only uploads records where `favourite: true` and `uploaded` is not set, by default.

```
node scripts/upload-photos-from-manifest.mjs [options]
```

| Flag | Default | Description |
|---|---|---|
| `--write` | off | Actually upload (default is dry run) |
| `--all` | off | Upload all favourites, not just the unuploaded ones |
| `--include-uploaded` | off | Include records already marked `uploaded: true` |
| `--force` | off | Re-upload and overwrite existing Storage objects |
| `--where-file <substr>` | — | Only upload records whose path contains this string |
| `--where-hash <sha>` | — | Only upload the record with this exact hash |
| `--manifest <path>` | `.private-data/photo-manifest.json` | Manifest file path |
| `--credentials <path>` | default JSON | Firebase service account JSON |

#### `classify-favourite-themes.mjs`

Runs CLIP zero-shot image classification on favourite photos that have a `download_url` in the manifest. Does **not** require local image files. Updates `theme_suggested`, `theme_suggestion_score`, and `theme_model` in the manifest, and patches the `theme` field on Firestore `photos` documents.

```
node scripts/classify-favourite-themes.mjs           # dry run
node scripts/classify-favourite-themes.mjs --write   # save manifest + patch Firestore
node scripts/classify-favourite-themes.mjs --all     # re-classify all, not just unclassified
```

#### `write-theme-stats.mjs`

Reads all manifest records, tallies `theme_suggested`/`theme_final` labels, and writes only `statistics/theme-stats` to Firestore. Use this to reset inflated theme counts or push stats after a classification run.

```
node scripts/write-theme-stats.mjs [--write] [--manifest <path>]
```

#### `update-photo-manifest.mjs`

Bulk-edit manifest records without touching JSON directly. Filter by file path, hash, theme, or upload status; then set or clear fields like `favourite`, `theme_final`, `recipe`, and `title`.

```
node scripts/update-photo-manifest.mjs [filter flags] [update flags] [--write]
```

**Filter flags:**

| Flag | Description |
|---|---|
| `--where-file <substr>` | Records whose path contains this substring |
| `--where-hash <sha>` | Exact hash match |
| `--where-theme-suggested <label>` | Exact `theme_suggested` value |
| `--where-theme-final <label>` | Exact `theme_final` value |
| `--where-theme-score-gte <n>` | `theme_suggestion_score` ≥ n |
| `--where-theme-score-lte <n>` | `theme_suggestion_score` ≤ n |
| `--where-favourite <true\|false>` | Filter by favourite flag |
| `--where-uploaded <true\|false>` | Filter by uploaded flag |
| `--limit <n>` | Cap number of records matched |

**Update flags:**

| Flag | Description |
|---|---|
| `--set-favourite <true\|false>` | Set favourite flag |
| `--set-theme-final <label>` | Override CLIP suggestion with a manual theme |
| `--clear-theme-final` | Remove manual theme override |
| `--set-recipe <name>` | Set film simulation / colour recipe |
| `--clear-recipe` | Remove recipe |
| `--set-title <text>` | Set display title |
| `--clear-title` | Remove title |

### Photo maintenance

#### `patch-photos-exif.mjs`

Backfills `aperture`, `shutter_speed`, and `focal_length` on Firestore `photos` documents using values from the manifest. Use this when photos were uploaded before EXIF fields were added to the upload script.

```
node scripts/patch-photos-exif.mjs           # dry run
node scripts/patch-photos-exif.mjs --write   # patch Firestore
```

#### `clear-gallery-favourites.mjs`

Clears the `favourite` flag on every document in the Firestore `photos` collection where `favourite == true`. Does not delete documents or touch other fields.

```
node scripts/clear-gallery-favourites.mjs          # dry run
node scripts/clear-gallery-favourites.mjs --write  # clear flags
```

#### `wipe-photos.mjs`

**Destructive.** Deletes every document in the Firestore `photos` collection and every object in Firebase Storage. Used to reset photo data from scratch.

```
node scripts/wipe-photos.mjs          # dry run — lists what would be deleted
node scripts/wipe-photos.mjs --write  # deletes everything
```

### Content management

These one-shot scripts update specific Firestore content. Edit the data at the top of each file, then run with `--write`.

| Script | What it updates |
|---|---|
| `add-experience-items.mjs` | Insert new items into `experience/{category}/item` |
| `add-project.mjs` | Add a project + techstack subcollection to Firestore |
| `update-project-description.mjs` | Update the personal project description |
| `update-services.mjs` | Recategorise and retitle service items |
| `update-profile.mjs` | Update profile fields (location, hobbies, etc.) |
| `update-social-media.mjs` | Update social media link/text entries |
| `update-boardgames.mjs` | Update boardgame names and tags |

All follow the same pattern:

```bash
node scripts/<script>.mjs           # dry run
node scripts/<script>.mjs --write   # commit to Firestore
```

### Utilities

#### `ui-preview.mjs`

Screenshots an HTML mockup file and sends desktop + mobile previews to Telegram. Invoked via `npm run ui:preview`.

```bash
npm run ui:preview -- --file scripts/mockup.html --label "Description"
```

#### `delete-firestore-docs.mjs`

Deletes specific Firestore documents by path. Edit the `DOCS_TO_DELETE` array at the top of the file before running.

```
node scripts/delete-firestore-docs.mjs           # dry run
node scripts/delete-firestore-docs.mjs --write   # delete
```

#### `list-services.mjs`

Reads the `services` collection from Firestore and prints a grouped summary to the console. No arguments needed.

```
node scripts/list-services.mjs
```

#### `check-new-favs.mjs`

Checks whether a hardcoded list of files are present in the manifest. Useful for verifying new FUJI roll photos were scanned before upload.

#### `check-themes.mjs`

Prints a summary of `theme` and `theme_suggested` coverage across manifest favourites. Useful for diagnosing missing gallery themes.

### CI agents

Scripts under `scripts/agents/` are invoked by Claude Code during the PR workflow — not for direct developer use.

| Script | Purpose |
|---|---|
| `create-pr.mjs` | Open a GitHub PR via App auth |
| `merge-pr.mjs` | Merge a PR via App auth |
| `check-ci.mjs` | Poll CI check status for a PR |
| `ai-review.mjs` | Auto-merge gate for phase PRs |
| `update-handoff.mjs` | Update `HANDOFF.md` via GitHub API |
| `push-handoff.mjs` | Push `HANDOFF.md` changes to a branch |

### MCP wrapper

`github-mcp-wrapper.mjs` — MCP server wrapper that exposes the GitHub API to Claude Code. Started automatically via Claude Code's MCP config; no manual invocation needed.

---

## Local manifest

The manifest lives at `.private-data/photo-manifest.json` (gitignored). It is the source of truth for all local photo metadata.

| Field | Description |
|---|---|
| `hash` | SHA-1 of the file — deduplication key |
| `file_path` | Absolute path on disk at scan time |
| `source_directory` | DCIM root folder |
| `capture_date` | From EXIF `DateTimeOriginal` |
| `outing_date` | `YYYY-MM-DD` shooting session key |
| `month_key` | `MM/YYYY` chart key |
| `lens_label` | From EXIF `LensModel` |
| `focal_length_35mm_label` | From EXIF `FocalLengthIn35mmFormat` |
| `aperture_label` | From EXIF `FNumber` (e.g. `f/2.8`) |
| `shutter_speed_label` | From EXIF `ExposureTime` (e.g. `1/250s`) |
| `theme_suggested` | CLIP zero-shot prediction |
| `theme_suggestion_score` | CLIP confidence (0–1) |
| `theme_model` | Model ID used for classification |
| `theme_final` | Manual override — takes precedence over `theme_suggested` |
| `title` | Display title for the photo |
| `recipe` | Film simulation / colour recipe name |
| `favourite` | Whether to feature in the gallery |
| `uploaded` | Whether the photo has been pushed to Firebase Storage |
| `firebase_doc_id` | Firestore document ID once uploaded |
| `storage_path` | Firebase Storage object path |
| `download_url` | Public Firebase Storage download URL |
| `uploaded_width` / `uploaded_height` | Dimensions after resize |

## Libraries

These modules are imported by the scripts above — not intended for direct use.

| File | Purpose |
|---|---|
| `photography-manifest-lib.mjs` | Load/save the manifest, merge records |
| `photography-stats-lib.mjs` | Build Firestore stat documents from records |
| `photography-metadata-lib.mjs` | EXIF field parsers (aperture, shutter speed) |
| `photo-manifest-edit-lib.mjs` | Filter + update manifest records in bulk |
| `photo-upload-lib.mjs` | Build Firestore photo documents, Storage paths |
| `firestore-export-lib.mjs` | Decode Firestore REST response format |
