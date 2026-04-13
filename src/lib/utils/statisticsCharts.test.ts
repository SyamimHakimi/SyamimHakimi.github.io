import { describe, expect, it } from "vitest";
import {
  buildPhotoStatsLineSeries,
  buildPhotoStatsLineOptions,
  buildRecipeBarSeries,
  buildRecipeBarOptions,
  buildCumulativeLineSeries,
  buildCumulativeLineOptions,
  buildHeatmapSeries,
  buildHeatmapOptions,
  buildFocalLengthSeries,
  buildFocalLengthOptions,
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
  surfaceVariant: "#f4f4f5",
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
      A: 10,
      B: 50,
      C: 30,
      D: 80,
      E: 20,
      F: 60,
      G: 5,
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

// ── buildCumulativeLineSeries ──────────────────────────────────────────────

describe("buildCumulativeLineSeries", () => {
  it("returns empty series for undefined input", () => {
    const { series, categories } = buildCumulativeLineSeries(undefined);
    expect(series[0]?.data).toHaveLength(0);
    expect(categories).toHaveLength(0);
  });

  it("produces a monotonically increasing running total", () => {
    const { series } = buildCumulativeLineSeries({
      "1/2024": 10,
      "2/2024": 20,
      "3/2024": 5,
    });
    expect(series[0]?.data).toEqual([10, 30, 35]);
  });

  it("uses ALL months, not just last 12", () => {
    const stats: Record<string, number> = {};
    for (let m = 1; m <= 20; m++) stats[`${m > 12 ? m - 12 : m}/2024`] = 1;
    // Even with more than 12 unique months this won't dedupe properly, so use 2 years
    const twoYears: Record<string, number> = {};
    for (let m = 1; m <= 12; m++) twoYears[`${m}/2023`] = 1;
    for (let m = 1; m <= 6; m++) twoYears[`${m}/2024`] = 1;
    const { series } = buildCumulativeLineSeries(twoYears);
    expect(series[0]?.data).toHaveLength(18); // all 18 months
    expect(series[0]?.data.at(-1)).toBe(18); // running total = 18
  });

  it("shows every 4th category label, rest are empty strings", () => {
    const stats: Record<string, number> = {};
    for (let m = 1; m <= 12; m++) stats[`${m}/2024`] = m;
    const { categories } = buildCumulativeLineSeries(stats);
    expect(categories[0]).toMatch(/Jan/i);
    expect(categories[1]).toBe("");
    expect(categories[2]).toBe("");
    expect(categories[3]).toBe("");
    expect(categories[4]).toMatch(/May/i);
  });
});

// ── buildCumulativeLineOptions ─────────────────────────────────────────────

describe("buildCumulativeLineOptions", () => {
  it("disables animation when reduced motion is preferred", () => {
    const opts = buildCumulativeLineOptions(
      { palette, prefersReducedMotion: true },
      [],
      0,
    ) as { chart: { animations: { enabled: boolean } } };
    expect(opts.chart.animations.enabled).toBe(false);
  });

  it("tooltip formatter includes 'total photos'", () => {
    const opts = buildCumulativeLineOptions(
      { palette, prefersReducedMotion: false },
      [],
      0,
    ) as { tooltip: { y: { formatter: (v: number) => string } } };
    expect(opts.tooltip.y.formatter(42)).toBe("42 total photos");
  });
});

// ── buildHeatmapSeries ─────────────────────────────────────────────────────

describe("buildHeatmapSeries", () => {
  it("returns empty array for undefined input", () => {
    expect(buildHeatmapSeries(undefined)).toHaveLength(0);
  });

  it("groups by year and orders newest first", () => {
    const rows = buildHeatmapSeries({
      "3/2023": 5,
      "6/2024": 10,
      "1/2025": 3,
    });
    expect(rows[0]?.name).toBe("2025");
    expect(rows[1]?.name).toBe("2024");
    expect(rows[2]?.name).toBe("2023");
  });

  it("each row has 12 data points (one per month)", () => {
    const rows = buildHeatmapSeries({ "3/2024": 7 });
    expect(rows[0]?.data).toHaveLength(12);
  });

  it("places the count in the correct month slot", () => {
    const rows = buildHeatmapSeries({ "3/2024": 7 });
    // month index 2 = March (0-indexed)
    const march = rows[0]?.data.find((d) => d.x === "Mar");
    expect(march?.y).toBe(7);
  });

  it("fills missing months with 0", () => {
    const rows = buildHeatmapSeries({ "6/2024": 4 });
    const jan = rows[0]?.data.find((d) => d.x === "Jan");
    expect(jan?.y).toBe(0);
  });
});

// ── buildHeatmapOptions ────────────────────────────────────────────────────

describe("buildHeatmapOptions", () => {
  it("uses surfaceVariant for zero-value range", () => {
    const opts = buildHeatmapOptions({
      palette,
      prefersReducedMotion: false,
    }) as {
      plotOptions: {
        heatmap: { colorScale: { ranges: { from: number; color: string }[] } };
      };
    };
    const zeroRange = opts.plotOptions.heatmap.colorScale.ranges.find(
      (r) => r.from === 0,
    );
    expect(zeroRange?.color).toBe(palette.surfaceVariant);
  });

  it("highest range uses solid cta color", () => {
    const opts = buildHeatmapOptions({
      palette,
      prefersReducedMotion: false,
    }) as {
      plotOptions: {
        heatmap: { colorScale: { ranges: { from: number; color: string }[] } };
      };
    };
    const ranges = opts.plotOptions.heatmap.colorScale.ranges;
    expect(ranges.at(-1)?.color).toBe(palette.cta);
  });
});

// ── buildFocalLengthSeries ─────────────────────────────────────────────────

describe("buildFocalLengthSeries", () => {
  it("returns empty arrays for undefined input", () => {
    const { series, labels } = buildFocalLengthSeries(undefined);
    expect(series).toHaveLength(0);
    expect(labels).toHaveLength(0);
  });

  it("sorts descending by count", () => {
    const { series, labels } = buildFocalLengthSeries({
      "18-50": 80,
      "56": 30,
      "10-18": 50,
    });
    expect(series[0]).toBe(80);
    expect(labels[0]).toBe("18-50");
  });

  it("appends 'mm' to pure-digit focal length labels", () => {
    const { labels } = buildFocalLengthSeries({ "56": 30, "18-50": 80 });
    expect(labels.find((l) => l.includes("56"))).toBe("56mm");
    expect(labels.find((l) => l.includes("18-50"))).toBe("18-50"); // hyphenated — no suffix
  });
});

// ── buildFocalLengthOptions ────────────────────────────────────────────────

describe("buildFocalLengthOptions", () => {
  it("first slice color is solid cta", () => {
    const opts = buildFocalLengthOptions(
      { palette, prefersReducedMotion: false },
      ["56mm", "18-50mm"],
      110,
    ) as { colors: string[] };
    expect(opts.colors[0]).toBe(palette.cta);
  });

  it("total shown in donut centre equals the provided total", () => {
    const opts = buildFocalLengthOptions(
      { palette, prefersReducedMotion: false },
      ["56mm"],
      42,
    ) as {
      plotOptions: {
        pie: { donut: { labels: { total: { formatter: () => string } } } };
      };
    };
    expect(opts.plotOptions.pie.donut.labels.total.formatter()).toBe("42");
  });

  it("disables animation when reduced motion is preferred", () => {
    const opts = buildFocalLengthOptions(
      { palette, prefersReducedMotion: true },
      [],
      0,
    ) as { chart: { animations: { enabled: boolean } } };
    expect(opts.chart.animations.enabled).toBe(false);
  });
});
