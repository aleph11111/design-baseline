---
area: archetypes
opened: '2026-11-12'
status: ready
value: high
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: sonnet
model_reason: "follows the transaction-document slice's pattern; the stack primitive and chrome already exist"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# Move the analytics-dashboard shell onto the section-card stack with one card per widget

## Context

Phase 3 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 3 — Weak-separation slices". ADR-0008 named dashboard widgets as the case that separates too weakly inside one frame.

Today the pieces render like this:
- `src/components/archetypes/analytics-dashboard/DashboardShell.tsx` wraps its children in one `PageFrame` frame with a `divide-y` div.
- `DashboardGrid.tsx` draws hairline-divided cells (`-mr-px -mb-px grid`).
- `DashboardWidget.tsx` is a chromeless `SectionCard`.

Phase 1 shipped `PageFrame` `body="stack"`, which hands the toolbar band to the first child through `ToolbarLeadContext`. Phase 2 ([[page-body-section-card-stack-transaction-document]]) is the first consumer to copy.

## What to do

- [ ] `DashboardShell` passes `body="stack"` and drops the `divide-y` wrapper.
- [ ] When `toolbar` (or `viewSwitch` / `count` / `viewOptions`) is set, the shell renders a band-only first card (an empty `SurfaceFrame`, spec rule 5) so the filters sit on a card of their own.
- [ ] The KPI row (`StatTileRow`) is its own raised card.
- [ ] `DashboardGrid` becomes a gapped grid (`gap-4 md:gap-5`, same column breakpoints) with no hairline-cell rules.
- [ ] `DashboardWidget` renders a chromed `SectionCard`: each widget is a bordered, rounded card on the canvas.
- [ ] `DashboardAssignmentList` and `DashboardPeriodPair` keep working inside a widget card. Nested raised surfaces drop border and fill (ADR-0015 rule 2).
- [ ] Edit mode ([ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md), `DashboardEditMode.test.tsx`) keeps its drag/resize affordances on the new cards.
- [ ] Update `docs/archetypes/analytics-dashboard.md`, keeping it role-only. Bump the MANIFEST minor version and add a CHANGELOG entry. Update the demo if needed.
- [ ] Update the shell, grid and edit-mode tests:
  - a stack body is present;
  - the band-only first card appears when the toolbar is set;
  - each widget is a card with `border` and `rounded-lg`;
  - no `divide-y` cell grid remains.
- [ ] Regenerate the analytics-dashboard screenshot baselines on all three devices (desk27, laptop14 and phone) and run `npm run check:viewports`.

## Acceptance

- The analytics-dashboard demo renders `[data-page-body="stack"]`: a band-only first card holding the filters, then the KPI row card, then one bordered, rounded card per widget with a canvas gap between widgets.
- Dashboard widgets no longer render as hairline-divided cells, and no other dashboard component keeps a `-mr-px -mb-px` cell grid.
- Edit mode still moves and resizes widgets, and `DashboardEditMode.test.tsx` passes.
- `npm test`, `npx tsc --noEmit`, `node scripts/lint-design.mjs`, `npm run screenshots` and `npm run check:viewports` pass at desk27, laptop14 and phone.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p3)
- [[page-body-section-card-stack-transaction-document]] — the pattern to copy
- [[page-body-section-card-stack-kanban-board]] — sibling Phase-3 slice
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — dashboard edit mode
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — flagged widgets as separating too weakly
