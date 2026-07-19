---
area: archetypes
opened: 2026-07-19
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T21:00:00Z
---

# SettingsTableShell selection-membership test times out, leaving npm test red on main

## Context

`src/components/archetypes/settings-table/SettingsTableShell.test.tsx:24` — the test
`"checks row/header selection membership via a Set, not Array#includes"` fails with
`Test timed out in 5000ms`. It reproduces in isolation
(`npx vitest run src/components/archetypes/settings-table/SettingsTableShell.test.tsx`),
so it is not parallel-session load flakiness, and it is present on `origin/main` — every
`/feat` worktree currently inherits a red `npm test`.

The test was introduced by `01d9093` ("fix: replace SettingsTableShell selectedIds scans
with a memoized Set"). Its assertion strategy installs two spies on hot global prototypes
before rendering 30 rows:

```ts
const includesSpy = vi.spyOn(Array.prototype, "includes");
const hasSpy = vi.spyOn(Set.prototype, "has");
```

React and jsdom call `Array#includes` and `Set#has` constantly during render, so every
internal call is intercepted and recorded into `mock.calls` / `mock.contexts` — the
render never completes inside the 5s budget. The second test in the same file
("still resolves the correct rows on bulk delete") passes; it installs no prototype spies.

The behaviour under test — that `selectedIds` is never rescanned linearly per row — is
worth keeping. The instrumentation is what needs replacing.

## What to do

- [ ] Reproduce: `npx vitest run src/components/archetypes/settings-table/SettingsTableShell.test.tsx` and confirm only the first test times out.
- [ ] Replace the `Array.prototype` / `Set.prototype` global spies with an assertion that does not instrument hot built-ins. Preferred: make `selectedIds` a `Proxy` (or a plain array with a getter-instrumented `includes` own-property) so only *that* array's `includes` is observable, leaving React's internal calls untouched.
- [ ] Keep the two behavioural assertions already in the test: `rows.length + 1` checkboxes render, and every one carries `data-state="checked"`.
- [ ] If no non-instrumenting assertion can express "no linear rescan", drop the mechanism assertion and keep the behavioural one — a scaling assertion (render 1000 rows within a time budget) is not worth the flake surface.

## Acceptance

- `npx vitest run src/components/archetypes/settings-table/SettingsTableShell.test.tsx` passes; no test in the file times out.
- `npm test` is green on the branch with no pre-existing failures remaining in this file.
- The test still fails when `SettingsTableShell`'s memoized `Set` is reverted to `selectedIds.includes(...)` per row — i.e. the regression guard from `01d9093` survives the rewrite (or, if the mechanism assertion was dropped per the last bullet, that removal is stated in the PR description).

## Related

- `01d9093` — the commit that introduced both the memoized-`Set` fix and this test.
- [test-gap-settings-page-shell-no-tests.md](test-gap-settings-page-shell-no-tests.md) — sibling shell in the same archetype family, also missing coverage.
- [test-gap-form-page-shell-no-tests.md](wip/test-gap-form-page-shell-no-tests.md) — the ticket whose `npm test` run surfaced this failure.
