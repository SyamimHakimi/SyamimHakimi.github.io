<script setup lang="ts">
/**
 * ExperienceSection — shared portfolio category section for platforms,
 * protocols, and frameworks.
 *
 * Keeps the section framing, count badge, description, and card grid layout
 * consistent so PortfolioSection can stay data-driven.
 */
import type { ExperienceItem } from "../../lib/composables/usePortfolio";
import ExperienceCard from "./ExperienceCard.vue";

defineProps<{
  id: string;
  title: string;
  description: string;
  items: ExperienceItem[];
  compact?: boolean;
  gridClass?: string;
  headerAnimationDelay: string;
  itemAnimationDelay: (index: number) => string;
  isActive: (item: ExperienceItem) => boolean;
  durationLabel: (item: ExperienceItem) => string;
  sinceYear: (iso: string | undefined) => string | null;
}>();
</script>

<template>
  <section v-if="items.length > 0" :aria-label="`${title} experience`">
    <div
      class="reveal-up mb-3 flex items-center gap-2.5"
      :style="{ animationDelay: headerAnimationDelay }"
    >
      <h2 class="text-xl">{{ title }}</h2>
      <span class="pill pill--counter">{{ items.length }}</span>
    </div>
    <p class="mb-4 text-[13px] text-[var(--color-on-surface-variant)]">
      {{ description }}
    </p>
    <ul class="grid gap-3" :class="gridClass" role="list">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="reveal-up experience-card-item"
        :style="{ animationDelay: itemAnimationDelay(index) }"
      >
        <ExperienceCard
          :compact="compact"
          :item="item"
          :active="isActive(item)"
          :duration-label="durationLabel(item)"
          :since-year="compact ? null : sinceYear(item['date-from'])"
        />
      </li>
    </ul>
  </section>
</template>
