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

/**
 * Coerces a Firestore Timestamp object to an ISO 8601 string.
 * Firestore Timestamps arrive as objects with either a `toDate()` method
 * (Timestamp class instance) or a plain `{ seconds, nanoseconds }` shape.
 * Strings and nullish values pass through unchanged.
 */
function coerceDate(val: unknown): unknown {
  if (val == null || typeof val === "string") return val;
  if (typeof val === "object") {
    if ("toDate" in val && typeof (val as { toDate: unknown }).toDate === "function") {
      return (val as { toDate(): Date }).toDate().toISOString();
    }
    if ("seconds" in val) {
      return new Date((val as { seconds: number }).seconds * 1000).toISOString();
    }
  }
  return val;
}

/** Accepts either an ISO string or a Firestore Timestamp and returns an optional string. */
const dateField = z.preprocess(coerceDate, z.string().optional());

/**
 * Validates a document from `experience/{category}/item` subcollections
 * (categories: `platforms`, `protocols`, `frameworks`, `languages`).
 * `date-from` / `date-to` accept both plain ISO strings and Firestore Timestamps.
 */
export const ExperienceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  link: z.string().optional(),
  "img-src": z.string().optional(),
  "date-from": dateField,
  "date-to": dateField,
});

/**
 * Validates the singleton project document (`projects/XYdqe9OyXNSUEzZ8kqwn`).
 * `subtitle` and `description` are optional display fields.
 */
export const ProjectDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Validates a document from the `techstack` subcollection under the project document.
 * `sorting` controls display order.
 */
export const TechstackItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  link: z.string().optional(),
  "img-src": z.string().optional(),
  sorting: z.number(),
});

// ── Types ──────────────────────────────────────────────────────────────────

/** Validated experience item (platform, protocol, framework, or language). */
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
/** Validated personal project singleton document. */
export type ProjectDocument = z.infer<typeof ProjectDocumentSchema>;
/** Validated tech stack item from the project's `techstack` subcollection. */
export type TechstackItem = z.infer<typeof TechstackItemSchema>;

/** Aggregated return type for the `usePortfolio` composable. */
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

/** Builds a Firestore query for one experience category, ordered by `date-from`. */
function experienceQuery(category: string) {
  return getDocs(
    query(collection(db, "experience", category, "item"), orderBy("date-from")),
  );
}

/**
 * Fetches all portfolio content in a single parallel batch:
 * - `experience/{platforms,protocols,frameworks,languages}/item` — ordered by `date-from`
 * - `projects/XYdqe9OyXNSUEzZ8kqwn` — singleton personal project document
 * - `projects/{id}/techstack` — ordered by `sorting`
 *
 * All payloads are validated through their Zod schemas before reaching the UI.
 *
 * @returns `data` — reactive `PortfolioData` object;
 *          `loading` — true while the fetch batch is in flight;
 *          `error` — error message string on failure, otherwise null.
 */
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
