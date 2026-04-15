/**
 * Derive photography statistics from a local image directory and update
 * Firestore.
 *
 * Modes:
 * - overwrite: rebuild derived stats from the provided directory
 * - append: add only unseen photos from the provided directory onto existing
 *   derived stats, backed by a hidden Firestore state doc
 *
 * This script only updates the automatically derivable docs/fields:
 * - statistics/stats.total_photos
 * - statistics/stats.total_outings
 * - statistics/photo-stats
 * - statistics/focal-stats
 * - statistics/lens_stats
 *
 * Manual docs and fields such as favourites, recipe, and theme stats are left
 * untouched.
 */

import { createHash, createSign } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import exifr from "exifr";
import { pipeline } from "@huggingface/transformers";

import { decodeDocument } from "./firestore-export-lib.mjs";
import {
  loadManifest,
  manifestRecordsToStatsRecords,
  mergeManifestRecords,
  saveManifest,
} from "./photography-manifest-lib.mjs";
import {
  buildDerivedStatistics,
  focalLabelFromValue,
  SUPPORTED_IMAGE_EXTENSIONS,
  mergeAppendStatistics,
} from "./photography-stats-lib.mjs";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const GENERATED_STATE_DOCUMENT = "statistics/generated-state";
const DEFAULT_MANIFEST_PATH = ".private-data/photo-manifest.json";
const DEFAULT_THEME_LABELS = [
  "Portrait",
  "Street",
  "Travel",
  "Architecture",
  "Nature",
  "Event",
  "Abstract",
];
const DEFAULT_THEME_MODEL = "Xenova/clip-vit-base-patch32";

/**
 * Parse updater CLI flags.
 *
 * @param {string[]} argv
 * @returns {{
 *   directory: string,
 *   mode: "overwrite" | "append",
 *   write: boolean,
 *   credentialsPath: string,
 *   allowModifiedTimeFallback: boolean,
 *   classifyThemes: boolean,
 *   themeModel: string,
 *   themeLabels: string[],
 *   themeMinScore: number,
 *   manifestPath: string,
 *   saveManifest: boolean,
 *   manifestOnly: boolean,
 * }}
 */
function parseArgs(argv) {
  const options = {
    directory: "",
    mode: "overwrite",
    write: false,
    credentialsPath:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH,
    allowModifiedTimeFallback: false,
    classifyThemes: false,
    themeModel: DEFAULT_THEME_MODEL,
    themeLabels: [...DEFAULT_THEME_LABELS],
    themeMinScore: 0,
    manifestPath: DEFAULT_MANIFEST_PATH,
    saveManifest: false,
    manifestOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dir") {
      options.directory = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--mode") {
      const mode = argv[index + 1];
      if (mode === "overwrite" || mode === "append") {
        options.mode = mode;
      } else {
        throw new Error(`Unsupported mode "${mode}". Use overwrite or append.`);
      }
      index += 1;
      continue;
    }

    if (argument === "--credentials") {
      options.credentialsPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--write") {
      options.write = true;
      continue;
    }

    if (argument === "--fallback-file-mtime") {
      options.allowModifiedTimeFallback = true;
      continue;
    }

    if (argument === "--classify-themes") {
      options.classifyThemes = true;
      continue;
    }

    if (argument === "--theme-model") {
      options.themeModel = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--theme-labels") {
      options.themeLabels = (argv[index + 1] ?? "")
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean);
      index += 1;
      continue;
    }

    if (argument === "--theme-min-score") {
      options.themeMinScore = Number(argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--manifest") {
      options.manifestPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--save-manifest") {
      options.saveManifest = true;
      continue;
    }

    if (argument === "--manifest-only") {
      options.manifestOnly = true;
      continue;
    }

    if (argument === "--help") {
      printUsage();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!options.directory && !options.manifestOnly) {
    throw new Error("Missing required --dir <path> argument.");
  }

  if (!options.credentialsPath) {
    throw new Error(
      "No Firebase credentials path provided. Use --credentials or set GOOGLE_APPLICATION_CREDENTIALS.",
    );
  }

  return options;
}

