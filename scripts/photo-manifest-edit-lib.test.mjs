import test from "node:test";
import assert from "node:assert/strict";

import {
  parseBoolean,
  recordMatchesFilters,
  updateManifestRecords,
} from "./photo-manifest-edit-lib.mjs";

test("parseBoolean parses true and false", () => {
  assert.equal(parseBoolean("true"), true);
  assert.equal(parseBoolean("false"), false);
});

test("recordMatchesFilters supports file and flag filtering", () => {
  const record = {
    hash: "abc",
    file_path: "D:/DCIM/971_FUJI/DSCF1001.JPG",
    favourite: false,
    uploaded: false,
    theme_suggested: "Portrait",
    theme_suggestion_score: 0.72,
  };

  assert.equal(
    recordMatchesFilters(record, {
      fileIncludes: "1001",
      favourite: false,
      uploaded: false,
      themeSuggested: "Portrait",
      themeScoreGte: 0.7,
      themeScoreLte: 0.8,
    }),
    true,
  );
});

test("updateManifestRecords updates only matching records", () => {
  const result = updateManifestRecords(
    [
      {
        hash: "a",
        file_path: "D:/a.jpg",
        favourite: false,
        uploaded: false,
      },
      {
        hash: "b",
        file_path: "D:/b.jpg",
        favourite: false,
        uploaded: false,
      },
    ],
    {
      filters: { fileIncludes: "a.jpg" },
      updates: { favourite: true, themeFinal: "Street" },
    },
  );

  assert.equal(result.updatedCount, 1);
  assert.deepEqual(result.records[0], {
    hash: "a",
    file_path: "D:/a.jpg",
    favourite: true,
    uploaded: false,
    theme_final: "Street",
  });
  assert.equal(result.records[1]?.favourite, false);
});
