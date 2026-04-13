import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.vue"],
    setupFiles: ["src/__tests__/setup.ts"],
    // threads pool: lighter startup than forks (shared process, no child process spawn)
    pool: "threads",
    poolOptions: {
      threads: {
        // 6 test files — cap workers to avoid over-spawning on small suite
        maxThreads: 4,
        minThreads: 1,
      },
    },
  },
});
