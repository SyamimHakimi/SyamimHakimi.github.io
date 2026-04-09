import { ref, onMounted } from "vue";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { z } from "zod";
import { db } from "../firebase";

// ── Schemas ────────────────────────────────────────────────────────────────

export const ProfileSchema = z.object({
  id: z.string(),
  Name: z.string(),
  Country: z.string().optional(),
  "Residing Country": z.string().optional(),
  Hobbies: z.string().optional(),
});

export const PhotographyGearSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  type: z.number(),
  link: z.string().optional(),
  "img-src": z.string().optional(),
});

export const BoardgameSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  link: z.string().optional(),
  tags: z.string().optional(),
});

export const SocialMediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string(),
  link: z.string(),
  icon: z.string(),
  sorting: z.number(),
});

// ── Types ──────────────────────────────────────────────────────────────────

export type Profile = z.infer<typeof ProfileSchema>;
export type PhotographyGear = z.infer<typeof PhotographyGearSchema>;
export type Boardgame = z.infer<typeof BoardgameSchema>;
export type SocialMedia = z.infer<typeof SocialMediaSchema>;

export interface AboutMeData {
  profile: Profile | null;
  gear: PhotographyGear[];
  boardgames: Boardgame[];
  socialMedia: SocialMedia[];
}

// ── Composable ─────────────────────────────────────────────────────────────

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
            query(collection(db, "favourite-boardgames"), orderBy("score", "desc")),
          ),
          getDocs(
            query(collection(db, "social-media"), orderBy("sorting")),
          ),
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
