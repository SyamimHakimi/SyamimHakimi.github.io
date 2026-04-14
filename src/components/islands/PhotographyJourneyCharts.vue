<script setup lang="ts">
/**
 * PhotographyJourneyCharts — chart-heavy portion of the photography journey UI.
 *
 * Split out from PhotographyJourney so the ApexCharts runtime can be lazy-loaded
 * in its own chunk.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import VueApexCharts from "vue3-apexcharts";
import type { Statistics } from "../../lib/composables/useStatistics";
import {
  buildCumulativeLineOptions,
  buildCumulativeLineSeries,
  buildHeatmapOptions,
  buildHeatmapSeries,
  buildFocalLengthOptions,
  buildFocalLengthSeries,
  buildRecipeBarOptions,
  buildRecipeBarSeries,
  type ChartPalette,
} from "../../lib/utils/statisticsCharts";

/**
 * Props for PhotographyJourneyCharts.
 *
 * `statistics` provides the validated Firestore statistics payload used to
 * build the chart series. `prefersReducedMotion` keeps chart animation aligned
 * with the parent island's motion preference handling.
 */
interface PhotographyJourneyChartsProps {
  statistics: Statistics;
  prefersReducedMotion: boolean;
}

const props = defineProps<PhotographyJourneyChartsProps>();

const palette = ref<ChartPalette>({
  cta: "#b45309",
  onSurface: "#09090b",
  onSurfaceVariant: "#52525b",
  outline: "#e4e4e7",
  surface: "#ffffff",
  surfaceVariant: "#f4f4f5",
});

function resolvePalette(): ChartPalette {
  const styles = getComputedStyle(document.documentElement);
  const get = (variable: string, fallback: string) =>
    styles.getPropertyValue(variable).trim() || fallback;

  return {
    cta: get("--color-cta", "#b45309"),
    onSurface: get("--color-on-surface", "#09090b"),
    onSurfaceVariant: get("--color-on-surface-variant", "#52525b"),
    outline: get("--color-outline", "#e4e4e7"),
    surface: get("--color-surface", "#ffffff"),
    surfaceVariant: get("--color-surface-variant", "#f4f4f5"),
  };
}

let themeObserver: MutationObserver | null = null;

