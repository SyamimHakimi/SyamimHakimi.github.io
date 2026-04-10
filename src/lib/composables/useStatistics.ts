import { ref, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { z } from "zod";
import { db } from "../firebase";

// ── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates the `statistics/stats` document — aggregate photography counters.
 * `favourite_photo_lens` is the most-used lens, optional if not yet computed.
 */
export const StatsSchema = z.object({
  id: z.string(),
  total_outings: z.number(),
  total_photos: z.number(),
  total_fav_photos: z.number(),
  favourite_photo_lens: z.string().optional(),
});

/** Month-keyed count maps (keys like "11/2024") — accept any string→number pairs. */
export const MonthlyCountMapSchema = z.record(z.string(), z.number());

/** Validates `statistics/focal-stats` — focal length → count (or label) map. */
export const FocalStatsSchema = z.record(
  z.string(),
  z.union([z.number(), z.string()]),
);

/** Validates `statistics/lens_stats` — lens name → count (or label) map. */
export const LensStatsSchema = z.record(
  z.string(),
  z.union([z.number(), z.string()]),
);

/** Validates `statistics/recipe-stats` — film simulation recipe → count (or label) map. */
export const RecipeStatsSchema = z.record(
  z.string(),
  z.union([z.number(), z.string()]),
);

/** Validates `statistics/theme-stats` — shoot theme → count (or label) map. */
export const ThemeStatsSchema = z.record(
  z.string(),
  z.union([z.number(), z.string()]),
);

/** Aggregates all statistics sub-documents into a single validated object. */
export const StatisticsSchema = z.object({
  stats: StatsSchema,
  photoStats: MonthlyCountMapSchema,
  favPhotoStats: MonthlyCountMapSchema,
  focalStats: FocalStatsSchema,
  lensStats: LensStatsSchema,
  recipeStats: RecipeStatsSchema,
  themeStats: ThemeStatsSchema,
});

// ── Types ──────────────────────────────────────────────────────────────────

/** Validated aggregate statistics counters. */
export type Stats = z.infer<typeof StatsSchema>;
/** Validated full statistics payload returned by `useStatistics`. */
export type Statistics = z.infer<typeof StatisticsSchema>;

// ── Composable ─────────────────────────────────────────────────────────────

/**
 * Fetches all photography statistics in a single parallel batch from the
 * `statistics` Firestore collection:
 * - `stats` — aggregate counters (total photos, outings, favourites)
 * - `photo-stats` / `fav-photo-stats` — monthly photo counts (keys like "11/2024")
 * - `focal-stats` / `lens_stats` / `recipe-stats` / `theme-stats` — distribution maps
 *
 * All payloads are validated through their Zod schemas before reaching the UI.
 *
 * @returns `statistics` — reactive `Statistics | null` (null until the fetch completes);
 *          `loading` — true while the fetch batch is in flight;
 *          `error` — error message string on failure, otherwise null.
 */
export function useStatistics() {
  const statistics = ref<Statistics | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      const [
        statsSnap,
        photoStatsSnap,
        favPhotoStatsSnap,
        focalStatsSnap,
        lensStatsSnap,
        recipeStatsSnap,
        themeStatsSnap,
      ] = await Promise.all([
        getDoc(doc(db, "statistics", "stats")),
        getDoc(doc(db, "statistics", "photo-stats")),
        getDoc(doc(db, "statistics", "fav-photo-stats")),
        getDoc(doc(db, "statistics", "focal-stats")),
        getDoc(doc(db, "statistics", "lens_stats")),
        getDoc(doc(db, "statistics", "recipe-stats")),
        getDoc(doc(db, "statistics", "theme-stats")),
      ]);

      statistics.value = StatisticsSchema.parse({
        stats: StatsSchema.parse({ id: statsSnap.id, ...statsSnap.data() }),
        photoStats: photoStatsSnap.data() ?? {},
        favPhotoStats: favPhotoStatsSnap.data() ?? {},
        focalStats: focalStatsSnap.data() ?? {},
        lensStats: lensStatsSnap.data() ?? {},
        recipeStats: recipeStatsSnap.data() ?? {},
        themeStats: themeStatsSnap.data() ?? {},
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  return { statistics, loading, error };
}
