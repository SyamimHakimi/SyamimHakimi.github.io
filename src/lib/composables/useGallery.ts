import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { z } from "zod";
import { db } from "../firebase";

// ── Schema ─────────────────────────────────────────────────────────────────

export const PhotoSchema = z.object({
  id: z.string(),
  date: z.string(),
  theme: z.string().optional(),
  lens: z.string().optional(),
  focal_length: z.number().optional(),
  recipe: z.string().optional(),
  title: z.string().optional(),
  link: z.string().optional(),
  favourite: z.boolean().optional(),
});

// ── Type ───────────────────────────────────────────────────────────────────

export type Photo = z.infer<typeof PhotoSchema>;

// ── Composable ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

export function useGallery() {
  const photos = ref<Photo[]>([]);
  const loading = ref(true);
  const loadingMore = ref(false);
  const hasMore = ref(true);
  const error = ref<string | null>(null);

  let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

  async function fetchPage(after?: QueryDocumentSnapshot<DocumentData>) {
    const constraints = [orderBy("date", "desc"), limit(PAGE_SIZE)] as const;
    const q = after
      ? query(collection(db, "photos"), ...constraints, startAfter(after))
      : query(collection(db, "photos"), ...constraints);

    const snap = await getDocs(q);
    const fetched = snap.docs.map((d) =>
      PhotoSchema.parse({ id: d.id, ...d.data() }),
    );

    if (snap.docs.length > 0) {
      lastDoc = snap.docs[snap.docs.length - 1];
    }
    hasMore.value = snap.docs.length === PAGE_SIZE;
    return fetched;
  }

  onMounted(async () => {
    try {
      photos.value = await fetchPage();
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  });

  async function loadMore() {
    if (!hasMore.value || loadingMore.value || !lastDoc) return;

    loadingMore.value = true;
    try {
      const more = await fetchPage(lastDoc);
      photos.value.push(...more);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loadingMore.value = false;
    }
  }

  return { photos, loading, loadingMore, hasMore, error, loadMore };
}
