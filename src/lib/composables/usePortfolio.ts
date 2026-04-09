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

export const ExperienceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  link: z.string().optional(),
  "img-src": z.string().optional(),
  "date-from": z.string().optional(),
  "date-to": z.string().optional(),
});

export const ProjectDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
});

export const TechstackItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  link: z.string().optional(),
  "img-src": z.string().optional(),
  sorting: z.number(),
});

// ── Types ──────────────────────────────────────────────────────────────────

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type ProjectDocument = z.infer<typeof ProjectDocumentSchema>;
export type TechstackItem = z.infer<typeof TechstackItemSchema>;

export interface PortfolioData {
  experience: {
    platforms: ExperienceItem[];
    protocols: ExperienceItem[];
    frameworks: ExperienceItem[];
    languages: ExperienceItem[];
  };
  project: ProjectDocument | null;
  techstack: TechstackItem[];
}

// ── Composable ─────────────────────────────────────────────────────────────

const PROJECT_DOC_ID = "XYdqe9OyXNSUEzZ8kqwn";

function experienceQuery(category: string) {
  return getDocs(
    query(
      collection(db, "experience", category, "item"),
      orderBy("date-from"),
    ),
  );
}

export function usePortfolio() {
  const data = ref<PortfolioData>({
    experience: {
      platforms: [],
      protocols: [],
      frameworks: [],
      languages: [],
    },
    project: null,
    techstack: [],
  });
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      const [
        platformsSnap,
        protocolsSnap,
        frameworksSnap,
        languagesSnap,
        projectSnap,
        techstackSnap,
      ] = await Promise.all([
        experienceQuery("platforms"),
        experienceQuery("protocols"),
        experienceQuery("frameworks"),
        experienceQuery("languages"),
        getDoc(doc(db, "projects", PROJECT_DOC_ID)),
        getDocs(
          query(
            collection(db, "projects", PROJECT_DOC_ID, "techstack"),
            orderBy("sorting"),
          ),
        ),
      ]);

      data.value = {
        experience: {
          platforms: platformsSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
          protocols: protocolsSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
          frameworks: frameworksSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
          languages: languagesSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
        },
        project: projectSnap.exists()
          ? ProjectDocumentSchema.parse({
              id: projectSnap.id,
              ...projectSnap.data(),
            })
          : null,
        techstack: techstackSnap.docs.map((d) =>
          TechstackItemSchema.parse({ id: d.id, ...d.data() }),
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
