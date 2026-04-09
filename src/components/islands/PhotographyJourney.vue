<script setup lang="ts">
/**
 * PhotographyJourney — photography statistics charts and featured photos.
 * Island: client:visible — ApexCharts requires browser canvas APIs.
 * Composable: useStatistics()
 */
import { computed, defineAsyncComponent } from "vue";
import { useStatistics } from "../../lib/composables/useStatistics";

// Lazy-load ApexCharts to avoid SSR issues (it requires browser APIs)
const VueApexCharts = defineAsyncComponent(() =>
  import("vue3-apexcharts").then((m) => m.default ?? m),
);

const { statistics, loading, error } = useStatistics();

const themeChartOptions = computed(() => ({
  chart: { type: "donut", toolbar: { show: false } },
  labels: Object.keys(statistics.value?.themeStats ?? {}).filter(
    (k) => k !== "id" && k !== "path" && k !== "createTime" && k !== "updateTime",
  ),
  legend: { position: "bottom" },
  responsive: [{ breakpoint: 480, options: { chart: { width: 300 } } }],
}));

const themeChartSeries = computed(() =>
  Object.entries(statistics.value?.themeStats ?? {})
    .filter(([k]) => !["id", "path", "createTime", "updateTime"].includes(k))
    .map(([, v]) => Number(v)),
);

const recipeChartOptions = computed(() => ({
  chart: { type: "bar", toolbar: { show: false } },
  xaxis: {
    categories: Object.keys(statistics.value?.recipeStats ?? {}).filter(
      (k) => !["id", "path", "createTime", "updateTime"].includes(k),
    ),
  },
  plotOptions: { bar: { horizontal: true } },
}));

const recipeChartSeries = computed(() => [
  {
    name: "Photos",
    data: Object.entries(statistics.value?.recipeStats ?? {})
      .filter(([k]) => !["id", "path", "createTime", "updateTime"].includes(k))
      .map(([, v]) => Number(v)),
  },
]);
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="space-y-6" aria-busy="true">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="i in 4" :key="i" class="h-24 animate-pulse rounded-xl bg-[var(--color-surface)]" />
      </div>
      <div class="h-64 animate-pulse rounded-xl bg-[var(--color-surface)]" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400" role="alert">
      <p class="font-medium">Failed to load statistics</p>
      <p class="mt-1 text-sm opacity-80">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="statistics" class="space-y-10">
      <!-- Summary stats -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p class="text-3xl font-bold text-[var(--color-accent)]">{{ statistics.stats.total_outings }}</p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Outings</p>
        </div>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p class="text-3xl font-bold text-[var(--color-accent)]">{{ statistics.stats.total_photos }}</p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Photos</p>
        </div>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p class="text-3xl font-bold text-[var(--color-accent)]">{{ statistics.stats.total_fav_photos }}</p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Favourites</p>
        </div>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p class="text-sm font-bold text-[var(--color-accent)]">{{ statistics.stats.favourite_photo_lens }}</p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">Fav Lens</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 class="mb-3 font-medium">Themes</h3>
          <VueApexCharts
            v-if="themeChartSeries.length > 0"
            type="donut"
            :options="themeChartOptions"
            :series="themeChartSeries"
          />
        </div>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 class="mb-3 font-medium">Film Recipes</h3>
          <VueApexCharts
            v-if="recipeChartSeries[0]?.data.length > 0"
            type="bar"
            height="250"
            :options="recipeChartOptions"
            :series="recipeChartSeries"
          />
        </div>
      </div>
    </div>
  </div>
</template>
