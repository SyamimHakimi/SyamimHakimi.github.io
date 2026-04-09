import { describe, it, expect } from "vitest";
import { StatsSchema, StatisticsSchema } from "./useStatistics";

describe("StatsSchema", () => {
  it("parses a valid stats document", () => {
    const result = StatsSchema.parse({
      id: "stats",
      total_outings: 20,
      total_photos: 64,
      total_fav_photos: 23,
      favourite_photo_lens: "18-50mm F2.8 DC DN",
    });
    expect(result.total_photos).toBe(64);
    expect(result.total_fav_photos).toBe(23);
  });

  it("accepts stats without optional lens field", () => {
    const result = StatsSchema.parse({
      id: "stats",
      total_outings: 5,
      total_photos: 20,
      total_fav_photos: 8,
    });
    expect(result.favourite_photo_lens).toBeUndefined();
  });
});

describe("StatisticsSchema", () => {
  it("parses a full statistics payload", () => {
    const result = StatisticsSchema.parse({
      stats: {
        id: "stats",
        total_outings: 20,
        total_photos: 64,
        total_fav_photos: 23,
      },
      photoStats: { "11/2024": 22, "02/2025": 18 },
      favPhotoStats: { "11/2024": 7 },
      focalStats: { "75": 18, "84": 29 },
      lensStats: { "56mm F1.7 APS-C": 30 },
      recipeStats: { "Kodachrome 64": 15 },
      themeStats: { "Street": 28, "Portrait": 9 },
    });
    expect(result.stats.total_outings).toBe(20);
    expect(result.photoStats["11/2024"]).toBe(22);
    expect(result.themeStats["Street"]).toBe(28);
  });
});
