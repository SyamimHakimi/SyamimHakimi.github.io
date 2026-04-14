<script setup lang="ts">
/**
 * PortfolioSection — experience categories and personal projects.
 * Island: client:visible
 * Composable: usePortfolio()
 *
 * UI: hero summary strip, experience cards with brand logo + active indicator
 * + year badge, with lightweight CSS entrance stagger.
 */
import { computed } from "vue";
import { usePortfolio } from "../../lib/composables/usePortfolio";
import type { ExperienceItem } from "../../lib/composables/usePortfolio";
import { useReducedMotion } from "../../lib/composables/useReducedMotion";
import {
  buildPortfolioHeroItems,
  PORTFOLIO_EXPERIENCE_SECTIONS,
} from "../../lib/utils/portfolioSection";
import ErrorAlert from "../ui/ErrorAlert.vue";
import ExperienceSection from "../ui/ExperienceSection.vue";

const { data, loading, error } = usePortfolio();

function sinceYear(iso: string | undefined): string | null {
  if (!iso) return null;
  return String(new Date(iso).getFullYear());
}

function isActive(item: ExperienceItem): boolean {
  return !item["date-to"];
}

function durationLabel(item: ExperienceItem): string {
  const from = item["date-from"];
  if (!from) return "";
  const year = new Date(from).getFullYear();
  return isActive(item)
    ? `Since ${year}`
    : `${year}–${new Date(item["date-to"]!).getFullYear()}`;
}

/** Years of experience as a compact label, e.g. "6y" or "<1y". */
function yearsLabel(item: ExperienceItem): string | null {
  if (!item["date-from"]) return null;
  const years =
    new Date().getFullYear() - new Date(item["date-from"]).getFullYear();
  if (years < 1) return "<1y";
  return `${years}y`;
}

const pythonSince = computed(() => {
  const item = data.value.experience.languages.find(
    (entry) => entry.title === "Python",
  );
  return item?.["date-from"] ? new Date(item["date-from"]).getFullYear() : null;
});

const vueSince = computed(() => {
  const item = data.value.experience.frameworks.find((entry) =>
    entry.title.toLowerCase().includes("vue"),
  );
  return item?.["date-from"] ? new Date(item["date-from"]).getFullYear() : null;
});

const heroItems = computed(() =>
  buildPortfolioHeroItems(
    pythonSince.value ? new Date().getFullYear() - pythonSince.value : null,
    vueSince.value ? new Date().getFullYear() - vueSince.value : null,
  ),
);

const { prefersReducedMotion } = useReducedMotion();

function revealDelay(index: number, base = 0): string {
  return prefersReducedMotion.value ? "0ms" : `${base + index * 50}ms`;
}
</script>

