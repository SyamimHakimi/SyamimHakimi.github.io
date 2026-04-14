import { ref, onMounted } from "vue";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore/lite";
import { z } from "zod";
import { db } from "../firebase";

// ── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates the singleton profile document (`profile/ddIhV8IxV5DjciJY7UxW`).
 * Required: `Name`. Optional: `Country`, `Residing Country`, `Hobbies`.
 */
export const ProfileSchema = z.object({
  id: z.string(),
  Name: z.string(),
  Country: z.string().optional(),
  "Residing Country": z.string().optional(),
  Hobbies: z.string().optional(),
});

/**
 * Validates a document from the `photography-gears` collection.
 * `type` is a numeric category key (e.g. 1 = camera body, 2 = lens).
 * `link` and `img-src` are optional external URL and image path.
 */
export const PhotographyGearSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  type: z.number(),
  link: z.string().optional(),
  "img-src": z.string().optional(),
});

/**
 * Validates a document from the `favourite-boardgames` collection.
 * `score` is a numeric rating (e.g. 9.5). `tags` is a free-form category string.
 */
export const BoardgameSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  link: z.string().optional(),
  tags: z.string().optional(),
});

/**
 * Validates a document from the `social-media` collection.
 * `icon` is a CSS class string (e.g. Bootstrap Icons class).
 * `sorting` controls display order.
 */
export const SocialMediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string(),
  link: z.string(),
  icon: z.string(),
  sorting: z.number(),
});

// ── Types ──────────────────────────────────────────────────────────────────

/** Validated profile singleton. */
export type Profile = z.infer<typeof ProfileSchema>;
/** Validated photography gear item. */
export type PhotographyGear = z.infer<typeof PhotographyGearSchema>;
/** Validated favourite boardgame entry. */
export type Boardgame = z.infer<typeof BoardgameSchema>;
/** Validated social media link. */
export type SocialMedia = z.infer<typeof SocialMediaSchema>;

/** Aggregated return type for the `useAboutMe` composable. */
export interface AboutMeData {
  profile: Profile | null;
  gear: PhotographyGear[];
  boardgames: Boardgame[];
  socialMedia: SocialMedia[];
}

// ── Composable ─────────────────────────────────────────────────────────────

/**
 * Fetches all About Me content in a single parallel batch:
 * - `profile/ddIhV8IxV5DjciJY7UxW` — singleton profile document
 * - `photography-gears` — ordered by `type`
 * - `favourite-boardgames` — ordered by `score` descending
 * - `social-media` — ordered by `sorting`
 *
 * All payloads are validated through their Zod schemas before reaching the UI.
 *
 * @returns `data` — reactive `AboutMeData` object;
 *          `loading` — true while the fetch batch is in flight;
 *          `error` — error message string on failure, otherwise null.
 */
export function useAboutMe() {
  const data = ref<AboutMeData>({
    profile: null,
    gear: [],
    boardgames: [],
    socialMedia: [],
  });
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      const [profileSnap, gearSnap, boardgamesSnap, socialSnap] =
        await Promise.all([
          getDoc(doc(db, "profile", "ddIhV8IxV5DjciJY7UxW")),
          getDocs(query(collection(db, "photography-gears"), orderBy("type"))),
          getDocs(
            query(
              collection(db, "favourite-boardgames"),
              orderBy("score", "desc"),
            ),
          ),
          getDocs(query(collection(db, "social-media"), orderBy("sorting"))),
        ]);

      data.value = {
        profile: profileSnap.exists()
          ? ProfileSchema.parse({ id: profileSnap.id, ...profileSnap.data() })
          : null,
        gear: gearSnap.docs.map((d) =>
          PhotographyGearSchema.parse({ id: d.id, ...d.data() }),
        ),
        boardgames: boardgamesSnap.docs.map((d) =>
          BoardgameSchema.parse({ id: d.id, ...d.data() }),
        ),
        socialMedia: socialSnap.docs.map((d) =>
          SocialMediaSchema.parse({ id: d.id, ...d.data() }),
        ),
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  return { data, loading, error };
}