function printUsage() {
  console.log(`Usage:
  node scripts/update-photography-stats.mjs --dir "<photos-dir>" [options]

Options:
  --mode overwrite|append     overwrite = rebuild from directory, append = ingest new files only
  --write                     actually write to Firestore (default is dry-run)
  --credentials <path>        service account JSON path
  --fallback-file-mtime       use file modified time when EXIF date is missing
  --classify-themes           run local CLIP zero-shot theme classification
  --theme-labels <csv>        comma-separated theme labels to classify against
  --theme-model <id>          Hugging Face model id for zero-shot image classification
  --theme-min-score <n>       minimum score required to keep a predicted theme
  --manifest <path>           local manifest file path
  --save-manifest             save scanned results into the local manifest
  --manifest-only             build stats from the local manifest without scanning a directory
  --help                      show this usage message
`);
}

/**
 * Create a local zero-shot image classification pipeline.
 *
 * @param {string} modelId
 * @returns {Promise<unknown>}
 */
async function createThemeClassifier(modelId) {
  return pipeline("zero-shot-image-classification", modelId, {
    dtype: "fp32",
  });
}

/**
 * Convert a capture date into the manifest outing key.
 *
 * @param {Date} date
 * @returns {string}
 */
function outingDateFromCaptureDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Convert a capture date into the site chart month key.
 *
 * @param {Date} date
 * @returns {string}
 */
function monthKeyFromCaptureDate(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

/**
 * Base64url encode a UTF-8 string or buffer.
 *
 * @param {string | Buffer} input
 * @returns {string}
 */
function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

/**
 * Read and validate a Firebase service account JSON file.
 *
 * @param {string} credentialsPath
 * @returns {Promise<Record<string, string>>}
 */
async function loadServiceAccount(credentialsPath) {
  const raw = await readFile(credentialsPath, "utf8");
  const credentials = JSON.parse(raw);

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error(
      "The configured service account JSON is missing client_email or private_key.",
    );
  }

  return credentials;
}

/**
 * Create a signed JWT assertion for Google OAuth service account exchange.
 *
 * @param {Record<string, string>} credentials
 * @returns {string}
 */
function createJwtAssertion(credentials) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  };

  const encodedHeader = base64UrlEncode(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  );
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${base64UrlEncode(
    signer.sign(credentials.private_key),
  )}`;
}

/**
 * Exchange the signed JWT for a Google OAuth access token.
 *
 * @param {Record<string, string>} credentials
 * @returns {Promise<string>}
 */
async function fetchAccessToken(credentials) {
  const response = await fetch(
    credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createJwtAssertion(credentials),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `OAuth token exchange failed: ${response.status} ${await response.text()}`,
    );
  }

  const payload = await response.json();
  return payload.access_token;
}

/**
 * Fetch Firestore JSON from the REST API.
 *
 * @param {string} accessToken
 * @param {string} url
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function fetchFirestoreJson(accessToken, url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Firestore request failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

/**
 * Read and decode a single Firestore document.
 *
 * @param {string} accessToken
 * @param {string} firestoreBaseUrl
 * @param {string} documentPath
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function getDocument(accessToken, firestoreBaseUrl, documentPath) {
  const payload = await fetchFirestoreJson(
    accessToken,
    `${firestoreBaseUrl}/${documentPath}`,
  );
  return payload ? decodeDocument(payload) : null;
}

/**
 * Encode a plain JS value into the Firestore REST value format.
 *
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function encodeFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }

    return { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: { values: value.map((item) => encodeFirestoreValue(item)) },
    };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  return { mapValue: { fields: encodeFirestoreFields(value) } };
}

/**
 * Encode a plain object into Firestore REST fields.
 *
 * @param {Record<string, unknown>} data
 * @returns {Record<string, unknown>}
 */
function encodeFirestoreFields(data) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, encodeFirestoreValue(value)]),
  );
}

/**
 * Replace a Firestore document using the commit API.
 *
 * @param {string} accessToken
 * @param {string} projectId
 * @param {string} documentPath
 * @param {Record<string, unknown>} data
 * @returns {Promise<void>}
 */
async function writeDocument(accessToken, projectId, documentPath, data) {
  const documentName = `projects/${projectId}/databases/(default)/documents/${documentPath}`;
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: documentName,
              fields: encodeFirestoreFields(data),
            },
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Firestore write failed for ${documentPath}: ${response.status} ${await response.text()}`,
    );
  }
}

