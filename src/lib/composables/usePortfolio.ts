import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore/lite";
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
    if (
      "toDate" in val &&
      typeof (val as { toDate: unknown }).toDate === "function"
    ) {
      return (val as { toDate(): Date }).toDate().toISOString();
    }
    if ("seconds" in val) {
      return new Date(
        (val as { seconds: number }).seconds * 1000,
      ).toISOString();
    }
  }
  return val;
}

/** Accepts either an ISO string or a Firestore Timestamp and returns an optional string. */
const dateField = z.preprocess(coerceDate, z.string().optional());

/**
 * Validates a document from `experience/{category}/item` subcollections
 * (categories: `platforms`, `protocols`, `ai`, `frameworks`, `languages`).
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
 * Validates a document from the `projects` collection.
 * `date-from` controls display order (newest first); `link` is an optional CTA URL.
 */
export const ProjectDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
  "date-from": dateField,
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
/** Validated personal project document. */
export type ProjectDocument = z.infer<typeof ProjectDocumentSchema>;
/** Validated tech stack item from a project's `techstack` subcollection. */
export type TechstackItem = z.infer<typeof TechstackItemSchema>;

/** A project document together with its ordered tech stack. */
export interface ProjectWithTechstack {
  project: ProjectDocument;
  techstack: TechstackItem[];
}

/** Aggregated return type for the `usePortfolio` composable. */
export interface PortfolioData {
  experience: {
    platforms: ExperienceItem[];
    protocols: ExperienceItem[];
    ai: ExperienceItem[];
    frameworks: ExperienceItem[];
    languages: ExperienceItem[];
  };
  projects: ProjectWithTechstack[];
}

// ── Composable ─────────────────────────────────────────────────────────────

/** Builds a Firestore query for one experience category, ordered by `date-from`. */
function experienceQuery(category: string) {
  return getDocs(
    query(collection(db, "experience", category, "item"), orderBy("date-from")),
  );
}

/**
 * Fetches all portfolio content in two parallel stages:
 * - Stage 1: all five experience categories + the full `projects` collection
 * - Stage 2: each project's `techstack` subcollection (in parallel)
 *
 * Projects are sorted newest-first by `date-from` (docs without that field sort last).
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
      ai: [],
      frameworks: [],
      languages: [],
    },
    projects: [],
  });
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      const [
        platformsSnap,
        protocolsSnap,
        aiSnap,
        frameworksSnap,
        languagesSnap,
        projectsSnap,
      ] = await Promise.all([
        experienceQuery("platforms"),
        experienceQuery("protocols"),
        experienceQuery("ai"),
        experienceQuery("frameworks"),
        experienceQuery("languages"),
        getDocs(collection(db, "projects")),
      ]);

      const projectDocs = projectsSnap.docs
        .map((d) => ProjectDocumentSchema.parse({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aDate = a["date-from"] ? new Date(a["date-from"]).getTime() : 0;
          const bDate = b["date-from"] ? new Date(b["date-from"]).getTime() : 0;
          return bDate - aDate;
        });

      const techstackSnaps = await Promise.all(
        projectDocs.map((p) =>
          getDocs(
            query(
              collection(db, "projects", p.id, "techstack"),
              orderBy("sorting"),
            ),
          ),
        ),
      );

      data.value = {
        experience: {
          platforms: platformsSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
          protocols: protocolsSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
          ai: aiSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
          frameworks: frameworksSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
          languages: languagesSnap.docs.map((d) =>
            ExperienceItemSchema.parse({ id: d.id, ...d.data() }),
          ),
        },
        projects: projectDocs.map((project, i) => ({
          project,
          techstack: techstackSnaps[i].docs.map((d) =>
            TechstackItemSchema.parse({ id: d.id, ...d.data() }),
          ),
        })),
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  return { data, loading, error };
}
