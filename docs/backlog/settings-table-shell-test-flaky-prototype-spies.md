---
area: archetypes
opened: 2026-07-19
status: ready
model: sonnet
model_reason: scoped single-test fix with a clear preferred approach and unchanged assertions
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# SettingsTableShell selection test flakes on timeout from global prototype spies

## Context

The first test in `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` — "checks row/header selection membership via a Set, not `Array#includes`" — times out nondeterministically. Observed 2026-07-19 from an unrelated docs-only branch: the identical tree passed 61/61, a rerun failed 7 files / 7 tests, another failed 1, and the file failed again run in isolation. Every failure is `Error: Test timed out in 5000ms`, with the test itself measured at ~9918ms. It is a flake, not a regression — the varying failure count on an unchanged tree is the signature.

The cause is the test's instrumentation, not `SettingsTableShell` itself. Lines 28–29 call `vi.spyOn(Array.prototype, "includes")` and `vi.spyOn(Set.prototype, "has")`, patching two extremely hot **global** prototype methods. For the whole duration of `render()`, every `.includes()` and `.has()` invoked by React, jsdom, `@testing-library/react` and vitest itself is funnelled through a spy that records receiver and arguments into `mock.contexts` / `mock.calls`. With `makeRows(30)` the recorded volume is large enough that the render's cost is dominated by spy bookkeeping, which scales with whatever else is competing for CPU — hence it only tips over the 5s default timeout sometimes, and reproduces readily on a machine running many parallel `/feat` worktrees (the same run reported `environment 329.66s`, `import 254.24s`).

Corroborating evidence: the second test in the same file, "still resolves the correct rows on bulk delete", has never been observed failing — it does no prototype spying. The assertions themselves are sound and worth keeping (`selectedIds` must never be the receiver of `.includes`, and `Set.prototype.has` must be called at least `rows.length` times); only the mechanism is the problem. The test landed in `01d9093` "fix: replace SettingsTableShell selectedIds scans with a memoized Set".

## What to do

- [ ] Narrow the `Array#includes` spy from `Array.prototype` to the `selectedIds` array **instance** — the assertion at line 46–49 only ever inspects whether `selectedIds` was the receiver, so an own-property spy on that one object preserves the assertion's exact meaning while removing the global hot-path patch.
- [ ] Replace the `vi.spyOn(Set.prototype, "has")` call-count assertion with one that doesn't patch a global: either spy on the specific memoized `Set` instance if it is reachable, or assert the memoized-Set behaviour through observable output instead of call counts.
- [ ] Keep both existing behavioural assertions intact — `rows.length + 1` checkboxes rendered, every one with `data-state="checked"`.
- [ ] Re-run `npm test` several times in a row (and ideally while other worktrees are building) to confirm the flake is gone rather than merely less likely.

## Acceptance

- `npx vitest run src/components/archetypes/settings-table/SettingsTableShell.test.tsx` passes on 5 consecutive runs, including while the machine is under parallel-worktree load.
- The test file no longer contains `vi.spyOn(Array.prototype, …)` or `vi.spyOn(Set.prototype, …)` — no global prototype is patched.
- The individual test completes well under the 5000ms default timeout, so no timeout override is needed to make it pass.
- `npm test` shows 61 passing with no failures attributable to this file.

## Related

- [docs/backlog/vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — the other known source of spurious vitest failures in this repo under parallel worktrees; distinct root cause, same "test fails for non-code reasons" class.
- [docs/backlog/archive/ops-health-orphaned-worktrees-branches.md](archive/ops-health-orphaned-worktrees-branches.md) — the ship whose test gate surfaced this flake.
- The ten open `test-gap-*` tickets in `docs/backlog/` — this repo is actively growing its donor test suite, so flake hygiene compounds.
- `docs/ARCHITECTURE.md` §3 "Component map" — locates `src/components/archetypes/settings-table/`.