/**
 * Recursively list supported image files under a directory.
 *
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function listImageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(absolutePath)));
      continue;
    }

    if (
      entry.isFile() &&
      SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

/**
 * Hash a file's contents so append mode can skip files already processed.
 *
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function hashFile(filePath) {
  const hash = createHash("sha1");

  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  return hash.digest("hex");
}

/**
 * Normalize the best available capture date from EXIF metadata.
 *
 * @param {Record<string, unknown> | null} metadata
 * @returns {Date | null}
 */
function captureDateFromMetadata(metadata) {
  const candidate =
    metadata?.DateTimeOriginal ??
    metadata?.CreateDate ??
    metadata?.ModifyDate ??
    null;

  return candidate instanceof Date && !Number.isNaN(candidate.getTime())
    ? candidate
    : null;
}

/**
 * Normalize the best lens label available in EXIF metadata.
 *
 * @param {Record<string, unknown> | null} metadata
 * @returns {string | null}
 */
function lensLabelFromMetadata(metadata) {
  const candidate =
    metadata?.LensModel ??
    metadata?.LensInfo ??
    metadata?.Lens ??
    metadata?.Model ??
    null;

  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
}

/**
 * Normalize the best focal-length label available in EXIF metadata.
 *
 * @param {Record<string, unknown> | null} metadata
 * @returns {string | null}
 */
function focalLabelFromMetadata(metadata) {
  const focal35 =
    typeof metadata?.FocalLengthIn35mmFormat === "number"
      ? metadata.FocalLengthIn35mmFormat
      : null;
  const focalNative =
    typeof metadata?.FocalLength === "number" ? metadata.FocalLength : null;

  return focalLabelFromValue(focal35 ?? focalNative);
}

/**
 * Convert one image file into a record the aggregator can consume.
 *
 * @param {string} filePath
 * @param {boolean} allowModifiedTimeFallback
 * @param {null | ((filePath: string) => Promise<{ label: string | null, score: number | null }>)} classifyTheme
 * @returns {Promise<{
 *   hash: string,
 *   captureDate: Date,
 *   lensLabel: string | null,
 *   focalLabel: string | null,
 *   themeSuggested: string | null,
 *   themeSuggestionScore: number | null,
 *   filePath: string,
 * } | null>}
 */
async function readImageRecord(
  filePath,
  allowModifiedTimeFallback,
  classifyTheme,
) {
  let metadata = null;

  try {
    metadata = await exifr.parse(filePath, {
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "ModifyDate",
        "LensModel",
        "LensInfo",
        "Lens",
        "Model",
        "FocalLength",
        "FocalLengthIn35mmFormat",
      ],
    });
  } catch {
    metadata = null;
  }

  let captureDate = captureDateFromMetadata(metadata);

  if (!captureDate && allowModifiedTimeFallback) {
    const fileStats = await import("node:fs/promises").then(({ stat }) =>
      stat(filePath),
    );
    captureDate = fileStats.mtime;
  }

  if (!captureDate) {
    return null;
  }

  const themeSuggestion = classifyTheme
    ? await classifyTheme(filePath)
    : { label: null, score: null };

  return {
    hash: await hashFile(filePath),
    captureDate,
    lensLabel: lensLabelFromMetadata(metadata),
    focalLabel: focalLabelFromMetadata(metadata),
    themeSuggested: themeSuggestion.label,
    themeSuggestionScore: themeSuggestion.score,
    filePath,
  };
}

