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
  /** --color-surface-variant — heatmap zero-value cell background */
  surfaceVariant: string;
}

export interface ChartThemeOptions {
  palette: ChartPalette;
  prefersReducedMotion: boolean;
}

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Converts a 6-digit hex colour to an rgba string with the given alpha.
 * Requires `hex` to be a '#rrggbb' string (as produced by CSS custom properties).
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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
    parseMonthKey(key).toLocaleString("en", {
      month: "short",
      year: "2-digit",
    }),
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

// ── Cumulative line chart (all-time photo growth) ──────────────────────────

/**
 * Builds the ApexCharts series and x-axis categories for the cumulative photos
 * area chart from `photoStats`.
 *
 * Sorts all months chronologically, computes a running total, and returns every
 * 4th month as a visible x-axis label (rest are empty strings) to avoid crowding.
 *
 * @param photoStats Firestore `photo-stats` document data.
 * @returns `series` (running totals) and sparse `categories` for the x-axis.
 */
export function buildCumulativeLineSeries(
  photoStats: Record<string, string | number> | undefined,
): { series: { name: string; data: number[] }[]; categories: string[] } {
  const entries = toChartEntries(photoStats)
    .filter(([key]) => /^\d{1,2}\/\d{4}$/.test(key))
    .sort(
      ([a], [b]) => parseMonthKey(a).getTime() - parseMonthKey(b).getTime(),
    );

  let running = 0;
  const data = entries.map(([, v]) => {
    running += v;
    return running;
  });

  const categories = entries.map(([key], i) =>
    i % 4 === 0
      ? parseMonthKey(key).toLocaleString("en", {
          month: "short",
          year: "2-digit",
        })
      : "",
  );

  return {
    series: [{ name: "Total Photos", data }],
    categories,
  };
}

/**
 * Builds ApexCharts options for the cumulative photos area chart.
 *
 * @param opts Palette and reduced-motion flag.
 * @param categories Sparse x-axis labels from `buildCumulativeLineSeries`.
 * @param lastIndex Index of the last data point (highlighted with a dot marker).
 * @returns ApexCharts options object.
 */
export function buildCumulativeLineOptions(
  { palette, prefersReducedMotion }: ChartThemeOptions,
  categories: string[],
  lastIndex: number,
): object {
  return {
    chart: {
      type: "area",
      toolbar: { show: false },
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
      y: { formatter: (v: number) => `${v} total photos` },
    },
  };
}

// ── Heatmap (shooting calendar) ────────────────────────────────────────────

/**
 * Builds the ApexCharts series for the shooting calendar heatmap from `photoStats`.
 *
 * Groups monthly counts by year. Series are ordered newest-first (top row = most
 * recent year). Each series row has 12 data points — one per calendar month.
 *
 * @param photoStats Firestore `photo-stats` document data.
 * @returns Array of ApexCharts heatmap series (one per year).
 */
export function buildHeatmapSeries(
  photoStats: Record<string, string | number> | undefined,
): { name: string; data: { x: string; y: number }[] }[] {
  const entries = toChartEntries(photoStats).filter(([key]) =>
    /^\d{1,2}\/\d{4}$/.test(key),
  );

  const byYear = new Map<number, number[]>();
  for (const [key, v] of entries) {
    const d = parseMonthKey(key);
    const year = d.getFullYear();
    const month = d.getMonth();
    if (!byYear.has(year)) byYear.set(year, new Array(12).fill(0));
    byYear.get(year)![month] = v;
  }

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const years = [...byYear.keys()].sort((a, b) => b - a); // newest first

  return years.map((year) => ({
    name: String(year),
    data: MONTHS.map((m, i) => ({ x: m, y: byYear.get(year)![i] })),
  }));
}

