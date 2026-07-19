---
area: tooling
opened: 2026-07-19
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# vitest's default 5s testTimeout makes the donor suite flaky on a loaded machine

## Context

`vitest.config.ts` sets `environment: "jsdom"` and `include: ["src/**/*.test.{ts,tsx}"]` but leaves `test.testTimeout` at vitest's 5000ms default. On a machine running parallel `/feat` sessions, that default is not enough: `npm test` on an untouched checkout failed **9 of 21 test files** with `Error: Test timed out in 5000ms` — `src/components/layout/ThemeToggle.test.tsx` and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` among them. A repeat run failed a different subset (6 files), confirming the failures are load-dependent rather than deterministic.

The same suite passes completely — 21 files, 67 tests — under `npx vitest run --testTimeout=30000`. Nothing in the test bodies changed between the two runs, so the tests themselves are correct; only the budget is wrong.

The underlying cost is environment setup, not assertion work. Vitest's own summary for a 67-test run reports `environment 248s` / `import 143s` against `tests 88s` — jsdom construction and module import dominate, and both are exactly what contends when several sessions build at once. This was observed while implementing `test-gap-settings-page-shell-no-tests`, where the full-suite verification step failed on unrelated files.

This repo has no `.github/workflows/`, so the practical blast radius is the local gate: `/ship` runs `npm test` before pushing, and a spurious red there blocks or misdirects a ship that is actually green.

## What to do

- [ ] Raise `test.testTimeout` in `vitest.config.ts` to a value that survives a loaded machine (30000ms is the value empirically shown to pass the whole suite).
- [ ] ? Investigate whether the `environment 248s` / `import 143s` cost can be cut — e.g. by narrowing which suites need the full `jsdom` environment, or by sharing a jsdom instance across files rather than per-file construction.

## Acceptance

- `npm test` passes all 21 files / 67 tests on a machine running concurrent `/feat` sessions, with no `Test timed out in 5000ms` failures.
- `vitest.config.ts` declares an explicit `testTimeout` under `test`, so the budget is no longer an inherited default.
- Running `npm test` twice in a row returns the same result — no load-dependent variation in which files fail.

## Related

- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — the other `vitest.config.ts` / config-loading defect found under the same parallel-worktree conditions.
- [test-gap-settings-page-shell-no-tests.md](wip/test-gap-settings-page-shell-no-tests.md) — the ticket whose verification step surfaced this.