<template>
  <div>
    <div
      v-if="loading"
      class="space-y-9"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      <div
        class="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-outline)] bg-[var(--color-surface)] px-5 py-4"
      >
        <div class="skeleton-line" style="width: 90px; animation-delay: 0ms" />
        <div class="h-4 w-px bg-[var(--color-outline)]" />
        <div class="skeleton-line" style="width: 72px; animation-delay: 60ms" />
        <div class="h-4 w-px bg-[var(--color-outline)]" />
        <div
          class="skeleton-line"
          style="width: 100px; animation-delay: 120ms"
        />
        <div class="h-4 w-px bg-[var(--color-outline)]" />
        <div
          class="skeleton-rect h-6 w-20 rounded-full"
          style="animation-delay: 180ms"
        />
        <div
          class="skeleton-rect h-6 w-24 rounded-full"
          style="animation-delay: 240ms"
        />
      </div>

      <div
        v-for="(cols, si) in [
          [3, 100],
          [1, 100],
          [5, 58],
        ]"
        :key="si"
        class="space-y-3"
      >
        <div class="flex items-center gap-2">
          <div class="skeleton-line" style="width: 80px; height: 16px" />
          <div class="skeleton-rect h-[18px] w-5 rounded-full" />
        </div>
        <div class="skeleton-line" style="width: 55%" />
        <div
          class="grid gap-3"
          :style="`grid-template-columns: repeat(auto-fill, minmax(${si === 2 ? 180 : 260}px, 1fr))`"
        >
          <div
            v-for="j in cols[0]"
            :key="j"
            class="skeleton-rect"
            :style="`height:${cols[1]}px;animation-delay:${(j - 1) * 60}ms`"
          />
        </div>
      </div>

      <div class="space-y-3">
        <div class="skeleton-line" style="width: 160px; height: 16px" />
        <div class="flex flex-wrap gap-2">
          <div
            v-for="w in [82, 100, 74, 92]"
            :key="w"
            class="skeleton-rect h-8 rounded-full"
            :style="`width:${w}px`"
          />
        </div>
      </div>

      <div class="space-y-3" style="max-width: 720px">
        <div class="skeleton-line" style="width: 130px; height: 16px" />
        <div
          class="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6 shadow-sm space-y-3"
        >
          <div class="skeleton-line" style="width: 100px; height: 10px" />
          <div class="skeleton-line" style="width: 120px; height: 20px" />
          <div class="skeleton-line" style="width: 75%" />
          <div class="skeleton-line" style="width: 90%" />
          <div class="skeleton-line" style="width: 60%" />
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

    <div v-else class="space-y-12">
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
          <span :class="item.kind === 'tag' ? 'hero-domain-tag' : 'hero-stat'">
            <component
              :is="item.icon"
              :size="item.kind === 'tag' ? 11 : 13"
              aria-hidden="true"
            />
            {{ item.label }}
          </span>
        </template>
      </div>

      <ExperienceSection
        v-for="section in PORTFOLIO_EXPERIENCE_SECTIONS"
        :id="section.key"
        :key="section.key"
        :title="section.title"
        :description="section.description"
        :items="data.experience[section.key]"
        :compact="section.compact"
        :grid-class="section.gridClass"
        :header-animation-delay="revealDelay(0, 80)"
        :item-animation-delay="(index) => revealDelay(index, 120)"
        :is-active="isActive"
        :duration-label="durationLabel"
        :since-year="sinceYear"
      />

      <section
        v-if="data.experience.languages.length > 0"
        aria-label="Languages and databases"
      >
        <div
          class="reveal-up mb-3 flex items-center gap-2.5"
          :style="{ animationDelay: revealDelay(0, 80) }"
        >
          <h2 class="text-xl">Languages &amp; Databases</h2>
        </div>
        <p class="mb-4 text-[13px] text-[var(--color-on-surface-variant)]">
          What I write and query in day-to-day engineering work.
        </p>
        <ul class="flex flex-wrap gap-2" role="list">
          <li
            v-for="(item, i) in data.experience.languages"
            :key="item.id"
            class="reveal-up"
            :style="{ animationDelay: revealDelay(i, 120) }"
          >
            <span class="chip" :class="{ 'opacity-60': !isActive(item) }">
              <span
                v-if="isActive(item)"
                class="active-dot"
                aria-label="Currently using"
              />
              {{ item.title }}
              <span
                v-if="yearsLabel(item)"
                class="chip-years"
                aria-hidden="true"
              >
                {{ yearsLabel(item) }}
              </span>
            </span>
          </li>
        </ul>
        <p
          class="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--color-on-surface-variant)]"
        >
          <span class="active-dot" aria-hidden="true" />
          Currently using
        </p>
      </section>

      <section v-if="data.project" aria-label="Personal projects">
        <div
          class="reveal-up mb-3"
          :style="{ animationDelay: revealDelay(0, 80) }"
        >
          <h2 class="text-xl">Personal Project</h2>
        </div>
        <div
          class="reveal-up card-elevated"
          style="padding: 24px; max-width: 720px"
          :style="{ animationDelay: revealDelay(1, 80) }"
        >
          <p class="project-eyebrow">syamim.hakimi.dev</p>
          <h3
            class="mt-1 text-[20px] font-normal text-[var(--color-on-surface)]"
          >
            {{ data.project.title }}
          </h3>
          <p
            v-if="data.project.subtitle"
            class="mt-1 text-[13px] text-[var(--color-on-surface-variant)]"
          >
            {{ data.project.subtitle }}
          </p>
          <p
            v-if="data.project.description"
            class="mt-3 text-[14px] leading-relaxed text-[var(--color-on-surface-variant)]"
          >
            {{ data.project.description }}
          </p>
          <div v-if="data.techstack.length > 0" class="mt-4">
            <p
              class="mb-2 text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--color-on-surface-variant)]"
            >
              Tech Stack
            </p>
            <ul class="flex flex-wrap gap-1.5" role="list">
              <li v-for="tech in data.techstack" :key="tech.id">
                <a
                  v-if="tech.link"
                  :href="tech.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tag tag--link"
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
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
}

.hero-domain-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(37, 99, 235, 0.08);
  color: var(--color-cta);
  border: 1px solid rgba(37, 99, 235, 0.18);
}

[data-theme="dark"] .hero-domain-tag {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.25);
}

h2 {
  font-family: "DM Serif Display", serif;
}

.count-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-variant);
  border: 1px solid var(--color-outline);
  border-radius: 999px;
  padding: 2px 8px;
}

.active-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  display: inline-block;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--color-surface-variant);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
  border: 1px solid var(--color-outline);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  border: 1px solid var(--color-outline);
}

.project-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-cta);
}

.chip-years {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.5;
  margin-left: 2px;
}

.tag--link {
  cursor: pointer;
  transition:
    color 150ms,
    border-color 150ms,
    background 150ms;
  text-decoration: none;
}

.tag--link:hover {
  color: var(--color-cta);
  border-color: var(--color-cta);
  background: rgba(37, 99, 235, 0.06);
}

[data-theme="dark"] .tag--link:hover {
  background: rgba(96, 165, 250, 0.08);
}

.tag--link:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}
</style>
