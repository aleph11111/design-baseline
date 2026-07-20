---
area: tooling
opened: 2026-07-19
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T13:40:00Z
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

### Status, 2026-07-20 — all three causes closed; verified, nothing left to fix

Re-measured on the current tree. Every contributing cause has been addressed by work
that already landed on `main` across three separate branches — this ticket's remaining
value was verification, not implementation:

- **Cause 1 (prototype spies) — fixed** in `91e028a` (`feat/settings-table-shell-test-flaky-prototype-spies`).
  `SettingsTableShell.test.tsx:32` now spies on the `selectedIds` *array instance*, not
  `Array.prototype`, so React's render path is no longer instrumented. That `it` block
  runs in ~200ms, down from the reported 18–21s. The guard still bites: reverting
  `SettingsTableShell` to `selectedIds.includes(...)` (4 call sites) fails the test.
- **Cause 2 (slow `*ByRole` queries) — no longer reproduces.** Full verbose run: slowest
  test in the suite is 242ms (`ThemeToggle` "defaults to English strings"); nothing is
  within an order of magnitude of the reported 5–8s. The 5–8s figure was a *symptom of
  cause 1 plus worker thrashing*, not an inherent jsdom/RTL cost — with both removed, the
  role queries are cheap. Rewriting them to `querySelectorAll` would trade readable RTL
  queries for nothing measurable, so it is deliberately **not** done.
- **Cause 3 (worker contention) — fixed** by `testTimeout: 30_000` + `maxWorkers: 4`.
- **act-environment warning — gone.** `npx vitest run src/components/ui/segmented-control.test.tsx`
  prints no `act(...)` warning on the current React/RTL versions, so the `setupFiles`
  entry that would have set `IS_REACT_ACT_ENVIRONMENT` has no warning left to clear and
  is not added.

Verification run on 2026-07-20: five consecutive `npx vitest run` invocations, zero code
change between them, **163/163 passing every time** (7.4s–8.8s). One further run with two
concurrent `vitest run` processes and a `tsc --noEmit` saturating the machine: **163/163,
17.1s, no timeout failures and no test above 1s**. The 1→9 varying-failure non-determinism
that defined this ticket does not reproduce.

- [x] ~~Narrow the prototype spies in `SettingsTableShell.test.tsx` so React's render path is not instrumented — install them only around the assertion-relevant work, or assert membership on an extracted `isSelected` helper instead of patching globals. The test's own comment at `:42–45` already notes the spy catches React's internal `includes` calls. **Do this first: it is the single largest contributor (18–21s → single-digit).**
- [x] ~~Raise `test.testTimeout` in `vitest.config.ts` above the observed worst case (10000ms), with a comment naming why.~~ **Landed** — `vitest.config.ts` now sets `testTimeout: 30_000` with a comment recording the measurement (a 67-test run spending ~186s in `environment` and ~125s in `import` against ~61s of actual `tests`; up to 9 of 21 files failing under the default).
- [x] ~~Bound worker concurrency (`poolOptions` / `maxWorkers`) so a full run stops starving on contention.~~ **Landed** — `vitest.config.ts` now sets `maxWorkers: 4`, with the measurement in-comment: 7 failing files uncapped vs 1 at `--maxWorkers=2`, and wall-clock cut from ~49s to ~4s because the workers stop thrashing.
- [x] ~~Add the missing act environment: set `globalThis.IS_REACT_ACT_ENVIRONMENT` via a `test.setupFiles` entry.~~ **Not needed** — the `act(...)` warning is no longer emitted; adding a setup file to silence a warning that does not appear would be dead config.
- [x] ~~Replace the hot `getAllByRole` / `getByRole` calls with cheaper `container.querySelectorAll('[role="…"]')` lookups.~~ **Not needed** — those queries are no longer hot (slowest test in the suite: 242ms). Keeping the RTL queries.
- [x] ~~Re-check the remaining role-heavy suites for the same pattern and convert the slowest.~~ **Checked** — no suite has a test above 250ms; nothing to convert.
- [x] ~~? Consider whether the settings-table perf test should assert on an operation count rather than wall-clock behaviour.~~ It already does — it asserts `includesSpy` was never called, which is an operation-count assertion, not a timing one.

## Acceptance

- Five consecutive full `npm test` invocations pass with zero failures, no code change between them (the observed failure counts varied 1→9 across identical runs, so three is too weak a bar).
- No test in the suite reports a duration above 5000ms in vitest's per-test timing output.
- The SettingsTableShell selection test reports single-digit-second self-time, no longer 18–21s.
- The test still fails when `SettingsTableShell` reverts to scanning `selectedIds` with `Array#includes` — narrowing the spy must not weaken the original assertion.
- `npx vitest run src/components/ui/segmented-control.test.tsx` no longer prints `The current testing environment is not configured to support act(...)` to stderr.
- A full run passes while at least one other worktree build runs concurrently.

## Resolution

Closed as **verified, not re-implemented**. All three contributing causes were already
fixed by work that landed on `main` in separate branches — `testTimeout: 30_000` and
`maxWorkers: 4` in `vitest.config.ts`, and the instance-scoped spy in
`SettingsTableShell.test.tsx` (`91e028a`). This branch contributes no code change; it
contributes the measurement that closes the ticket, since the acceptance criteria are all
empirical and none had been checked against the post-fix tree.

Every criterion re-measured and met:

| Criterion | Result |
|---|---|
| 5 consecutive full runs, zero failures | 163/163 × 5 (7.4–8.8s) |
| No test above 5000ms | Slowest: 242ms |
| SettingsTableShell selection test single-digit-second | ~200ms |
| Guard still fails on an `Array#includes` revert | Reverted 4 call sites → test fails |
| No `act(...)` warning from `segmented-control.test.tsx` | Not emitted |
| Full run passes under concurrent build load | 163/163, 17.1s, no timeouts |

Two open work items were closed as **deliberately not done**: the `querySelectorAll`
rewrite and the `setupFiles` act-environment entry. Both were prescribed against
measurements (5–8s role queries; an `act(...)` warning) that no longer hold — the role
queries were slow *because of* cause 1 and worker thrashing, not inherently. Doing them
now would add config and churn tests for no measurable gain.

The residual jsdom-setup cost stays out of scope, tracked in
[vitest-jsdom-setup-cost.md](vitest-jsdom-setup-cost.md) — `environment` is still the
dominant line in every run (19s against 4.5s of actual `tests`), it just no longer
threatens the gate.

## Related

- [test-gap-row-actions-menu-zero-tests.md](test-gap-row-actions-menu-zero-tests.md) — the ticket whose full-suite verification surfaced this; its test file demonstrates the `querySelectorAll` workaround. (Shipped; moved from `wip/` to `archive/`.)
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — sibling `tooling` ticket touching the same config layer.
- [test-gap-settings-page-shell-no-tests.md](test-gap-settings-page-shell-no-tests.md) — added more tests to the suite this flakiness affects. (Shipped; now in `archive/`.)
- [vitest-jsdom-setup-cost.md](vitest-jsdom-setup-cost.md) — **not** a duplicate: jsdom setup + module-import cost, plausibly the driver behind contributing cause 3. Fix that one and this one may soften on its own.
- Consolidated into this ticket on 2026-07-20 (archived as duplicate reports, not as resolved):
  [test-suite-prototype-spy-timeout-flake.md](test-suite-prototype-spy-timeout-flake.md),
  [flaky-test-timeouts-under-parallel-run.md](flaky-test-timeouts-under-parallel-run.md),
  [vitest-default-timeout-flaky-under-load.md](vitest-default-timeout-flaky-under-load.md).
