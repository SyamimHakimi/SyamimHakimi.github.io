<script setup lang="ts">
/**
 * ServicesSection — displays service offerings grouped by category.
 * Island: client:visible — loads only when scrolled into view.
 * Composable: useServices()
 * Animations: motion-v scroll-triggered card entrance (respects prefers-reduced-motion)
 */
import { computed } from "vue";
import { Motion } from "motion-v";
import { useServices } from "../../lib/composables/useServices";

const { services, loading, error } = useServices();

// Respect user's reduced-motion preference.
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cardVariants = {
  hidden: prefersReducedMotion ? {} : { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const grouped = computed(() => {
  // Preserve the Firestore-controlled `sorting` insertion order for group sections.
  // Services arrive already sorted by `sorting` from useServices(); the Map preserves
  // first-seen group order so groups appear in the sequence Firestore defines.
  const map = new Map<number, typeof services.value>();
  for (const service of services.value) {
    if (!map.has(service.group)) map.set(service.group, []);
    map.get(service.group)!.push(service);
  }
  return [...map.entries()];
});
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="loading"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading services"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="h-32 animate-pulse rounded-xl bg-[var(--color-surface)]"
      />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
      role="alert"
    >
      <p class="font-medium">Failed to load services</p>
      <p class="mt-1 text-sm opacity-80">{{ error }}</p>
    </div>

    <!-- Empty -->
    <p v-else-if="services.length === 0" class="text-[var(--color-text-muted)]">
      No services found.
    </p>

    <!-- Content — rendered grouped by category -->
    <div v-else class="space-y-8">
      <section
        v-for="[groupId, groupServices] in grouped"
        :key="groupId"
        :aria-label="`Service group ${groupId}`"
      >
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Motion
            v-for="(service, index) in groupServices"
            :key="service.id"
            as="article"
            :initial="cardVariants.hidden"
            :animate="cardVariants.visible"
            :transition="{
              duration: 0.3,
              delay: prefersReducedMotion ? 0 : index * 0.05,
            }"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-md"
          >
            <h3 class="font-semibold text-[var(--color-text)]">
              {{ service.title }}
            </h3>
            <p class="mt-1 text-sm text-[var(--color-text-muted)]">
              {{ service.description }}
            </p>
          </Motion>
        </div>
      </section>
    </div>
  </div>
</template>
