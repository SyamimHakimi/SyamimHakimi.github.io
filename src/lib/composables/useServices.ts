import { ref, onMounted } from "vue";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { z } from "zod";
import { db } from "../firebase";

// ── Schema ─────────────────────────────────────────────────────────────────

export const ServiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  group: z.number(),
  sorting: z.number(),
});

// ── Type ───────────────────────────────────────────────────────────────────

export type Service = z.infer<typeof ServiceSchema>;

// ── Composable ─────────────────────────────────────────────────────────────

export function useServices() {
  const services = ref<Service[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "services"), orderBy("sorting")),
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
