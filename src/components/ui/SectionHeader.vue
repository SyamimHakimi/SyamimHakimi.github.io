<script setup lang="ts">
/**
 * SectionHeader — icon-disc + serif h2 + optional subtitle.
 *
 * Shared widget used by any island section that opens with the standard
 * "icon → heading → one-liner" pattern (e.g. Gear, Boardgames, Connect in AboutMe).
 *
 * Props:
 *   icon     - lucide-vue-next (or any) component rendered inside the icon-disc
 *   title    - heading text (also exposed as default slot for custom markup)
 *   subtitle - optional descriptive sentence below the heading
 */
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="mb-5">
    <div class="mb-2 flex items-center gap-3.5">
      <span class="icon-disc" aria-hidden="true">
        <component :is="icon" :size="18" :stroke-width="1.75" />
      </span>
      <h2 class="font-serif text-[clamp(1.5rem,3vw,2.125rem)] leading-[1.02]">
        <slot>{{ title }}</slot>
      </h2>
    </div>
    <p
      v-if="subtitle"
      class="max-w-[56ch] text-sm text-[var(--color-on-surface-variant)]"
    >
      {{ subtitle }}
    </p>
  </div>
</template>