onMounted(() => {
  palette.value = resolvePalette();
  themeObserver = new MutationObserver(() => {
    palette.value = resolvePalette();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});

onUnmounted(() => {
  themeObserver?.disconnect();
});

const lineData = computed(() =>
  buildCumulativeLineSeries(props.statistics.photoStats),
);
const lineOptions = computed(() =>
  buildCumulativeLineOptions(
    {
      palette: palette.value,
      prefersReducedMotion: props.prefersReducedMotion,
    },
    lineData.value.categories,
    Math.max(0, lineData.value.series[0]?.data.length - 1),
  ),
);

const barData = computed(() =>
  buildRecipeBarSeries(props.statistics.recipeStats),
);
const barOptions = computed(() =>
  buildRecipeBarOptions(
    {
      palette: palette.value,
      prefersReducedMotion: props.prefersReducedMotion,
    },
    barData.value.categories,
  ),
);

const heatmapData = computed(() =>
  buildHeatmapSeries(props.statistics.photoStats),
);
const heatmapOptions = computed(() =>
  buildHeatmapOptions({
    palette: palette.value,
    prefersReducedMotion: props.prefersReducedMotion,
  }),
);

const donutData = computed(() =>
  buildFocalLengthSeries(props.statistics.focalStats),
);
const donutTotal = computed(() =>
  donutData.value.series.reduce((sum, value) => sum + value, 0),
);
const donutOptions = computed(() =>
  buildFocalLengthOptions(
    {
      palette: palette.value,
      prefersReducedMotion: props.prefersReducedMotion,
    },
    donutData.value.labels,
    donutTotal.value,
  ),
);

const lineSrSummary = computed(() => {
  const total = props.statistics.stats.total_photos ?? 0;
  const firstYear = lineData.value.categories[0] ?? "";
  const lastYear =
    lineData.value.categories[lineData.value.categories.length - 1] ?? "";
  return `Cumulative photo count from ${firstYear} to ${lastYear}, reaching ${total.toLocaleString()} total photos.`;
});

const barSrSummary = computed(() => {
  const entries = barData.value.categories
    .map(
      (name, index) => `${name}: ${barData.value.series[0]?.data[index] ?? 0}`,
    )
    .join(", ");
  return `Film recipe usage — ${entries}.`;
});

const heatmapSrSummary = computed(() => {
  const total = props.statistics.stats.total_photos ?? 0;
  const outings = props.statistics.stats.total_outings ?? 0;
  return `Shooting calendar heatmap showing ${total.toLocaleString()} photos across ${outings} outings by month and year.`;
});

const donutSrSummary = computed(() => {
  if (!donutData.value.series.length) return "";
  const parts = donutData.value.labels.map(
    (label, index) => `${label}: ${donutData.value.series[index]}`,
  );
  return `Focal length distribution — ${parts.join(", ")}.`;
});

const heatmapMaxPhotos = computed(() => {
  let max = 0;
  for (const row of heatmapData.value) {
    for (const point of row.data as { y: number }[]) {
      if (point.y > max) max = point.y;
    }
  }
  return max;
});

function revealDelay(index: number, base = 0, step = 60): string {
  return props.prefersReducedMotion ? "0ms" : `${base + index * step}ms`;
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-[3fr_2fr]">
      <div
        class="reveal-up card-outlined overflow-visible"
        :style="{ animationDelay: revealDelay(0, 240) }"
      >
        <p class="text-[13px] font-semibold text-[var(--color-on-surface)]">
          Photos Over Time
        </p>
        <p class="mb-3 text-[11px] text-[var(--color-on-surface-variant)]">
          Cumulative total since first shoot
        </p>
        <VueApexCharts
          type="area"
          height="160"
          :options="lineOptions"
          :series="lineData.series"
          aria-label="Cumulative photo count area chart"
        />
        <p v-if="lineSrSummary" class="sr-only">{{ lineSrSummary }}</p>
      </div>

      <div
        class="reveal-up card-outlined overflow-visible"
        :style="{ animationDelay: revealDelay(1, 240) }"
      >
        <p class="text-[13px] font-semibold text-[var(--color-on-surface)]">
          Film Recipes
        </p>
        <p class="mb-3 text-[11px] text-[var(--color-on-surface-variant)]">
          Simulation usage count
        </p>
        <VueApexCharts
          type="bar"
          height="160"
          :options="barOptions"
          :series="barData.series"
          aria-label="Film recipe usage horizontal bar chart"
        />
        <p v-if="barSrSummary" class="sr-only">{{ barSrSummary }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
      <div
        class="reveal-up card-outlined overflow-visible"
        :style="{ animationDelay: revealDelay(0, 360) }"
      >
        <p class="text-[13px] font-semibold text-[var(--color-on-surface)]">
          Shooting Calendar
        </p>
        <p class="mb-3 text-[11px] text-[var(--color-on-surface-variant)]">
          Photos per month by year
        </p>
        <VueApexCharts
          type="heatmap"
          height="110"
          width="100%"
          :options="heatmapOptions"
          :series="heatmapData"
          aria-label="Shooting calendar heatmap by year and month"
        />
        <p v-if="heatmapSrSummary" class="sr-only">{{ heatmapSrSummary }}</p>
        <div
          class="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-[var(--color-on-surface-variant)]"
          :aria-label="`Colour scale: 0 photos (light) to ${heatmapMaxPhotos}+ photos (dark)`"
        >
          <span>0</span>
          <div
            class="h-2 w-14 rounded-sm"
            style="
              background: linear-gradient(
                to right,
                var(--color-surface-variant),
                var(--color-cta)
              );
            "
            aria-hidden="true"
          />
          <span>{{ heatmapMaxPhotos }}+ photos</span>
        </div>
      </div>

      <div
        class="reveal-up card-outlined flex flex-col overflow-visible"
        :style="{ animationDelay: revealDelay(1, 360) }"
      >
        <p class="text-[13px] font-semibold text-[var(--color-on-surface)]">
          Focal Lengths
        </p>
        <p class="mb-1 text-[11px] text-[var(--color-on-surface-variant)]">
          Shots by focal length
        </p>
        <div class="w-full overflow-visible">
          <VueApexCharts
            type="donut"
            height="200"
            width="100%"
            :options="donutOptions"
            :series="donutData.series"
            aria-label="Focal length usage donut chart"
          />
          <p v-if="donutSrSummary" class="sr-only">{{ donutSrSummary }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
