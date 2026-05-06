<script setup lang="ts">
import {
  ArrowLeftRight,
  BarChart2,
  ClipboardList,
  Code2,
  Database,
  FileText,
  GitMerge,
  Globe,
  KeyRound,
  Network,
  Plug,
  ShieldCheck,
  Zap,
} from "lucide-vue-next";
import type { Component } from "vue";
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

const SERVICE_ICONS: Record<string, Component> = {
  "Custom Web Application": Globe,
  "Dashboard & Analytics UI": BarChart2,
  "Form Engineering & Validation": ClipboardList,
  "Authentication & Access Control": KeyRound,
  "REST API Design": Code2,
  "Third-Party API Integration": Plug,
  "Database Schema Design": Database,
  "Data Migration": ArrowLeftRight,
  "Data Mapping & Transformation": GitMerge,
  "Business Flow Analysis": Network,
  "Performance Optimisation": Zap,
  "Security Review & Implementation": ShieldCheck,
  "API Documentation & Contracts": FileText,
};

function iconForService(title: string): Component {
  return SERVICE_ICONS[title] ?? Code2;
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
        :eyebrow="metric.short"
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
      <div v-for="i in 3" :key="i" class="space-y-3">
        <div class="border-b-2 border-[var(--color-on-surface)] pb-3 space-y-2">
          <div class="skeleton-line w-32" />
          <div class="skeleton-line w-56" />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div
            v-for="j in 3"
            :key="j"
            class="rounded-xl border border-[var(--color-outline)] p-4 space-y-2"
          >
            <div class="skeleton-rect h-9 w-9 rounded-lg" />
            <div class="skeleton-line w-3/4" />
            <div class="skeleton-line w-full" />
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
        <!-- Group header -->
        <div class="border-b-2 border-[var(--color-on-surface)] pb-3 mb-4">
          <h2
            :id="`service-group-title-${id}`"
            class="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--color-on-surface)]"
          >
            {{ meta.title }}
          </h2>
          <p class="mt-1.5 text-[12px] leading-relaxed text-[var(--color-on-surface-variant)]">
            {{ meta.description }}
          </p>
        </div>

        <!-- Tile grid: 2-col mobile, 3-col sm+ -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div
            v-for="service in groupServices"
            :key="service.id"
            class="rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface)] p-4"
          >
            <span
              class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-cta)_10%,var(--color-surface))] text-[var(--color-cta)]"
              aria-hidden="true"
            >
              <component :is="iconForService(service.title)" class="h-4 w-4" />
            </span>
            <p class="text-[13px] font-semibold leading-snug text-[var(--color-on-surface)]">
              {{ service.title }}
            </p>
            <p class="mt-1 text-[11px] leading-relaxed text-[var(--color-on-surface-variant)]">
              {{ service.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- CTA ─────────────────────────────────────────────────────────── -->
      <section
        class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5"
        style="background: var(--color-surface-variant); border-color: rgba(180,83,9,0.20);"
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
