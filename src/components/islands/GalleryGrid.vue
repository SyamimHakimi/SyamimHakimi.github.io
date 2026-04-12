<script setup lang="ts">
/**
 * GalleryGrid — paginated photo grid with cursor-based pagination.
 * Island: client:visible
 * Composable: useGallery()
 *
 * Scroll entrance animations use motion-v; stagger is skipped when
 * prefers-reduced-motion is active.
 */
import { ref } from "vue";
import { Motion } from "motion-v";
import { useGallery } from "../../lib/composables/useGallery";
import GalleryLightbox from "./GalleryLightbox.vue";

const { photos, loading, loadingMore, hasMore, error, loadMore } = useGallery();

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}

// ── Motion helpers ─────────────────────────────────────────────────────────
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const tileInitial = prefersReducedMotion ? {} : { opacity: 0, y: 12 };
const tileVisible = { opacity: 1, y: 0 };

function delay(i: number): number {
  return prefersReducedMotion ? 0 : (i * 40) / 1000;
}
</script>

<template>
  <div>
    <!-- Loading skeleton ─────────────────────────────────────────────────── -->
    <div
      v-if="loading"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading photos"
    >
      <div
        v-for="i in 12"
        :key="i"
        class="skeleton-rect aspect-square"
        :style="{ animationDelay: `${(i - 1) * 60}ms` }"
      />
    </div>

    <!-- Initial load error ───────────────────────────────────────────────── -->
    <div
      v-else-if="error && photos.length === 0"
      class="flex gap-4 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-surface)] p-5"
      role="alert"
    >
      <div
        class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style="background: rgba(220,38,38,0.10)"
      >
        <svg
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="var(--color-error)"
          stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-[var(--color-error)]">Failed to load gallery</p>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">{{ error }}</p>
      </div>
    </div>

    <!-- Empty ────────────────────────────────────────────────────────────── -->
    <p v-else-if="photos.length === 0" class="text-[var(--color-on-surface-variant)]">
      No photos found.
    </p>

    <!-- Grid ─────────────────────────────────────────────────────────────── -->
    <div v-else>
      <ul
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        role="list"
      >
        <Motion
          v-for="(photo, index) in photos"
          :key="photo.id"
          as="li"
          :initial="tileInitial"
          :animate="tileVisible"
          :transition="{ duration: 0.25, delay: delay(index % 12), easing: [0.2,0,0,1] }"
        >
          <button
            type="button"
            class="group relative aspect-square w-full overflow-hidden rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cta)]"
            :aria-label="photo.title ?? `Photo ${index + 1}`"
            style="touch-action: manipulation; cursor: pointer"
            @click="openLightbox(index)"
          >
            <img
              v-if="photo.link"
              :src="photo.link"
              :alt="photo.title ?? ''"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              v-else
              class="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[var(--color-surface-variant)]"
            >
              <svg
                width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="var(--color-on-surface-variant)"
                stroke-width="1.5" aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span class="text-[10px] text-[var(--color-on-surface-variant)]">No image</span>
            </div>

            <!-- Hover overlay — title + recipe ──────────────────────────── -->
            <div
              class="pointer-events-none absolute inset-0 flex flex-col justify-end p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              style="background: linear-gradient(to top, rgba(0,0,0,.70) 0%, rgba(0,0,0,.18) 55%, transparent 100%)"
              aria-hidden="true"
            >
              <p
                v-if="photo.title"
                class="truncate text-[11px] font-semibold leading-tight text-white"
              >
                {{ photo.title }}
              </p>
              <p
                v-if="photo.recipe"
                class="mt-0.5 truncate text-[10px] text-white/70"
              >
                {{ photo.recipe }}
              </p>
            </div>
          </button>
        </Motion>
      </ul>

      <!-- Pagination error ─────────────────────────────────────────────── -->
      <div
        v-if="error && photos.length > 0"
        class="mt-4 flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-surface)] p-4"
        role="alert"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="var(--color-error)"
          stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
          class="mt-px flex-shrink-0" aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-sm text-[var(--color-on-surface-variant)]">
          Failed to load more photos. Please try again.
        </p>
      </div>

      <!-- Load more ───────────────────────────────────────────────────────── -->
      <div v-if="hasMore" class="mt-8 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-outline)] bg-[var(--color-surface)] px-6 py-2.5 text-sm font-medium text-[var(--color-on-surface)] transition-all duration-150 hover:border-[var(--color-cta)] hover:bg-[var(--color-surface-variant)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cta)] disabled:cursor-not-allowed disabled:opacity-50"
          style="touch-action: manipulation"
          :disabled="loadingMore"
          @click="loadMore"
        >
          <svg
            v-if="loadingMore"
            class="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5"
            aria-hidden="true"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <span>{{ loadingMore ? "Loading…" : "Load more" }}</span>
        </button>
      </div>
    </div>

    <!-- Lightbox ─────────────────────────────────────────────────────────── -->
    <GalleryLightbox
      :photos="photos"
      :initial-index="lightboxIndex"
      :open="lightboxOpen"
      @close="lightboxOpen = false"
    />
  </div>
</template>
