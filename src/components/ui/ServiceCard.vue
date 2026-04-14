<script setup lang="ts">
/**
 * ServiceCard — shared service-offering card used by ServicesSection.
 *
 * Props:
 * - `title`: service heading sourced from Firestore.
 * - `description`: supporting service copy.
 * - `summary`: short group summary badge shown in the card chrome.
 * - `tags`: compact treatment tags for the service footer.
 * - `icon`: lucide component used for the service glyph.
 * - `animationDelay`: optional reveal delay string for staggered entrance.
 *
 * Island rationale: this stays a Vue component because ServicesSection is a
 * hydrated island and each card shares the same reactive filtered data flow.
 */
import type { Component } from "vue";
import { ArrowRight } from "lucide-vue-next";

defineProps<{
  title: string;
  description: string;
  summary: string;
  tags: readonly string[];
  icon: Component;
  animationDelay?: string;
}>();
</script>

<template>
  <article
    class="reveal-up relative grid gap-4 overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--color-cta)_24%,var(--color-outline))] hover:shadow-[0_12px_28px_rgba(0,0,0,0.05)]"
    :style="animationDelay ? { animationDelay } : undefined"
  >
    <span
      class="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--color-cta)] to-transparent"
      aria-hidden="true"
    />

    <div class="flex items-start justify-between gap-3">
      <span class="flex h-12 w-12 items-center justify-center">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-cta-soft)] text-[var(--color-cta)]"
        >
          <component :is="icon" aria-hidden="true" class="h-4.5 w-4.5" />
        </span>
      </span>
      <span class="pill pill--counter">
        {{ summary }}
      </span>
    </div>

    <div class="space-y-2">
      <h3 class="text-2xl leading-[1.06] tracking-[-0.02em]">
        {{ title }}
      </h3>
      <p class="max-w-[44ch] text-sm text-[var(--color-on-surface-variant)]">
        {{ description }}
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2">
        <span v-for="tag in tags" :key="tag" class="pill pill--soft">
          {{ tag }}
        </span>
      </div>
      <span
        class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-cta)]"
      >
        Contact
        <ArrowRight aria-hidden="true" class="h-4 w-4" />
      </span>
    </div>
  </article>
</template>
