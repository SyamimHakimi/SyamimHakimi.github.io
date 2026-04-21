<script setup lang="ts">
/**
 * GalleryLightbox — full-screen photo viewer.
 * Island: client:visible (mounted alongside GalleryGrid)
 * Props: photos array, initial index, open flag
 */
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { Motion } from "motion-v";
import { X, ChevronLeft, ChevronRight } from "lucide-vue-next";

interface Photo {
  id: string;
  link?: string;
  title?: string;
  date: string;
  recipe?: string;
  lens?: string;
  theme?: string;
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
const imageError = ref(false);

watch(
  () => props.initialIndex,
  (v) => {
    currentIndex.value = v;
  },
);

watch(currentIndex, () => {
  imageError.value = false;
});

const current = computed(() => props.photos[currentIndex.value]);

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const overlayInitial = prefersReducedMotion ? {} : { opacity: 0 };
const overlayVisible = { opacity: 1 };
const frameInitial = prefersReducedMotion
  ? {}
  : { opacity: 0, scale: 0.985, y: 10 };
const frameVisible = { opacity: 1, scale: 1, y: 0 };
const chromeInitial = prefersReducedMotion ? {} : { opacity: 0, y: 6 };
const chromeVisible = { opacity: 1, y: 0 };

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    month: "short",
    year: "numeric",
  });
}
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
        <!-- Counter badge ─────────────────────────────────────────────── -->
        <Motion
          as="div"
          class="lb-counter"
          :initial="chromeInitial"
          :animate="chromeVisible"
          :transition="{
            duration: prefersReducedMotion ? 0 : 0.2,
            delay: prefersReducedMotion ? 0 : 0.08,
            ease: 'easeOut',
          }"
        >
          {{ currentIndex + 1 }} / {{ photos.length }}
        </Motion>

        <!-- Close button ──────────────────────────────────────────────── -->
        <Motion
          as="button"
          type="button"
          class="lb-btn absolute right-3.5 top-3.5"
          aria-label="Close lightbox"
          :initial="chromeInitial"
          :animate="chromeVisible"
          :transition="{
            duration: prefersReducedMotion ? 0 : 0.2,
            delay: prefersReducedMotion ? 0 : 0.12,
            ease: 'easeOut',
          }"
          @click="close"
        >
          <X class="h-[18px] w-[18px]" aria-hidden="true" />
        </Motion>

        <!-- Prev ──────────────────────────────────────────────────────── -->
        <Motion
          v-if="currentIndex > 0"
          as="button"
          type="button"
          class="lb-btn absolute left-3.5 top-1/2 -translate-y-1/2"
          aria-label="Previous photo"
          :initial="chromeInitial"
          :animate="chromeVisible"
          :transition="{
            duration: prefersReducedMotion ? 0 : 0.2,
            ease: 'easeOut',
          }"
          @click="prev"
        >
          <ChevronLeft class="h-5 w-5" aria-hidden="true" />
        </Motion>

        <!-- Image + metadata ──────────────────────────────────────────── -->
        <Motion
          :key="current.id"
          as="div"
          class="mx-[64px] flex max-h-[90dvh] max-w-[90dvw] flex-col items-center gap-0"
          :initial="frameInitial"
          :animate="frameVisible"
          :transition="{
            duration: prefersReducedMotion ? 0 : 0.26,
            ease: [0.22, 1, 0.36, 1],
          }"
        >
          <!-- Image error fallback -->
          <div
            v-if="imageError || !current.link"
            class="flex w-[min(60dvw,420px)] flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.05)] py-16"
            role="img"
            :aria-label="`Image unavailable${current.title ? ': ' + current.title : ''}`"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p class="text-[12px] text-[rgba(255,255,255,0.4)]">Image unavailable</p>
          </div>

          <Motion
            v-else
            as="img"
            :src="current.link"
            :alt="current.title ?? 'Photo'"
            loading="eager"
            class="max-h-[74dvh] max-w-full rounded-[var(--radius-md)] object-contain"
            :initial="overlayInitial"
            :animate="overlayVisible"
            :transition="{
              duration: prefersReducedMotion ? 0 : 0.22,
              ease: 'easeOut',
            }"
            @error="imageError = true"
          />

          <!-- Metadata bar -->
          <Motion
            v-if="
              current.title ||
              current.recipe ||
              current.lens ||
              current.date ||
              current.theme
            "
            as="div"
            class="lb-meta mt-2.5 w-full"
            :initial="chromeInitial"
            :animate="chromeVisible"
            :transition="{
              duration: prefersReducedMotion ? 0 : 0.2,
              delay: prefersReducedMotion ? 0 : 0.06,
              ease: 'easeOut',
            }"
          >
            <span
              v-if="current.title"
              class="truncate text-[13px] font-semibold text-white/90"
            >
              {{ current.title }}
            </span>
            <div class="flex flex-shrink-0 flex-wrap justify-end gap-1.5">
              <span v-if="current.date" class="lb-tag lb-tag--dim">{{
                formatDate(current.date)
              }}</span>
              <span v-if="current.theme" class="lb-tag lb-tag--dim">{{
                current.theme
              }}</span>
              <span v-if="current.recipe" class="lb-tag">{{
                current.recipe
              }}</span>
              <span v-if="current.lens" class="lb-tag lb-tag--dim">{{
                current.lens
              }}</span>
            </div>
          </Motion>
        </Motion>

        <!-- Next ──────────────────────────────────────────────────────── -->
        <Motion
          v-if="currentIndex < photos.length - 1"
          as="button"
          type="button"
          class="lb-btn absolute right-3.5 top-1/2 -translate-y-1/2"
          aria-label="Next photo"
          :initial="chromeInitial"
          :animate="chromeVisible"
          :transition="{
            duration: prefersReducedMotion ? 0 : 0.2,
            ease: 'easeOut',
          }"
          @click="next"
        >
          <ChevronRight class="h-5 w-5" aria-hidden="true" />
        </Motion>

        <!-- Keyboard hints ────────────────────────────────────────────── -->
        <Motion
          v-if="!prefersReducedMotion"
          as="div"
          class="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3"
          aria-hidden="true"
          :initial="chromeInitial"
          :animate="chromeVisible"
          :transition="{ duration: 0.2, delay: 0.14, ease: 'easeOut' }"
        >
          <span class="lb-hint"><kbd>←</kbd><kbd>→</kbd> navigate</span>
          <span class="lb-hint"><kbd>Esc</kbd> close</span>
        </Motion>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop transition */
.fade-enter-active {
  transition: opacity 0.2s ease;
}
.fade-leave-active {
  transition: opacity 0.15s ease;
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

/* Counter badge */
.lb-counter {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.03em;
  white-space: nowrap;
}

/* Shared button style — 48×48px (meets 44px touch target) */
.lb-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: white;
  cursor: pointer;
  transition: background 150ms;
  touch-action: manipulation;
}
.lb-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}
.lb-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

/* Metadata bar */
.lb-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 14px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.lb-tag {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 3px 9px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}
.lb-tag--dim {
  color: rgba(255, 255, 255, 0.5);
}

/* Keyboard hints */
.lb-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
.lb-hint kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.55);
}
</style>
