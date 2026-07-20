---
area: tooling
opened: 2026-07-19
status: ready
model: sonnet
model_reason: mechanical config change plus a measurement pass; no design tradeoffs
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T23:30:00Z
---

# Vitest default 5s testTimeout makes the donor suite flaky under parallel-worktree load

## Context

`vitest.config.ts` declares `environment: "jsdom"` and an `include` glob but no
`testTimeout`, so the suite runs on vitest's 5000ms default. On a machine running
several `/feat` worktrees concurrently that default is not enough for this
repo's React Testing Library render tests: a run during the
`tokenize-semantic-color` feature reported `transform 70.45s` /
`environment 415.53s` and failed 6 of 61 tests — including
`src/components/archetypes/settings-table/SettingsTableShell.test.tsx`'s
selection-membership test — every one of them with
`Error: Test timed out in 5000ms`, not an assertion failure. An immediate re-run
with `npx vitest run --testTimeout=30000` was fully green at 61/61.

The failure mode is load-dependent, so it is worse precisely when the
parallel-safe workflow is being used as intended. It undermines `npm test` as a
`/ship` gate in both directions: a green-on-retry red run trains the operator to
re-run rather than investigate, which is exactly how a genuine regression gets
waved through.

## What to do

- [ ] Set an explicit `testTimeout` in `vitest.config.ts`'s `test` block (the
      file currently declares only `environment` and `include`, so the default
      applies) — 20–30s, sized to absorb contention rather than to mask a slow
      test.
- [ ] Re-run the full suite under deliberate load (several worktrees building at
      once) to confirm the new value actually holds.
- [ ] ? Investigate whether the RTL render tests are individually slow or merely
      starved — if a single test genuinely needs seconds of CPU, raising the
      global ceiling hides that and a per-test `{ timeout }` would be the
      narrower fix.

## Acceptance

- `npm test` passes 61/61 with no timeout failures when run concurrently with at
  least one other worktree build.
- No test fails with `Test timed out in <N>ms` where the same test passes on a
  re-run — timeouts, when they occur, are reproducible rather than load-dependent.
- `vitest.config.ts` names its timeout explicitly rather than inheriting the
  default.

## Related

- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — the
  other open `area: tooling` ticket against this repo's vite/vitest config.
- The ten open `test-gap-*` tickets add new tests to this same suite; each one
  lands more RTL renders under the same 5s ceiling.
