---
area: tooling
opened: 2026-07-19
status: ready
model: opus
model_reason: requires measuring real test cost and judging per-test timeout vs. global config change — not a mechanical edit
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T21:15:00Z
---

# Two donor tests flake by hitting vitest's 5s default timeout under a full run

## Context

`npx vitest run` over the whole donor suite intermittently fails tests in `src/components/ui/segmented-control.test.tsx` ("is a single tab stop: the group wraps focus, no radio starts tabbable") and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` ("checks row/header selection membership via a Set, not `Array#includes`"). Observed 2026-07-19 on the `feat/test-gap-page-header-no-tests` branch: two consecutive full runs with no code change between them failed 4 tests and then 2 tests respectively. The failures are `Error: Test timed out in 5000ms` — vitest's default `testTimeout` — not assertion failures, and both files pass when run alone (`npx vitest run <file>`). `vitest.config.ts` sets `environment: "jsdom"` and `include`, but leaves `testTimeout` and worker concurrency at their defaults, so every test file competes for cores during a full run. Both offending tests are the heaviest in the suite by design — the settings-table test builds 30 rows to assert `Set` membership beats `Array#includes`, and the segmented-control test walks a focus loop across the radiogroup. This makes `npm test` unreliable as a `/ship` gate and as CI signal: a green local run is not evidence, and a red one is not a real regression.

## What to do

- [ ] Measure the two tests' actual wall-clock cost in isolation (`npx vitest run <file>` reports per-test duration) to establish whether they are inherently near the 5s default or only slow under contention.
- [ ] Fix the flake at whichever level the measurement points to: an explicit per-test timeout argument on the two `it(...)` calls if they are genuinely long-running, or a raised global `testTimeout` / bounded worker concurrency in `vitest.config.ts` if contention is the cause.
- [ ] ? Consider whether the settings-table perf test should assert on an operation count rather than wall-clock behaviour, so it stops being timing-sensitive at all.

## Acceptance

- Five consecutive full `npx vitest run` invocations pass with zero failures, no code change between them.
- Neither `segmented-control.test.tsx` nor `SettingsTableShell.test.tsx` reports a `Test timed out` error under a full-suite run.
- If a timeout or concurrency value changed, `vitest.config.ts` carries a comment naming why — matching the file's existing convention of explaining its scope split from `vite.config.ts`.

## Related

- [archive/segmented-control-radio-keyboard.md](archive/segmented-control-radio-keyboard.md) — the ticket that added the flaking segmented-control keyboard test
- [archive/settings-table-selected-set-perf.md](archive/settings-table-selected-set-perf.md) — the ticket that added the flaking `Set`-membership perf test
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — sibling open ticket on vite/vitest config correctness in worktrees
