<script setup lang="ts">
import { computed } from "vue";
import { useServices } from "../../lib/composables/useServices";
import {
  groupServices,
  SERVICES_OVERVIEW_METRICS,
} from "../../lib/utils/servicesSection";
import ErrorAlert from "../ui/ErrorAlert.vue";

const { services, loading, error } = useServices();
const grouped = computed(() => groupServices(services.value));
</script>

<template>
  <div>
    <!-- Intro strip ─────────────────────────────────────────────────── -->
    <div
      class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b-2 border-[var(--color-on-surface)] pb-6"
    >
      <h2
        class="font-serif text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-[-0.02em]"
      >
        Services
      </h2>
      <div class="flex flex-wrap gap-x-6 gap-y-1">
        <span
          v-for="metric in SERVICES_OVERVIEW_METRICS"
          :key="metric.value"
          class="text-[13px] text-[var(--color-on-surface-variant)]"
        >
          <strong class="font-semibold text-[var(--color-on-surface)]">{{
            metric.value
          }}</strong>
          {{ metric.short }}
        </span>
      </div>
    </div>

    <!-- Loading skeleton ────────────────────────────────────────────── -->
    <div
      v-if="loading"
      aria-busy="true"
      aria-label="Loading services"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="border-b border-[var(--color-outline)] py-7"
      >
        <div class="mb-5 grid gap-4 md:grid-cols-[160px_1fr_auto]">
          <div class="skeleton-line w-16" />
          <div class="space-y-2">
            <div class="skeleton-line w-32" />
            <div class="skeleton-line w-3/4" />
          </div>
          <div class="skeleton-line w-20" />
        </div>
        <div class="space-y-3 md:pl-[176px]">
          <div v-for="j in 3" :key="j" class="grid gap-3 py-3 md:grid-cols-2 border-t border-[var(--color-outline)] first:border-t-0">
            <div class="skeleton-line w-1/2" />
            <div class="skeleton-line w-3/4" />
          </div>
        </div>
      </div>
    </div>

    <ErrorAlert
      v-else-if="error"
      title="Failed to load services"
      :message="error"
    />

    <div v-else-if="services.length === 0" class="empty-state py-12">
      No services are available right now.
    </div>

    <!-- Service groups ───────────────────────────────────────────────── -->
    <div v-else>
      <section
        v-for="({ id, meta, services: groupServices }, groupIndex) in grouped"
        :key="id"
        class="border-b border-[var(--color-outline)] py-7 last:border-b-0"
        :aria-labelledby="`service-group-title-${id}`"
      >
        <!-- Group header: number | title + desc | engagement pill -->
        <div class="mb-4 grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-start">
          <p
            class="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-on-surface-variant)] md:pt-0.5"
          >
            Group {{ String(groupIndex + 1).padStart(2, "0") }}
          </p>

          <div>
            <h3
              :id="`service-group-title-${id}`"
              class="text-[15px] font-bold leading-snug text-[var(--color-on-surface)]"
            >
              {{ meta.title }}
            </h3>
            <p
              class="mt-1 max-w-[52ch] text-[13px] leading-relaxed text-[var(--color-on-surface-variant)]"
            >
              {{ meta.description }}
            </p>
          </div>

          <span class="pill pill--counter self-start">{{
            meta.engagement
          }}</span>
        </div>

        <!-- Service rows: name | description -->
        <div class="md:pl-[176px]">
          <div
            v-for="service in groupServices"
            :key="service.id"
            class="grid gap-1 border-t border-[var(--color-outline)] py-3 first:border-t-0 md:grid-cols-2 md:gap-6"
          >
            <p class="text-[13px] font-semibold text-[var(--color-on-surface)]">
              {{ service.title }}
            </p>
            <p
              class="text-[13px] leading-relaxed text-[var(--color-on-surface-variant)]"
            >
              {{ service.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- CTA ─────────────────────────────────────────────────────────── -->
      <section
        class="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-outline)] bg-[var(--color-surface)] p-5"
        aria-labelledby="services-cta-title"
      >
        <div class="space-y-1">
          <h2
            id="services-cta-title"
            class="text-[15px] font-bold leading-snug text-[var(--color-on-surface)]"
          >
            If the scope fits, let's make it work.
          </h2>
          <p class="text-[13px] text-[var(--color-on-surface-variant)]">
            One message is enough to start the conversation.
          </p>
        </div>
        <a href="/contact" class="button-primary shrink-0">
          Start a Conversation
        </a>
      </section>
    </div>
  </div>
</template>
