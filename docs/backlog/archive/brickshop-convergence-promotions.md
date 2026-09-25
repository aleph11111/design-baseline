---
area: archetypes
opened: '2026-09-25'
status: done
value: normal
model: sonnet
model_reason: "three independently-scoped, pattern-following ports (an opt-in render-prop, a one-line Children API swap, a module-hoist + classNames swap) with a source-repo reference implementation and existing tests to port — no open design tradeoffs"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-25T09:02:21Z'
---

# Promote three brickshop-manager fork features into matrix-grid, StatTileRow, and calendar

## Context

brickshop-manager (source repo `~/Documents/dev/brickshop-manager`, worktree
`archetype-package-cutover-convergence-prereq`) carries three fixes/features
against its vendored copies of donor primitives that are ahead of this donor
and should be promoted upstream, same shape as
`archive/mistra-list-detail-settings-table-fork-promotion.md`'s "consumer is
ahead of the donor" pattern:

- `src/components/archetypes/matrix-grid/MatrixGridShell.tsx` (brickshop
  ADR-0168) adds an optional `renderEmptyCell?: (ctx: MatrixCellContext<Cell>)
  => React.ReactNode` prop to `MatrixGridShellProps<Cell>`, opt-in: without it
  empty cells render no content (today's donor default at
  `src/components/archetypes/matrix-grid/MatrixGridShell.tsx`, MANIFEST
  `matrix-grid` version `2.3`). Pass it when the domain distinguishes a
  visible empty marker (e.g. `—`) from a filled value; filled/`data-filled`
  semantics stay driven by `isFilled` alone regardless.
- `src/components/layout/StatTileRow.tsx`'s donor version derives its column
  count via `React.Children.count(children)` (confirmed at line 40 of the
  current donor file), which counts the `false`/`null` a hidden conditional
  tile (`{cond && <StatTile/>}`) leaves behind — a row with 2 of 4 tiles
  hidden still renders 4 grid columns. `React.Children.toArray(children)`
  drops null/undefined/boolean before `.length`, fixing the derivation.
- `src/components/ui/calendar.tsx`'s donor version defines its `Chevron`
  render-prop as an inline arrow inside the `components={{ Chevron: ... }}`
  object literal (confirmed at lines 56-63 of the current donor file), which
  makes react-day-picker remount the nav buttons on every render; brickshop's
  fixed version hoists it to a module-level `CalendarChevron` component plus a
  module-level `calendarComponents` object, and switches to `navLayout="around"`
  with grid-based `month`/`month_caption`/`button_previous`/`button_next`/
  `month_grid` classNames instead of the donor's absolutely-positioned `nav`
  class.

## What to do

- [ ] Add `renderEmptyCell` to `MatrixGridShellProps<Cell>` in
      `src/components/archetypes/matrix-grid/MatrixGridShell.tsx`, resolve
      `content` as `isFilled ? (renderCell?.(ctx) ?? null) : (renderEmptyCell?.(ctx) ?? null)`,
      and port the two `renderEmptyCell` tests from brickshop's
      `src/tests/unit/MatrixGridShell.test.tsx` into this donor's
      `src/components/archetypes/matrix-grid/MatrixGridShell.test.tsx`. Bump
      `docs/archetypes/MANIFEST.json`'s `matrix-grid` entry (minor version —
      additive, optional prop) and add the prop to
      `docs/archetypes/matrix-grid.md`'s Layer 6 cell contract.
- [ ] Fix `src/components/layout/StatTileRow.tsx`'s column derivation to
      `React.Children.toArray(children).length` and add a test asserting a
      row with hidden conditional `<StatTile>` children (`{false && <StatTile
      .../>}`) still derives the visible count, not the raw child-slot count.
- [ ] Port brickshop's `src/components/ui/calendar.tsx` fix into this donor's
      `src/components/ui/calendar.tsx`: hoist `Chevron` to a module-level
      `CalendarChevron` function plus a module-level `calendarComponents`
      object, add `navLayout="around"`, and swap the `classNames` to the
      grid-based set (`month: "grid grid-cols-[auto_1fr_auto] items-center
      gap-y-4"`, `month_caption: "col-start-2 flex justify-center
      items-center"`, no absolute `nav` class, `button_previous`/
      `button_next` get `col-start-1`/`col-start-3`, `month_grid` gets
      `col-span-3`). Keep this donor's existing code style (double quotes,
      relative imports).
- [ ] Bump `package.json` + `package-lock.json` version (patch or minor per
      `docs/PACKAGE.md`'s versioning contract) to reflect the shipped change,
      following the `bf089e8` promotion commit's pattern.

## Acceptance

- `npx tsc --noEmit` and `npm test` pass after the change.
- `MatrixGridShell.test.tsx` shows a `renderEmptyCell`-rendered marker on an
  empty cell without stamping `data-filled`, and shows the default (no
  content) on an empty cell when `renderEmptyCell` is omitted.
- A `StatTileRow` test with conditional children hidden (`false`/`null`)
  renders the `sm:grid-cols-<N>` matching the *visible* tile count, not the
  count including hidden slots.
- The calendar's nav buttons no longer remount on every render (component
  identity is stable across re-renders since `Chevron` is now module-level,
  not an inline arrow recreated per render).

## Related

- [archive/mistra-list-detail-settings-table-fork-promotion.md](../archive/mistra-list-detail-settings-table-fork-promotion.md) — prior instance of the same "consumer fork is ahead of the donor" promotion shape
- `docs/archetypes/MANIFEST.json` `matrix-grid` entry (version `2.3`, `promoted_from: hk-crm`)
