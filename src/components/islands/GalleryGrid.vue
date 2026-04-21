<script setup lang="ts">
/**
 * GalleryGrid — paginated photo grid with cursor-based pagination.
 * Island: client:visible
 * Composable: useGallery()
 *
 * Layout: uniform CSS grid (2 → 3 → 4 by breakpoint).
 * Tiles use a consistent media frame so portrait and landscape images both
 * read cleanly without masonry packing or aggressive cropping.
 *
 * Skeleton UX:
 * - Initial load: full grid of 12 framed skeleton tiles.
 * - Load-more: 12 skeleton tiles appended after existing photos while
 *   loadingMore is true.
 */
import { computed, ref, watchPostEffect } from "vue";
import { useGallery } from "../../lib/composables/useGallery";
import GalleryLightbox from "./GalleryLightbox.vue";

const { photos, loading, loadingMore, hasMore, error, loadMore } = useGallery();

// ── Theme filtering (client-side, loaded batch only) ───────────────────────
const activeTheme = ref<string | null>(null);

const availableThemes = computed(() => {
  const seen = new Set<string>();
  for (const p of photos.value) {
    if (p.theme) seen.add(p.theme);
  }
  return [...seen];
});

const filteredPhotos = computed(() =>
  activeTheme.value
    ? photos.value.filter((p) => p.theme === activeTheme.value)
    : photos.value,
);

// ── Lightbox ───────────────────────────────────────────────────────────────
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(photoId: string) {
  const realIndex = photos.value.findIndex((p) => p.id === photoId);
  lightboxIndex.value = realIndex >= 0 ? realIndex : 0;
  lightboxOpen.value = true;
}

type ImageStatus = "loading" | "loaded" | "error";

const imageStatuses = ref<Record<string, ImageStatus>>({});

function setImageStatus(id: string, status: ImageStatus) {
  imageStatuses.value = { ...imageStatuses.value, [id]: status };
}

function onImageLoad(id: string) {
  setImageStatus(id, "loaded");
}

function onImageError(id: string) {
  setImageStatus(id, "error");
}

function isImageLoading(id: string) {
  return (
    imageStatuses.value[id] !== "loaded" && imageStatuses.value[id] !== "error"
  );
}

function isImageLoaded(id: string) {
  return imageStatuses.value[id] === "loaded";
}

function isImageError(id: string) {
  return imageStatuses.value[id] === "error";
}

const galleryRoot = ref<HTMLElement | null>(null);

watchPostEffect(() => {
  if (typeof window === "undefined") return;

  void filteredPhotos.value;

  requestAnimationFrame(() => {
    const root = galleryRoot.value;
    if (!root) return;

    const images =
      root.querySelectorAll<HTMLImageElement>("img[data-photo-id]");
    for (const image of images) {
      const id = image.dataset.photoId;
      if (!id || !image.complete) continue;
      if (
        imageStatuses.value[id] === "loaded" ||
        imageStatuses.value[id] === "error"
      ) {
        continue;
      }

      if (image.naturalWidth > 0) {
        onImageLoad(id);
      } else {
        onImageError(id);
      }
    }
  });
});

const SKELETON_COUNT = 12;
</script>

