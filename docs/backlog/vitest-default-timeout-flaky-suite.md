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

# Vitest's 5s default timeout makes the suite flaky under parallel workers

## Context

A full `npm test` run (vitest 4, config at `vitest.config.ts`) intermittently fails two tests — `src/components/ui/segmented-control.test.tsx` ("is a single tab stop: the group wraps focus, no radio starts tabbable") and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` ("checks row/header selection membership via a Set, not Array#includes") — with `Error: Test timed out in 5000ms`. Both pass when their file is run in isolation, so this is load-dependent flakiness, not a real regression.

The cause is the interaction of two things: `vitest.config.ts` sets no `test.testTimeout`, so vitest's 5000ms default applies; and Testing Library's `*ByRole` queries are extremely slow under jsdom in this repo — individual role-querying tests were measured at 5–8s while the rest of the run took only milliseconds. Under parallel workers the machine contention pushes those role queries past the 5s line. Since every future PR runs the full suite, this makes CI red/green results untrustworthy repo-wide.

## What to do

- [ ] Raise `test.testTimeout` in `vitest.config.ts` to a value above the observed worst case (10000ms), so role-query slowness under load no longer trips the default.
- [ ] Replace the hot `getAllByRole` / `getByRole` calls in `src/components/ui/segmented-control.test.tsx` and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` with cheaper `container.querySelectorAll('[role="…"]')` lookups — the pattern already used in `src/components/archetypes/shared/RowActionsMenu.test.tsx`.
- [ ] Re-check the remaining role-heavy suites (`ListWithDetailShell.test.tsx`, `GroupedListShell.test.tsx`, `CalendarShell.test.tsx`, `MatrixGridShell.test.tsx`) for the same pattern and convert the slowest.

## Acceptance

- Three consecutive full `npm test` runs pass with zero timeout failures.
- No test in the suite reports a duration above 5000ms in vitest's per-test timing output.
- A run of `segmented-control.test.tsx` and `SettingsTableShell.test.tsx` together no longer fails with `Test timed out in 5000ms`.

## Related

- [test-gap-row-actions-menu-zero-tests.md](wip/test-gap-row-actions-menu-zero-tests.md) — the ticket whose full-suite verification surfaced this; its test file demonstrates the `querySelectorAll` workaround.
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — sibling `tooling` ticket touching the same config layer.
- [test-gap-settings-page-shell-no-tests.md](test-gap-settings-page-shell-no-tests.md) — adds more tests to the suite this flakiness affects.
