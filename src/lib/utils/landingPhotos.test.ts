import { describe, expect, it } from "vitest";
import {
  LANDING_PHOTO_LIMIT,
  getLandingPhotoPlaceholderCount,
  selectLandingPhotos,
  shuffleItems,
} from "./landingPhotos";
import type { Photo } from "../composables/useGallery";

const photos: Photo[] = [
  { id: "1", date: "2025-01-01T00:00:00.000Z", title: "One" },
  { id: "2", date: "2025-01-02T00:00:00.000Z", title: "Two" },
  { id: "3", date: "2025-01-03T00:00:00.000Z", title: "Three" },
  { id: "4", date: "2025-01-04T00:00:00.000Z", title: "Four" },
  { id: "5", date: "2025-01-05T00:00:00.000Z", title: "Five" },
];

describe("shuffleItems", () => {
  it("returns a new array instance", () => {
    const result = shuffleItems(photos, () => 0.4);
    expect(result).not.toBe(photos);
    expect(result).toHaveLength(photos.length);
  });

  it("supports deterministic ordering when a random function is injected", () => {
    const randomValues = [0.1, 0.8, 0.25, 0.6];
    let index = 0;

    const result = shuffleItems(photos, () => randomValues[index++] ?? 0);

    expect(result.map((photo) => photo.id)).toEqual(["3", "2", "5", "4", "1"]);
  });
});

describe("selectLandingPhotos", () => {
  it("caps the landing selection to the grid limit", () => {
    const result = selectLandingPhotos(photos, () => 0);
    expect(result).toHaveLength(LANDING_PHOTO_LIMIT);
  });

  it("keeps all photos when fewer than the grid limit are available", () => {
    const result = selectLandingPhotos(photos.slice(0, 2), () => 0);
    expect(result.map((photo) => photo.id)).toEqual(["2", "1"]);
  });
});

describe("getLandingPhotoPlaceholderCount", () => {
  it("fills the remaining cells in the 2x2 grid", () => {
    expect(getLandingPhotoPlaceholderCount(3)).toBe(1);
  });

  it("never returns a negative placeholder count", () => {
    expect(getLandingPhotoPlaceholderCount(6)).toBe(0);
  });
});