/**
 * Convert a scanned record into a local manifest record.
 *
 * @param {{
 *   hash: string,
 *   captureDate: Date,
 *   lensLabel: string | null,
 *   focalLabel: string | null,
 *   themeSuggested: string | null,
 *   themeSuggestionScore: number | null,
 *   filePath: string,
 * }} record
 * @param {{
 *   sourceDirectory: string,
 *   themeModel: string,
 * }} options
 * @returns {Record<string, unknown>}
 */
function toManifestRecord(record, options) {
  return {
    hash: record.hash,
    file_path: record.filePath,
    source_directory: options.sourceDirectory,
    capture_date: record.captureDate.toISOString(),
    outing_date: outingDateFromCaptureDate(record.captureDate),
    month_key: monthKeyFromCaptureDate(record.captureDate),
    lens_label: record.lensLabel,
    focal_length_35mm_label: record.focalLabel,
    theme_suggested: record.themeSuggested,
    theme_suggestion_score: record.themeSuggestionScore,
    theme_model: record.themeSuggested ? options.themeModel : null,
    title: null,
    favourite: false,
    recipe: null,
    uploaded: false,
    firebase_doc_id: null,
    scanned_at: new Date().toISOString(),
  };
}

/**
 * Remove script-internal metadata keys from decoded Firestore docs.
 *
 * @param {Record<string, unknown> | null} document
 * @returns {Record<string, unknown>}
 */
function sanitizeDecodedDocument(document) {
  if (!document) return {};

  const cleaned = { ...document };
  delete cleaned.id;
  delete cleaned.path;
  delete cleaned.createTime;
  delete cleaned.updateTime;
  return cleaned;
}

/**
 * Summarize a planned write batch for dry runs and confirmations.
 *
 * @param {{
 *   mode: "overwrite" | "append",
 *   scannedFiles: number,
 *   processedFiles: number,
 *   skippedFiles: string[],
 *   filteredExistingFiles: number,
 *   manifestPath: string,
 *   manifestRecords: number,
 *   finalStats: Record<string, unknown>,
 *   finalPhotoStats: Record<string, number>,
 *   finalFocalStats: Record<string, number>,
 *   finalLensStats: Record<string, number>,
 *   finalThemeStats: Record<string, number>,
 * }} summary
 * @returns {void}
 */
