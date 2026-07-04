import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Files that import `bun:sqlite` transitively cannot run under Vitest
    // (esbuild's Node bundler rejects the `bun:` URI scheme). They run
    // via `bun test` — the `test` script chains both runners.
    exclude: ["tests/migrate.test.ts", "tests/cross_scope.test.ts", "tests/memories_repo.test.ts", "tests/memory_service.test.ts", "tests/tools_memory.test.ts"],
    globals: false,
  },
});
