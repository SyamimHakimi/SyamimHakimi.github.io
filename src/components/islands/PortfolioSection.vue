<script setup lang="ts">
/**
 * PortfolioSection — experience categories and personal projects.
 * Island: client:visible
 * Composable: usePortfolio()
 *
 * UI: hero summary strip, skills matrix (all categories in one scannable
 * table), personal project card. Designed for recruiter readability.
 */
import { computed } from "vue";
import { usePortfolio } from "../../lib/composables/usePortfolio";
import type { ExperienceItem } from "../../lib/composables/usePortfolio";
import { useReducedMotion } from "../../lib/composables/useReducedMotion";
import { buildPortfolioHeroItems } from "../../lib/utils/portfolioSection";
import ErrorAlert from "../ui/ErrorAlert.vue";
import ExperienceMatrix from "../ui/ExperienceMatrix.vue";

const { data, loading, error } = usePortfolio();

function isActive(item: ExperienceItem): boolean {
  return !item["date-to"];
}

const expYears = computed((): number | null => {
  const allDates = [
    ...data.value.experience.platforms,
    ...data.value.experience.protocols,
    ...data.value.experience.ai,
    ...data.value.experience.frameworks,
    ...data.value.experience.languages,
  ]
    .map((item) => item["date-from"])
    .filter(Boolean)
    .map((d) => new Date(d!).getFullYear())
    .filter((y) => !isNaN(y));
  if (!allDates.length) return null;
  const earliest = Math.min(...allDates);
  const years = new Date().getFullYear() - earliest;
  return years >= 1 ? years : null;
});

const heroItems = computed(() => buildPortfolioHeroItems(expYears.value));

const { prefersReducedMotion } = useReducedMotion();

function revealDelay(index: number, base = 0): string {
  return prefersReducedMotion.value ? "0ms" : `${base + index * 50}ms`;
}
</script>

