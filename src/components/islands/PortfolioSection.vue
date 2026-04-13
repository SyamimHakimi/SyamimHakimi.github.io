<script setup lang="ts">
/**
 * PortfolioSection — experience categories and personal projects.
 * Island: client:visible
 * Composable: usePortfolio()
 *
 * UI: hero summary strip, experience cards with brand logo + active indicator
 * + year badge, card-outlined hover accent, motion-v entrance stagger.
 */
import { computed } from "vue";
import { Motion } from "motion-v";
import { usePortfolio } from "../../lib/composables/usePortfolio";
import type { ExperienceItem } from "../../lib/composables/usePortfolio";
import { useMotionAnimation } from "../../lib/composables/useMotionAnimation";

const { data, loading, error } = usePortfolio();

// ── Date helpers ───────────────────────────────────────────────────────────
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

// ── Hero strip stats ───────────────────────────────────────────────────────
const pythonSince = computed(() => {
  const item = data.value.experience.languages.find(
    (i) => i.title === "Python",
  );
  return item?.["date-from"] ? new Date(item["date-from"]).getFullYear() : null;
});

const vueSince = computed(() => {
  const item = data.value.experience.frameworks.find((i) =>
    i.title.toLowerCase().includes("vue"),
  );
  return item?.["date-from"] ? new Date(item["date-from"]).getFullYear() : null;
});

// ── Motion helpers ─────────────────────────────────────────────────────────
const { cardInitial, cardVisible, delay } = useMotionAnimation();
</script>

