<script setup lang="ts">
/**
 * ServicesSection - grouped services experience for the `/services` page.
 * Island: client:visible - runtime Firestore data and motion-v entrances require hydration.
 * Composable: useServices()
 */
import {
  ArrowRight,
  BriefcaseBusiness,
  Database,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-vue-next";
import { Motion } from "motion-v";
import { computed } from "vue";
import { useServices } from "../../lib/composables/useServices";
import { groupServices } from "../../lib/utils/servicesSection";
import { useMotionAnimation } from "../../lib/composables/useMotionAnimation";
import ErrorAlert from "../ui/ErrorAlert.vue";

const { services, loading, error } = useServices();

const { prefersReducedMotion, cardInitial, cardVisible } = useMotionAnimation();

const grouped = computed(() => groupServices(services.value));

function iconForService(title: string, groupId: number) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("ux") || normalizedTitle.includes("polish")) {
    return Sparkles;
  }

  if (normalizedTitle.includes("api") || normalizedTitle.includes("schema")) {
    return Database;
  }

  if (
    normalizedTitle.includes("review") ||
    normalizedTitle.includes("hardening")
  ) {
    return ShieldCheck;
  }

  if (
    normalizedTitle.includes("workflow") ||
    normalizedTitle.includes("integration")
  ) {
    return Workflow;
  }

  if (groupId === 1) return BriefcaseBusiness;
  if (groupId === 2) return Layers3;

  return ShieldCheck;
}
</script>

