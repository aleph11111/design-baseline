---
area: tooling
opened: 2026-07-20
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T00:00:00Z
---

# jsdom environment setup and module import dominate the donor vitest run

## Context

`vitest.config.ts` applies `environment: "jsdom"` globally to everything matching `src/**/*.test.{ts,tsx}`. For a 67-test run across 21 files, vitest's own summary attributes roughly 186s to `environment` and 125s to `import` against roughly 61s of actual `tests` — setup and module loading cost several times what the assertions do.

The cost is strongly load-dependent rather than constant: the same suite completes in about 3.4s wall-clock on an unloaded machine, but stretches out badly when several parallel `/feat` worktrees are building at once, which is this repo's normal working mode. That variance is what produced [vitest-default-timeout-flaky-suite.md](archive/vitest-default-timeout-flaky-suite.md) — under the old 5s default, a load-dependent subset of up to 9 of 21 files failed with `Test timed out in 5000ms`. Raising `testTimeout` to 30s fixed the false failures, but it made the gate honest rather than making the suite fast; the underlying setup cost is untouched.

There is concrete headroom. Two test files exercise pure logic and reference neither `@testing-library/react` nor `document`: `src/components/archetypes/shared/resolveListState.test.ts` and `src/components/archetypes/shared/interactiveRow.test.ts`. Both currently pay for a jsdom environment they never use. Vitest supports per-file environment selection via a `// @vitest-environment node` docblock, so narrowing is available without restructuring the config.

## What to do

- [ ] Measure the baseline properly before changing anything: record `environment` / `import` / `tests` timings from `npx vitest run` on both an idle and a loaded machine, so any improvement is attributable.
- [ ] Move the two DOM-free suites (`resolveListState.test.ts`, `interactiveRow.test.ts`) to the `node` environment via a `// @vitest-environment node` docblock, and re-measure.
- [ ] ? Investigate whether the remaining jsdom files can share an environment instance rather than constructing one per file — check what vitest's `isolate` / `pool` options make possible without breaking test isolation.
- [ ] ? Check whether the ~125s `import` figure points at a specific heavy dependency barrel (e.g. a re-export hub under `src/components/ui/`) that individual tests pull in transitively.

## Acceptance

- `resolveListState.test.ts` and `interactiveRow.test.ts` run under the `node` environment and still pass — no jsdom globals are required by either.
- The `environment` figure reported by `npx vitest run` is measurably lower than the recorded baseline on a comparable machine.
- `npm test` continues to pass all 21 files / 67 tests after any environment or pool change — isolation is not traded away for speed.

## Related

- [vitest-default-timeout-flaky-suite.md](archive/vitest-default-timeout-flaky-suite.md) — the flake this cost caused; fixed by raising `testTimeout`, which is why the performance question survives as its own ticket.
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — the other `vitest.config.ts` defect surfaced under parallel-worktree conditions.
