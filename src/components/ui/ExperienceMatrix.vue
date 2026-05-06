<script setup lang="ts">
import type { PortfolioData, ExperienceItem } from "../../lib/composables/usePortfolio";
import {
  PORTFOLIO_MATRIX_ROWS,
  matrixYearLabel,
  sortExperienceItems,
} from "../../lib/utils/portfolioSection";

defineProps<{
  experience: PortfolioData["experience"];
  isActive: (item: ExperienceItem) => boolean;
}>();
</script>

<template>
  <div>
    <p class="matrix-legend" aria-label="Legend: green dot means currently active, no dot means past experience">
      <span class="legend-item" aria-hidden="true">
        <span class="legend-dot legend-dot--active" />
        Currently active
      </span>
      <span class="legend-item" aria-hidden="true">
        <span class="legend-dot legend-dot--past" />
        Past experience
      </span>
    </p>

    <div class="matrix" role="table" aria-label="Skills and experience by category">
      <div
        v-for="row in PORTFOLIO_MATRIX_ROWS"
        v-show="experience[row.key].length > 0"
        :key="row.key"
        class="matrix-row"
        role="row"
      >
        <div class="matrix-label" role="rowheader">
          <span class="matrix-row-name">{{ row.title }}</span>
          <span class="matrix-row-desc">{{ row.description }}</span>
        </div>
        <div class="matrix-items" role="cell">
          <span
            v-for="item in sortExperienceItems(experience[row.key])"
            :key="item.id"
            class="skill-tag"
            :class="isActive(item) ? 'skill-tag--active' : 'skill-tag--inactive'"
          >
            <span v-if="isActive(item)" class="skill-dot" aria-hidden="true" />
            {{ item.title }}
            <span class="skill-year" aria-hidden="true">{{ matrixYearLabel(item) }}</span>
            <span class="sr-only">{{ isActive(item) ? ', currently active' : `, used ${matrixYearLabel(item)}` }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Legend ── */
.matrix-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--color-on-surface-variant);
  margin-bottom: 10px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot--active {
  background: var(--color-success);
  box-shadow: 0 0 0 2px var(--color-success-glow);
}

.legend-dot--past {
  background: var(--color-surface-variant);
  border: 1px solid var(--color-on-surface-variant);
  opacity: 0.5;
}

/* ── Matrix table ── */
.matrix {
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.matrix-row {
  display: grid;
  grid-template-columns: 168px 1fr;
  border-bottom: 1px solid var(--color-outline);
}

.matrix-row:last-child {
  border-bottom: none;
}

/* ── Label column ── */
.matrix-label {
  padding: 14px 16px;
  background: var(--color-surface-variant);
  border-right: 1px solid var(--color-outline);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}

.matrix-row-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-on-surface);
  line-height: 1.3;
}

.matrix-row-desc {
  font-size: 10px;
  color: var(--color-on-surface-variant);
  line-height: 1.45;
}

/* ── Items column ── */
.matrix-items {
  padding: 10px 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

/* ── Skill tags ── */
.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid var(--color-outline);
  white-space: nowrap;
}

.skill-tag--active {
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.28);
  color: #166534;
}

[data-theme="dark"] .skill-tag--active {
  background: rgba(74, 222, 128, 0.08);
  border-color: rgba(74, 222, 128, 0.25);
  color: #4ade80;
}

.skill-tag--inactive {
  background: var(--color-surface);
  color: var(--color-on-surface-variant);
  opacity: 0.65;
}

.skill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-success);
  flex-shrink: 0;
}

.skill-year {
  font-size: 9px;
  font-weight: 400;
  opacity: 0.65;
  margin-left: 1px;
}

/* ── Mobile: stack label above items ── */
@media (max-width: 540px) {
  .matrix-row {
    grid-template-columns: 1fr;
  }

  .matrix-label {
    border-right: none;
    border-bottom: 1px solid var(--color-outline);
    padding: 10px 14px;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .matrix-row-desc {
    display: none;
  }
}
</style>
