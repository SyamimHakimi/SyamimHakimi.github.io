import test from "node:test";
import assert from "node:assert/strict";

import {
  manifestRecordsToStatsRecords,
  mergeManifestRecords,
  normalizeManifest,
} from "./photography-manifest-lib.mjs";

test("normalizeManifest returns an empty manifest for invalid input", () => {
  assert.deepEqual(normalizeManifest(null), {
    version: 1,
    updated_at: null,
    records: [],
  });
});

test("mergeManifestRecords preserves manual fields from previous scans", () => {
  const merged = mergeManifestRecords(
    [
      {
        hash: "abc",
        capture_date: "2026-04-12T07:58:34.000Z",
        favourite: true,
        theme_final: "Street",
        notes: "keep",
      },
    ],
    [
      {
        hash: "abc",
        capture_date: "2026-04-12T07:58:34.000Z",
        lens_label: "Sigma 18-50mm",
        theme_suggested: "Portrait",
      },
      {
        hash: "def",
        capture_date: "2026-04-13T07:58:34.000Z",
      },
    ],
  );

  assert.equal(merged.length, 2);
  assert.deepEqual(merged[0], {
    hash: "abc",
    capture_date: "2026-04-12T07:58:34.000Z",
    lens_label: "Sigma 18-50mm",
    theme_suggested: "Portrait",
    favourite: true,
    theme_final: "Street",
    notes: "keep",
  });
});

test("manifestRecordsToStatsRecords prefers reviewed themes over suggestions", () => {
  const result = manifestRecordsToStatsRecords([
    {
      hash: "abc",
      capture_date: "2026-04-12T07:58:34.000Z",
      lens_label: "Sigma 18-50mm",
      focal_length_35mm_label: "75mm",
      theme_suggested: "Portrait",
      theme_final: "Street",
    },
  ]);

  assert.equal(result[0]?.themeLabel, "Street");
});
