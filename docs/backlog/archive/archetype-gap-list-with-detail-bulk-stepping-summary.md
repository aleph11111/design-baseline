---
area: archetypes
opened: 2026-11-19
status: done
value: high
model: opus
model_reason: "archetype shape is the deliverable: bulk-bar, sort-order stepping and pinned summary band must compose into one role-only contract without forking settings-table or matrix-grid"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-19T00:00:00Z
---

# List-with-detail gap: bulk selection, sort-order stepping and a pinned summary band

## Context

controlling-app bottom-up planning needs a page "Raumkosten · 25 Konten" listing 20-25 accounts under one plan line: a sortable table with a checkbox column, a bulk action bar, a sum band that stays visible while rows scroll, and a row-click detail sheet with ˄/˅ stepping. No single exported archetype composes it. `list-with-detail` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`, `onRowSelect`/`selectedRowId` at lines 112-113, 276) has sort and the detail sheet but lacks three things:

1. **Optional row selection + bulk bar** replacing the toolbar while ≥1 row is selected. `settings-table` already ships it (`bulkSelectable`/`bulkActions`, `src/components/archetypes/settings-table/SettingsTableShell.tsx:144,211-213,285`; shared derivation `computeBulkSelection`/`resolveBulkActions` per `docs/archetypes/settings-table.md`) but has no sort and no row-click detail sheet.
2. **Prev/next stepping inside the detail Sheet** that follows the current sort/filter order. Only `matrix-grid`'s inspector has `onPrev`/`onNext` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx:150-155`) and it steps in rows-array order.
3. **Optional summary band pinned above the table body**, visible while rows scroll. `StatementTotalRow` (`src/components/archetypes/statement-with-filters/StatementTable.tsx:119-150`) sits at the table foot and scrolls away.

Reference mock: https://claude.ai/artifact/A5HS9QuGg85udPRwei3ie5 (section 1b). Per the baseline-ships-first rule, this ships here before controlling-app builds the page; the consumer then bumps its `design-baseline` dependency (no hand-rolled stopgap).

Decision: extend `list-with-detail` with three optional, default-off props rather than adding a new archetype — same call as ADR-0011 (edit mode of an existing archetype) and ADR-0013 (slots on matrix-grid, not a new archetype). Reuse settings-table's bulk derivation instead of re-implementing it.

## What to do

- [ ] Add optional bulk selection to `ListWithDetailShell`: checkbox column plus a bulk bar that replaces the toolbar while ≥1 row is selected, reusing `computeBulkSelection`/`resolveBulkActions` from settings-table (extract to a shared module if they are not yet importable from both).
- [ ] Clear or prune the selection when the filter changes so hidden rows are never bulk-acted on (same scar as archived `archetype-rollout-settings-table-bulk-selection-outlives-filter`).
- [ ] Add prev/next stepping in the detail Sheet that walks the displayed (sorted + filtered) row order, disabled at the ends, updating `selectedRowId`.
- [ ] Add an optional summary-band slot pinned above the table body (sticky within the scroll container), working at the device triad (desk27/laptop14/phone) with the phone scroll cue intact.
- [ ] Update `docs/archetypes/list-with-detail.md` (role-only, no Tailwind classes), the gallery demo in `src/examples/` with a visible demo for each new axis, the MANIFEST version, and the screenshot baselines.

## Acceptance

- `ListWithDetailShell` with bulk selection enabled shows a bulk bar in place of the toolbar once one row is selected, and the toolbar returns when the selection is cleared.
- Stepping next/prev in the detail Sheet follows the current sort and filter order, and is disabled at the first and last displayed row.
- The summary band stays visible while a 25-row table scrolls, and is unchanged (absent) when the prop is not passed.
- A row hidden by a filter change is no longer selected, and bulk actions never act on it.
- Existing `list-with-detail` consumers render unchanged when none of the new props are passed.

## Related

- [[archetype-gap-matrix-grid-docked-inspector]] — precedent for adding `onPrev`/`onNext` and slots to an existing archetype
- [[archetype-rollout-settings-table-bulk-selection-outlives-filter]] — the bulk-vs-filter scar to avoid repeating
- [[list-with-detail-sheet-sizes-to-content]] — the Sheet overlay this stepping lives inside
- [[list-with-detail-column-filter-hoist]]
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — detail overlay sizes to content
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — extend an archetype, not a new one
- [ADR-0013](/docs/adr/0013-matrix-grid-workbench-body-dock.md) — slots on an existing archetype
