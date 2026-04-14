import { onMounted, onUnmounted, ref } from "vue";

/**
 * useReducedMotion — reactive wrapper around the user's
 * `prefers-reduced-motion` setting.
 *
 * Keeps lightweight UI animation logic aligned with the platform preference
 * without pulling in a full animation runtime.
 *
 * @returns `prefersReducedMotion` — true when the user requests reduced motion.
 */
export function useReducedMotion() {
  const prefersReducedMotion = ref(false);
  let mediaQuery: MediaQueryList | null = null;
  let syncPreference: (() => void) | null = null;

  onMounted(() => {
    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const currentMediaQuery = mediaQuery;
    syncPreference = () => {
      prefersReducedMotion.value = currentMediaQuery.matches;
    };

    syncPreference();
    currentMediaQuery.addEventListener("change", syncPreference);
  });

  onUnmounted(() => {
    if (mediaQuery && syncPreference) {
      mediaQuery.removeEventListener("change", syncPreference);
    }
  });

  return { prefersReducedMotion };
}
