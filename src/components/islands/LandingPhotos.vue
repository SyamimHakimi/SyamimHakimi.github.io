<script setup lang="ts">
/**
 * LandingPhotos — 2×2 grid of random favourite photos for the landing page.
 *
 * Fetches up to 12 favourite photos from Firestore, shuffles them, and
 * displays 4. The last cell carries a "View Gallery" overlay link.
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

const photos = ref<Photo[]>([]);
const loading = ref(true);

/** Fisher-Yates shuffle — returns a new array. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
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
    photos.value = shuffle(fetched).slice(0, 4);
  } catch {
    // Silently fail — the grid just stays empty
  } finally {
    loading.value = false;
  }
});

const displayPhotos = computed(() => photos.value.slice(0, 4));
</script>

<template>
  <!-- 2×2 photo grid -->
  <div class="grid h-full grid-cols-2 grid-rows-2 gap-2.5">
    <!-- Skeleton state -->
    <template v-if="loading">
      <div
        v-for="i in 4"
        :key="i"
        class="skeleton-rect min-h-[120px] rounded-[var(--radius-lg)]"
      />
    </template>

    <!-- Loaded state -->
    <template v-else>
      <div
        v-for="(photo, index) in displayPhotos"
        :key="photo.id"
        class="relative min-h-[120px] overflow-hidden rounded-[var(--radius-lg)]"
        :class="{ 'group': index === 3 }"
      >
        <!-- Photo image -->
        <img
          v-if="photo.link"
          :src="photo.link"
          :alt="photo.title ?? 'favourite photo'"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <!-- Fallback when no link -->
        <div
          v-else
          class="h-full w-full bg-[var(--color-surface-variant)]"
          aria-hidden="true"
        />

        <!-- "View Gallery" overlay on last cell -->
        <a
          v-if="index === 3"
          href="/photography"
          class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-lg)] bg-[rgba(28,25,23,0.52)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="View full gallery"
        >
          <span class="text-center text-[12px] font-600 leading-tight text-white">
            More in<br />Gallery
          </span>
          <span class="flex items-center gap-1 text-[11px] text-white/75">
            View all
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </a>
      </div>

      <!-- Fill remaining cells if fewer than 4 photos loaded -->
      <div
        v-for="i in Math.max(0, 4 - displayPhotos.length)"
        :key="`fill-${i}`"
        class="min-h-[120px] rounded-[var(--radius-lg)] bg-[var(--color-surface-variant)]"
        aria-hidden="true"
      />
    </template>
  </div>
</template>
