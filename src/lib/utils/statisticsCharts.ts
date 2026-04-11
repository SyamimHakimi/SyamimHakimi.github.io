import type { ChartData, ChartOptions } from "chart.js";

const METADATA_KEYS = new Set(["id", "path", "createTime", "updateTime"]);

export interface ChartPalette {
  accent: string;
  accentAlt: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  border: string;
  surface: string;
}

export interface ChartThemeOptions {
  palette: ChartPalette;
  prefersReducedMotion: boolean;
}

/**
 * Normalizes Firestore statistics maps into chart-friendly label/value entries.
 *
 * Firestore statistics docs may contain metadata fields or number-like strings.
 * This helper strips metadata keys and coerces finite values to numbers.
 *
 * @param statsMap Firestore statistics object keyed by label.
 * @returns Ordered label/value entries safe to render in charts.
 */
export function toChartEntries(
  statsMap: Record<string, string | number> | undefined,
) {
  return Object.entries(statsMap ?? {})
    .filter(([key]) => !METADATA_KEYS.has(key))
    .map(([label, value]) => [label, Number(value)] as const)
    .filter(([, value]) => Number.isFinite(value));
}

/**
 * Builds doughnut-chart data for photography theme statistics.
 *
 * @param themeStats Firestore theme distribution map.
 * @param palette Current resolved chart palette.
 * @returns Chart.js data payload for the doughnut chart.
 */
export function buildThemeChartData(
  themeStats: Record<string, string | number> | undefined,
  palette: ChartPalette,
): ChartData<"doughnut", number[], string> {
  const entries = toChartEntries(themeStats);
  const colors = [
    palette.accent,
    palette.accentAlt,
    palette.accentSoft,
    palette.textMuted,
    palette.border,
  ];

  return {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        data: entries.map(([, value]) => value),
        backgroundColor: entries.map(
          (_, index) => colors[index % colors.length],
        ),
        borderColor: palette.surface,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };
}

/**
 * Builds horizontal-bar data for film recipe usage statistics.
 *
 * @param recipeStats Firestore recipe distribution map.
 * @param palette Current resolved chart palette.
 * @returns Chart.js data payload for the bar chart.
 */
export function buildRecipeChartData(
  recipeStats: Record<string, string | number> | undefined,
  palette: ChartPalette,
): ChartData<"bar", number[], string> {
  const entries = toChartEntries(recipeStats);

  return {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        label: "Photos",
        data: entries.map(([, value]) => value),
        backgroundColor: palette.accent,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  };
}

/**
 * Returns the doughnut-chart presentation options used by the portfolio stats view.
 *
 * @param options Resolved palette plus motion preference.
 * @returns Chart.js doughnut options.
 */
export function buildThemeChartOptions({
  palette,
  prefersReducedMotion,
}: ChartThemeOptions): ChartOptions<"doughnut"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion ? false : { duration: 300 },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: palette.text,
          boxWidth: 14,
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: palette.surface,
        titleColor: palette.text,
        bodyColor: palette.text,
        borderColor: palette.border,
        borderWidth: 1,
      },
    },
  };
}

/**
 * Returns the horizontal-bar presentation options used by the recipe stats view.
 *
 * @param options Resolved palette plus motion preference.
 * @returns Chart.js horizontal bar options.
 */
export function buildRecipeChartOptions({
  palette,
  prefersReducedMotion,
}: ChartThemeOptions): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    animation: prefersReducedMotion ? false : { duration: 300 },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: palette.surface,
        titleColor: palette.text,
        bodyColor: palette.text,
        borderColor: palette.border,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: palette.border,
        },
        ticks: {
          color: palette.textMuted,
          precision: 0,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: palette.text,
        },
      },
    },
  };
}
