/**
 * useMotionAnimation — shared motion-v entrance animation helpers.
 *
 * Centralises the `prefers-reduced-motion` check and the card initial/visible
 * variants so every island that uses motion-v doesn't have to repeat the same
 * three lines of setup.
 *
 * Usage:
 *   const { prefersReducedMotion, cardInitial, cardVisible, delay } = useMotionAnimation();
 */
export function useMotionAnimation() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Initial state: hidden + shifted down 12 px. No-op when reduced motion is on. */
  const cardInitial = prefersReducedMotion ? {} : { opacity: 0, y: 12 };

  /** Visible state: fully opaque, in-place. */
  const cardVisible = { opacity: 1, y: 0 };

  /**
   * Stagger delay in seconds.
   * @param i     - item index within the list
   * @param base  - additional offset in milliseconds (default 0)
   */
  function delay(i: number, base = 0): number {
    return prefersReducedMotion ? 0 : (base + i * 50) / 1000;
  }

  return { prefersReducedMotion, cardInitial, cardVisible, delay };
}