/**
 * Helpers for transforming Firestore REST responses into stable JSON exports.
 */

/**
 * Decode a Firestore REST value into plain JSON.
 *
 * @param {Record<string, unknown> | undefined} value
 * @returns {unknown}
 */
export function decodeFirestoreValue(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("bytesValue" in value) return value.bytesValue;

  if ("geoPointValue" in value) {
    return {
      latitude: Number(value.geoPointValue.latitude),
      longitude: Number(value.geoPointValue.longitude),
    };
  }

  if ("arrayValue" in value) {
    const values = Array.isArray(value.arrayValue?.values)
      ? value.arrayValue.values
      : [];
    return values.map((item) => decodeFirestoreValue(item));
  }

  if ("mapValue" in value) {
    return decodeFirestoreFields(value.mapValue?.fields);
  }

  return null;
}

/**
 * Decode a Firestore REST fields object into plain JSON.
 *
 * @param {Record<string, Record<string, unknown>> | undefined} fields
 * @returns {Record<string, unknown>}
 */
export function decodeFirestoreFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      decodeFirestoreValue(value),
    ]),
  );
}

/**
 * Convert a Firestore REST document into a stable plain object with metadata.
 *
 * @param {{
 *   name: string,
 *   fields?: Record<string, Record<string, unknown>>,
 *   createTime?: string,
 *   updateTime?: string
 * }} document
 * @returns {Record<string, unknown>}
 */
export function decodeDocument(document) {
  const segments = document.name.split("/");
  const id = segments[segments.length - 1];
  const path = segments.slice(5).join("/");

  return {
    id,
    path,
    createTime: document.createTime ?? null,
    updateTime: document.updateTime ?? null,
    ...decodeFirestoreFields(document.fields),
  };
}

/**
 * Sort a list of decoded documents by a field when present.
 *
 * @param {Array<Record<string, unknown>>} records
 * @param {{ field: string, direction?: "asc" | "desc" } | undefined} sortSpec
 * @returns {Array<Record<string, unknown>>}
 */
export function sortDecodedRecords(records, sortSpec) {
  if (!sortSpec) {
    return [...records].sort((left, right) =>
      String(left.id).localeCompare(String(right.id)),
    );
  }

  const multiplier = sortSpec.direction === "desc" ? -1 : 1;
  return [...records].sort((left, right) => {
    const leftValue = left[sortSpec.field];
    const rightValue = right[sortSpec.field];

    if (leftValue == null && rightValue == null) return 0;
    if (leftValue == null) return 1;
    if (rightValue == null) return -1;

    if (leftValue < rightValue) return -1 * multiplier;
    if (leftValue > rightValue) return 1 * multiplier;
    return String(left.id).localeCompare(String(right.id));
  });
}

/**
 * Assemble the final export payloads written into `export/`.
 *
 * @param {{
 *   profile: Record<string, unknown>,
 *   services: Array<Record<string, unknown>>,
 *   experiencePlatforms: Array<Record<string, unknown>>,
 *   experienceProtocols: Array<Record<string, unknown>>,
 *   experienceFrameworks: Array<Record<string, unknown>>,
 *   experienceLanguages: Array<Record<string, unknown>>,
 *   project: Record<string, unknown>,
 *   projectTechstack: Array<Record<string, unknown>>,
 *   boardgames: Array<Record<string, unknown>>,
 *   photographyGear: Array<Record<string, unknown>>,
 *   socialMedia: Array<Record<string, unknown>>,
 *   photos: Array<Record<string, unknown>>,
 *   statistics: Record<string, Record<string, unknown>>,
 * }} source
 * @returns {Record<string, unknown>}
 */
export function buildExportBundle(source) {
  return {
    "profile.json": source.profile,
    "services.json": source.services,
    "portfolio.json": {
      experience: {
        platforms: source.experiencePlatforms,
        protocols: source.experienceProtocols,
        frameworks: source.experienceFrameworks,
        languages: source.experienceLanguages,
      },
    },
    // Keeps the Firestore boundary explicit: "document" holds the project doc fields,
    // "techstack" holds the subcollection. Phase A2 must read these as two separate resources.
    "projects.json": {
      document: source.project,
      techstack: source.projectTechstack,
    },
    "boardgames.json": source.boardgames,
    "photography-gear.json": source.photographyGear,
    "social-media.json": source.socialMedia,
    "photos.json": source.photos,
    "statistics.json": source.statistics,
  };
}
