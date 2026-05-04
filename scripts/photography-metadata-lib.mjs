/**
 * Helpers for normalizing EXIF metadata into manifest-friendly values.
 */

/**
 * Format an aperture number as an f-stop label.
 *
 * @param {number | null} value
 * @returns {string | null}
 */
export function apertureLabelFromValue(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const rounded = Number.isInteger(value * 10)
    ? value
    : Number(value.toFixed(1));
  const label = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  return `f/${label}`;
}

/**
 * Read the aperture label from parsed EXIF metadata.
 *
 * @param {Record<string, unknown> | null} metadata
 * @returns {string | null}
 */
export function apertureLabelFromMetadata(metadata) {
  return apertureLabelFromValue(
    typeof metadata?.FNumber === "number" ? metadata.FNumber : null,
  );
}

/**
 * Read the ISO value from parsed EXIF metadata.
 *
 * @param {Record<string, unknown> | null} metadata
 * @returns {number | null}
 */
export function isoValueFromMetadata(metadata) {
  if (typeof metadata?.ISO === "number" && Number.isFinite(metadata.ISO)) {
    return Math.round(metadata.ISO);
  }

  if (
    Array.isArray(metadata?.ISOSpeedRatings) &&
    typeof metadata.ISOSpeedRatings[0] === "number" &&
    Number.isFinite(metadata.ISOSpeedRatings[0])
  ) {
    return Math.round(metadata.ISOSpeedRatings[0]);
  }

  if (
    typeof metadata?.PhotographicSensitivity === "number" &&
    Number.isFinite(metadata.PhotographicSensitivity)
  ) {
    return Math.round(metadata.PhotographicSensitivity);
  }

  return null;
}
