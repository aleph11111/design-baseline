---
area: test-gap
opened: 2026-07-19
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
model: sonnet
model_reason: Scoped test fix with a diagnosed root cause and an established spy-narrowing pattern to apply.
---

# SettingsTableShell Set-membership test exceeds the default vitest timeout

## Context

`src/components/archetypes/settings-table/SettingsTableShell.test.tsx:24` — the test `"checks row/header selection membership via a Set, not Array#includes"` fails on `origin/main`, taking ~8.9s against vitest's default 5s `testTimeout`. It reproduces in isolation (`npx vitest run src/components/archetypes/settings-table/SettingsTableShell.test.tsx`), so it is not contention from a parallel test file — though it does get noticeably worse under load, which makes it read as flaky when the full suite runs.

The cause is the instrumentation, not the component. The test calls `vi.spyOn(Array.prototype, "includes")` and `vi.spyOn(Set.prototype, "has")` — patching two of the hottest built-ins in the process, globally, for the duration of a full React render of a 30-row table. Every internal React call to `Array#includes` routes through the spy wrapper and is recorded into `mock.contexts`, which is what pushes the render past 5s. The assertions themselves are cheap; the prototype patch is the cost.

This is the only failing test in the suite (verified 2026-07-19: `Test Files 1 failed | 20 passed`, all other files green), so it is the single thing standing between this repo and a clean `npm test`.

## What to do

- [ ] Confirm first that `SettingsTableShell` has not genuinely regressed to `Array#includes` membership — the test may be reporting a real defect slowly rather than merely being slow.
- [ ] Narrow the instrumentation so the prototype spies are installed only around the membership check rather than around the whole `render()` — or replace the `Array.prototype`/`Set.prototype` spies with an assertion that does not patch global built-ins (e.g. asserting on the prop type the shell builds, or a render-count//perf-free structural check).
- [ ] If instrumentation genuinely must wrap the render, give this single test an explicit timeout argument rather than raising the global `testTimeout` — the rest of the suite is fast and should keep the tight default.

## Acceptance

- `npx vitest run src/components/archetypes/settings-table/SettingsTableShell.test.tsx` passes, and the membership test completes well under the default 5s timeout.
- `npx vitest run` reports zero failing test files.
- The test still fails when `SettingsTableShell` is changed to scan `selectedIds` with `Array#includes` instead of backing membership with a `Set` — i.e. the regression guard survives the speedup.

## Related

- [refactor-shell-surface-header-slot-duplication.md](archive/refactor-shell-surface-header-slot-duplication.md) — prior work on the same shell.
- [clickable-rows-keyboard-operability.md](archive/clickable-rows-keyboard-operability.md) — sibling settings-table/row-interaction ticket.
- [test-gap-settings-page-shell-no-tests.md](test-gap-settings-page-shell-no-tests.md) — adjacent settings-archetype coverage gap.