/**
 * Builds ApexCharts options for the shooting calendar heatmap.
 *
 * Uses a 5-stop opacity scale on `palette.cta` for non-zero cells;
 * zero cells use `palette.surfaceVariant`. `palette.cta` must be a 6-digit
 * hex string (e.g. '#2563eb') for the `hexToRgba` helper to work correctly.
 *
 * @param opts Palette and reduced-motion flag.
 * @returns ApexCharts options object.
 */
export function buildHeatmapOptions({
  palette,
  prefersReducedMotion,
}: ChartThemeOptions): object {
  const { cta, surfaceVariant } = palette;
  return {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
      animations: { enabled: !prefersReducedMotion, speed: 300 },
      background: "transparent",
      fontFamily: "DM Sans, system-ui, sans-serif",
    },
    dataLabels: { enabled: false },
    plotOptions: {
      heatmap: {
        radius: 3,
        enableShades: false,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: surfaceVariant, name: "0" },
            { from: 1, to: 8, color: hexToRgba(cta, 0.18), name: "1–8" },
            { from: 9, to: 18, color: hexToRgba(cta, 0.42), name: "9–18" },
            { from: 19, to: 30, color: hexToRgba(cta, 0.7), name: "19–30" },
            { from: 31, to: 9999, color: cta, name: "31+" },
          ],
        },
      },
    },
    grid: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    xaxis: {
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
      y: { formatter: (v: number) => `${v} photo${v !== 1 ? "s" : ""}` },
    },
    legend: { show: false },
  };
}

// ── Donut chart (focal lengths) ────────────────────────────────────────────

/**
 * Builds the ApexCharts series and labels for the focal length donut chart
 * from `focalStats`.
 *
 * Sorts entries descending by count. Pure-digit labels (e.g. "56") are
 * suffixed with "mm" for readability.
 *
 * @param focalStats Firestore `focal-stats` document data.
 * @returns `series` (counts) and `labels` for ApexCharts donut.
 */
export function buildFocalLengthSeries(
  focalStats: Record<string, string | number> | undefined,
): { series: number[]; labels: string[] } {
  const entries = toChartEntries(focalStats).sort(([, a], [, b]) => b - a);
  return {
    series: entries.map(([, v]) => v),
    labels: entries.map(([label]) =>
      /^\d+$/.test(label) ? `${label}mm` : label,
    ),
  };
}

/**
 * Builds ApexCharts options for the focal length donut chart.
 *
 * Slice colours use `palette.cta` at decreasing opacity (100% → 65% → 38% → …).
 * `palette.cta` must be a 6-digit hex string for `hexToRgba` to work.
 *
 * @param opts Palette and reduced-motion flag.
 * @param labels Slice labels from `buildFocalLengthSeries`.
 * @param total Sum of all slice values (shown in the donut centre).
 * @returns ApexCharts options object.
 */
export function buildFocalLengthOptions(
  { palette, prefersReducedMotion }: ChartThemeOptions,
  labels: string[],
  total: number,
): object {
  const ALPHA_STEPS = [1, 0.65, 0.38, 0.22];
  const colors = labels.map((_, i) =>
    i === 0
      ? palette.cta
      : hexToRgba(
          palette.cta,
          ALPHA_STEPS[Math.min(i, ALPHA_STEPS.length - 1)],
        ),
  );

  return {
    chart: {
      type: "donut",
      toolbar: { show: false },
      animations: { enabled: !prefersReducedMotion, speed: 300 },
      background: "transparent",
      fontFamily: "DM Sans, system-ui, sans-serif",
    },
    colors,
    labels,
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "shots",
              fontSize: "10px",
              color: palette.onSurfaceVariant,
              formatter: () => String(total),
            },
            value: {
              fontSize: "20px",
              fontWeight: 600,
              color: palette.onSurface,
              offsetY: 4,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "11px",
      labels: { colors: palette.onSurfaceVariant },
      markers: { size: 6 },
      itemMargin: { horizontal: 8, vertical: 2 },
    },
    tooltip: {
      theme: "none",
      style: { fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "12px" },
    },
  };
}