<template>
  <div ref="galleryRoot">
    <!-- Initial loading skeleton ──────────────────────────────────────────── -->
    <div
      v-if="loading"
      class="gallery-grid"
      aria-busy="true"
      aria-label="Loading photos"
    >
      <div v-for="i in SKELETON_COUNT" :key="i" aria-hidden="true">
        <div
          class="gallery-card"
          :style="{ animationDelay: `${(i - 1) * 60}ms` }"
        >
          <div class="skeleton-rect gallery-media-frame" />
        </div>
      </div>
    </div>

    <!-- Initial load error ───────────────────────────────────────────────── -->
    <div
      v-else-if="error && photos.length === 0"
      class="flex gap-4 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-surface)] p-5"
      role="alert"
    >
      <div
        class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style="background: rgba(220, 38, 38, 0.1)"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-error)"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-[var(--color-error)]">
          Failed to load gallery
        </p>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- Empty ────────────────────────────────────────────────────────────── -->
    <p
      v-else-if="photos.length === 0"
      class="text-[var(--color-on-surface-variant)]"
    >
      No photos found.
    </p>

    <!-- Grid ─────────────────────────────────────────────────────────────── -->
    <div v-else>
      <!-- Count context line -->
      <p class="mb-3 text-[13px] text-[var(--color-on-surface-variant)]">
        <span v-if="activeTheme">
          {{ filteredPhotos.length }} {{ activeTheme }} photo{{
            filteredPhotos.length !== 1 ? "s" : ""
          }}
          <span class="opacity-60">· from {{ photos.length }} loaded</span>
        </span>
        <span v-else>
          {{ photos.length }} favourite photo{{
            photos.length !== 1 ? "s" : ""
          }}
        </span>
      </p>

      <!-- Theme filter bar -->
      <div
        v-if="availableThemes.length > 1"
        class="mb-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by theme"
      >
        <button
          type="button"
          class="pill pill-button px-4 text-[13px]"
          :aria-pressed="activeTheme === null"
          :class="{ 'is-active': activeTheme === null }"
          @click="activeTheme = null"
        >
          All
        </button>
        <button
          v-for="theme in availableThemes"
          :key="theme"
          type="button"
          class="pill pill-button px-4 text-[13px]"
          :aria-pressed="activeTheme === theme"
          :class="{ 'is-active': activeTheme === theme }"
          @click="activeTheme = theme"
        >
          {{ theme }}
        </button>
      </div>

      <!-- Uniform grid — 2 → 3 → 4 columns by breakpoint -->
      <ul class="gallery-grid" role="list">
        <!-- Photo tiles -->
        <li v-for="photo in filteredPhotos" :key="photo.id">
          <button
            type="button"
            class="group relative block w-full overflow-hidden rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cta)]"
            :aria-label="photo.title ?? `Photo ${index + 1}`"
            style="touch-action: manipulation; cursor: pointer"
            @click="openLightbox(photo.id)"
          >
            <div class="gallery-card">
              <div class="gallery-media-frame">
                <div
                  v-if="isImageLoading(photo.id)"
                  class="skeleton-rect absolute inset-0 z-10"
                  aria-hidden="true"
                />
                <div
                  v-if="isImageError(photo.id)"
                  class="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--color-surface-variant)] px-4 text-center"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-on-surface-variant)"
                    stroke-width="1.5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M8 8l8 8" />
                    <path d="M16 8l-8 8" />
                  </svg>
                  <span
                    class="text-[11px] text-[var(--color-on-surface-variant)]"
                  >
                    Image unavailable
                  </span>
                </div>
                <img
                  v-else-if="photo.link"
                  :src="photo.link"
                  :alt="photo.title || `Gallery photo ${index + 1}`"
                  loading="lazy"
                  :data-photo-id="photo.id"
                  class="gallery-image relative z-0 transition-all duration-300 group-hover:scale-[1.02]"
                  :class="isImageLoaded(photo.id) ? 'opacity-100' : 'opacity-0'"
                  @load="onImageLoad(photo.id)"
                  @error="onImageError(photo.id)"
                />
                <div
                  v-else
                  class="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[var(--color-surface-variant)]"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-on-surface-variant)"
                    stroke-width="1.5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span
                    class="text-[10px] text-[var(--color-on-surface-variant)]"
                    >No image</span
                  >
                </div>
              </div>

              <div class="gallery-meta">
                <p
                  v-if="photo.title"
                  class="truncate text-[12px] font-semibold text-[var(--color-on-surface)]"
                >
                  {{ photo.title }}
                </p>
                <p
                  v-if="photo.recipe"
                  class="mt-0.5 truncate text-[11px] text-[var(--color-on-surface-variant)]"
                >
                  {{ photo.recipe }}
                </p>
              </div>

              <div
                class="pointer-events-none absolute inset-0 rounded-[var(--radius-sm)] ring-1 ring-transparent transition-all duration-200 group-hover:ring-[var(--color-cta)]/25 group-focus-visible:ring-[var(--color-cta)]/30"
                aria-hidden="true"
              />
            </div>
          </button>
        </li>

        <!-- Load-more skeleton tiles (appended while loadingMore) -->
        <template v-if="loadingMore">
          <li
            v-for="i in SKELETON_COUNT"
            :key="`skeleton-more-${i}`"
            aria-hidden="true"
          >
            <div class="gallery-card">
              <div
                class="skeleton-rect gallery-media-frame"
                :style="{ animationDelay: `${i * 60}ms` }"
              />
            </div>
          </li>
        </template>
      </ul>

      <!-- Pagination error ─────────────────────────────────────────────── -->
      <div
        v-if="error && photos.length > 0"
        class="mt-4 flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-surface)] p-4"
        role="alert"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-error)"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mt-px flex-shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="text-sm text-[var(--color-on-surface-variant)]">
          Failed to load more photos. Please try again.
        </p>
      </div>

      <!-- Load more button -->
      <div
        v-if="hasMore && !loadingMore"
        class="mt-8 flex flex-col items-center gap-2"
      >
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-outline)] bg-[var(--color-surface)] px-6 py-2.5 text-sm font-medium text-[var(--color-on-surface)] transition-all duration-150 hover:border-[var(--color-cta)] hover:bg-[var(--color-surface-variant)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-cta)]"
          style="touch-action: manipulation"
          @click="loadMore"
        >
          Load more
        </button>
        <p
          v-if="activeTheme"
          class="text-center text-[12px] text-[var(--color-on-surface-variant)]"
        >
          Load more to see all {{ activeTheme }} photos
        </p>
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

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  align-items: start;
}

.gallery-grid > * {
  align-self: start;
}

.gallery-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.gallery-media-frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface-variant) 78%, var(--color-cta-soft))
      0%,
    var(--color-surface-variant) 100%
  );
}

.gallery-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gallery-meta {
  padding: 0.75rem 0.75rem 0.8rem;
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .gallery-media-frame {
    aspect-ratio: 3 / 4;
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .gallery-media-frame {
    aspect-ratio: 4 / 5;
  }
}
</style>