<template>
  <div>
    <!-- ── Loading skeleton ── -->
    <div
      v-if="loading"
      class="space-y-9"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      <!-- Hero strip skeleton -->
      <div
        class="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-outline)] bg-[var(--color-surface)] px-5 py-4"
      >
        <div class="skeleton-line" style="width: 90px; animation-delay: 0ms" />
        <div class="h-4 w-px bg-[var(--color-outline)]" />
        <div class="skeleton-line" style="width: 72px; animation-delay: 60ms" />
        <div class="h-4 w-px bg-[var(--color-outline)]" />
        <div class="skeleton-line" style="width: 100px; animation-delay: 120ms" />
        <div class="h-4 w-px bg-[var(--color-outline)]" />
        <div class="skeleton-rect h-6 w-20 rounded-full" style="animation-delay: 180ms" />
        <div class="skeleton-rect h-6 w-24 rounded-full" style="animation-delay: 240ms" />
      </div>

      <!-- Matrix skeleton -->
      <div
        class="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-outline)]"
      >
        <div
          v-for="(widths, i) in [[90, 110, 80, 95], [70, 88], [100, 75], [80, 95, 70], [84, 66, 92, 78]]"
          :key="i"
          class="matrix-skel-row"
        >
          <div class="matrix-skel-label">
            <div
              class="skeleton-line"
              :style="`width:${i === 0 ? 68 : i === 1 ? 58 : i === 2 ? 96 : i === 3 ? 72 : 88}px;animation-delay:${i * 40}ms`"
            />
          </div>
          <div class="matrix-skel-items">
            <div
              v-for="(w, j) in widths"
              :key="j"
              class="skeleton-rect h-[26px] rounded-full"
              :style="`width:${w}px;animation-delay:${i * 40 + j * 30}ms`"
            />
          </div>
        </div>
      </div>

      <!-- Project card skeleton -->
      <div class="space-y-3" style="max-width: 720px">
        <div class="skeleton-line" style="width: 130px; height: 16px" />
        <div
          class="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6 shadow-sm space-y-3"
        >
          <div class="skeleton-line" style="width: 100px; height: 10px" />
          <div class="skeleton-line" style="width: 120px; height: 20px" />
          <div class="skeleton-line" style="width: 75%" />
          <div class="skeleton-line" style="width: 90%" />
          <div class="flex flex-wrap gap-2 pt-1">
            <div
              v-for="w in [64, 52, 72]"
              :key="w"
              class="skeleton-rect h-6 rounded-full"
              :style="`width:${w}px`"
            />
          </div>
        </div>
      </div>
    </div>

    <ErrorAlert
      v-else-if="error"
      title="Failed to load portfolio"
      :message="error"
    />

    <div v-else class="space-y-10">
      <!-- ── Hero strip (unchanged) ── -->
      <div
        class="reveal-up flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--radius-md)] border border-[var(--color-outline)] bg-[var(--color-surface)] px-5 py-4"
        :style="{ animationDelay: revealDelay(0) }"
      >
        <template
          v-for="(item, index) in heroItems"
          :key="`${item.kind}-${item.label}`"
        >
          <div
            v-if="index > 0 && item.kind === 'stat'"
            class="h-4 w-px bg-[var(--color-outline)]"
            aria-hidden="true"
          />
          <span
            :class="item.kind === 'tag' ? 'pill pill--accent' : 'stat-inline'"
          >
            <component
              :is="item.icon"
              :size="item.kind === 'tag' ? 11 : 13"
              aria-hidden="true"
            />
            {{ item.label }}
          </span>
        </template>
      </div>

      <!-- ── Skills matrix ── -->
      <div
        class="reveal-up"
        :style="{ animationDelay: revealDelay(1, 40) }"
      >
        <ExperienceMatrix
          :experience="data.experience"
          :is-active="isActive"
        />
      </div>

      <!-- ── Personal projects ── -->
      <section v-if="data.projects.length > 0" aria-label="Personal projects">
        <div
          class="reveal-up mb-3"
          :style="{ animationDelay: revealDelay(0, 80) }"
        >
          <h2 class="text-xl">Personal Projects</h2>
        </div>
        <div class="space-y-4" style="max-width: 720px">
          <div
            v-for="({ project, techstack }, pi) in data.projects"
            :key="project.id"
            class="reveal-up card-elevated"
            style="padding: 24px"
            :style="{ animationDelay: revealDelay(pi + 1, 80) }"
          >
            <p
              v-if="project.subtitle"
              class="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--color-on-surface-variant)]"
            >
              {{ project.subtitle }}
            </p>
            <h3
              class="mt-1 text-[20px] font-normal text-[var(--color-on-surface)]"
            >
              <a
                v-if="project.link"
                :href="project.link"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:underline"
              >{{ project.title }}</a>
              <template v-else>{{ project.title }}</template>
            </h3>
            <p
              v-if="project.description"
              class="mt-3 text-[14px] leading-relaxed text-[var(--color-on-surface-variant)]"
            >
              {{ project.description }}
            </p>
            <div v-if="techstack.length > 0" class="mt-4">
              <p
                class="mb-2 text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--color-on-surface-variant)]"
              >
                Tech Stack
              </p>
              <ul class="flex flex-wrap gap-1.5" role="list">
                <li v-for="tech in techstack" :key="tech.id">
                  <a
                    v-if="tech.link"
                    :href="tech.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="tag tag-link"
                  >
                    <img
                      v-if="tech['img-src']"
                      :src="`/${tech['img-src']}`"
                      :alt="tech.title"
                      class="h-3.5 w-3.5 shrink-0 object-contain"
                      width="14"
                      height="14"
                      aria-hidden="true"
                    />
                    {{ tech.title }}
                  </a>
                  <span v-else class="tag">
                    <img
                      v-if="tech['img-src']"
                      :src="`/${tech['img-src']}`"
                      :alt="tech.title"
                      class="h-3.5 w-3.5 shrink-0 object-contain"
                      width="14"
                      height="14"
                      aria-hidden="true"
                    />
                    {{ tech.title }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-family: "DM Serif Display", serif;
}

.matrix-skel-row {
  display: grid;
  grid-template-columns: 168px 1fr;
  border-bottom: 1px solid var(--color-outline);
}

.matrix-skel-row:last-child {
  border-bottom: none;
}

.matrix-skel-label {
  padding: 14px 16px;
  background: var(--color-surface-variant);
  border-right: 1px solid var(--color-outline);
  display: flex;
  align-items: center;
}

.matrix-skel-items {
  padding: 10px 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
</style>
