<script setup lang="ts">
/**
 * MetricCard — shared serif value card for concise statistics / highlights.
 *
 * Used when a section needs a compact "big number/value + short explanation"
 * widget without repeating the same panel markup and typography setup.
 */
defineProps<{
  value: string | number;
  description: string;
  eyebrow?: string;
  compact?: boolean;
}>();
</script>

<template>
  <div class="panel-inset p-5">
    <p
      v-if="eyebrow"
      class="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]"
    >
      {{ eyebrow }}
    </p>
    <p
      class="font-serif leading-none text-[var(--color-on-surface)]"
      :class="compact ? 'text-[17px] leading-snug' : 'text-3xl'"
    >
      {{ value }}
    </p>
    <p class="mt-2 text-sm text-[var(--color-on-surface-variant)]">
      {{ description }}
    </p>
  </div>
</template>