function printSummary(summary) {
  console.log(`Mode: ${summary.mode}`);
  console.log(`Scanned files: ${summary.scannedFiles}`);
  console.log(`Processed files: ${summary.processedFiles}`);
  console.log(`Manifest path: ${summary.manifestPath}`);
  console.log(`Manifest records: ${summary.manifestRecords}`);
  console.log(
    `Skipped files (missing metadata): ${summary.skippedFiles.length}`,
  );
  console.log(
    `Skipped files (already ingested): ${summary.filteredExistingFiles}`,
  );
  console.log("");
  console.log("stats/stats");
  console.log(JSON.stringify(summary.finalStats, null, 2));
  console.log("");
  console.log("statistics/photo-stats");
  console.log(JSON.stringify(summary.finalPhotoStats, null, 2));
  console.log("");
  console.log("statistics/focal-stats");
  console.log(JSON.stringify(summary.finalFocalStats, null, 2));
  console.log("");
  console.log("statistics/lens_stats");
  console.log(JSON.stringify(summary.finalLensStats, null, 2));

  if (Object.keys(summary.finalThemeStats).length > 0) {
    console.log("");
    console.log("statistics/theme-stats");
    console.log(JSON.stringify(summary.finalThemeStats, null, 2));
  }

  if (summary.skippedFiles.length > 0) {
    console.log("");
    console.log("Skipped files:");
    for (const filePath of summary.skippedFiles.slice(0, 20)) {
      console.log(`- ${filePath}`);
    }
    if (summary.skippedFiles.length > 20) {
      console.log(`- ...and ${summary.skippedFiles.length - 20} more`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const credentials = await loadServiceAccount(options.credentialsPath);
  const accessToken = await fetchAccessToken(credentials);
  const projectId = credentials.project_id;
  const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const manifestPath = path.resolve(options.manifestPath);
  const existingManifest = await loadManifest(manifestPath);

  const decodedState = sanitizeDecodedDocument(
    await getDocument(accessToken, firestoreBaseUrl, GENERATED_STATE_DOCUMENT),
  );
  const existingStats = sanitizeDecodedDocument(
    await getDocument(accessToken, firestoreBaseUrl, "statistics/stats"),
  );
  const existingPhotoStats = sanitizeDecodedDocument(
    await getDocument(accessToken, firestoreBaseUrl, "statistics/photo-stats"),
  );
  const existingFocalStats = sanitizeDecodedDocument(
    await getDocument(accessToken, firestoreBaseUrl, "statistics/focal-stats"),
  );
  const existingLensStats = sanitizeDecodedDocument(
    await getDocument(accessToken, firestoreBaseUrl, "statistics/lens_stats"),
  );
  const existingThemeStats = sanitizeDecodedDocument(
    await getDocument(accessToken, firestoreBaseUrl, "statistics/theme-stats"),
  );

  if (options.manifestOnly && existingManifest.records.length === 0) {
    throw new Error(
      `Manifest-only mode requires an existing manifest at ${manifestPath}.`,
    );
  }

  const imageFiles = options.manifestOnly
    ? []
    : await listImageFiles(path.resolve(options.directory));
  const existingHashes = new Set(
    existingManifest.records.map((record) => String(record.hash)),
  );
  const records = [];
  const skippedFiles = [];
  let filteredExistingFiles = 0;
  let classifyTheme = null;

  if (options.classifyThemes) {
    const classifier = await createThemeClassifier(options.themeModel);
    classifyTheme = async (filePath) => {
      const predictions = await classifier(filePath, options.themeLabels, {
        hypothesis_template: "This is a photo of {}.",
      });
      const topPrediction = Array.isArray(predictions) ? predictions[0] : null;
      if (!topPrediction) return { label: null, score: null };

      return {
        label:
          topPrediction.score >= options.themeMinScore
            ? topPrediction.label
            : null,
        score: topPrediction.score,
      };
    };
  }

  for (const filePath of imageFiles) {
    const record = await readImageRecord(
      filePath,
      options.allowModifiedTimeFallback,
      classifyTheme,
    );

    if (!record) {
      skippedFiles.push(filePath);
      continue;
    }

    if (options.mode === "append" && existingHashes.has(record.hash)) {
      filteredExistingFiles += 1;
      continue;
    }

    records.push(record);
  }

  const scannedManifestRecords = records.map((record) =>
    toManifestRecord(record, {
      sourceDirectory: options.manifestOnly
        ? ""
        : path.resolve(options.directory),
      themeModel: options.themeModel,
    }),
  );
  const finalManifestRecords = options.manifestOnly
    ? existingManifest.records
    : mergeManifestRecords(existingManifest.records, scannedManifestRecords);
  const statsSourceRecords = options.manifestOnly
    ? manifestRecordsToStatsRecords(existingManifest.records)
    : options.mode === "append"
      ? manifestRecordsToStatsRecords(finalManifestRecords)
      : records.map((record) => ({
          hash: record.hash,
          captureDate: record.captureDate,
          lensLabel: record.lensLabel,
          focalLabel: record.focalLabel,
          themeLabel: record.themeSuggested,
        }));
  const batch = buildDerivedStatistics(statsSourceRecords);
  const overwriteStats = {
    total_photos: batch.totalPhotos,
    total_outings: batch.totalOutings,
    total_fav_photos: existingStats.total_fav_photos,
    favourite_photo_lens: existingStats.favourite_photo_lens,
  };

  const overwriteState = {
    outing_dates: batch.outingDates,
    processed_file_hashes: batch.processedFileHashes,
    last_mode: "overwrite",
    updated_at: new Date().toISOString(),
  };

  const appendResult = mergeAppendStatistics({
    existingStats,
    existingPhotoStats,
    existingFocalStats,
    existingLensStats,
    existingThemeStats,
    existingOutingDates: /** @type {string[]} */ (
      Array.isArray(decodedState.outing_dates)
        ? decodedState.outing_dates
        : manifestRecordsToStatsRecords(existingManifest.records).map(
            (record) => record.captureDate.toISOString().slice(0, 10),
          )
    ),
    existingProcessedFileHashes: /** @type {string[]} */ (
      Array.isArray(decodedState.processed_file_hashes)
        ? decodedState.processed_file_hashes
        : existingManifest.records.map((record) => String(record.hash))
    ),
    batch,
  });

  const finalStats =
    options.mode === "append" ? appendResult.stats : overwriteStats;
  const finalPhotoStats =
    options.mode === "append" ? appendResult.photoStats : batch.photoStats;
  const finalFocalStats =
    options.mode === "append" ? appendResult.focalStats : batch.focalStats;
  const finalLensStats =
    options.mode === "append" ? appendResult.lensStats : batch.lensStats;
  const finalThemeStats = options.classifyThemes
    ? options.mode === "append"
      ? appendResult.themeStats
      : batch.themeStats
    : Object.keys(batch.themeStats).length > 0
      ? batch.themeStats
      : existingThemeStats;
  const finalState =
    options.mode === "append"
      ? {
          ...appendResult.state,
          last_mode: "append",
          updated_at: new Date().toISOString(),
          theme_labels: options.classifyThemes
            ? options.themeLabels
            : decodedState.theme_labels,
          theme_model: options.classifyThemes
            ? options.themeModel
            : decodedState.theme_model,
        }
      : {
          ...overwriteState,
          theme_labels: options.classifyThemes
            ? options.themeLabels
            : decodedState.theme_labels,
          theme_model: options.classifyThemes
            ? options.themeModel
            : decodedState.theme_model,
        };

  printSummary({
    mode: options.mode,
    scannedFiles: imageFiles.length,
    processedFiles: records.length,
    manifestPath,
    manifestRecords: finalManifestRecords.length,
    skippedFiles,
    filteredExistingFiles,
    finalStats,
    finalPhotoStats,
    finalFocalStats,
    finalLensStats,
    finalThemeStats,
  });

  if (!options.write) {
    if (options.saveManifest && !options.manifestOnly) {
      await saveManifest(manifestPath, finalManifestRecords);
      console.log("");
      console.log(`Manifest saved to ${manifestPath}`);
    }
    console.log("");
    console.log("Dry run only. Re-run with --write to update Firestore.");
    return;
  }

  if (options.saveManifest && !options.manifestOnly) {
    await saveManifest(manifestPath, finalManifestRecords);
  }

  await writeDocument(accessToken, projectId, "statistics/stats", finalStats);
  await writeDocument(
    accessToken,
    projectId,
    "statistics/photo-stats",
    finalPhotoStats,
  );
  await writeDocument(
    accessToken,
    projectId,
    "statistics/focal-stats",
    finalFocalStats,
  );
  await writeDocument(
    accessToken,
    projectId,
    "statistics/lens_stats",
    finalLensStats,
  );
  if (options.classifyThemes) {
    await writeDocument(
      accessToken,
      projectId,
      "statistics/theme-stats",
      finalThemeStats,
    );
  }
  await writeDocument(
    accessToken,
    projectId,
    GENERATED_STATE_DOCUMENT,
    finalState,
  );

  console.log("");
  console.log("Firestore updated successfully.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
