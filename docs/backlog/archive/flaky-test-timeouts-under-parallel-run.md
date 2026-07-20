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

`npx vitest run` over the whole donor suite fails a **different, non-deterministic subset** of tests on every invocation, always with `Error: Test timed out in 5000ms` — vitest's default `testTimeout` — never with an assertion failure. Four consecutive runs on 2026-07-19 (`feat/test-gap-page-header-no-tests`, no code change between them) failed 4, then 2, then 1, then 9 tests. At least 8 files are affected: `segmented-control`, `SettingsTableShell`, `BottomNav`, `ThemeToggle`, `FeedItem`, `FormPageActions`, `ListWithDetailShell`, and `MatrixGridShell`. Every one passes when its file is run alone. The failing set includes trivial tests (`ThemeToggle` "defaults to English strings" is a single render plus a `getByRole`), which rules out "these tests are genuinely slow" as the whole story — the suite is starving on worker contention. `segmented-control.test.tsx` additionally emits `The current testing environment is not configured to support act(...)` to stderr, suggesting `globals`/act-environment setup is also missing. `vitest.config.ts` sets `environment: "jsdom"` and `include`, but leaves `testTimeout` and worker concurrency at their defaults, so every test file competes for cores during a full run. Both offending tests are the heaviest in the suite by design — the settings-table test builds 30 rows to assert `Set` membership beats `Array#includes`, and the segmented-control test walks a focus loop across the radiogroup. This makes `npm test` unreliable as a `/ship` gate and as CI signal: a green local run is not evidence, and a red one is not a real regression.

## What to do

- [ ] Raise `testTimeout` and bound worker concurrency (`poolOptions`/`maxWorkers`) in `vitest.config.ts` so a full run stops starving on contention — the failing set spans trivial single-render tests, so this is the primary fix, not per-test timeouts.
- [ ] Add the missing act environment for `segmented-control.test.tsx`, which logs `The current testing environment is not configured to support act(...)` — set `globalThis.IS_REACT_ACT_ENVIRONMENT` via a `test.setupFiles` entry (`vitest.config.ts` currently declares no `setupFiles`).
- [ ] ? Consider whether the settings-table perf test should assert on an operation count rather than wall-clock behaviour, so it stops being timing-sensitive at all.

## Acceptance

- Five consecutive full `npx vitest run` invocations pass with zero failures, no code change between them.
- No test file reports a `Test timed out in 5000ms` error under a full-suite run.
- `npx vitest run src/components/ui/segmented-control.test.tsx` no longer prints `The current testing environment is not configured to support act(...)` to stderr.
- If a timeout or concurrency value changed, `vitest.config.ts` carries a comment naming why — matching the file's existing convention of explaining its scope split from `vite.config.ts`.

## Related

- [archive/segmented-control-radio-keyboard.md](archive/segmented-control-radio-keyboard.md) — the ticket that added the flaking segmented-control keyboard test
- [archive/settings-table-selected-set-perf.md](archive/settings-table-selected-set-perf.md) — the ticket that added the flaking `Set`-membership perf test
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — sibling open ticket on vite/vitest config correctness in worktrees
