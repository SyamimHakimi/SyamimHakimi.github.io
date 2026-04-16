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

export interface HeatmapColorRange {
  from: number;
  to: number;
  color: string;
  label: string;
}

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Parses a CSS colour string into [r, g, b] integers (0–255).
 * Handles: '#rrggbb', '#rgb', 'rgb(r, g, b)', 'rgba(r, g, b, a)'.
 * Returns null if the format is unrecognised.
 */
function parseCssColor(color: string): [number, number, number] | null {
  const c = color.trim();
  // #rrggbb
  if (/^#[0-9a-f]{6}$/i.test(c)) {
    return [
      parseInt(c.slice(1, 3), 16),
      parseInt(c.slice(3, 5), 16),
      parseInt(c.slice(5, 7), 16),
    ];
  }
  // #rgb → expand to #rrggbb
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    return [
      parseInt(c[1]! + c[1]!, 16),
      parseInt(c[2]! + c[2]!, 16),
      parseInt(c[3]! + c[3]!, 16),
    ];
  }
  // rgb(r, g, b) or rgba(r, g, b, a)
  const m = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    return [parseInt(m[1]!, 10), parseInt(m[2]!, 10), parseInt(m[3]!, 10)];
  }
  return null;
}

/**
 * Blends a foreground CSS colour against a background CSS colour at the given
 * alpha, returning a fully-opaque hex string. ApexCharts heatmap colorScale
 * ranges only accept hex colours — rgba strings are silently ignored, causing
 * chart cells to render a different colour than the custom legend swatches.
 *
 * Supports #rrggbb, #rgb, rgb(), and rgba() input formats. Falls back to the
 * foreground colour (alpha = 1) if either colour cannot be parsed.
 *
 * @param fg Foreground colour, e.g. '#b45309' or 'rgb(180, 83, 9)'.
 * @param background Background colour to blend against.
 * @param alpha Opacity of the foreground layer (0–1).
 */
function blendHex(fg: string, background: string, alpha: number): string {
  const f = parseCssColor(fg);
  const b = parseCssColor(background);
  if (!f || !b) {
    // Fallback: return foreground as solid hex if either parse fails
    const safe = parseCssColor(fg);
    if (safe) {
      return `#${safe[0].toString(16).padStart(2, "0")}${safe[1].toString(16).padStart(2, "0")}${safe[2].toString(16).padStart(2, "0")}`;
    }
    return fg.startsWith("#") ? fg : "#000000";
  }
  const rr = Math.round(f[0] * alpha + b[0] * (1 - alpha));
  const rg = Math.round(f[1] * alpha + b[1] * (1 - alpha));
  const rb = Math.round(f[2] * alpha + b[2] * (1 - alpha));
  return `#${rr.toString(16).padStart(2, "0")}${rg.toString(16).padStart(2, "0")}${rb.toString(16).padStart(2, "0")}`;
}

/**
 * Builds a readable y-axis scale for large cumulative totals.
 *
 * @param maxValue Highest plotted value.
 * @returns Rounded axis max and tick count.
 */
export function buildNiceAxisScale(maxValue: number): {
  max: number;
  tickAmount: number;
} {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return { max: 4, tickAmount: 4 };
  }

  if (maxValue <= 24) {
    return { max: Math.max(4, Math.ceil(maxValue / 4) * 4), tickAmount: 4 };
  }

  const magnitude = 10 ** Math.floor(Math.log10(maxValue));
  const candidates = [1, 1.5, 2, 2.5, 5, 10];
  let step = magnitude;

  for (const candidate of candidates) {
    const nextStep = candidate * magnitude;
    if (Math.ceil(maxValue / nextStep) <= 6) {
      step = nextStep;
      break;
    }
  }

  const axisMax = Math.ceil(maxValue / step) * step;
  const intervals = Math.max(4, Math.min(6, Math.round(axisMax / step)));

  return {
    max: axisMax,
    tickAmount: intervals,
  };
}

/**
 * Builds a discrete heatmap colour scale derived from the actual monthly max.
 *
 * @param palette Resolved chart palette.
 * @param maxValue Highest non-zero monthly photo count in the heatmap.
 * @returns Ordered zero + non-zero ranges for Apex heatmap colourScale and legend UI.
 */
export function buildHeatmapColorRanges(
  palette: ChartPalette,
  maxValue: number,
): HeatmapColorRange[] {
  const zeroRange: HeatmapColorRange = {
    from: 0,
    to: 0,
    color: palette.surfaceVariant,
    label: "0",
  };

  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return [zeroRange];
  }

  const steps = [0.15, 0.3, 0.5, 0.7, 1];
  // Use blendHex (not hexToRgba) so ApexCharts receives solid hex strings.
  // ApexCharts heatmap colorScale only accepts hex — rgba values are silently
  // dropped, causing chart cells to mismatch the custom legend swatches.
  const colors = [
    blendHex(palette.cta, palette.surface, 0.18),
    blendHex(palette.cta, palette.surface, 0.32),
    blendHex(palette.cta, palette.surface, 0.5),
    blendHex(palette.cta, palette.surface, 0.7),
    palette.cta,
  ];

  let previousUpper = 0;
  const ranges = steps.map((ratio, index) => {
    const upper =
      index === steps.length - 1
        ? maxValue
        : Math.max(previousUpper + 1, Math.round(maxValue * ratio));
    const range: HeatmapColorRange = {
      from: previousUpper + 1,
      to: upper,
      color: colors[index]!,
      label:
        previousUpper + 1 === upper
          ? `${upper}`
          : `${previousUpper + 1}\u2013${upper}`,
    };
    previousUpper = upper;
    return range;
  });

  return [zeroRange, ...ranges];
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
      cssClass: "chart-tooltip",
      style: { fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "12px" },
      x: { show: true },
    },
  };
}

