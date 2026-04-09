<script setup lang="ts">
/**
 * PortfolioSection — experience categories and personal projects.
 * Island: client:visible
 * Composable: usePortfolio()
 */
import { usePortfolio } from "../../lib/composables/usePortfolio";

const { data, loading, error } = usePortfolio();

function formatDate(iso: string | undefined): string {
  if (!iso) return "Present";
  return new Date(iso).toLocaleDateString("en-MY", { year: "numeric", month: "short" });
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="space-y-8" aria-busy="true">
      <div v-for="i in 4" :key="i" class="space-y-3">
        <div class="h-6 w-40 animate-pulse rounded bg-[var(--color-surface)]" />
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="j in 2" :key="j" class="h-28 animate-pulse rounded-xl bg-[var(--color-surface)]" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400" role="alert">
      <p class="font-medium">Failed to load portfolio</p>
      <p class="mt-1 text-sm opacity-80">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-12">
      <!-- Platforms -->
      <section v-if="data.experience.platforms.length > 0" aria-label="Platforms experience">
        <h2 class="mb-4 text-xl font-semibold">Platforms</h2>
        <ul class="grid gap-3 sm:grid-cols-2" role="list">
          <li
            v-for="item in data.experience.platforms"
            :key="item.id"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p class="font-medium">{{ item.title }}</p>
            <p v-if="item['date-from']" class="mt-1 text-sm text-[var(--color-text-muted)]">
              {{ formatDate(item['date-from']) }} — {{ formatDate(item['date-to']) }}
            </p>
            <p v-if="item.description" class="mt-1 text-sm text-[var(--color-text-muted)]">{{ item.description }}</p>
          </li>
        </ul>
      </section>

      <!-- Protocols -->
      <section v-if="data.experience.protocols.length > 0" aria-label="Protocols experience">
        <h2 class="mb-4 text-xl font-semibold">Protocols</h2>
        <ul class="grid gap-3 sm:grid-cols-2" role="list">
          <li
            v-for="item in data.experience.protocols"
            :key="item.id"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p class="font-medium">{{ item.title }}</p>
            <p v-if="item['date-from']" class="mt-1 text-sm text-[var(--color-text-muted)]">
              {{ formatDate(item['date-from']) }} — {{ formatDate(item['date-to']) }}
            </p>
            <p v-if="item.description" class="mt-1 text-sm text-[var(--color-text-muted)]">{{ item.description }}</p>
          </li>
        </ul>
      </section>

      <!-- Frameworks -->
      <section v-if="data.experience.frameworks.length > 0" aria-label="Frameworks experience">
        <h2 class="mb-4 text-xl font-semibold">Frameworks</h2>
        <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
          <li
            v-for="item in data.experience.frameworks"
            :key="item.id"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p class="font-medium">{{ item.title }}</p>
            <p v-if="item['date-from']" class="mt-1 text-sm text-[var(--color-text-muted)]">
              {{ formatDate(item['date-from']) }} — {{ formatDate(item['date-to']) }}
            </p>
          </li>
        </ul>
      </section>

      <!-- Languages -->
      <section v-if="data.experience.languages.length > 0" aria-label="Languages experience">
        <h2 class="mb-4 text-xl font-semibold">Languages</h2>
        <ul class="flex flex-wrap gap-2" role="list">
          <li
            v-for="item in data.experience.languages"
            :key="item.id"
            class="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm font-medium"
          >
            {{ item.title }}
          </li>
        </ul>
      </section>

      <!-- Personal Project -->
      <section v-if="data.project" aria-label="Personal projects">
        <h2 class="mb-4 text-xl font-semibold">Personal Project</h2>
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 class="text-lg font-semibold">{{ data.project.title }}</h3>
          <p v-if="data.project.subtitle" class="mt-1 text-sm text-[var(--color-accent)]">{{ data.project.subtitle }}</p>
          <p v-if="data.project.description" class="mt-3 text-sm text-[var(--color-text-muted)]">{{ data.project.description }}</p>

          <div v-if="data.techstack.length > 0" class="mt-4">
            <p class="mb-2 text-sm font-medium">Tech Stack</p>
            <ul class="flex flex-wrap gap-2" role="list">
              <li
                v-for="tech in data.techstack"
                :key="tech.id"
                class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs"
              >
                {{ tech.title }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
