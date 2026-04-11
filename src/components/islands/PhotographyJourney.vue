<script setup lang="ts">
/**
 * PhotographyJourney — photography statistics: 4 stat cards, monthly photos
 * line chart, and film recipe horizontal bar chart.
 *
 * Island: client:visible — ApexCharts requires browser APIs.
 * Composable: useStatistics()
 *
 * Chart palette is resolved from CSS custom properties at mount and re-resolved
 * whenever data-theme changes (MutationObserver), keeping charts in sync with
 * the user's light/dark preference.
 *
 * Scroll entrance animations use motion-v; stagger and translate are skipped
 * when prefers-reduced-motion is active.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { Motion } from "motion-v";
import { useStatistics } from "../../lib/composables/useStatistics";
import {
  buildPhotoStatsLineOptions,
  buildPhotoStatsLineSeries,
  buildRecipeBarOptions,
  buildRecipeBarSeries,
  type ChartPalette,
} from "../../lib/utils/statisticsCharts";

const { statistics, loading, error } = useStatistics();

// ── Chart palette ──────────────────────────────────────────────────────────
const palette = ref<ChartPalette>({
  cta: "#2563eb",
  onSurface: "#09090b",
  onSurfaceVariant: "#52525b",
  outline: "#e4e4e7",
  surface: "#ffffff",
});

function resolvePalette(): ChartPalette {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string, fb: string) => s.getPropertyValue(v).trim() || fb;
  return {
    cta:              get("--color-cta",                "#2563eb"),
    onSurface:        get("--color-on-surface",         "#09090b"),
    onSurfaceVariant: get("--color-on-surface-variant", "#52525b"),
    outline:          get("--color-outline",            "#e4e4e7"),
    surface:          get("--color-surface",            "#ffffff"),
  };
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

// ── Line chart (photoStats — monthly counts) ───────────────────────────────
const lineData = computed(() =>
  buildPhotoStatsLineSeries(statistics.value?.photoStats),
);
const lineOptions = computed(() =>
  buildPhotoStatsLineOptions(
    { palette: palette.value, prefersReducedMotion },
    lineData.value.categories,
    Math.max(0, lineData.value.categories.length - 1),
  ),
);

// ── Bar chart (recipeStats — film simulations) ─────────────────────────────
const barData = computed(() =>
  buildRecipeBarSeries(statistics.value?.recipeStats),
);
const barOptions = computed(() =>
  buildRecipeBarOptions(
    { palette: palette.value, prefersReducedMotion },
    barData.value.categories,
  ),
);

// ── Motion helpers ─────────────────────────────────────────────────────────
const cardInitial = prefersReducedMotion ? {} : { opacity: 0, y: 16 };
const cardVisible = { opacity: 1, y: 0 };

function delay(i: number, base = 0, step = 60): number {
  return prefersReducedMotion ? 0 : (base + i * step) / 1000;
}
</script>

<template>
  <!-- ── Loading skeleton ─────────────────────────────────────────────────── -->
  <div v-if="loading" class="space-y-3" aria-busy="true" aria-label="Loading statistics">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="i in 4" :key="i" class="card-elevated">
        <div class="skeleton-line mb-3.5" style="width:50%"/>
        <div class="skeleton-line mb-2" style="width:55%;height:30px"/>
        <div class="skeleton-line" style="width:65%;height:10px"/>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-[3fr_2fr]">
      <div class="card-outlined">
        <div class="skeleton-line mb-1.5" style="width:45%;height:13px"/>
        <div class="skeleton-line mb-4" style="width:60%;height:10px"/>
        <div class="skeleton-rect" style="height:160px"/>
      </div>
      <div class="card-outlined">
        <div class="skeleton-line mb-1.5" style="width:40%;height:13px"/>
        <div class="skeleton-line mb-4" style="width:55%;height:10px"/>
        <div class="flex flex-col gap-2.5">
          <div v-for="j in 6" :key="j" class="flex items-center gap-2">
            <div class="skeleton-line flex-shrink-0" style="width:80px;height:10px"/>
            <div class="skeleton-rect flex-1" style="height:9px;border-radius:999px"/>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Error state ──────────────────────────────────────────────────────── -->
  <div
    v-else-if="error"
    class="flex gap-4 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-surface)] p-6"
    role="alert"
  >
    <div
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
      style="background: rgba(220,38,38,0.10)"
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="var(--color-error)"
        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <div>
      <p class="text-sm font-semibold text-[var(--color-error)]">
        Failed to load statistics
      </p>
      <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">{{ error }}</p>
    </div>
  </div>

  <!-- ── Loaded state ─────────────────────────────────────────────────────── -->
  <div v-else-if="statistics" class="space-y-3">

    <!-- Stat row — 2-col mobile, 4-col sm+ -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Motion
        v-for="(stat, i) in [
          { eyebrow: 'Outings',      value: statistics.stats.total_outings,                     label: 'photo walks'     },
          { eyebrow: 'Total Photos', value: statistics.stats.total_photos,                       label: 'frames captured' },
          { eyebrow: 'Favourites',   value: statistics.stats.total_fav_photos,                   label: 'kept forever'    },
          { eyebrow: 'Fav Lens',     value: statistics.stats.favourite_photo_lens ?? '—',        label: 'most used', small: true },
        ]"
        :key="stat.eyebrow"
        as="div"
        class="card-elevated"
        :initial="cardInitial"
        :animate="cardVisible"
        :transition="{ duration: 0.3, delay: delay(i), easing: [0.2,0,0,1] }"
      >
        <p class="mb-2.5 text-[10px] font-medium uppercase tracking-[.08em] text-[var(--color-on-surface-variant)]">
          {{ stat.eyebrow }}
        </p>
        <p
          class="font-serif text-[var(--color-on-surface)]"
          :class="stat.small ? 'text-[17px] leading-snug' : 'text-[36px] leading-none'"
        >
          {{ typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value }}
        </p>
        <p class="mt-1 text-xs text-[var(--color-on-surface-variant)]">{{ stat.label }}</p>
      </Motion>
    </div>

    <!-- Chart row — stacked mobile, line(3fr) + bar(2fr) on sm+ -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-[3fr_2fr]">

      <!-- Monthly photos line chart -->
      <Motion
        as="div"
        class="card-outlined"
        :initial="cardInitial"
        :animate="cardVisible"
        :transition="{ duration: 0.3, delay: delay(0, 240), easing: [0.2,0,0,1] }"
      >
        <p class="text-[13px] font-semibold text-[var(--color-on-surface)]">
          Photos Over Time
        </p>
        <p class="mb-3 text-[11px] text-[var(--color-on-surface-variant)]">
          Monthly shots — last 12 months
        </p>
        <VueApexCharts
          type="area"
          height="160"
          :options="lineOptions"
          :series="lineData.series"
          aria-label="Monthly photo count line graph"
        />
      </Motion>

      <!-- Film recipe bar chart -->
      <Motion
        as="div"
        class="card-outlined"
        :initial="cardInitial"
        :animate="cardVisible"
        :transition="{ duration: 0.3, delay: delay(1, 240), easing: [0.2,0,0,1] }"
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
      </Motion>

    </div>
  </div>
</template>