<template>
  <div>
    <!-- ── Loading skeleton ──────────────────────────────────────────── -->
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

      <!-- Section blocks × 3 (platforms, protocols, frameworks) -->
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

      <!-- Languages chip row -->
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

    <!-- ── Error ──────────────────────────────────────────────────────── -->
    <div
      v-else-if="error"
      class="flex gap-4 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-surface)] p-5"
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
          Failed to load portfolio
        </p>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- ── Loaded ─────────────────────────────────────────────────────── -->
    <div v-else class="space-y-12">
      <!-- Hero summary strip -->
      <Motion
        as="div"
        class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--radius-md)] border border-[var(--color-outline)] bg-[var(--color-surface)] px-5 py-4"
        :initial="cardInitial"
        :animate="cardVisible"
        :transition="{ duration: 0.3, delay: delay(0), easing: [0.2, 0, 0, 1] }"
      >
        <span v-if="pythonSince" class="hero-stat">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          {{ new Date().getFullYear() - pythonSince }}+ yrs Python
        </span>
        <div
          v-if="pythonSince && vueSince"
          class="h-4 w-px bg-[var(--color-outline)]"
          aria-hidden="true"
        />
        <span v-if="vueSince" class="hero-stat">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <polygon points="12 2 2 7 12 22 22 7 12 2" />
          </svg>
          {{ new Date().getFullYear() - vueSince }}+ yrs Vue
        </span>
        <div class="h-4 w-px bg-[var(--color-outline)]" aria-hidden="true" />
        <span class="hero-stat">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          AWS · Firebase
        </span>
        <div class="h-4 w-px bg-[var(--color-outline)]" aria-hidden="true" />
        <span class="hero-domain-tag">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          FinTech
        </span>
        <span class="hero-domain-tag">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          EV Charging
        </span>
      </Motion>

      <!-- Platforms ─────────────────────────────────────────────────── -->
      <section
        v-if="data.experience.platforms.length > 0"
        aria-label="Platforms experience"
      >
        <Motion
          as="div"
          class="mb-3 flex items-center gap-2.5"
          :initial="cardInitial"
          :animate="cardVisible"
          :transition="{
            duration: 0.25,
            delay: delay(0, 80),
            easing: [0.2, 0, 0, 1],
          }"
        >
          <h2 class="text-xl">Platforms</h2>
          <span class="count-badge">{{
            data.experience.platforms.length
          }}</span>
        </Motion>
        <p class="mb-4 text-[13px] text-[var(--color-on-surface-variant)]">
          Cloud infrastructure, payment rails, and developer platforms I've
          shipped with.
        </p>
        <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
          <Motion
            v-for="(item, i) in data.experience.platforms"
            :key="item.id"
            as="li"
            class="card-outlined exp-card"
            :initial="cardInitial"
            :animate="cardVisible"
            :transition="{
              duration: 0.25,
              delay: delay(i, 120),
              easing: [0.2, 0, 0, 1],
            }"
          >
            <div class="mb-2.5 flex items-start justify-between gap-2">
              <div class="exp-logo">
                <img
                  v-if="item['img-src']"
                  :src="`/${item['img-src']}`"
                  :alt="item.title"
                />
                <span v-else>{{ item.title.slice(0, 2) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <a
                  v-if="item.link"
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="exp-link-btn"
                  :aria-label="`Learn more about ${item.title}`"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <span
                  v-if="isActive(item)"
                  class="active-dot"
                  aria-label="Currently using"
                />
                <span v-if="isActive(item)" class="active-label">Active</span>
                <span v-else class="year-badge">{{
                  sinceYear(item["date-from"])
                }}</span>
              </div>
            </div>
            <p class="exp-title">{{ item.title }}</p>
            <p v-if="item.description" class="exp-desc">
              {{ item.description }}
            </p>
            <div v-if="isActive(item)" class="mt-2.5">
              <span class="year-badge">{{ durationLabel(item) }}</span>
            </div>
          </Motion>
        </ul>
      </section>

      <!-- Protocols ─────────────────────────────────────────────────── -->
      <section
        v-if="data.experience.protocols.length > 0"
        aria-label="Protocols experience"
      >
        <Motion
          as="div"
          class="mb-3 flex items-center gap-2.5"
          :initial="cardInitial"
          :animate="cardVisible"
          :transition="{
            duration: 0.25,
            delay: delay(0, 80),
            easing: [0.2, 0, 0, 1],
          }"
        >
          <h2 class="text-xl">Protocols</h2>
          <span class="count-badge">{{
            data.experience.protocols.length
          }}</span>
        </Motion>
        <p class="mb-4 text-[13px] text-[var(--color-on-surface-variant)]">
          Specialised communication standards I've implemented in production.
        </p>
        <ul class="grid gap-3 sm:grid-cols-2" role="list">
          <Motion
            v-for="(item, i) in data.experience.protocols"
            :key="item.id"
            as="li"
            class="card-outlined exp-card"
            :initial="cardInitial"
            :animate="cardVisible"
            :transition="{
              duration: 0.25,
              delay: delay(i, 120),
              easing: [0.2, 0, 0, 1],
            }"
          >
            <div class="mb-2.5 flex items-start justify-between gap-2">
              <div class="exp-logo">
                <img
                  v-if="item['img-src']"
                  :src="`/${item['img-src']}`"
                  :alt="item.title"
                />
                <span v-else>{{ item.title.slice(0, 2) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <a
                  v-if="item.link"
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="exp-link-btn"
                  :aria-label="`Learn more about ${item.title}`"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <span
                  v-if="isActive(item)"
                  class="active-dot"
                  aria-label="Currently using"
                />
                <span v-if="isActive(item)" class="active-label">Active</span>
                <span v-else class="year-badge">{{
                  sinceYear(item["date-from"])
                }}</span>
              </div>
            </div>
            <p class="exp-title">{{ item.title }}</p>
            <p v-if="item.description" class="exp-desc">
              {{ item.description }}
            </p>
            <div v-if="isActive(item)" class="mt-2.5">
              <span class="year-badge">{{ durationLabel(item) }}</span>
            </div>
          </Motion>
        </ul>
      </section>

      <!-- Frameworks ────────────────────────────────────────────────── -->
      <section
        v-if="data.experience.frameworks.length > 0"
        aria-label="Frameworks experience"
      >
        <Motion
          as="div"
          class="mb-3 flex items-center gap-2.5"
          :initial="cardInitial"
          :animate="cardVisible"
          :transition="{
            duration: 0.25,
            delay: delay(0, 80),
            easing: [0.2, 0, 0, 1],
          }"
        >
          <h2 class="text-xl">Frameworks</h2>
          <span class="count-badge">{{
            data.experience.frameworks.length
          }}</span>
        </Motion>
        <p class="mb-4 text-[13px] text-[var(--color-on-surface-variant)]">
          Backend and frontend frameworks I use to build fast, maintainable
          products.
        </p>
        <ul class="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3" role="list">
          <Motion
            v-for="(item, i) in data.experience.frameworks"
            :key="item.id"
            as="li"
            class="card-outlined"
            style="padding: 14px"
            :initial="cardInitial"
            :animate="cardVisible"
            :transition="{
              duration: 0.25,
              delay: delay(i, 120),
              easing: [0.2, 0, 0, 1],
            }"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="exp-logo exp-logo--sm">
                  <img
                    v-if="item['img-src']"
                    :src="`/${item['img-src']}`"
                    :alt="item.title"
                  />
                  <span v-else>{{ item.title.slice(0, 2) }}</span>
                </div>
                <div>
                  <p
                    class="text-[13px] font-semibold text-[var(--color-on-surface)]"
                  >
                    {{ item.title }}
                  </p>
                  <p class="text-[11px] text-[var(--color-on-surface-variant)]">
                    {{ durationLabel(item) }}
                  </p>
                </div>
              </div>
              <span
                v-if="isActive(item)"
                class="active-dot flex-shrink-0"
                aria-label="Currently using"
              />
            </div>
          </Motion>
        </ul>
      </section>

      <!-- Languages & Databases ─────────────────────────────────────── -->
      <section
        v-if="data.experience.languages.length > 0"
        aria-label="Languages and databases"
      >
        <Motion
          as="div"
          class="mb-3 flex items-center gap-2.5"
          :initial="cardInitial"
          :animate="cardVisible"
          :transition="{
            duration: 0.25,
            delay: delay(0, 80),
            easing: [0.2, 0, 0, 1],
          }"
        >
          <h2 class="text-xl">Languages &amp; Databases</h2>
        </Motion>
        <p class="mb-4 text-[13px] text-[var(--color-on-surface-variant)]">
          What I write and query in day-to-day engineering work.
        </p>
        <ul class="flex flex-wrap gap-2" role="list">
          <Motion
            v-for="(item, i) in data.experience.languages"
            :key="item.id"
            as="li"
            :initial="cardInitial"
            :animate="cardVisible"
            :transition="{
              duration: 0.25,
              delay: delay(i, 120),
              easing: [0.2, 0, 0, 1],
            }"
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
          </Motion>
        </ul>
        <p
          class="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--color-on-surface-variant)]"
        >
          <span class="active-dot" aria-hidden="true" />
          Currently using
        </p>
      </section>

      <!-- Personal Project ───────────────────────────────────────────── -->
      <section v-if="data.project" aria-label="Personal projects">
        <Motion
          as="div"
          class="mb-3"
          :initial="cardInitial"
          :animate="cardVisible"
          :transition="{
            duration: 0.25,
            delay: delay(0, 80),
            easing: [0.2, 0, 0, 1],
          }"
        >
          <h2 class="text-xl">Personal Project</h2>
        </Motion>
        <Motion
          as="div"
          class="card-elevated"
          style="padding: 24px; max-width: 720px"
          :initial="cardInitial"
          :animate="cardVisible"
          :transition="{
            duration: 0.3,
            delay: delay(1, 80),
            easing: [0.2, 0, 0, 1],
          }"
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
                    aria-hidden="true"
                  />
                  {{ tech.title }}
                </span>
              </li>
            </ul>
          </div>
        </Motion>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ── Hero strip ─────────────────────────────────────────────────── */
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

