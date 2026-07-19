---
area: tooling
opened: 2026-07-19
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T21:10:00Z
---

# npm test fails non-deterministically with 5000ms timeouts under the full suite

## Context

`npm test` does not pass cleanly on `origin/main`. Across three consecutive full-suite runs on the same tree, between 4 and 6 test files failed, and **the failing set differed every run** — observed victims include `src/components/ui/segmented-control.test.tsx`, `src/components/layout/BottomNav.test.tsx`, `src/components/layout/ThemeToggle.test.tsx`, `src/components/archetypes/crud-dialog/CrudDialogFooter.test.tsx`, `src/components/archetypes/form-page/FormPageActions.test.tsx`, `src/components/archetypes/list-with-detail/ListWithDetailShell.test.tsx`, `src/components/archetypes/matrix-grid/MatrixGridShell.test.tsx`, and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx`. Every failure is the same shape: `Error: Test timed out in 5000ms` on the first `render()` in the test, never an assertion failure.

The vitest run summary points at environment setup, not test logic — a 20-file run reported `Duration 49.16s (transform 27.94s, import 126.72s, tests 78.84s, environment 286.81s)`. `environment` (jsdom construction) dominates by a wide margin, and the aggregate far exceeds wall-clock, meaning many jsdom environments are being built concurrently and starving each other. `vitest.config.ts` sets `environment: "jsdom"` globally with no `testTimeout`, no `pool` tuning, and no `maxWorkers` cap, so vitest defaults to one worker per core and every file pays full jsdom construction.

This is pre-existing and unrelated to any feature branch: a baseline run with the working tree's new test file removed still produced `Test Files 4 failed | 16 passed (20)`. Because the failures move between runs, CI on any PR can go red for reasons that have nothing to do with the diff, and `/ship`'s green-CI auto-merge gate becomes unreliable.

## What to do

- [ ] Reproduce and confirm the contention hypothesis: run `npx vitest run` with `--no-file-parallelism` (or `--maxWorkers=2`) and check whether the timeouts disappear entirely. This distinguishes worker starvation from a genuinely slow render path.
- [ ] If contention is confirmed, cap concurrency in `vitest.config.ts` via `test.maxWorkers` (or `poolOptions.threads.maxThreads`) rather than raising `testTimeout` — a higher timeout hides starvation instead of fixing it.
- [ ] Raise `test.testTimeout` in `vitest.config.ts` above the 5000ms default only as a secondary measure, and only if capped concurrency alone still leaves headroom too thin on slower machines.
- [ ] ? If jsdom construction is the irreducible cost, evaluate `environment: "happy-dom"` — it constructs substantially faster than jsdom, but is a broad behavioral change across all 20+ suites and needs its own verification pass.

## Acceptance

- `npm test` run three times consecutively on a clean checkout of `origin/main` reports `0 failed` every time.
- No test in the suite fails with `Error: Test timed out in 5000ms`.
- The set of passing tests after the fix matches the set that passes today when files are run in isolation — no test is silently skipped or dropped to make the suite green.

## Related

- [test-gap-section-card-no-tests.md](wip/test-gap-section-card-no-tests.md) — the ticket during which this was observed; adding a 21st test file made the contention more visible.
- [test-gap-detail-overview-shell-no-tests.md](test-gap-detail-overview-shell-no-tests.md) — one of several open `test-gap` tickets that will each add a test file, worsening the contention until this is fixed.
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — the other open ticket against this repo's vite/vitest config.
