import { describe, expect, it } from "vitest";
import {
  buildPhotoStatsLineSeries,
  buildPhotoStatsLineOptions,
  buildRecipeBarSeries,
  buildRecipeBarOptions,
  parseMonthKey,
  toChartEntries,
  type ChartPalette,
} from "./statisticsCharts";

const palette: ChartPalette = {
  cta: "#2563eb",
  onSurface: "#09090b",
  onSurfaceVariant: "#52525b",
  outline: "#e4e4e7",
  surface: "#ffffff",
};

// ── toChartEntries ─────────────────────────────────────────────────────────

describe("toChartEntries", () => {
  it("removes metadata keys and coerces numeric values", () => {
    const result = toChartEntries({
      id: "theme-stats",
      Street: 28,
      Portrait: "9",
      updateTime: "ignore-me",
    });

    expect(result).toEqual([
      ["Street", 28],
      ["Portrait", 9],
    ]);
  });

  it("drops non-finite values", () => {
    const result = toChartEntries({
      Street: Number.NaN,
      Portrait: Infinity,
      Travel: 3,
    });

    expect(result).toEqual([["Travel", 3]]);
  });
});

// ── parseMonthKey ──────────────────────────────────────────────────────────

describe("parseMonthKey", () => {
  it("parses MM/YYYY into the correct month", () => {
    const d = parseMonthKey("11/2024");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(10); // 0-indexed November
  });

  it("sorts two months in chronological order", () => {
    const a = parseMonthKey("1/2024");
    const b = parseMonthKey("11/2024");
    expect(a.getTime()).toBeLessThan(b.getTime());
  });
});

// ── buildPhotoStatsLineSeries ──────────────────────────────────────────────

describe("buildPhotoStatsLineSeries", () => {
  it("returns empty series for undefined input", () => {
    const { series, categories } = buildPhotoStatsLineSeries(undefined);
    expect(series[0]?.data).toHaveLength(0);
    expect(categories).toHaveLength(0);
  });

  it("sorts entries chronologically and takes last 12", () => {
    // 13 months — oldest should be dropped
    const stats: Record<string, number> = {};
    for (let m = 1; m <= 13; m++) {
      stats[`${m}/2024`] = m * 10;
    }
    const { series, categories } = buildPhotoStatsLineSeries(stats);
    expect(series[0]?.data).toHaveLength(12);
    // First entry kept should be month 2 (month 1 was the 13th oldest, dropped)
    expect(categories[0]).toMatch(/Feb/i);
  });

  it("strips metadata keys from photoStats", () => {
    const { series } = buildPhotoStatsLineSeries({
      id: "ignore",
      "1/2024": 30,
      "2/2024": 45,
    });
    expect(series[0]?.data).toEqual([30, 45]);
  });
});

// ── buildPhotoStatsLineOptions ─────────────────────────────────────────────

describe("buildPhotoStatsLineOptions", () => {
  it("disables animation when reduced motion is preferred", () => {
    const opts = buildPhotoStatsLineOptions(
      { palette, prefersReducedMotion: true },
      ["Jan 24"],
      0,
    ) as Record<string, unknown>;

    const chart = opts.chart as { animations: { enabled: boolean } };
    expect(chart.animations.enabled).toBe(false);
  });

  it("uses palette.cta as the primary color", () => {
    const opts = buildPhotoStatsLineOptions(
      { palette, prefersReducedMotion: false },
      ["Jan 24"],
      0,
    ) as { colors: string[] };

    expect(opts.colors[0]).toBe(palette.cta);
  });

  it("places a discrete marker on the last index", () => {
    const opts = buildPhotoStatsLineOptions(
      { palette, prefersReducedMotion: false },
      ["Jan 24", "Feb 24"],
      1,
    ) as { markers: { discrete: { dataPointIndex: number }[] } };

    expect(opts.markers.discrete[0]?.dataPointIndex).toBe(1);
  });
});

// ── buildRecipeBarSeries ───────────────────────────────────────────────────

describe("buildRecipeBarSeries", () => {
  it("sorts descending and takes top 6", () => {
    const stats = {
      A: 10, B: 50, C: 30, D: 80, E: 20, F: 60, G: 5,
    };
    const { series, categories } = buildRecipeBarSeries(stats);
    expect(categories).toHaveLength(6);
    // Should be sorted descending: D(80), F(60), B(50), C(30), A(10 or E(20))
    expect(categories[0]).toBe("D");
    expect(series[0]?.data[0]).toBe(80);
  });

  it("returns empty series for undefined input", () => {
    const { series, categories } = buildRecipeBarSeries(undefined);
    expect(series[0]?.data).toHaveLength(0);
    expect(categories).toHaveLength(0);
  });
});

// ── buildRecipeBarOptions ──────────────────────────────────────────────────

describe("buildRecipeBarOptions", () => {
  it("sets horizontal bar orientation", () => {
    const opts = buildRecipeBarOptions(
      { palette, prefersReducedMotion: false },
      ["Classic Chrome"],
    ) as { plotOptions: { bar: { horizontal: boolean } } };

    expect(opts.plotOptions.bar.horizontal).toBe(true);
  });

  it("disables animation when reduced motion is preferred", () => {
    const opts = buildRecipeBarOptions(
      { palette, prefersReducedMotion: true },
      [],
    ) as { chart: { animations: { enabled: boolean } } };

    expect(opts.chart.animations.enabled).toBe(false);
  });

  it("uses palette.cta as bar color", () => {
    const opts = buildRecipeBarOptions(
      { palette, prefersReducedMotion: false },
      [],
    ) as { colors: string[] };

    expect(opts.colors[0]).toBe(palette.cta);
  });
});
