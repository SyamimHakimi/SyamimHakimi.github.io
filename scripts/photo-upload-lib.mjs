/**
 * Helpers for selecting manifest records and shaping Firestore photo docs.
 */

import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Return manifest records eligible for upload.
 *
 * @param {Array<Record<string, unknown>>} records
 * @param {{ onlyFavourites: boolean, includeUploaded: boolean }} options
 * @returns {Array<Record<string, unknown>>}
 */
export function selectUploadRecords(records, options) {
  return records.filter((record) => {
    const isFavourite = record.favourite === true;
    const alreadyUploaded = record.uploaded === true;

    if (
      options.fileIncludes &&
      !String(record.file_path ?? "")
        .toLowerCase()
        .includes(options.fileIncludes.toLowerCase())
    ) {
      return false;
    }

    if (options.hash && String(record.hash ?? "") !== options.hash) {
      return false;
    }

    if (options.onlyFavourites && !isFavourite) {
      return false;
    }

    if (!options.includeUploaded && alreadyUploaded) {
      return false;
    }

    return (
      typeof record.file_path === "string" && typeof record.hash === "string"
    );
  });
}

/**
 * Build the storage object path for one manifest record.
 *
 * @param {Record<string, unknown>} record
 * @returns {string}
 */
export function buildStoragePath(record) {
  const extension =
    path.extname(String(record.file_path)).toLowerCase() || ".jpg";
  return `photos/${record.hash}${extension}`;
}

/**
 * Build the public Firebase Storage download URL for an object.
 *
 * @param {{ bucket: string, objectPath: string, token: string }} input
 * @returns {string}
 */
export function buildFirebaseDownloadUrl(input) {
  return `https://firebasestorage.googleapis.com/v0/b/${input.bucket}/o/${encodeURIComponent(input.objectPath)}?alt=media&token=${input.token}`;
}

/**
 * Convert a manifest record into a Firestore `photos` document payload.
 *
 * @param {Record<string, unknown>} record
 * @param {{ bucket: string, objectPath: string, downloadToken: string }} upload
 * @returns {{ docId: string, payload: Record<string, unknown> }}
 */
export function buildPhotoDocument(record, upload) {
  const theme =
    typeof record.theme_final === "string"
      ? record.theme_final
      : typeof record.theme_suggested === "string"
        ? record.theme_suggested
        : undefined;

  const payload = {
    date: record.capture_date,
    lens: record.lens_label,
    focal_length:
      typeof record.focal_length_35mm_value === "number"
        ? record.focal_length_35mm_value
        : typeof record.focal_length_35mm_label === "string"
          ? Number.parseFloat(record.focal_length_35mm_label)
          : undefined,
    theme,
    recipe: typeof record.recipe === "string" ? record.recipe : undefined,
    title: typeof record.title === "string" ? record.title : undefined,
    favourite: record.favourite === true ? true : undefined,
    link: buildFirebaseDownloadUrl({
      bucket: upload.bucket,
      objectPath: upload.objectPath,
      token: upload.downloadToken,
    }),
  };

  return {
    docId:
      typeof record.firebase_doc_id === "string" && record.firebase_doc_id
        ? record.firebase_doc_id
        : String(record.hash),
    payload,
  };
}

/**
 * Generate a storage download token for Firebase Storage metadata.
 *
 * @returns {string}
 */
export function createDownloadToken() {
  return randomUUID();
}
