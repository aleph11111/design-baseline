import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// ---------------------------------------------------------------------------
// Unit test config for `src/` primitives. Separate from `vite.config.ts`,
// which is scoped to the donor-dev gallery build (root: "gallery") — see
// STYLE.md, "Donor file scope". This config is repo-root scoped so tests can
// live alongside the primitives they cover under `src/`.
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // Vitest's 5s default is not enough here. The donor runs several parallel
    // `/feat` worktrees on one machine, and this suite's cost is jsdom setup
    // and module import, not assertions — a 67-test run reports ~186s in
    // `environment` and ~125s in `import` against ~61s of actual `tests`.
    // Under the default, a load-dependent subset of files (up to 9 of 21)
    // failed with "Test timed out in 5000ms" on an untouched tree, which made
    // `npm test` unusable as the `/ship` gate. 30s clears it with margin.
    testTimeout: 30_000,
    // Cap workers on top of that timeout. Left uncapped, vitest spawns one
    // worker per core and the jsdom builds starve each other, so the fix above
    // buys headroom without removing the contention causing it. Measured on a
    // 21-file run: 7 failing files uncapped, 1 at `--maxWorkers=2`. Capping
    // also cut wall-clock from ~49s to ~4s, since the workers stop thrashing.
    maxWorkers: 4,
  },
});
