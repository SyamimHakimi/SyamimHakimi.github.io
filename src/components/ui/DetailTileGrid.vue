<script setup lang="ts">
/**
 * DetailTileGrid — shared small-card grid for short title/description pairs.
 *
 * Used by sections that repeat compact informational tiles with the same
 * visual treatment, such as About-page interest summaries and Contact-page
 * expectation notes.
 */
export interface DetailTileItem {
  title: string;
  description: string;
}

withDefaults(
  defineProps<{
    items: DetailTileItem[];
    columnsClass?: string;
    tileClass?: string;
  }>(),
  {
    columnsClass: "grid-cols-1 sm:grid-cols-3",
    tileClass: "",
  },
);
</script>

<template>
  <div class="grid gap-2.5" :class="columnsClass">
    <div
      v-for="item in items"
      :key="item.title"
      class="panel-inset grid gap-1.5 p-3.5"
      :class="tileClass"
    >
      <strong
        class="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--color-on-surface-variant)]"
      >
        {{ item.title }}
      </strong>
      <span class="text-sm text-[var(--color-on-surface)]">
        {{ item.description }}
      </span>
    </div>
  </div>
</template>
