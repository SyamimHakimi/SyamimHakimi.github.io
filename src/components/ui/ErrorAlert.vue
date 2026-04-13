<script setup lang="ts">
/**
 * ErrorAlert — standardised error state block.
 *
 * Renders a rounded card in error colours (--color-error tints against
 * --color-surface) with a bold title and an optional detail sentence.
 * Always carries role="alert" so screen readers announce it immediately.
 *
 * Props:
 *   title   - primary error headline (e.g. "Failed to load profile")
 *   message - optional detail text (e.g. the raw error string)
 */
defineProps<{
  title: string;
  message?: string;
}>();
</script>

<template>
  <div
    class="rounded-[18px] border border-[color-mix(in_srgb,var(--color-error)_35%,var(--color-surface))] bg-[color-mix(in_srgb,var(--color-error)_10%,var(--color-surface))] p-5 text-[var(--color-error)]"
    role="alert"
  >
    <p class="font-medium">{{ title }}</p>
    <p v-if="message" class="mt-1 text-sm opacity-80">{{ message }}</p>
  </div>
</template>