<script setup lang="ts">
/**
 * PhotographyJourney - photography statistics charts and featured photos.
 * Island: client:visible - Chart.js requires browser canvas APIs.
 * Composable: useStatistics()
 */
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "vue-chartjs";
import { computed, onMounted, onUnmounted, ref, type Ref } from "vue";
import { useStatistics } from "../../lib/composables/useStatistics";
import {
  buildRecipeChartData,
  buildRecipeChartOptions,
  buildThemeChartData,
  buildThemeChartOptions,
  toChartEntries,
  type ChartPalette,
} from "../../lib/utils/statisticsCharts";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const { statistics, loading, error } = useStatistics();

const chartPalette: Ref<ChartPalette> = ref({
  accent: "#f59e0b",
  accentAlt: "#fb923c",
  accentSoft: "#fde68a",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#d1d5db",
  surface: "#ffffff",
});

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resolveCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

function updateChartPalette() {
  chartPalette.value = {
    accent: resolveCssVar("--color-accent", "#f59e0b"),
    accentAlt: "#fb923c",
    accentSoft: "#fde68a",
    text: resolveCssVar("--color-text", "#111827"),
    textMuted: resolveCssVar("--color-text-muted", "#6b7280"),
    border: resolveCssVar("--color-border", "#d1d5db"),
    surface: resolveCssVar("--color-surface", "#ffffff"),
  };
}

let themeObserver: MutationObserver | null = null;

onMounted(() => {
  updateChartPalette();

  themeObserver = new MutationObserver(updateChartPalette);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});

onUnmounted(() => {
  themeObserver?.disconnect();
});

const themeEntries = computed(() =>
  toChartEntries(statistics.value?.themeStats),
);
const recipeEntries = computed(() =>
  toChartEntries(statistics.value?.recipeStats),
);

const themeChartData = computed(() =>
  buildThemeChartData(statistics.value?.themeStats, chartPalette.value),
);

const recipeChartData = computed(() =>
  buildRecipeChartData(statistics.value?.recipeStats, chartPalette.value),
);

const themeChartOptions = computed(() =>
  buildThemeChartOptions({
    palette: chartPalette.value,
    prefersReducedMotion,
  }),
);

const recipeChartOptions = computed(() =>
  buildRecipeChartOptions({
    palette: chartPalette.value,
    prefersReducedMotion,
  }),
);
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-6" aria-busy="true">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          v-for="i in 4"
          :key="i"
          class="h-24 animate-pulse rounded-xl bg-[var(--color-surface)]"
        />
      </div>
      <div class="h-64 animate-pulse rounded-xl bg-[var(--color-surface)]" />
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
      role="alert"
    >
      <p class="font-medium">Failed to load statistics</p>
      <p class="mt-1 text-sm opacity-80">{{ error }}</p>
    </div>

    <div v-else-if="statistics" class="space-y-10">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
        >
          <p class="text-3xl font-bold text-[var(--color-accent)]">
            {{ statistics.stats.total_outings }}
          </p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Outings</p>
        </div>
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
        >
          <p class="text-3xl font-bold text-[var(--color-accent)]">
            {{ statistics.stats.total_photos }}
          </p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Photos</p>
        </div>
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
        >
          <p class="text-3xl font-bold text-[var(--color-accent)]">
            {{ statistics.stats.total_fav_photos }}
          </p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Favourites</p>
        </div>
        <div
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
        >
          <p class="text-sm font-bold text-[var(--color-accent)]">
            {{ statistics.stats.favourite_photo_lens }}
          </p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Fav Lens</p>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          aria-labelledby="theme-chart-title"
        >
          <h3 id="theme-chart-title" class="mb-3 font-medium">Themes</h3>
          <div class="h-[320px]">
            <Doughnut
              v-if="themeEntries.length > 0"
              :data="themeChartData"
              :options="themeChartOptions"
              aria-label="Photography themes distribution chart"
            />
          </div>
        </section>

        <section
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          aria-labelledby="recipe-chart-title"
        >
          <h3 id="recipe-chart-title" class="mb-3 font-medium">Film Recipes</h3>
          <div class="h-[320px]">
            <Bar
              v-if="recipeEntries.length > 0"
              :data="recipeChartData"
              :options="recipeChartOptions"
              aria-label="Film recipe usage chart"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
