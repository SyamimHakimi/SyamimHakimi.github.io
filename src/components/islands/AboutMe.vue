<script setup lang="ts">
/**
 * AboutMe — profile, photography gear, favourite boardgames, and social links.
 * Island: client:visible
 * Composable: useAboutMe()
 */
import { useAboutMe } from "../../lib/composables/useAboutMe";

const { data, loading, error } = useAboutMe();
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="space-y-8" aria-busy="true" aria-label="Loading profile">
      <div class="h-24 w-64 animate-pulse rounded-xl bg-[var(--color-surface)]" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-xl bg-[var(--color-surface)]" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400" role="alert">
      <p class="font-medium">Failed to load profile</p>
      <p class="mt-1 text-sm opacity-80">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-12">
      <!-- Profile -->
      <section v-if="data.profile" aria-label="Profile">
        <h2 class="text-xl font-semibold">{{ data.profile.Name }}</h2>
        <p class="mt-1 text-[var(--color-text-muted)]">
          {{ data.profile['Residing Country'] ?? data.profile.Country }}
        </p>
        <p v-if="data.profile.Hobbies" class="mt-1 text-sm text-[var(--color-text-muted)]">
          {{ data.profile.Hobbies }}
        </p>
      </section>

      <!-- Photography Gear -->
      <section v-if="data.gear.length > 0" aria-label="Photography gear">
        <h2 class="mb-4 text-xl font-semibold">Photography Gear</h2>
        <ul class="grid gap-3 sm:grid-cols-2" role="list">
          <li
            v-for="gear in data.gear"
            :key="gear.id"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p class="font-medium">{{ gear.brand }} {{ gear.name }}</p>
            <a
              v-if="gear.link"
              :href="gear.link"
              class="mt-1 text-sm text-[var(--color-accent)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View details
            </a>
          </li>
        </ul>
      </section>

      <!-- Favourite Boardgames -->
      <section v-if="data.boardgames.length > 0" aria-label="Favourite boardgames">
        <h2 class="mb-4 text-xl font-semibold">Favourite Boardgames</h2>
        <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
          <li
            v-for="game in data.boardgames"
            :key="game.id"
            class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p class="font-medium">{{ game.name.trim() }}</p>
            <p class="mt-1 text-sm text-[var(--color-text-muted)]">
              Score: {{ game.score }} &bull; {{ game.tags }}
            </p>
          </li>
        </ul>
      </section>

      <!-- Social Media -->
      <section v-if="data.socialMedia.length > 0" aria-label="Social media links">
        <h2 class="mb-4 text-xl font-semibold">Connect</h2>
        <ul class="flex flex-wrap gap-3" role="list">
          <li v-for="social in data.socialMedia" :key="social.id">
            <a
              :href="social.link"
              class="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-border)]"
              :target="social.link.startsWith('mailto:') ? undefined : '_blank'"
              rel="noopener noreferrer"
            >
              {{ social.name }} — {{ social.text }}
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
