/**
 * statisticsCharts.ts — ApexCharts series and options builders for the
 * PhotographyJourney island.
 *
 * All chart colours are supplied by the caller as a resolved `ChartPalette`
 * (read from CSS custom properties at mount time and re-read on theme change).
 * No raw hex values live here — the palette is the single source of truth.
 */

const METADATA_KEYS = new Set(["id", "path", "createTime", "updateTime"]);

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * Colour palette resolved from CSS custom properties at mount time.
 * Re-resolved whenever `data-theme` changes so charts stay in sync.
 */
export interface ChartPalette {
  /** --color-cta — primary chart colour (line, bars, dots) */
  cta: string;
  /** --color-on-surface — primary text */
  onSurface: string;
  /** --color-on-surface-variant — axis tick labels */
  onSurfaceVariant: string;
  /** --color-outline — grid lines */
  outline: string;
  /** --color-surface — tooltip background and marker inner fill */
  surface: string;
}

export interface ChartThemeOptions {
  palette: ChartPalette;
  prefersReducedMotion: boolean;
}

// ── Shared helpers ─────────────────────────────────────────────────────────

/**
 * Normalizes Firestore statistics maps into chart-friendly label/value entries.
 *
 * Strips Firestore metadata keys (`id`, `path`, `createTime`, `updateTime`) and
 * coerces all values to numbers, dropping any that are not finite.
 *
 * @param statsMap Firestore statistics object keyed by label.
 * @returns Ordered label/value pairs safe to pass into chart builders.
 */
export function toChartEntries(
  statsMap: Record<string, string | number> | undefined,
): [string, number][] {
  return Object.entries(statsMap ?? {})
    .filter(([key]) => !METADATA_KEYS.has(key))
    .map(([label, value]) => [label, Number(value)] as [string, number])
    .filter(([, value]) => Number.isFinite(value));
}

/**
 * Parses a Firestore month key in "MM/YYYY" format into a `Date` for
 * chronological sorting.
 *
 * @param key Month key string, e.g. "11/2024".
 * @returns Date set to the first day of that month.
 */
export function parseMonthKey(key: string): Date {
  const [mm, yyyy] = key.split("/").map(Number);
  return new Date(yyyy, mm - 1);
}

// ── Line chart (monthly photos) ────────────────────────────────────────────

/**
 * Builds the ApexCharts series and x-axis categories for the monthly photos
 * area/line chart from `photoStats`.
 *
 * Filters to entries whose keys match "MM/YYYY", sorts chronologically, then
 * takes the last 12 months.
 *
 * @param photoStats Firestore `photo-stats` document data.
 * @returns `series` for ApexCharts and `categories` for the x-axis.
 */
export function buildPhotoStatsLineSeries(
  photoStats: Record<string, string | number> | undefined,
): { series: { name: string; data: number[] }[]; categories: string[] } {
  const entries = toChartEntries(photoStats)
    .filter(([key]) => /^\d{1,2}\/\d{4}$/.test(key))
    .sort(([a], [b]) => parseMonthKey(a).getTime() - parseMonthKey(b).getTime())
    .slice(-12);

  const categories = entries.map(([key]) =>
    parseMonthKey(key).toLocaleString("en", { month: "short", year: "2-digit" }),
  );

  return {
    series: [{ name: "Photos", data: entries.map(([, v]) => v) }],
    categories,
  };
}

/**
 * Builds ApexCharts options for the monthly photos area/line chart.
 *
 * @param opts Palette and reduced-motion flag.
 * @param categories X-axis month labels produced by `buildPhotoStatsLineSeries`.
 * @param lastIndex Index of the last data point (highlighted with a dot marker).
 * @returns ApexCharts options object.
 */
export function buildPhotoStatsLineOptions(
  { palette, prefersReducedMotion }: ChartThemeOptions,
  categories: string[],
  lastIndex: number,
): object {
  return {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: false },
      animations: { enabled: !prefersReducedMotion, speed: 300 },
      background: "transparent",
      fontFamily: "DM Sans, system-ui, sans-serif",
    },
    colors: [palette.cta],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.15,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      discrete: [
        {
          dataPointIndex: lastIndex,
          seriesIndex: 0,
          size: 4,
          fillColor: palette.cta,
          strokeColor: palette.surface,
          strokeWidth: 2,
        },
      ],
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: palette.outline,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 4, right: 4, bottom: 0, left: 0 },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: palette.onSurfaceVariant, fontSize: "9px" },
        rotate: 0,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      tickAmount: 4,
      labels: {
        style: { colors: palette.onSurfaceVariant, fontSize: "9px" },
        formatter: (v: number) => String(Math.round(v)),
      },
    },
    tooltip: {
      theme: "none",
      style: { fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "12px" },
      x: { show: true },
    },
  };
}

// ── Bar chart (film recipes) ───────────────────────────────────────────────

/**
 * Builds the ApexCharts series and y-axis categories for the film recipe
 * horizontal bar chart from `recipeStats`.
 *
 * Sorts descending by count and takes the top 6 recipes.
 *
 * @param recipeStats Firestore `recipe-stats` document data.
 * @returns `series` for ApexCharts and `categories` for the y-axis.
 */
export function buildRecipeBarSeries(
  recipeStats: Record<string, string | number> | undefined,
): { series: { name: string; data: number[] }[]; categories: string[] } {
  const entries = toChartEntries(recipeStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return {
    series: [{ name: "Photos", data: entries.map(([, v]) => v) }],
    categories: entries.map(([label]) => label),
  };
}

/**
 * Builds ApexCharts options for the film recipe horizontal bar chart.
 *
 * @param opts Palette and reduced-motion flag.
 * @param categories Y-axis recipe labels produced by `buildRecipeBarSeries`.
 * @returns ApexCharts options object.
 */
export function buildRecipeBarOptions(
  { palette, prefersReducedMotion }: ChartThemeOptions,
  categories: string[],
): object {
  return {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: { enabled: !prefersReducedMotion, speed: 300 },
      background: "transparent",
      fontFamily: "DM Sans, system-ui, sans-serif",
    },
    colors: [palette.cta],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        borderRadiusApplication: "end",
        barHeight: "60%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: palette.outline,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: 8, bottom: 0, left: 0 },
    },
    xaxis: {
      categories,
      labels: { style: { colors: palette.onSurfaceVariant, fontSize: "9px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: palette.onSurfaceVariant, fontSize: "10px" } },
    },
    tooltip: {
      theme: "none",
      style: { fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "12px" },
    },
  };
}
