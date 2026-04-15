/**
 * Helpers for filtering and updating private photo manifest records.
 */

/**
 * Parse a CLI boolean string.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function parseBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Expected "true" or "false", received "${value}".`);
}

/**
 * Test whether a record matches the provided filters.
 *
 * @param {Record<string, unknown>} record
 * @param {{
 *   fileIncludes?: string,
 *   hash?: string,
 *   themeSuggested?: string,
 *   themeFinal?: string,
 *   themeScoreGte?: number,
 *   themeScoreLte?: number,
 *   favourite?: boolean,
 *   uploaded?: boolean,
 * }} filters
 * @returns {boolean}
 */
export function recordMatchesFilters(record, filters) {
  if (
    filters.fileIncludes &&
    !String(record.file_path ?? "")
      .toLowerCase()
      .includes(filters.fileIncludes.toLowerCase())
  ) {
    return false;
  }

  if (filters.hash && String(record.hash ?? "") !== filters.hash) {
    return false;
  }

  if (
    filters.themeSuggested &&
    String(record.theme_suggested ?? "") !== filters.themeSuggested
  ) {
    return false;
  }

  if (
    filters.themeFinal &&
    String(record.theme_final ?? "") !== filters.themeFinal
  ) {
    return false;
  }

  if (
    typeof filters.themeScoreGte === "number" &&
    (!Number.isFinite(Number(record.theme_suggestion_score)) ||
      Number(record.theme_suggestion_score) < filters.themeScoreGte)
  ) {
    return false;
  }

  if (
    typeof filters.themeScoreLte === "number" &&
    (!Number.isFinite(Number(record.theme_suggestion_score)) ||
      Number(record.theme_suggestion_score) > filters.themeScoreLte)
  ) {
    return false;
  }

  if (
    typeof filters.favourite === "boolean" &&
    record.favourite !== filters.favourite
  ) {
    return false;
  }

  if (
    typeof filters.uploaded === "boolean" &&
    record.uploaded !== filters.uploaded
  ) {
    return false;
  }

  return true;
}

/**
 * Apply manifest updates to matching records.
 *
 * @param {Array<Record<string, unknown>>} records
 * @param {{
 *   filters: Parameters<typeof recordMatchesFilters>[1],
 *   updates: {
 *     favourite?: boolean,
 *     themeFinal?: string | null,
 *     recipe?: string | null,
 *     title?: string | null,
 *   },
 *   limit?: number,
 * }} input
 * @returns {{
 *   records: Array<Record<string, unknown>>,
 *   matched: Array<Record<string, unknown>>,
 *   updatedCount: number,
 * }}
 */
export function updateManifestRecords(records, input) {
  const matched = [];
  let updatedCount = 0;

  const nextRecords = records.map((record) => {
    if (!recordMatchesFilters(record, input.filters)) {
      return record;
    }

    if (
      typeof input.limit === "number" &&
      Number.isFinite(input.limit) &&
      matched.length >= input.limit
    ) {
      return record;
    }

    matched.push(record);

    const nextRecord = { ...record };

    if (typeof input.updates.favourite === "boolean") {
      nextRecord.favourite = input.updates.favourite;
    }

    if (input.updates.themeFinal !== undefined) {
      nextRecord.theme_final = input.updates.themeFinal;
    }

    if (input.updates.recipe !== undefined) {
      nextRecord.recipe = input.updates.recipe;
    }

    if (input.updates.title !== undefined) {
      nextRecord.title = input.updates.title;
    }

    updatedCount += 1;
    return nextRecord;
  });

  return {
    records: nextRecords,
    matched,
    updatedCount,
  };
}