/* ── Section headings ───────────────────────────────────────────── */
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

/* ── Card-outlined hover accent ─────────────────────────────────── */
.card-outlined {
  position: relative;
  overflow: hidden;
  transition:
    border-color 200ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
}
.card-outlined::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-cta);
  border-radius: 3px 0 0 3px;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
}
.card-outlined:hover::before {
  transform: scaleY(1);
}
.card-outlined:hover {
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}
[data-theme="dark"] .card-outlined:hover {
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

/* ── Experience card internals ──────────────────────────────────── */
.exp-card {
  display: flex;
  flex-direction: column;
}
.exp-logo {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-variant);
  border: 1px solid var(--color-outline);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-on-surface-variant);
}
.exp-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
}
.exp-logo--sm {
  width: 30px;
  height: 30px;
}
.exp-logo--sm img {
  padding: 4px;
}
.exp-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
}
.exp-desc {
  font-size: 12px;
  color: var(--color-on-surface-variant);
  margin-top: 6px;
  line-height: 1.55;
  flex: 1;
}

/* ── Active indicators ──────────────────────────────────────────── */
.active-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  display: inline-block;
}
.active-label {
  font-size: 11px;
  font-weight: 600;
  color: #16a34a;
}
[data-theme="dark"] .active-label {
  color: #4ade80;
}
.year-badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-variant);
  border: 1px solid var(--color-outline);
  border-radius: 999px;
  padding: 2px 7px;
  white-space: nowrap;
}

/* ── Languages chips ────────────────────────────────────────────── */
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

/* ── Tech stack tags ────────────────────────────────────────────── */
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

/* ── Project eyebrow ────────────────────────────────────────────── */
.project-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-cta);
}

/* ── Years label inside language chip ───────────────────────────── */
.chip-years {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.5;
  margin-left: 2px;
}

/* ── External link button on exp cards ──────────────────────────── */
.exp-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-variant);
  transition:
    color 150ms,
    background 150ms;
  cursor: pointer;
  flex-shrink: 0;
}
.exp-link-btn:hover {
  color: var(--color-cta);
  background: rgba(37, 99, 235, 0.08);
}
[data-theme="dark"] .exp-link-btn:hover {
  background: rgba(96, 165, 250, 0.1);
}
.exp-link-btn:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

/* ── Tech stack tag as link ─────────────────────────────────────── */
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
