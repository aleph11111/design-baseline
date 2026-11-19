---
area: archetypes
opened: 2026-11-19
status: needs-enrichment
value: normal
model: opus
model_reason: "archetype shape is the deliverable: a page-level detail slot must reconcile grouped-list Forbidden #5 with list-with-detail's sheet/overlay without forking either contract"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved fork (page-level detail slot vs rowActions-only) capped at 4"
  graded_at: 2026-11-19T00:00:00Z
---

# Grouped-list gap: page-level detail pane across sections

## Context

`GroupedListShell` / `GroupedListSection` (`src/components/archetypes/grouped-list/`) have no detail slot: `GroupedListSection` forwards `selectedRowId` to the inner `ListWithDetailBody` (`GroupedListSection.tsx:32,57,79`) but takes no `detail` prop, and the contract forbids a "detail panel inside a section" (`docs/archetypes/grouped-list.md`, Forbidden patterns #5). A work-queue page grouped by patient therefore cannot move onto `grouped-list` without losing its detail pane. Consumer: behandlungskompass `/praxis/offene-leistungen` (consumer ticket `open-items-group-by-patient`), today `list-with-detail` with a right-hand pane showing key-value details, a Strecke link and a "Neue Strecke anlegen" action. Per the baseline-ships-first rule this ships here first; the consumer then bumps its `design-baseline` dependency and builds on the export, no hand-rolled stopgap.

Repro: try to give `WorkQueueGroups` / `GroupedListSection` a `detail` prop; none exists.

## What to do

- [ ] Add a page-level detail slot to `GroupedListShell`: one `selectedRowId` shared across all sections, one detail pane beside the section stack on desktop, overlay surface on mobile (same overlay primitive `list-with-detail` uses).
- [ ] Amend `docs/archetypes/grouped-list.md`: Forbidden #5 narrows to "detail panel *inside* a section"; the page-level slot is the sanctioned shape. Contract stays role-only (props, no Tailwind classes).
- [ ] Ship a living demo of the variant in `src/examples/` and bump the MANIFEST version (per the living-demos-for-variants convention).

## Acceptance

- `GroupedListShell` renders one detail pane for the selected row, whichever section holds it; selecting a row in another section moves the pane.
- On mobile the detail renders in the overlay surface, not beside the stack.
- Without a `detail` prop the shell renders unchanged.
- The grouped-list contract no longer forbids a page-level detail surface, and the demo shows it.

## Related

- [[archetype-gap-list-with-detail-bulk-stepping-summary]]
- [[page-body-section-card-stack-grouped-list]]

## Open question

Fork auto-resolved to the first option: (A, asserted above) page-level detail slot on `GroupedListShell`, or (B) a documented `rowActions`-only pattern with no detail pane (detail navigation to a dedicated route). B loses the pane the consumer needs today; A widens the grouped-list contract. Operator to confirm A before `/feat`.
