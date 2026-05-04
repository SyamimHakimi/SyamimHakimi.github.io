<script setup lang="ts">
/**
 * LandingPhotoStats — live shot counters for the home page photo canvas.
 *
 * Reads only the `statistics/stats` aggregate document so the canvas doesn't
 * pull the full 7-document statistics batch that PhotographyJourney uses.
 */
import { ref, onMounted, computed } from "vue";
import { doc, getDoc } from "firebase/firestore/lite";
import { db } from "../../lib/firebase";
import { StatsSchema } from "../../lib/composables/useStatistics";

const totalPhotos = ref<number | null>(null);
const totalOutings = ref<number | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, "statistics", "stats"));
    const stats = StatsSchema.parse({ id: snap.id, ...snap.data() });
    totalPhotos.value = stats.total_photos;
    totalOutings.value = stats.total_outings;
  } catch {
    // Values stay null → displayed as em dash
  } finally {
    loading.value = false;
  }
});

const counters = computed(() => [
  { value: totalPhotos.value, label: "Photos" },
  { value: totalOutings.value, label: "Outings" },
]);
</script>

<template>
  <div class="flex gap-5" aria-label="Photography stats">
    <div v-for="counter in counters" :key="counter.label">
      <div
        v-if="loading"
        class="skeleton-rect mb-1 h-6 w-10"
        aria-hidden="true"
      />
      <span
        v-else
        class="block font-serif text-[22px] leading-none text-white"
      >
        {{ counter.value ?? "—" }}
      </span>
      <span
        class="mt-1 block text-[10px] uppercase tracking-[0.08em] text-white/50"
      >
        {{ counter.label }}
      </span>
    </div>

  </div>
</template>
