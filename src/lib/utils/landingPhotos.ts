import type { Photo } from "../composables/useGallery";

export const LANDING_PHOTO_LIMIT = 4;

/**
 * Returns a shuffled copy of the provided array using Fisher-Yates.
 *
 * @param items Source items to shuffle.
 * @param random Random number generator used for deterministic tests.
 * @returns New array with the same items in shuffled order.
 */
export function shuffleItems<T>(items: T[], random = Math.random): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex]!,
      shuffled[index]!,
    ];
  }

  return shuffled;
}

/**
 * Picks up to four photos for the landing page grid.
 *
 * @param photos Validated gallery photos from Firestore.
 * @param random Random number generator used for deterministic tests.
 * @returns Shuffled subset capped to the landing grid capacity.
 */
export function selectLandingPhotos(
  photos: Photo[],
  random = Math.random,
): Photo[] {
  return shuffleItems(photos, random).slice(0, LANDING_PHOTO_LIMIT);
}

/**
 * Calculates how many empty cells the landing grid needs to stay 2x2.
 *
 * @param visiblePhotoCount Number of rendered photos.
 * @returns Placeholder cell count needed to fill the grid.
 */
export function getLandingPhotoPlaceholderCount(
  visiblePhotoCount: number,
): number {
  return Math.max(0, LANDING_PHOTO_LIMIT - visiblePhotoCount);
}
