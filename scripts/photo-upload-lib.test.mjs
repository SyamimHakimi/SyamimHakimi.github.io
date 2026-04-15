import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFirebaseDownloadUrl,
  buildPhotoDocument,
  buildStoragePath,
  selectUploadRecords,
} from "./photo-upload-lib.mjs";

test("selectUploadRecords defaults to favourite-only pending uploads", () => {
  const result = selectUploadRecords(
    [
      { hash: "a", file_path: "D:/a.jpg", favourite: true, uploaded: false },
      { hash: "b", file_path: "D:/b.jpg", favourite: false, uploaded: false },
      { hash: "c", file_path: "D:/c.jpg", favourite: true, uploaded: true },
    ],
    { onlyFavourites: true, includeUploaded: false },
  );

  assert.deepEqual(
    result.map((record) => record.hash),
    ["a"],
  );
});

test("selectUploadRecords supports targeted selection by file substring", () => {
  const result = selectUploadRecords(
    [
      { hash: "a", file_path: "D:/a.jpg", favourite: true, uploaded: false },
      {
        hash: "b",
        file_path: "D:/folder/target.jpg",
        favourite: true,
        uploaded: false,
      },
    ],
    {
      onlyFavourites: true,
      includeUploaded: false,
      fileIncludes: "target",
    },
  );

  assert.deepEqual(
    result.map((record) => record.hash),
    ["b"],
  );
});

test("buildStoragePath uses the file hash with the original extension", () => {
  assert.equal(
    buildStoragePath({
      hash: "abc",
      file_path: "D:/DCIM/971_FUJI/DSCF1001.JPG",
    }),
    "photos/abc.jpg",
  );
});

test("buildFirebaseDownloadUrl matches Firebase Storage download links", () => {
  assert.equal(
    buildFirebaseDownloadUrl({
      bucket: "portfolio-9e62d.firebasestorage.app",
      objectPath: "photos/abc.jpg",
      token: "token-123",
    }),
    "https://firebasestorage.googleapis.com/v0/b/portfolio-9e62d.firebasestorage.app/o/photos%2Fabc.jpg?alt=media&token=token-123",
  );
});

test("buildPhotoDocument maps manifest fields into the public photo schema", () => {
  const result = buildPhotoDocument(
    {
      hash: "abc",
      capture_date: "2026-04-12T07:58:34.000Z",
      lens_label: "SIGMA 18-50mm F2.8 DC DN | Contemporary 021",
      focal_length_35mm_value: 75,
      theme_final: "Street",
      recipe: "Classic Chrome",
      title: "evening walk",
      favourite: true,
    },
    {
      bucket: "portfolio-9e62d.firebasestorage.app",
      objectPath: "photos/abc.jpg",
      downloadToken: "token-123",
    },
  );

  assert.equal(result.docId, "abc");
  assert.deepEqual(result.payload, {
    date: "2026-04-12T07:58:34.000Z",
    lens: "SIGMA 18-50mm F2.8 DC DN | Contemporary 021",
    focal_length: 75,
    theme: "Street",
    recipe: "Classic Chrome",
    title: "evening walk",
    favourite: true,
    link: "https://firebasestorage.googleapis.com/v0/b/portfolio-9e62d.firebasestorage.app/o/photos%2Fabc.jpg?alt=media&token=token-123",
  });
});
