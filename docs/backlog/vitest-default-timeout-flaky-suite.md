---
area: tooling
opened: 2026-07-19
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T09:40:00Z
---

# Vitest's 5s default timeout makes the suite flaky under parallel workers

## Context

A full `npm test` run (vitest 4, config at `vitest.config.ts`) intermittently fails two tests — `src/components/ui/segmented-control.test.tsx` ("is a single tab stop: the group wraps focus, no radio starts tabbable") and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` ("checks row/header selection membership via a Set, not Array#includes") — with `Error: Test timed out in 5000ms`. Both pass when their file is run in isolation, so this is load-dependent flakiness, not a real regression.

The cause is the interaction of two things: `vitest.config.ts` sets no `test.testTimeout`, so vitest's 5000ms default applies; and Testing Library's `*ByRole` queries are extremely slow under jsdom in this repo — individual role-querying tests were measured at 5–8s while the rest of the run took only milliseconds. Under parallel workers the machine contention pushes those role queries past the 5s line. Since every future PR runs the full suite, this makes CI red/green results untrustworthy repo-wide.

### Consolidated evidence (three tickets merged in, 2026-07-20)

This ticket absorbs `test-suite-prototype-spy-timeout-flake`, `flaky-test-timeouts-under-parallel-run`, and `vitest-default-timeout-flaky-under-load` — four independent captures of one symptom. They are kept as **three distinct contributing causes**, not one; a fix that addresses only one will leave the suite flaky.

1. **Global prototype spies instrument React's render path.** `SettingsTableShell.test.tsx:28–29` installs `vi.spyOn(Array.prototype, "includes")` and `vi.spyOn(Set.prototype, "has")` *before* `render()`, instrumenting two of the hottest methods in React's own render loop. That single `it` block reports **18–21s** of self-time against a 30-row table — already 4× over budget before any contention.
2. **Slow `*ByRole` queries under jsdom** — 5–8s per role-querying test (the original diagnosis above).
3. **Worker contention with no concurrency bound**, plus a **missing act environment**. The failing set includes trivial tests (`ThemeToggle` "defaults to English strings" is one render plus a `getByRole`), which rules out "these tests are genuinely slow" as the whole story. `segmented-control.test.tsx` also emits `The current testing environment is not configured to support act(...)`; `vitest.config.ts` declares no `setupFiles`, so `globalThis.IS_REACT_ACT_ENVIRONMENT` is never set.

**Non-determinism, same source, no code change between runs:** four consecutive runs failed 4 → 2 → 1 → 9 tests; another sequence 1 → 5 → 2. At least 8 files affected: `segmented-control`, `SettingsTableShell`, `BottomNav`, `ThemeToggle`, `FeedItem`, `FormPageActions`, `ListWithDetailShell`, `MatrixGridShell`.

**Load-dependence is measured, not inferred:** under parallel-worktree load a run reported `transform 70.45s` / `environment 415.53s` and failed 6/61 — every failure a 5000ms timeout, none an assertion. Re-running with `--testTimeout=30000` gave 61/61. The same suite on an idle machine completes in **2.85s**. So the timeout ceiling, not test correctness, is what's being hit.

Note that `vitest-jsdom-setup-cost` is deliberately **not** merged here — it covers jsdom environment setup and module-import cost dominating the run, which is plausibly the underlying driver of cause 3 rather than another report of the same symptom.

## What to do

- [ ] Narrow the prototype spies in `SettingsTableShell.test.tsx` so React's render path is not instrumented — install them only around the assertion-relevant work, or assert membership on an extracted `isSelected` helper instead of patching globals. The test's own comment at `:42–45` already notes the spy catches React's internal `includes` calls. **Do this first: it is the single largest contributor (18–21s → single-digit).**
- [ ] Raise `test.testTimeout` in `vitest.config.ts` above the observed worst case (10000ms), with a comment naming why — matching the file's existing convention of explaining its scope split from `vite.config.ts`.
- [ ] Bound worker concurrency (`poolOptions` / `maxWorkers`) so a full run stops starving on contention — the failing set spans trivial single-render tests, so a per-test timeout alone will not fix it.
- [ ] Add the missing act environment: set `globalThis.IS_REACT_ACT_ENVIRONMENT` via a `test.setupFiles` entry (`vitest.config.ts` currently declares none), clearing the `act(...)` warning from `segmented-control.test.tsx`.
- [ ] Replace the hot `getAllByRole` / `getByRole` calls in `src/components/ui/segmented-control.test.tsx` and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` with cheaper `container.querySelectorAll('[role="…"]')` lookups — the pattern already used in `src/components/archetypes/shared/RowActionsMenu.test.tsx`.
- [ ] Re-check the remaining role-heavy suites (`ListWithDetailShell.test.tsx`, `GroupedListShell.test.tsx`, `CalendarShell.test.tsx`, `MatrixGridShell.test.tsx`) for the same pattern and convert the slowest.
- [ ] ? Consider whether the settings-table perf test should assert on an operation count rather than wall-clock behaviour, so it stops being timing-sensitive at all.

## Acceptance

- Five consecutive full `npm test` invocations pass with zero failures, no code change between them (the observed failure counts varied 1→9 across identical runs, so three is too weak a bar).
- No test in the suite reports a duration above 5000ms in vitest's per-test timing output.
- The SettingsTableShell selection test reports single-digit-second self-time, no longer 18–21s.
- The test still fails when `SettingsTableShell` reverts to scanning `selectedIds` with `Array#includes` — narrowing the spy must not weaken the original assertion.
- `npx vitest run src/components/ui/segmented-control.test.tsx` no longer prints `The current testing environment is not configured to support act(...)` to stderr.
- A full run passes while at least one other worktree build runs concurrently.

## Related

- [test-gap-row-actions-menu-zero-tests.md](wip/test-gap-row-actions-menu-zero-tests.md) — the ticket whose full-suite verification surfaced this; its test file demonstrates the `querySelectorAll` workaround.
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — sibling `tooling` ticket touching the same config layer.
- [test-gap-settings-page-shell-no-tests.md](test-gap-settings-page-shell-no-tests.md) — adds more tests to the suite this flakiness affects.
- [vitest-jsdom-setup-cost.md](vitest-jsdom-setup-cost.md) — **not** a duplicate: jsdom setup + module-import cost, plausibly the driver behind contributing cause 3. Fix that one and this one may soften on its own.
- Consolidated into this ticket on 2026-07-20 (archived as duplicate reports, not as resolved):
  [test-suite-prototype-spy-timeout-flake.md](archive/test-suite-prototype-spy-timeout-flake.md),
  [flaky-test-timeouts-under-parallel-run.md](archive/flaky-test-timeouts-under-parallel-run.md),
  [vitest-default-timeout-flaky-under-load.md](archive/vitest-default-timeout-flaky-under-load.md).
