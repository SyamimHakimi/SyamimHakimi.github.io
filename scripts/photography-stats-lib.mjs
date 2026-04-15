/**
 * Helpers for deriving photography statistics from image metadata.
 */

export const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".raf",
]);

/**
 * Convert a capture date into the "MM/YYYY" keys consumed by the site charts.
 *
 * @param {Date} date
 * @returns {string}
 */
export function monthKeyFromDate(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

/**
 * Convert a capture date into the outing key used by the updater state doc.
 *
 * @param {Date} date
 * @returns {string}
 */
export function outingKeyFromDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Normalize a focal length number into a stable display label.
 *
 * @param {number | null | undefined} focalLength
 * @returns {string | null}
 */
export function focalLabelFromValue(focalLength) {
  if (typeof focalLength !== "number" || !Number.isFinite(focalLength)) {
    return null;
  }

  const rounded =
    Math.abs(focalLength - Math.round(focalLength)) < 0.05
      ? Math.round(focalLength)
      : Number(focalLength.toFixed(1));

  return `${rounded}mm`;
}

/**
 * Count string labels into a Firestore-friendly map.
 *
 * @param {string[]} values
 * @returns {Record<string, number>}
 */
export function countByLabel(values) {
  return values.reduce((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, /** @type {Record<string, number>} */ ({}));
}

/**
 * Merge two count maps by summing matching keys.
 *
 * @param {Record<string, number>} base
 * @param {Record<string, number>} addition
 * @returns {Record<string, number>}
 */
export function mergeCountMaps(base, addition) {
  const merged = { ...base };

  for (const [key, value] of Object.entries(addition)) {
    merged[key] = (merged[key] ?? 0) + value;
  }

  return merged;
}

/**
 * Build the derived public stats docs plus the hidden ingest state from files.
 *
 * @param {Array<{
 *   hash: string,
 *   captureDate: Date,
 *   lensLabel: string | null,
 *   focalLabel: string | null,
 *   themeLabel?: string | null,
 * }>} records
 * @returns {{
 *   totalPhotos: number,
 *   totalOutings: number,
 *   photoStats: Record<string, number>,
 *   focalStats: Record<string, number>,
 *   lensStats: Record<string, number>,
 *   themeStats: Record<string, number>,
 *   outingDates: string[],
 *   processedFileHashes: string[],
 * }}
 */
export function buildDerivedStatistics(records) {
  const outingDates = new Set();
  const processedFileHashes = [];
  const photoStatsInput = [];
  const focalStatsInput = [];
  const lensStatsInput = [];
  const themeStatsInput = [];

  for (const record of records) {
    processedFileHashes.push(record.hash);
    outingDates.add(outingKeyFromDate(record.captureDate));
    photoStatsInput.push(monthKeyFromDate(record.captureDate));

    if (record.focalLabel) {
      focalStatsInput.push(record.focalLabel);
    }

    if (record.lensLabel) {
      lensStatsInput.push(record.lensLabel);
    }

    if (record.themeLabel) {
      themeStatsInput.push(record.themeLabel);
    }
  }

  return {
    totalPhotos: records.length,
    totalOutings: outingDates.size,
    photoStats: countByLabel(photoStatsInput),
    focalStats: countByLabel(focalStatsInput),
    lensStats: countByLabel(lensStatsInput),
    themeStats: countByLabel(themeStatsInput),
    outingDates: [...outingDates].sort(),
    processedFileHashes: processedFileHashes.sort(),
  };
}

/**
 * Append newly derived stats onto the current public docs and hidden state.
 *
 * @param {{
 *   existingStats: {
 *     total_photos?: number,
 *     total_outings?: number,
 *     total_fav_photos?: number,
 *     favourite_photo_lens?: string,
 *   },
 *   existingPhotoStats: Record<string, number>,
 *   existingFocalStats: Record<string, number>,
 *   existingLensStats: Record<string, number>,
 *   existingThemeStats: Record<string, number>,
 *   existingOutingDates: string[],
 *   existingProcessedFileHashes: string[],
 *   batch: ReturnType<typeof buildDerivedStatistics>,
 * }} input
 * @returns {{
 *   stats: {
 *     total_photos: number,
 *     total_outings: number,
 *     total_fav_photos?: number,
 *     favourite_photo_lens?: string,
 *   },
 *   photoStats: Record<string, number>,
 *   focalStats: Record<string, number>,
 *   lensStats: Record<string, number>,
 *   themeStats: Record<string, number>,
 *   state: {
 *     outing_dates: string[],
 *     processed_file_hashes: string[],
 *   },
 * }}
 */
export function mergeAppendStatistics(input) {
  const outingDates = new Set([
    ...input.existingOutingDates,
    ...input.batch.outingDates,
  ]);
  const processedFileHashes = new Set([
    ...input.existingProcessedFileHashes,
    ...input.batch.processedFileHashes,
  ]);

  return {
    stats: {
      total_photos:
        (input.existingStats.total_photos ?? 0) + input.batch.totalPhotos,
      total_outings: outingDates.size,
      total_fav_photos: input.existingStats.total_fav_photos,
      favourite_photo_lens: input.existingStats.favourite_photo_lens,
    },
    photoStats: mergeCountMaps(
      input.existingPhotoStats,
      input.batch.photoStats,
    ),
    focalStats: mergeCountMaps(
      input.existingFocalStats,
      input.batch.focalStats,
    ),
    lensStats: mergeCountMaps(input.existingLensStats, input.batch.lensStats),
    themeStats: mergeCountMaps(
      input.existingThemeStats,
      input.batch.themeStats,
    ),
    state: {
      outing_dates: [...outingDates].sort(),
      processed_file_hashes: [...processedFileHashes].sort(),
    },
  };
}