<template>
  <div class="space-y-10">
    <section
      class="grid gap-4 rounded-[28px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-6 md:grid-cols-2"
      aria-label="Services overview"
    >
      <div class="space-y-4">
        <p
          class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]"
        >
          <span class="h-2 w-2 rounded-full bg-[var(--color-cta)]" />
          Software Engineering Services
        </p>
        <h2
          class="max-w-[11ch] text-[clamp(2.125rem,5vw,3.625rem)] leading-[0.98] tracking-[-0.03em]"
        >
          Build work that feels clear, deliberate, and properly finished.
        </h2>
        <p class="max-w-2xl text-[var(--color-on-surface-variant)]">
          Focused support across implementation, platform foundations, and
          review work. The page stays structured and direct, with one clear
          contact path after the service groups.
        </p>
        <div class="flex flex-wrap gap-3">
          <a
            href="#services-cta"
            class="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cta)] px-5 text-sm font-medium text-white transition hover:bg-[var(--color-cta-hover)]"
          >
            Start a Project
          </a>
          <a
            href="#service-groups"
            class="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface)] px-5 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-variant)]"
          >
            Browse Services
          </a>
        </div>
      </div>

      <div class="grid gap-3" aria-label="Service highlights">
        <div
          class="rounded-[20px] border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-5"
        >
          <p
            class="font-serif text-3xl leading-none text-[var(--color-on-surface)]"
          >
            3
          </p>
          <p class="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Service groups with a consistent structure and one clear CTA path.
          </p>
        </div>
        <div
          class="rounded-[20px] border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-5"
        >
          <p
            class="font-serif text-3xl leading-none text-[var(--color-on-surface)]"
          >
            48px
          </p>
          <p class="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Minimum target for icon-disc affordances and primary action
            controls.
          </p>
        </div>
        <div
          class="rounded-[20px] border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-5"
        >
          <p
            class="font-serif text-3xl leading-none text-[var(--color-on-surface)]"
          >
            1
          </p>
          <p class="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Primary route to contact, kept stable across mobile and desktop.
          </p>
        </div>
      </div>
    </section>

    <div
      v-if="loading"
      class="grid gap-4 md:grid-cols-2"
      aria-busy="true"
      aria-label="Loading services"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="rounded-[20px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5"
      >
        <div class="skeleton-rect h-28" />
        <div class="skeleton-line mt-4 w-1/2" />
        <div class="skeleton-line mt-3 w-5/6" />
        <div class="skeleton-line mt-3 w-2/3" />
      </div>
    </div>

    <ErrorAlert
      v-else-if="error"
      title="Failed to load services"
      :message="error"
    />

    <div
      v-else-if="services.length === 0"
      class="rounded-[20px] bg-[var(--color-surface-variant)] p-6 text-[var(--color-on-surface-variant)]"
    >
      No services are available right now.
    </div>

    <div v-else id="service-groups" class="space-y-8">
      <p class="max-w-3xl text-sm text-[var(--color-on-surface-variant)]">
        The service groups stay symmetric and structured so the page feels calm
        and readable while still carrying more personality than the original
        utility-only layout.
      </p>

      <section
        v-for="({ id, meta, services: groupServices }, groupIndex) in grouped"
        :key="id"
        class="space-y-4"
        :aria-labelledby="`service-group-title-${id}`"
      >
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div class="space-y-3">
            <div class="flex items-center gap-4">
              <span
                class="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--color-cta)_20%,transparent)] bg-[color:var(--color-cta-soft)] text-sm font-semibold text-[var(--color-cta)]"
              >
                {{ String(id).padStart(2, "0") }}
              </span>
              <div>
                <h2
                  :id="`service-group-title-${id}`"
                  class="text-[clamp(1.5rem,3vw,2.125rem)] leading-[1.02] tracking-[-0.02em]"
                >
                  {{ meta.title }}
                </h2>
                <p
                  class="mt-1 max-w-3xl text-sm text-[var(--color-on-surface-variant)]"
                >
                  {{ meta.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
              class="inline-flex min-h-8 items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-on-surface-variant)]"
            >
              {{ groupServices.length }} services
            </span>
            <span
              class="inline-flex min-h-8 items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-on-surface-variant)]"
            >
              {{ meta.summary }}
            </span>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <Motion
            v-for="(service, index) in groupServices"
            :key="service.id"
            as="article"
            :initial="cardInitial"
            :animate="cardVisible"
            :transition="{
              duration: 0.3,
              delay:
                prefersReducedMotion || groupIndex >= 3
                  ? 0
                  : (groupIndex * 2 + index) * 0.04,
            }"
            class="relative grid gap-4 overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--color-cta)_24%,var(--color-outline))] hover:shadow-[0_12px_28px_rgba(0,0,0,0.05)]"
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
                  <component
                    :is="iconForService(service.title, id)"
                    aria-hidden="true"
                    class="h-4.5 w-4.5"
                  />
                </span>
              </span>
              <span
                class="inline-flex min-h-7 items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface)] px-2.5 text-[11px] uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]"
              >
                {{ meta.summary }}
              </span>
            </div>

            <div class="space-y-2">
              <h3 class="text-2xl leading-[1.06] tracking-[-0.02em]">
                {{ service.title }}
              </h3>
              <p
                class="max-w-[44ch] text-sm text-[var(--color-on-surface-variant)]"
              >
                {{ service.description }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap gap-2">
                <span
                  class="inline-flex min-h-7 items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface-variant)] px-2.5 text-xs text-[var(--color-on-surface-variant)]"
                >
                  Scoped delivery
                </span>
                <span
                  class="inline-flex min-h-7 items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface-variant)] px-2.5 text-xs text-[var(--color-on-surface-variant)]"
                >
                  Review-ready
                </span>
              </div>
              <span
                class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-cta)]"
              >
                Contact
                <ArrowRight aria-hidden="true" class="h-4 w-4" />
              </span>
            </div>
          </Motion>
        </div>
      </section>

      <section
        id="services-cta"
        class="grid gap-5 rounded-[28px] border border-[var(--color-outline)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,var(--color-cta-soft))] p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        aria-labelledby="services-cta-title"
      >
        <div class="space-y-3">
          <p
            class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]"
          >
            <span class="h-2 w-2 rounded-full bg-[var(--color-cta)]" />
            Clear conversion path
          </p>
          <h2
            id="services-cta-title"
            class="max-w-[16ch] text-[clamp(1.75rem,4vw,2.5rem)] leading-[0.98] tracking-[-0.03em]"
          >
            Once the structure is clear, the next action should be clear too.
          </h2>
          <p class="max-w-3xl text-sm text-[var(--color-on-surface-variant)]">
            The page ends with one direct route to contact. No competing visual
            weight, no extra conversion branches.
          </p>
        </div>

        <a
          href="/contact"
          class="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cta)] px-5 text-sm font-medium text-white shadow-[0_10px_30px_color-mix(in_srgb,var(--color-cta)_20%,transparent)] transition hover:bg-[var(--color-accent-hover)]"
        >
          Start a Conversation
        </a>
      </section>
    </div>
  </div>
</template>
