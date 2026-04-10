import { ref, onMounted } from "vue";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { z } from "zod";
import { db } from "../firebase";

// ── Schema ─────────────────────────────────────────────────────────────────

/**
 * Validates a document from the `services` Firestore collection.
 * Fields: `title` (string), `description` (string), `icon` (CSS class string),
 * `group` (number — section bucket), `sorting` (number — display order within group).
 */
export const ServiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  group: z.number(),
  sorting: z.number(),
});

// ── Type ───────────────────────────────────────────────────────────────────

/** A validated service offering from Firestore. */
export type Service = z.infer<typeof ServiceSchema>;

// ── Composable ─────────────────────────────────────────────────────────────

/**
 * Fetches all service offerings from the `services` Firestore collection.
 * Documents are ordered by `group` then `sorting` so they arrive pre-sorted
 * for direct rendering — no client-side re-sort needed.
 *
 * @returns `services` — reactive array of validated `Service` objects;
 *          `loading` — true while the initial fetch is in flight;
 *          `error` — error message string if the fetch failed, otherwise null.
 */
export function useServices() {
  const services = ref<Service[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      // Primary sort: group (section order), secondary: sorting (card order within group).
      const snap = await getDocs(
        query(collection(db, "services"), orderBy("group"), orderBy("sorting")),
      );
      services.value = snap.docs.map((d) =>
        ServiceSchema.parse({ id: d.id, ...d.data() }),
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  return { services, loading, error };
}
