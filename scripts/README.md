# Photography Scripts

Scripts for ingesting photos from an SD card into the site's Firebase backend.
All scripts use the Firebase REST API directly with a service account — no Firebase Admin SDK required.

---

## Prerequisites

- Node.js 22+
- `.env` file at the repo root with `GOOGLE_APPLICATION_CREDENTIALS` pointing to the Firebase service account JSON (or the default `portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json` in the repo root)
- A populated `.private-data/photo-manifest.json` (created automatically on first run)

---

## Typical workflow

### 1. Insert SD card and update stats

Scan a new DCIM folder and append its stats to Firestore. Run once per folder — sequentially if you have multiple.

```bash
# Dry run first (no --write)
node --env-file=.env scripts/update-photography-stats.mjs \
  --dir "D:/DCIM/972_FUJI" \
  --mode append \
  --save-manifest

# Write to Firestore when happy with the numbers
node --env-file=.env scripts/update-photography-stats.mjs \
  --dir "D:/DCIM/972_FUJI" \
  --mode append \
  --save-manifest \
  --write
```

> **Important:** In append mode the manifest is saved even during a dry run (no `--write`). Once the manifest is saved, running the same folders again with `--write` will produce the correct final totals because the script builds its batch from all accumulated manifest records. Do **not** run `--write` a second time for the same batch of folders — it will double-count.

### 2. Classify photo themes with CLIP

Run CLIP zero-shot classification on each folder to populate `theme_suggested` in the manifest. This does **not** write to Firestore.

```bash
# Run for every folder that has new or unclassified photos
node --env-file=.env scripts/update-photography-stats.mjs \
  --dir "D:/DCIM/972_FUJI" \
  --mode overwrite \
  --classify-themes \
  --save-manifest
```

Run on multiple folders with a shell loop:

```bash
for folder in 971_FUJI 972_FUJI; do
  node --env-file=.env scripts/update-photography-stats.mjs \
    --dir "D:/DCIM/$folder" \
    --mode overwrite \
    --classify-themes \
    --save-manifest
done
```

> The CLIP model (`Xenova/clip-vit-base-patch32`, ~350 MB) is downloaded automatically on first run and cached locally.

### 3. Write theme stats to Firestore

After classification, push the aggregated theme counts from the full manifest to Firestore. This only touches `statistics/theme-stats` — all other stat documents are left unchanged.

```bash
# Dry run to preview counts
node --env-file=.env scripts/write-theme-stats.mjs

# Write
node --env-file=.env scripts/write-theme-stats.mjs --write
```

Use this script also to **reset inflated theme stats** — run it after re-classifying all folders to replace accumulated counts with a clean tally from the manifest.

### 4. Upload photos to Firebase Storage

Select photos from the manifest (filtered by flag, date range, etc.) and upload them to Firebase Storage, creating corresponding `photos` Firestore documents.

```bash
node --env-file=.env scripts/upload-photos-from-manifest.mjs [options]
```

---

## Script reference

### `update-photography-stats.mjs`

Scans a local image directory, extracts EXIF metadata, and updates Firestore statistics.

```
node --env-file=.env scripts/update-photography-stats.mjs --dir <path> [options]
```

| Flag | Default | Description |
|---|---|---|
| `--dir <path>` | *(required)* | Directory of image files to scan |
| `--mode overwrite\|append` | `overwrite` | `append` adds new photos on top of existing Firestore stats; `overwrite` rebuilds stats from the scanned directory only |
| `--write` | off | Actually write to Firestore (default is dry run) |
| `--save-manifest` | off | Save scanned results to the local manifest file |
| `--manifest-only` | off | Build stats from the local manifest without scanning a directory |
| `--classify-themes` | off | Run CLIP zero-shot theme classification on each image |
| `--theme-labels <csv>` | `Portrait,Street,Travel,Architecture,Nature,Event,Abstract` | Comma-separated labels for CLIP classification |
| `--theme-model <id>` | `Xenova/clip-vit-base-patch32` | Hugging Face model ID |
| `--theme-min-score <n>` | `0` | Minimum CLIP confidence score to keep a predicted theme |
| `--fallback-file-mtime` | off | Use file modified time when EXIF date is missing |
| `--manifest <path>` | `.private-data/photo-manifest.json` | Path to the local manifest file |
| `--credentials <path>` | `GOOGLE_APPLICATION_CREDENTIALS` env or default JSON | Firebase service account JSON |

**Firestore documents written (with `--write`):**

| Document | Notes |
|---|---|
| `statistics/stats` | `total_photos`, `total_outings` |
| `statistics/photo-stats` | Per-month photo counts |
| `statistics/focal-stats` | Per-focal-length counts |
| `statistics/lens_stats` | Per-lens counts |
| `statistics/theme-stats` | Only written when `--classify-themes` is set |
| `statistics/generated-state` | Internal state — processed hashes and outing dates |

### `write-theme-stats.mjs`

Reads all manifest records, counts `theme_suggested`/`theme_final` labels, and writes **only** `statistics/theme-stats` to Firestore. Use this to reset inflated theme counts or to push theme stats after a classification run.

```
node --env-file=.env scripts/write-theme-stats.mjs [--write] [--manifest <path>]
```

| Flag | Default | Description |
|---|---|---|
| `--write` | off | Actually write to Firestore (default is dry run) |
| `--manifest <path>` | `.private-data/photo-manifest.json` | Path to the local manifest file |
| `--credentials <path>` | `GOOGLE_APPLICATION_CREDENTIALS` env or default JSON | Firebase service account JSON |

### `update-photo-manifest.mjs`

Edit manifest records in bulk without touching the JSON directly — set flags (`favourite`, `uploaded`), assign titles, recipes, or themes.

```
node --env-file=.env scripts/update-photo-manifest.mjs [filter flags] [update flags]
```

### `upload-photos-from-manifest.mjs`

Upload photos from the manifest to Firebase Storage and create/update their `photos` Firestore documents.

---

## Local manifest

The manifest lives at `.private-data/photo-manifest.json` (gitignored). It is the source of truth for all local photo metadata and tracks:

| Field | Description |
|---|---|
| `hash` | SHA-1 of the file contents — used to detect duplicates |
| `file_path` | Absolute path on disk at scan time |
| `source_directory` | DCIM folder the photo came from |
| `capture_date` | From EXIF `DateTimeOriginal` |
| `outing_date` | `YYYY-MM-DD` key for the shooting session |
| `lens_label` | From EXIF `LensModel` |
| `focal_length_35mm_label` | From EXIF `FocalLengthIn35mmFormat` |
| `theme_suggested` | CLIP zero-shot prediction |
| `theme_final` | Manual override (takes precedence over `theme_suggested`) |
| `title` | Display title for the photo |
| `favourite` | Whether to feature the photo |
| `recipe` | Film simulation / colour recipe name |
| `uploaded` | Whether the photo has been pushed to Firebase Storage |
| `firebase_doc_id` | Firestore document ID once uploaded |
