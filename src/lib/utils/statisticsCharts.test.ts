import { describe, expect, it } from "vitest";
import {
  buildRecipeChartData,
  buildRecipeChartOptions,
  buildThemeChartData,
  buildThemeChartOptions,
  toChartEntries,
  type ChartPalette,
} from "./statisticsCharts";

const palette: ChartPalette = {
  accent: "#f59e0b",
  accentAlt: "#fb923c",
  accentSoft: "#fde68a",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#d1d5db",
  surface: "#ffffff",
};

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

describe("buildThemeChartData", () => {
  it("creates doughnut data from theme stats", () => {
    const result = buildThemeChartData(
      {
        Street: 12,
        Portrait: 5,
      },
      palette,
    );

    expect(result.labels).toEqual(["Street", "Portrait"]);
    expect(result.datasets[0]?.data).toEqual([12, 5]);
    expect(result.datasets[0]?.backgroundColor).toEqual([
      palette.accent,
      palette.accentAlt,
    ]);
  });
});

describe("buildRecipeChartData", () => {
  it("creates bar data from recipe stats", () => {
    const result = buildRecipeChartData(
      {
        Kodachrome: 10,
        ClassicChrome: "4",
      },
      palette,
    );

    expect(result.labels).toEqual(["Kodachrome", "ClassicChrome"]);
    expect(result.datasets[0]?.label).toBe("Photos");
    expect(result.datasets[0]?.data).toEqual([10, 4]);
  });
});

describe("buildThemeChartOptions", () => {
  it("disables animation when reduced motion is preferred", () => {
    const result = buildThemeChartOptions({
      palette,
      prefersReducedMotion: true,
    });

    expect(result.animation).toBe(false);
    expect(result.plugins?.legend?.position).toBe("bottom");
  });
});

describe("buildRecipeChartOptions", () => {
  it("creates horizontal bar options with themed axes", () => {
    const result = buildRecipeChartOptions({
      palette,
      prefersReducedMotion: false,
    });

    expect(result.indexAxis).toBe("y");
    expect(result.scales?.x?.ticks?.color).toBe(palette.textMuted);
    expect(result.scales?.y?.ticks?.color).toBe(palette.text);
  });
});
