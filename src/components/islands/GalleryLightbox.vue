<script setup lang="ts">
/**
 * GalleryLightbox — full-screen photo viewer.
 * Island: client:visible (mounted alongside GalleryGrid)
 * Props: photo URL + title, navigation controls emitted from GalleryGrid
 */
import { ref, watch, onMounted, onUnmounted } from "vue";
import { X, ChevronLeft, ChevronRight } from "lucide-vue-next";

interface Photo {
  id: string;
  link?: string;
  title?: string;
  date: string;
  recipe?: string;
  lens?: string;
}

interface Props {
  photos: Photo[];
  initialIndex?: number;
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
  open: false,
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const currentIndex = ref(props.initialIndex);

watch(
  () => props.initialIndex,
  (v) => { currentIndex.value = v; },
);

const current = computed(() => props.photos[currentIndex.value]);

function prev() {
  if (currentIndex.value > 0) currentIndex.value--;
}
function next() {
  if (currentIndex.value < props.photos.length - 1) currentIndex.value++;
}
function close() {
  emit("close");
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return;
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
  if (e.key === "Escape") close();
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));

import { computed } from "vue";
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open && current"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        role="dialog"
        aria-modal="true"
        :aria-label="current.title ?? 'Photo lightbox'"
        @click.self="close"
      >
        <!-- Close button -->
        <button
          type="button"
          class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close lightbox"
          @click="close"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </button>

        <!-- Prev -->
        <button
          v-if="currentIndex > 0"
          type="button"
          class="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Previous photo"
          @click="prev"
        >
          <ChevronLeft class="h-5 w-5" aria-hidden="true" />
        </button>

        <!-- Image -->
        <div class="mx-16 flex max-h-[90dvh] max-w-[90dvw] flex-col items-center gap-3">
          <img
            v-if="current.link"
            :src="current.link"
            :alt="current.title ?? 'Photo'"
            loading="eager"
            class="max-h-[80dvh] max-w-full rounded-lg object-contain"
          />
          <div v-if="current.title || current.recipe" class="text-center text-sm text-white/70">
            <p v-if="current.title" class="font-medium text-white">{{ current.title }}</p>
            <p v-if="current.recipe">{{ current.recipe }}</p>
            <p v-if="current.lens" class="opacity-60">{{ current.lens }}</p>
          </div>
        </div>

        <!-- Next -->
        <button
          v-if="currentIndex < photos.length - 1"
          type="button"
          class="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Next photo"
          @click="next"
        >
          <ChevronRight class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
