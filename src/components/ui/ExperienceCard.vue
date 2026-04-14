<script setup lang="ts">
/**
 * ExperienceCard — reusable portfolio item card for platforms, protocols,
 * and framework summaries.
 *
 * Encapsulates logo rendering, link affordance, active state, year badges, and
 * the compact/full layout split so PortfolioSection does not duplicate the
 * same widget markup across categories.
 */
import type { ExperienceItem } from "../../lib/composables/usePortfolio";

defineProps<{
  item: ExperienceItem;
  active: boolean;
  durationLabel: string;
  sinceYear?: string | null;
  compact?: boolean;
}>();
</script>

<template>
  <article
    class="card-outlined experience-card"
    :class="{ 'experience-card--compact': compact }"
  >
    <template v-if="compact">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="experience-logo experience-logo--sm">
            <img
              v-if="item['img-src']"
              :src="`/${item['img-src']}`"
              :alt="item.title"
            />
            <span v-else>{{ item.title.slice(0, 2) }}</span>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-[var(--color-on-surface)]">
              {{ item.title }}
            </p>
            <p class="text-[11px] text-[var(--color-on-surface-variant)]">
              {{ durationLabel }}
            </p>
          </div>
        </div>
        <span
          v-if="active"
          class="active-dot flex-shrink-0"
          aria-label="Currently using"
        />
      </div>
    </template>

    <template v-else>
      <div class="mb-2.5 flex items-start justify-between gap-2">
        <div class="experience-logo">
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
            class="experience-link-btn"
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
          <span v-if="active" class="active-dot" aria-label="Currently using" />
          <span v-if="active" class="active-label">Active</span>
          <span v-else-if="sinceYear" class="experience-year-badge">{{
            sinceYear
          }}</span>
        </div>
      </div>
      <p class="experience-title">{{ item.title }}</p>
      <p v-if="item.description" class="experience-desc">
        {{ item.description }}
      </p>
      <div v-if="active" class="mt-2.5">
        <span class="experience-year-badge">{{ durationLabel }}</span>
      </div>
    </template>
  </article>
</template>

<style scoped>
.experience-card {
  display: flex;
  flex-direction: column;
}

.experience-card--compact {
  padding: 14px;
}

.experience-logo {
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

.experience-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
}

.experience-logo--sm {
  width: 30px;
  height: 30px;
}

.experience-logo--sm img {
  padding: 4px;
}

.experience-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
}

.experience-desc {
  font-size: 12px;
  color: var(--color-on-surface-variant);
  margin-top: 6px;
  line-height: 1.55;
  flex: 1;
}

.experience-year-badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-variant);
  border: 1px solid var(--color-outline);
  border-radius: 999px;
  padding: 2px 7px;
  white-space: nowrap;
}

.experience-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-variant);
  transition:
    color 150ms,
    background 150ms;
  cursor: pointer;
  flex-shrink: 0;
}

.experience-link-btn:hover {
  color: var(--color-cta);
  background: rgba(37, 99, 235, 0.08);
}

.experience-link-btn:active {
  background: rgba(37, 99, 235, 0.16);
  transform: scale(0.95);
}

[data-theme="dark"] .experience-link-btn:hover {
  background: rgba(96, 165, 250, 0.1);
}

[data-theme="dark"] .experience-link-btn:active {
  background: rgba(96, 165, 250, 0.2);
}

.experience-link-btn:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
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

.active-label {
  font-size: 11px;
  font-weight: 600;
  color: #16a34a;
}

[data-theme="dark"] .active-label {
  color: #4ade80;
}
</style>
