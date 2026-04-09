import { ref, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { z } from "zod";
import { db } from "../firebase";

// ── Schemas ────────────────────────────────────────────────────────────────

export const StatsSchema = z.object({
  id: z.string(),
  total_outings: z.number(),
  total_photos: z.number(),
  total_fav_photos: z.number(),
  favourite_photo_lens: z.string().optional(),
});

// Month-keyed count maps (keys like "11/2024") — accept any string→number pairs.
export const MonthlyCountMapSchema = z.record(z.string(), z.number());

export const FocalStatsSchema = z.record(z.string(), z.union([z.number(), z.string()]));

export const LensStatsSchema = z.record(z.string(), z.union([z.number(), z.string()]));

export const RecipeStatsSchema = z.record(z.string(), z.union([z.number(), z.string()]));

export const ThemeStatsSchema = z.record(z.string(), z.union([z.number(), z.string()]));

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

export type Stats = z.infer<typeof StatsSchema>;
export type Statistics = z.infer<typeof StatisticsSchema>;

// ── Composable ─────────────────────────────────────────────────────────────

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
