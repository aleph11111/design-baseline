---
area: archetypes
opened: 2026-10-06
status: ready
value: high
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-06T17:00:00Z
---

# list-with-detail and kanban-board shells drop PageFrame viewOptions slots

## Context

Reported from hk-crm's v0.5.0 upgrade (hk-crm ticket design-baseline-shells-forward-view-options). Since v0.5.0 (ADR-0008's one-control-height ladder) two page shells type their frame slots as a `Pick` of `PageFrameProps` (`src/components/layout/PageFrame.tsx`) and never forward the display-options slots: `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx` picks `title | subtitle | badges | actions | toolbar | count`, and `src/components/archetypes/kanban-board/BoardShell.tsx` picks `title | subtitle | badges | actions | toolbar` — so `viewOptions`, `viewOptionsLabel`, and (BoardShell only) `count` do not exist on the shell props. A consumer that passes them in gets a `tsc` error; consumers that want a table/board display switch have to hand-roll it into the `toolbar` band instead. Both placements violate `docs/PLACEMENT.md` (row: `viewOptions` — "display-only toggles … one View menu") and `docs/STYLE.md` ("a shell forwards every `PageFrame` slot it takes"). The existing `archetype-swallowed-pageframe-slot` adherence rule (`scripts/lint-design.mjs`, `findSwallowedSlots`) cannot catch this: it only fires on a slot destructured beside `...rest` and never referenced, while the drop here is at the `Pick` level — the prop never exists on the type, and neither shell destructures it.

## What to do

- [ ] Add `viewOptions` and `viewOptionsLabel` to the `Pick` in `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx` and forward both to the existing explicit `<PageFrame>` prop list (the shell does not use `...rest`, so each slot needs a named forward line).
- [ ] Add `viewOptions`, `viewOptionsLabel`, and `count` to the `Pick` in `src/components/archetypes/kanban-board/BoardShell.tsx`; the shell already forwards `<PageFrame {...frame}>`, so the `Pick` extension alone suffices there (per STYLE.md "a shell forwards every PageFrame slot it takes").
- [ ] Audit every other PageFrame-based shell against its own contract for the same dropped-slots pattern (the `Pick<PageFrameProps, …>` sites to check: `src/components/archetypes/matrix-grid/MatrixGridShell.tsx`, `src/components/archetypes/grouped-list/GroupedListShell.tsx`, `src/components/archetypes/feed-inbox/FeedShell.tsx`, `src/components/archetypes/settings-table/SettingsTableShell.tsx`, `src/components/archetypes/calendar/CalendarShell.tsx`, `src/components/archetypes/statement-with-filters/StatementWithFiltersShell.tsx`, `src/components/archetypes/analytics-dashboard/DashboardShell.tsx`, `src/components/archetypes/report/ReportShell.tsx`). A contract that explicitly omits a slot (e.g. `docs/archetypes/detail-overview.md` "There is no toolbar, count or viewOptions") stays omitted — record each no-op in the PR body, change only the shells whose contracts claim the full frame.
- [ ] The `archetype-swallowed-pageframe-slot` rule (`_adherence.json`) already lists `viewOptions` in its `swallowedSlots` — it is blind to the `Pick<PageFrameProps, …>`-level drop this ticket fixes (no destructure exists to flag). Extend the check (`scripts/lint-design.mjs`, `scripts/lint-design-core.test.mjs`) with a `Pick<PageFrameProps, "…">`-list scan that errors when a shell whose contract claims the full frame omits `viewOptions`/`viewOptionsLabel` (and `count` for the shells that pick the rest), or record the ceiling in `_adherence.NOTES.md` if a zero-dep single-line scanner cannot see the contract boundary (the rule's documented posture — ADR-0003).
- [ ] Extend the gallery demos so the View menu is visible: `src/examples/list-with-detail-demo.tsx` (it already renders the toolbar band with a `SegmentedControl` state switcher — that toggle belongs in `viewOptions` per PLACEMENT.md) and `src/examples/kanban-board-demo.tsx`.
- [ ] Version bookkeeping: `npm run verify:manifest` (pretest) enforces archetype version parity, so bump the `version` fields of the two changed archetypes in `docs/archetypes/MANIFEST.json` to match their spec `version` (bump to 4.3 if the spec bumps), and bump the package.json `version` — required for shipped `src/` changes by `scripts/verify-package-version.mjs` (pretest; docs/RULES.md rule 11).

## Acceptance

- `npx tsc --noEmit` passes with `viewOptions`, `viewOptionsLabel`, and `count` (board only) accepted by both shells, and both forward them to `PageFrame`.
- `npm test` passes, including new cases in `src/components/archetypes/list-with-detail/ListWithDetailShell.test.tsx` and `src/components/archetypes/kanban-board/BoardShell.test.tsx` asserting a passed `viewOptions` node reaches the toolbar band's View menu (a `PageFrame.test.tsx` render pattern).
- The two demos render their display toggle through the View menu instead of a hand-rolled toolbar control, visible in the built gallery.
- After the audit pass, no other shell whose contract claims the full frame omits `viewOptions` / `viewOptionsLabel` (or `count`), and any deliberate ceiling lands in `_adherence.NOTES.md` or is enforced by the extended lint.

## Related

- [[pageframe-mobile-filter-sheet]] — sibling open ticket that renders the same `toolbar` / `viewOptions` band on mobile; the demos should not collide on the same band
- [[adherence-lint-swallowed-pageframe-slot-prop]] — the existing swallow-lint this ticket extends (the destructure-level gap it closed; this is the `Pick`-level gap)
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — slot-owned placement: `viewOptions` = one View menu in the toolbar band
- [docs/PLACEMENT.md](/docs/PLACEMENT.md) — the canonical band placement table
- [docs/STYLE.md](/docs/STYLE.md) — "a shell forwards every PageFrame slot it takes"
