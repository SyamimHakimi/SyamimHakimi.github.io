<script setup lang="ts">
import {
  BriefcaseBusiness,
  Database,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-vue-next";
import { computed } from "vue";
import { useServices } from "../../lib/composables/useServices";
import {
  groupServices,
  SERVICES_OVERVIEW_METRICS,
} from "../../lib/utils/servicesSection";
import ErrorAlert from "../ui/ErrorAlert.vue";
import MetricCard from "../ui/MetricCard.vue";

const { services, loading, error } = useServices();
const grouped = computed(() => groupServices(services.value));

function iconForService(title: string, groupId: number) {
  const t = title.toLowerCase();
  if (t.includes("ux") || t.includes("polish")) return Sparkles;
  if (t.includes("api") || t.includes("schema")) return Database;
  if (t.includes("review") || t.includes("hardening")) return ShieldCheck;
  if (t.includes("workflow") || t.includes("integration")) return Workflow;
  if (groupId === 1) return BriefcaseBusiness;
  if (groupId === 2) return Layers3;
  return ShieldCheck;
}
</script>

<template>
  <div class="space-y-8">
    <!-- Metrics strip ───────────────────────────────────────────────── -->
    <div class="grid gap-3 sm:grid-cols-3" aria-label="Service highlights">
      <MetricCard
        v-for="metric in SERVICES_OVERVIEW_METRICS"
        :key="metric.value"
        :value="metric.value"
        :description="metric.description"
      />
    </div>

    <!-- Loading skeleton ────────────────────────────────────────────── -->
    <div
      v-if="loading"
      class="space-y-8"
      aria-busy="true"
      aria-label="Loading services"
    >
      <div v-for="i in 3" :key="i" class="space-y-0">
        <div class="flex items-center justify-between border-b-2 border-[var(--color-on-surface)] pb-3">
          <div class="skeleton-line w-32" />
          <div class="skeleton-line w-24" />
        </div>
        <div v-for="j in 3" :key="j" class="flex items-start gap-4 border-b border-[var(--color-outline)] py-4">
          <div class="skeleton-rect h-8 w-8 shrink-0 rounded-lg" />
          <div class="flex-1 space-y-2">
            <div class="skeleton-line w-1/3" />
            <div class="skeleton-line w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <ErrorAlert
      v-else-if="error"
      title="Failed to load services"
      :message="error"
    />

    <div v-else-if="services.length === 0" class="empty-state">
      No services are available right now.
    </div>

    <!-- Service groups ───────────────────────────────────────────────── -->
    <div v-else class="space-y-8">
      <section
        v-for="({ id, meta, services: groupServices }) in grouped"
        :key="id"
        :aria-labelledby="`service-group-title-${id}`"
      >
        <!-- Group header: thick rule -->
        <div
          class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-[var(--color-on-surface)] pb-3"
        >
          <h2
            :id="`service-group-title-${id}`"
            class="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--color-on-surface)]"
          >
            {{ meta.title }}
          </h2>
          <div class="flex items-center gap-3">
            <span
              class="text-[11px] font-bold text-[var(--color-cta)]"
              aria-label="`${groupServices.length} services in this group`"
            >
              {{ groupServices.length }}
              {{ groupServices.length === 1 ? "service" : "services" }}
            </span>
            <span
              class="text-[11px] font-semibold text-[var(--color-on-surface-variant)]"
            >
              {{ meta.engagement }}
            </span>
          </div>
        </div>

        <!-- Service rows -->
        <div>
          <div
            v-for="service in groupServices"
            :key="service.id"
            class="flex items-start gap-3.5 border-b border-[var(--color-outline)] py-4 last:border-b-0"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-cta)_10%,var(--color-surface))] text-[var(--color-cta)]"
              aria-hidden="true"
            >
              <component
                :is="iconForService(service.title, id)"
                class="h-3.5 w-3.5"
              />
            </span>
            <div>
              <p
                class="text-[14px] font-semibold leading-snug text-[var(--color-on-surface)]"
              >
                {{ service.title }}
              </p>
              <p
                class="mt-0.5 text-[13px] leading-relaxed text-[var(--color-on-surface-variant)]"
              >
                {{ service.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA ─────────────────────────────────────────────────────────── -->
      <section
        class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-outline)] bg-[var(--color-surface)] p-5"
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
