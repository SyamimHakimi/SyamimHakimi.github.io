<script setup lang="ts">
/**
 * LandingPhotos — 2×2 grid of random favourite photos for the landing page.
 *
 * Fetches up to 12 favourite photos from Firestore, shuffles them, and
 * displays 4. All cells link to /photography.
 *
 * Skeleton UX mirrors GalleryGrid: a grid-level shimmer shows while Firestore
 * loads, then each image cell keeps its own shimmer overlay until the <img>
 * fires its load event.
 *
 * Island: client:visible — Firestore reads require browser context.
 */
import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore/lite";
import { db } from "../../lib/firebase";
import { PhotoSchema, type Photo } from "../../lib/composables/useGallery";
import {
  getLandingPhotoPlaceholderCount,
  selectLandingPhotos,
} from "../../lib/utils/landingPhotos";

const photos = ref<Photo[]>([]);
const loading = ref(true);
const fetchError = ref(false);

type ImageStatus = "loading" | "loaded" | "error";
const imageStatuses = ref<Record<string, ImageStatus>>({});

function onImageLoad(id: string) {
  imageStatuses.value = { ...imageStatuses.value, [id]: "loaded" };
}

function onImageError(id: string) {
  imageStatuses.value = { ...imageStatuses.value, [id]: "error" };
}

function isImageLoading(id: string) {
  return (
    imageStatuses.value[id] !== "loaded" && imageStatuses.value[id] !== "error"
  );
}

onMounted(async () => {
  try {
    const q = query(
      collection(db, "photos"),
      where("favourite", "==", true),
      orderBy("date", "desc"),
      limit(12),
    );
    const snap = await getDocs(q);
    const fetched = snap.docs.map((d) =>
      PhotoSchema.parse({ id: d.id, ...d.data() }),
    );
    photos.value = selectLandingPhotos(fetched);
  } catch {
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
});

const displayPhotos = computed(() => photos.value.slice(0, 4));
const placeholderCount = computed(() =>
  getLandingPhotoPlaceholderCount(displayPhotos.value.length),
);
</script>

<template>
  <!-- ── Error state (Firestore unavailable) ──────────────────────────────── -->
  <div
    v-if="!loading && fetchError"
    class="flex h-full flex-col items-center justify-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-6 text-center"
    role="alert"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-surface-variant)" stroke-width="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <p class="text-[12px] leading-snug text-[var(--color-on-surface-variant)]">
      Photos unavailable
    </p>
    <a href="/photography" class="text-[11px] font-medium text-[var(--color-cta)] hover:underline">
      Browse gallery →
    </a>
  </div>

  <div v-else class="grid h-full grid-cols-2 grid-rows-2 gap-2.5">
    <!-- ── Grid-level skeleton (while Firestore fetches) ──────────────────── -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="lp-card" aria-hidden="true">
        <div class="lp-frame skeleton-rect" />
      </div>
    </template>

    <!-- ── Loaded state ────────────────────────────────────────────────────── -->
    <template v-else>
      <a
        v-for="(photo, index) in displayPhotos"
        :key="photo.id"
        href="/photography"
        class="lp-card group"
        :aria-label="
          index === 3 ? 'View full gallery' : (photo.title ?? 'View gallery')
        "
      >
        <div class="lp-frame">
          <!-- Per-image shimmer — visible until <img> fires load -->
          <div
            v-if="isImageLoading(photo.id)"
            class="skeleton-rect absolute inset-0 z-10"
            aria-hidden="true"
          />

          <!-- Image -->
          <img
            v-if="photo.link"
            :src="photo.link"
            :alt="photo.title || `Gallery photo ${index + 1}`"
            loading="lazy"
            class="lp-image transition-transform duration-300 group-hover:scale-[1.03]"
            @load="onImageLoad(photo.id)"
            @error="onImageError(photo.id)"
          />

          <!-- No-link fallback -->
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-[var(--color-surface-variant)]"
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
          </div>

        </div>
      </a>

      <!-- Fill empty cells if fewer than 4 photos loaded -->
      <div
        v-for="i in placeholderCount"
        :key="`fill-${i}`"
        class="lp-card"
        aria-hidden="true"
      >
        <div class="lp-frame bg-[var(--color-surface-variant)]" />
      </div>
    </template>
  </div>
</template>



<style scoped>
/* Mirror GalleryGrid's card + frame styles for visual consistency */
.lp-card {
  display: block;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  text-decoration: none;
}

.lp-frame {
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

.lp-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
