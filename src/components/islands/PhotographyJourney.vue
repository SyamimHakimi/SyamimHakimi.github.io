<script setup lang="ts">
/**
 * PhotographyJourney — photography statistics: summary cards plus chart panels.
 *
 * Island: client:visible — Firestore data and chart rendering both require
 * browser APIs.
 *
 * The heavy ApexCharts runtime is loaded through an async child component so
 * the primary photography island bundle stays smaller and easier to maintain.
 */
import { defineAsyncComponent } from "vue";
import { useStatistics } from "../../lib/composables/useStatistics";
import { useReducedMotion } from "../../lib/composables/useReducedMotion";

const PhotographyJourneyCharts = defineAsyncComponent(
  () => import("./PhotographyJourneyCharts.vue"),
);

const { statistics, loading, error } = useStatistics();
const { prefersReducedMotion } = useReducedMotion();

function revealDelay(index: number, base = 0, step = 60): string {
  return prefersReducedMotion.value ? "0ms" : `${base + index * step}ms`;
}
</script>

<template>
  <div
    v-if="loading"
    class="space-y-3"
    aria-busy="true"
    aria-label="Loading statistics"
  >
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="i in 4" :key="i" class="card-elevated">
        <div class="skeleton-line mb-3.5" style="width: 50%" />
        <div class="skeleton-line mb-2" style="width: 55%; height: 30px" />
        <div class="skeleton-line" style="width: 65%; height: 10px" />
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-[3fr_2fr]">
      <div class="card-outlined">
        <div class="skeleton-line mb-1.5" style="width: 45%; height: 13px" />
        <div class="skeleton-line mb-4" style="width: 60%; height: 10px" />
        <div class="skeleton-rect" style="height: 160px" />
      </div>
      <div class="card-outlined">
        <div class="skeleton-line mb-1.5" style="width: 40%; height: 13px" />
        <div class="skeleton-line mb-4" style="width: 55%; height: 10px" />
        <div class="flex flex-col gap-2.5">
          <div v-for="j in 6" :key="j" class="flex items-center gap-2">
            <div
              class="skeleton-line flex-shrink-0"
              style="width: 80px; height: 10px"
            />
            <div
              class="skeleton-rect flex-1"
              style="height: 9px; border-radius: 999px"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
      <div class="card-outlined">
        <div class="skeleton-line mb-1.5" style="width: 50%; height: 13px" />
        <div class="skeleton-line mb-4" style="width: 65%; height: 10px" />
        <div class="skeleton-rect" style="height: 110px" />
      </div>
      <div class="card-outlined">
        <div class="skeleton-line mb-1.5" style="width: 45%; height: 13px" />
        <div class="skeleton-line mb-4" style="width: 55%; height: 10px" />
        <div class="skeleton-rect" style="height: 180px; border-radius: 50%" />
      </div>
    </div>
  </div>

  <div
    v-else-if="error"
    class="flex gap-4 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-surface)] p-6"
    role="alert"
  >
    <div
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
      style="background: rgba(220, 38, 38, 0.1)"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-error)"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <div>
      <p class="text-sm font-semibold text-[var(--color-error)]">
        Failed to load statistics
      </p>
      <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
        {{ error }}
      </p>
    </div>
  </div>

  <div v-else-if="statistics" class="space-y-3">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="(stat, i) in [
          {
            eyebrow: 'Outings',
            value: statistics.stats.total_outings,
            label: 'photo walks',
          },
          {
            eyebrow: 'Total Photos',
            value: statistics.stats.total_photos,
            label: 'frames captured',
          },
          {
            eyebrow: 'Favourites',
            value: statistics.stats.total_fav_photos,
            label: 'kept forever',
          },
          {
            eyebrow: 'Fav Lens',
            value: statistics.stats.favourite_photo_lens ?? '—',
            label: 'most used',
            small: true,
          },
        ]"
        :key="stat.eyebrow"
        class="reveal-up card-elevated"
        :style="{ animationDelay: revealDelay(i) }"
      >
        <p
          class="mb-2.5 text-[10px] font-medium uppercase tracking-[.08em] text-[var(--color-on-surface-variant)]"
        >
          {{ stat.eyebrow }}
        </p>
        <p
          class="font-serif text-[var(--color-on-surface)]"
          :class="
            stat.small ? 'text-[17px] leading-snug' : 'text-[36px] leading-none'
          "
        >
          {{
            typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value
          }}
        </p>
        <p class="mt-1 text-xs text-[var(--color-on-surface-variant)]">
          {{ stat.label }}
        </p>
      </div>
    </div>

    <Suspense>
      <PhotographyJourneyCharts
        :statistics="statistics"
        :prefers-reduced-motion="prefersReducedMotion"
      />
      <template #fallback>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-[3fr_2fr]">
          <div class="card-outlined">
            <div
              class="skeleton-line mb-1.5"
              style="width: 45%; height: 13px"
            />
            <div class="skeleton-line mb-4" style="width: 60%; height: 10px" />
            <div class="skeleton-rect" style="height: 160px" />
          </div>
          <div class="card-outlined">
            <div
              class="skeleton-line mb-1.5"
              style="width: 40%; height: 13px"
            />
            <div class="skeleton-line mb-4" style="width: 55%; height: 10px" />
            <div class="flex flex-col gap-2.5">
              <div v-for="j in 6" :key="j" class="flex items-center gap-2">
                <div
                  class="skeleton-line flex-shrink-0"
                  style="width: 80px; height: 10px"
                />
                <div
                  class="skeleton-rect flex-1"
                  style="height: 9px; border-radius: 999px"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <div class="card-outlined">
            <div
              class="skeleton-line mb-1.5"
              style="width: 50%; height: 13px"
            />
            <div class="skeleton-line mb-4" style="width: 65%; height: 10px" />
            <div class="skeleton-rect" style="height: 110px" />
          </div>
          <div class="card-outlined">
            <div
              class="skeleton-line mb-1.5"
              style="width: 45%; height: 13px"
            />
            <div class="skeleton-line mb-4" style="width: 55%; height: 10px" />
            <div
              class="skeleton-rect"
              style="height: 180px; border-radius: 50%"
            />
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>
