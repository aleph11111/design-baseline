---
area: tooling
opened: 2026-07-19
status: done
model: sonnet
model_reason: narrow a spy's scope and/or raise a config timeout — mechanical, with a reproducible acceptance check
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T23:20:00Z
---

# Full-suite npm test flakes with 5s timeouts on SettingsTableShell and ThemeToggle

## Context

`npm test` (vitest run, 21 files) intermittently fails with `Test timed out in 5000ms`, most reliably on `src/components/archetypes/settings-table/SettingsTableShell.test.tsx:24` ("checks row/header selection membership via a Set") and sometimes on `src/components/layout/ThemeToggle.test.tsx:11`. Both pass in isolation — `npx vitest run <file>` is green every time — so this is a parallel-worker-load artifact, not a component regression. Observed run-to-run: 1 failure, then 5, then 2, from identical source.

The prime suspect is the SettingsTableShell test's global prototype spies: it calls `vi.spyOn(Array.prototype, "includes")` and `vi.spyOn(Set.prototype, "has")` (`:28–29`) *before* `render()`, which instruments two of the hottest methods in React's own render path for the duration of the render. That single `it` block reports 18–21s of self-time against a 30-row table, against vitest's default 5s `testTimeout` — it is already an order of magnitude over budget, so any extra scheduling pressure from sibling workers tips it over. `vitest.config.ts` sets no `testTimeout` and no pool/concurrency options, so both defaults apply as-is.

## What to do

- [ ] Narrow the spies in `SettingsTableShell.test.tsx` so React's render path is not instrumented — e.g. install `vi.spyOn(Array.prototype, "includes")` / `Set.prototype.has` only around the assertion-relevant work, or assert membership behaviour on an extracted `isSelected` helper instead of via global prototype patching (the test's own comment at `:42–45` already notes the spy catches React's internal `includes` calls).
- [ ] If timings still sit near the limit after that, set an explicit `test.testTimeout` in `vitest.config.ts` rather than leaving the 5s default implicit.
- [ ] ? Consider capping worker concurrency (`test.poolOptions.threads.maxThreads`) if wall-clock contention, not the spies, turns out to dominate.

## Acceptance

- `npm test` passes on three consecutive full-suite runs with no `Test timed out in 5000ms` failures.
- The SettingsTableShell selection test reports single-digit-second self-time, no longer 18–21s.
- The test still fails when `SettingsTableShell` reverts to scanning `selectedIds` with `Array#includes` — i.e. narrowing the spy does not weaken the original assertion.

## Related

- [archive/settings-table-selected-set-perf.md](archive/settings-table-selected-set-perf.md) — the shipped ticket that introduced this test and the repo's vitest harness
- [test-gap-logger-zero-tests.md](test-gap-logger-zero-tests.md) — sibling test-harness ticket
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — sibling vite/vitest config ticket

## 2026-07-20 — superseded

Consolidated into [vitest-default-timeout-flaky-suite.md](vitest-default-timeout-flaky-suite.md),
which now carries this ticket's diagnosis and evidence. Archived as a duplicate
report of one symptom, not as resolved work — the underlying flakiness is still open
there.
