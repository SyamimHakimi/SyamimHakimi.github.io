<script setup lang="ts">
/**
 * GalleryGrid — paginated photo grid with cursor-based pagination.
 * Island: client:visible
 * Composable: useGallery()
 */
import { ref } from "vue";
import { useGallery } from "../../lib/composables/useGallery";
import GalleryLightbox from "./GalleryLightbox.vue";

const { photos, loading, loadingMore, hasMore, error, loadMore } = useGallery();

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading photos">
      <div
        v-for="i in 12"
        :key="i"
        class="aspect-square animate-pulse rounded-lg bg-[var(--color-surface)]"
      />
    </div>

    <!-- Initial load error (no photos yet) -->
    <div v-else-if="error && photos.length === 0" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400" role="alert">
      <p class="font-medium">Failed to load gallery</p>
      <p class="mt-1 text-sm opacity-80">{{ error }}</p>
    </div>

    <!-- Empty -->
    <p v-else-if="photos.length === 0" class="text-[var(--color-text-muted)]">
      No photos found.
    </p>

    <!-- Grid (shown even if a later loadMore failed) -->
    <div v-else>
      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
        <li
          v-for="(photo, index) in photos"
          :key="photo.id"
        >
          <button
            type="button"
            class="group aspect-square w-full overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            :aria-label="photo.title ?? `Photo ${index + 1}`"
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
              class="flex h-full w-full items-center justify-center bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs"
            >
              No image
            </div>
          </button>
        </li>
      </ul>

      <!-- Pagination error (photos still visible) -->
      <p v-if="error && photos.length > 0" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400" role="alert">
        Failed to load more photos. Please try again.
      </p>

      <!-- Load more -->
      <div v-if="hasMore" class="mt-8 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-border)] disabled:opacity-50"
          :disabled="loadingMore"
          @click="loadMore"
        >
          <span v-if="loadingMore">Loading…</span>
          <span v-else>Load more</span>
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <GalleryLightbox
      :photos="photos"
      :initial-index="lightboxIndex"
      :open="lightboxOpen"
      @close="lightboxOpen = false"
    />
  </div>
</template>
