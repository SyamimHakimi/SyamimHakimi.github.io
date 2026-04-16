/**
 * Helpers for reading, merging, and writing the private local photo manifest.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MANUAL_FIELDS = [
  "theme_final",
  "favourite",
  "recipe",
  "uploaded",
  "firebase_doc_id",
  "storage_path",
  "storage_download_token",
  "download_url",
  "uploaded_width",
  "uploaded_height",
  "uploaded_at",
  "firestore_synced_at",
  "title",
  "notes",
];

/**
 * Normalize the manifest payload loaded from disk.
 *
 * @param {unknown} value
 * @returns {{ version: number, updated_at: string | null, records: Array<Record<string, unknown>> }}
 */
export function normalizeManifest(value) {
  if (
    !value ||
    typeof value !== "object" ||
    !("records" in value) ||
    !Array.isArray(value.records)
  ) {
    return {
      version: 1,
      updated_at: null,
      records: [],
    };
  }

  return {
    version:
      typeof value.version === "number" && Number.isFinite(value.version)
        ? value.version
        : 1,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : null,
    records: value.records.filter(
      (record) => record && typeof record === "object" && "hash" in record,
    ),
  };
}

/**
 * Load the local manifest from disk if present.
 *
 * @param {string} manifestPath
 * @returns {Promise<{ version: number, updated_at: string | null, records: Array<Record<string, unknown>> }>}
 */
export async function loadManifest(manifestPath) {
  try {
    const raw = await readFile(manifestPath, "utf8");
    return normalizeManifest(JSON.parse(raw));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return normalizeManifest(null);
    }

    throw error;
  }
}

/**
 * Merge scanned records into an existing manifest while preserving manual fields.
 *
 * @param {Array<Record<string, unknown>>} existingRecords
 * @param {Array<Record<string, unknown>>} scannedRecords
 * @returns {Array<Record<string, unknown>>}
 */
export function mergeManifestRecords(existingRecords, scannedRecords) {
  const existingByHash = new Map(
    existingRecords.map((record) => [String(record.hash), record]),
  );

  const merged = scannedRecords.map((record) => {
    const previous = existingByHash.get(String(record.hash));
    if (!previous) {
      return record;
    }

    const preservedManualFields = Object.fromEntries(
      MANUAL_FIELDS.map((field) => [field, previous[field]]).filter(
        ([, value]) => value !== undefined,
      ),
    );

    return {
      ...record,
      ...preservedManualFields,
    };
  });

  const scannedHashes = new Set(
    scannedRecords.map((record) => String(record.hash)),
  );
  const untouchedExisting = existingRecords.filter(
    (record) => !scannedHashes.has(String(record.hash)),
  );

  return [...untouchedExisting, ...merged].sort((left, right) => {
    const leftDate =
      typeof left.capture_date === "string" ? left.capture_date : "";
    const rightDate =
      typeof right.capture_date === "string" ? right.capture_date : "";
    if (leftDate !== rightDate) {
      return leftDate.localeCompare(rightDate);
    }

    return String(left.hash).localeCompare(String(right.hash));
  });
}

/**
 * Persist the private manifest to disk.
 *
 * @param {string} manifestPath
 * @param {Array<Record<string, unknown>>} records
 * @returns {Promise<void>}
 */
export async function saveManifest(manifestPath, records) {
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        version: 1,
        updated_at: new Date().toISOString(),
        records,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

/**
 * Convert manifest records into the minimal stats-input shape.
 *
 * @param {Array<Record<string, unknown>>} records
 * @returns {Array<{
 *   hash: string,
 *   captureDate: Date,
 *   lensLabel: string | null,
 *   focalLabel: string | null,
 *   themeLabel: string | null,
 * }>}
 */
export function manifestRecordsToStatsRecords(records) {
  return records
    .map((record) => {
      if (
        typeof record.hash !== "string" ||
        typeof record.capture_date !== "string"
      ) {
        return null;
      }

      const captureDate = new Date(record.capture_date);
      if (Number.isNaN(captureDate.getTime())) {
        return null;
      }

      return {
        hash: record.hash,
        captureDate,
        lensLabel:
          typeof record.lens_label === "string" ? record.lens_label : null,
        focalLabel:
          typeof record.focal_length_35mm_label === "string"
            ? record.focal_length_35mm_label
            : null,
        themeLabel:
          typeof record.theme_final === "string"
            ? record.theme_final
            : typeof record.theme_suggested === "string"
              ? record.theme_suggested
              : null,
      };
    })
    .filter(Boolean);
}
