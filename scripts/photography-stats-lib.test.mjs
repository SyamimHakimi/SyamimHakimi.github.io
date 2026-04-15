import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDerivedStatistics,
  focalLabelFromValue,
  mergeAppendStatistics,
  monthKeyFromDate,
  outingKeyFromDate,
} from "./photography-stats-lib.mjs";

test("monthKeyFromDate returns site-compatible month buckets", () => {
  assert.equal(
    monthKeyFromDate(new Date("2025-04-14T02:00:00.000Z")),
    "04/2025",
  );
});

test("outingKeyFromDate groups outings by unique capture date", () => {
  assert.equal(
    outingKeyFromDate(new Date("2025-04-14T18:30:00.000Z")),
    "2025-04-14",
  );
});

test("focalLabelFromValue normalizes focal lengths", () => {
  assert.equal(focalLabelFromValue(35), "35mm");
  assert.equal(focalLabelFromValue(35.04), "35mm");
  assert.equal(focalLabelFromValue(27.5), "27.5mm");
  assert.equal(focalLabelFromValue(undefined), null);
});

test("buildDerivedStatistics aggregates counts from metadata records", () => {
  const result = buildDerivedStatistics([
    {
      hash: "a",
      captureDate: new Date("2025-04-14T01:00:00.000Z"),
      lensLabel: "Sigma 18-50mm F2.8",
      focalLabel: "35mm",
      themeLabel: "Street",
    },
    {
      hash: "b",
      captureDate: new Date("2025-04-14T11:30:00.000Z"),
      lensLabel: "Sigma 18-50mm F2.8",
      focalLabel: "50mm",
      themeLabel: "Street",
    },
    {
      hash: "c",
      captureDate: new Date("2025-05-01T07:00:00.000Z"),
      lensLabel: "Viltrox 56mm F1.7",
      focalLabel: "56mm",
      themeLabel: "Portrait",
    },
  ]);

  assert.equal(result.totalPhotos, 3);
  assert.equal(result.totalOutings, 2);
  assert.deepEqual(result.photoStats, {
    "04/2025": 2,
    "05/2025": 1,
  });
  assert.deepEqual(result.lensStats, {
    "Sigma 18-50mm F2.8": 2,
    "Viltrox 56mm F1.7": 1,
  });
  assert.deepEqual(result.themeStats, {
    Street: 2,
    Portrait: 1,
  });
});

test("mergeAppendStatistics adds new counts while preserving manual stats fields", () => {
  const batch = buildDerivedStatistics([
    {
      hash: "new-a",
      captureDate: new Date("2025-06-01T09:00:00.000Z"),
      lensLabel: "Sigma 18-50mm F2.8",
      focalLabel: "24mm",
      themeLabel: "Travel",
    },
    {
      hash: "new-b",
      captureDate: new Date("2025-06-02T09:00:00.000Z"),
      lensLabel: "Viltrox 56mm F1.7",
      focalLabel: "56mm",
      themeLabel: "Portrait",
    },
  ]);

  const result = mergeAppendStatistics({
    existingStats: {
      total_photos: 10,
      total_outings: 5,
      total_fav_photos: 3,
      favourite_photo_lens: "Sigma 18-50mm F2.8",
    },
    existingPhotoStats: { "05/2025": 10 },
    existingFocalStats: { "35mm": 4 },
    existingLensStats: { "Sigma 18-50mm F2.8": 4 },
    existingThemeStats: { Street: 5 },
    existingOutingDates: ["2025-05-01", "2025-05-02"],
    existingProcessedFileHashes: ["old-a"],
    batch,
  });

  assert.deepEqual(result.stats, {
    total_photos: 12,
    total_outings: 4,
    total_fav_photos: 3,
    favourite_photo_lens: "Sigma 18-50mm F2.8",
  });
  assert.deepEqual(result.photoStats, {
    "05/2025": 10,
    "06/2025": 2,
  });
  assert.deepEqual(result.themeStats, {
    Street: 5,
    Travel: 1,
    Portrait: 1,
  });
  assert.deepEqual(result.state.outing_dates, [
    "2025-05-01",
    "2025-05-02",
    "2025-06-01",
    "2025-06-02",
  ]);
});
