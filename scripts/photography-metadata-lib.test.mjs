import test from "node:test";
import assert from "node:assert/strict";

import {
  apertureLabelFromMetadata,
  apertureLabelFromValue,
  isoValueFromMetadata,
} from "./photography-metadata-lib.mjs";

test("apertureLabelFromValue formats whole and decimal f-stops", () => {
  assert.equal(apertureLabelFromValue(2.8), "f/2.8");
  assert.equal(apertureLabelFromValue(8), "f/8");
});

test("apertureLabelFromMetadata reads FNumber", () => {
  assert.equal(apertureLabelFromMetadata({ FNumber: 4 }), "f/4");
});

test("isoValueFromMetadata prefers ISO and falls back to other EXIF keys", () => {
  assert.equal(isoValueFromMetadata({ ISO: 640 }), 640);
  assert.equal(isoValueFromMetadata({ ISOSpeedRatings: [200] }), 200);
  assert.equal(isoValueFromMetadata({ PhotographicSensitivity: 1250 }), 1250);
});

test("metadata helpers return null for missing values", () => {
  assert.equal(apertureLabelFromMetadata(null), null);
  assert.equal(isoValueFromMetadata(null), null);
});
