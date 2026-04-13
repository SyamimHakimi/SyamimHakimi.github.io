/**
 * Global Vitest setup — runs before any test file is collected.
 *
 * Stubs out Firebase and Vue so their full SDKs are never loaded during
 * collection. The composable test files only exercise Zod schemas; they
 * never call Firebase or Vue APIs at runtime.
 */
import { vi } from "vitest";

// ── Firebase stub ──────────────────────────────────────────────────────────
// Composable files import from 'firebase/firestore' and 'firebase/app'.
// We replace them with no-op stubs so the real SDK is never parsed.

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn(),
}));

// ── Vue stub ───────────────────────────────────────────────────────────────
// Composable files import ref/onMounted/computed from 'vue'.
// None of these are *called* during Zod schema tests — composable functions
// are never invoked, only their exported schemas are tested.

vi.mock("vue", () => ({
  ref: vi.fn((v: unknown) => ({ value: v })),
  computed: vi.fn((fn: () => unknown) => ({ value: fn() })),
  readonly: vi.fn((v: unknown) => v),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  watch: vi.fn(),
  watchEffect: vi.fn(),
  reactive: vi.fn((v: unknown) => v),
  inject: vi.fn(),
  provide: vi.fn(),
  defineComponent: vi.fn((v: unknown) => v),
}));
