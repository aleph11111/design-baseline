import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// ---------------------------------------------------------------------------
// Unit test config for `src/` primitives. Separate from `vite.config.ts`,
// which is scoped to the donor-dev gallery build (root: "gallery") — see
// STYLE.md, "Donor file scope". This config is repo-root scoped so tests can
// live alongside the primitives they cover under `src/`.
//
// The `test` script passes `--configLoader runner`. Vite's default `bundle`
// loader hands this file to esbuild, and esbuild parses the `package.json` of
// EVERY ancestor directory — not just the nearest one — so a run from inside
// `.worktrees/<slug>` reads the main checkout's `package.json` two levels up.
// When a concurrent session leaves that file mid-merge, this run dies with
// `Expected string in JSON but found "<<"`. No `root`/workspace option stops
// the climb; `runner` skips esbuild entirely. Same flag on the gallery scripts.
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // jsdom is the default because nearly every suite renders. The few
    // DOM-free files opt out per-file with a `// @vitest-environment node`
    // docblock rather than being carved out here by glob — the docblock sits
    // next to the code that justifies it, so it can't drift as files move.
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
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
    // Left on the default `forks` pool deliberately. `threads` measured faster
    // idle (30 files: ~10.5s environment / ~4.9s wall vs ~11.7s / ~5.4s), but
    // the advantage inverts under the saturated-CPU condition this repo
    // actually runs in — with every core busy, threads measured ~26.9s
    // environment / ~12.5s wall against forks' ~24.1s / ~11.2s. The idle win
    // is not the case worth optimising for; don't re-adopt it on an idle
    // benchmark alone.
  },
});
