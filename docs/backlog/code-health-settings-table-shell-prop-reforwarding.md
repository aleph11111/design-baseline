---
area: archetypes
opened: 2026-11-04
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T12:00:00Z
---

# Stop SettingsTableShell re-destructuring and re-forwarding every body prop by name

## Context

`src/components/archetypes/settings-table/SettingsTableShell.tsx` grew 438 → 832 lines in a month (filed by the 2026-11-04 code-health ritual). `SettingsTableShell` (line 725) destructures 23 named props, then forwards 19 of them one by one to `<SettingsTableBody>` (lines ~791–822); `SettingsTableBody` (line 420) destructures the same list again. Its props type is `SettingsTableShellProps = Omit<PageShellFrameProps,'count'> & Omit<SettingsTableBodyProps,'band'|'flush'>` (line 241), so every new body prop has to be added in three places: the type, the body destructure, and the shell destructure plus forward. If the forward is missing, the prop is silently dropped on the page form only — `tsc` does not flag it, because the prop is still in the type. That is the bug class the lint rule `swallowedSlots` (`findSwallowedSlots`, `scripts/lint-design.mjs`) had to be written for, and it only watches `PageFrame` slots, not body props. There is also double work: the shell computes `computeBulkSelection`, `resolveCountLabel` and `resolveBulkActions`, then the body recomputes all three on every render even with `band={false}`, where `countLabel`/`bulkNode` are discarded.

## What to do

- [ ] In `SettingsTableShell`, destructure only what the shell consumes (`actions`, `toolbar`, `rowLabel`, `bulkActions`, `onBulkDelete`, and the inputs to its own derivations).
- [ ] Split the remaining props into frame and body sets with one typed key list — e.g. a `PAGE_SHELL_FRAME_KEYS` const `satisfies readonly (keyof PageShellFrameProps)[]`, owned next to `PageShellFrameProps` in `src/components/layout/PageFrame.tsx` so other shells can reuse it — and spread the body set into `<SettingsTableBody {...body} band={false} flush={false} />`.
- [ ] Make the key-list split fail typecheck on overlap: a frame key that is also a body key (none today; check `toolbar`) would need explicit routing.
- [ ] In `SettingsTableBody`, skip `resolveCountLabel`/`resolveBulkActions` when the band is off.
- [ ] Add one test proving a body prop reaches the body through `SettingsTableShell` with no per-prop forward, using an existing prop such as `emptyMessage` (in `SettingsTableShell.test.tsx`).

## Acceptance

- `SettingsTableShell`'s body forwarding is one spread, not a per-prop list.
- After the change, adding an optional prop to `SettingsTableBodyProps` and using it in the body makes it reach the body via `SettingsTableShell` with no shell edit; the new `emptyMessage` test passes.
- With `band={false}` the body no longer calls `resolveCountLabel` or `resolveBulkActions`.
- `npm test` passes, including `SettingsTableShell.test.tsx`, and `npx tsc --noEmit` is clean.

## Related

- [[code-health-toolbar-band-extract-from-pageframe]]
- [[adherence-lint-swallowed-pageframe-slot-prop]] — the lint rule this bug class already needed for frame slots
- [src/components/layout/PageFrame.tsx](/src/components/layout/PageFrame.tsx) — `PageShellFrameProps`
- [scripts/lint-design.mjs](/scripts/lint-design.mjs) — `findSwallowedSlots`
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one PageFrame, slot-owned placement