// ── Bar chart (theme distribution) ─────────────────────────────────────────

/**
 * Builds the ApexCharts series and y-axis categories for a horizontal
 * distribution bar chart from a label/count map.
 *
 * Sorts descending by count and takes the top 6 labels.
 *
 * @param statsMap Firestore statistics document data.
 * @returns `series` for ApexCharts and `categories` for the y-axis.
 */
export function buildDistributionBarSeries(
  statsMap: Record<string, string | number> | undefined,
): { series: { name: string; data: number[] }[]; categories: string[] } {
  const entries = toChartEntries(statsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return {
    series: [{ name: "Photos", data: entries.map(([, v]) => v) }],
    categories: entries.map(([label]) => label),
  };
}

/**
 * Builds ApexCharts options for the horizontal distribution bar chart.
 *
 * @param opts Palette and reduced-motion flag.
 * @param categories Y-axis labels produced by `buildDistributionBarSeries`.
 * @returns ApexCharts options object.
 */
export function buildDistributionBarOptions(
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
      cssClass: "chart-tooltip",
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
  maxValue: number,
): object {
  const axisScale = buildNiceAxisScale(maxValue);
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
      min: 0,
      max: axisScale.max,
      tickAmount: axisScale.tickAmount,
      forceNiceScale: true,
      labels: {
        style: { colors: palette.onSurfaceVariant, fontSize: "9px" },
        formatter: (v: number) =>
          v >= 1000
            ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
            : String(Math.round(v)),
      },
    },
    tooltip: {
      theme: "none",
      cssClass: "chart-tooltip",
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
 * zero cells use `palette.surfaceVariant`. Colour blending accepts hex and
 * rgb/rgba strings so theme-resolved CSS values stay usable here.
 *
 * @param opts Palette and reduced-motion flag.
 * @returns ApexCharts options object.
 */
export function buildHeatmapOptions(
  { palette, prefersReducedMotion }: ChartThemeOptions,
  maxValue: number,
): object {
  const ranges = buildHeatmapColorRanges(palette, maxValue);
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
          ranges: ranges.map((range) => ({
            from: range.from,
            to: range.to,
            color: range.color,
            name: range.label,
          })),
        },
      },
    },
    grid: { padding: { top: 0, right: 0, bottom: 0, left: 4 } },
    xaxis: {
      labels: { style: { colors: palette.onSurfaceVariant, fontSize: "9px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: palette.onSurfaceVariant, fontSize: "10px" },
        minWidth: 36,
        maxWidth: 36,
      },
    },
    tooltip: {
      theme: "none",
      cssClass: "chart-tooltip",
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
 * suffixed with "mm" for readability. Entries representing less than 3% of
 * total shots are collapsed into a single "Other" slice to prevent the legend
 * from accumulating many insignificant entries.
 *
 * @param focalStats Firestore `focal-stats` document data.
 * @returns `series` (counts) and `labels` for ApexCharts donut.
 */
export function buildFocalLengthSeries(
  focalStats: Record<string, string | number> | undefined,
): { series: number[]; labels: string[] } {
  const entries = toChartEntries(focalStats).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) return { series: [], labels: [] };

  const MIN_SHARE = 0.03; // collapse entries < 3% of total into "Other"
  const significant = entries.filter(([, v]) => v / total >= MIN_SHARE);
  const otherSum = entries
    .filter(([, v]) => v / total < MIN_SHARE)
    .reduce((sum, [, v]) => sum + v, 0);

  const filtered: [string, number][] =
    otherSum > 0 ? [...significant, ["Other", otherSum]] : significant;

  return {
    series: filtered.map(([, v]) => v),
    labels: filtered.map(([label]) =>
      /^\d+$/.test(label) ? `${label}mm` : label,
    ),
  };
}

/**
 * Builds ApexCharts options for the focal length donut chart.
 *
 * Slice colours use `palette.cta` at decreasing opacity (100% → 65% → 38% → …).
 * The colour parser accepts hex and rgb/rgba strings.
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
  const colors = labels.map((_, i) => {
    if (i === 0) return palette.cta;
    const rgb = parseCssColor(palette.cta);
    const a = ALPHA_STEPS[Math.min(i, ALPHA_STEPS.length - 1)] ?? 0.22;
    return rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})` : palette.cta;
  });

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
      cssClass: "chart-tooltip",
      style: { fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "12px" },
    },
  };
}
