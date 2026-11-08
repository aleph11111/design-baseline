---
area: archetypes
opened: 2026-11-06
status: done
value: normal
model: opus
model_reason: "archetype shape is the deliverable: body/dock slots on matrix-grid, the one-editable-matrix carve-out in the contract, and an ADR"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T23:00:00Z
---

# Archetype gap: planning workbench body slots around matrix-grid

## Context

controlling-app's composite planning page `frontend/src/app/workspace/planung/page.tsx` (685 lines) renders inside a bare `PageFrame`, which the fleet rule forbids (no `kind: page` archetype, no hand-rolled page). controlling-app ticket `frontend-builder-editor-pages-archetype-shell-migration` lists it as blocked on a design-baseline "planning workbench" gap ticket (dashboard inbox `6dee7153-2735-43bd-9b53-4ec2351c97de`), but that capture never landed, so the page had nothing to wait on. This ticket is that gap ticket.

What the page does, read from the consumer's truth ref: a `statement` switch (`guv` | `massnahmen` | `bilanz` | `cashflow` | `kombiniert`) chooses the body. `guv` shows the editable `GuvPlanGrid` (accounts × periods); `bilanz` adds `BSPlanConfigPanel` plus a `PreviewPlanGrid`; `cashflow` and `kombiniert` stack read-only `PreviewPlanGrid` blocks (`kombiniert` stacks three); `PlanPreviewDock` is a summary dock after the body; `VerlaufPanel` (history) is a header action; `PlanAnnahmenDialog` and `NeuerForecastDialog` are page-level dialogs.

Since v0.29.0 matrix-grid has the docked `inspector` slot (selection-driven, `onBeforeSelect` guard, no save model; archived [[archetype-gap-matrix-grid-docked-inspector]]). That covers the line editor: `InspektorDrawer` (`GuvPlanGrid.tsx:410`, today a non-modal floating 380px `Sheet`) moves into it and keeps its per-field autosave. Not covered: `MatrixGridShell` has no slot for the content around the grid: stacked preview grids, the config panel and the summary dock. controlling-app's planset page is handled separately by `planset-line-editor-docked-inspector` and needs none of this.

## What to do

- [ ] Add two slots to `MatrixGridShell` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx`): a `body` slot rendered below the grid inside the shell's scroll region (config panel, read-only preview matrices) and a `dock` slot pinned after it (summary). History stays a header `actions` entry and the statement switch stays in the toolbar view-switch; neither needs a new slot.
- [ ] Amend the matrix-grid contract (`docs/archetypes/matrix-grid.md`, role-only per RULES.md rules 2–3): Layer 1 "two matrix views on one route" gains the carve-out "one editable matrix; read-only preview matrices live in `body` as nested matrices". Name no Tailwind classes or primitive names in the contract body.
- [ ] Ship the typed slots (exported from `design-baseline/archetypes/matrix-grid`), a gallery demo variant (living-demo convention) showing editable grid + inspector + body preview + dock, and a MANIFEST + package version bump so controlling-app can pin it. Record `promoted_from` naming controlling-app `workspace/planung` (fleet synthesis, as for the inspector).
- [ ] Record the matrix-grid-extension vs new-archetype decision in a new ADR (`docs/adr/`, indexed in `docs/adr/INDEX.md`), following [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md).
- [ ] After it ships, re-enrich controlling-app `frontend-builder-editor-pages-archetype-shell-migration` so the page swaps the gap line for `archetype: matrix-grid` (consumer work, not part of this ticket).

## Acceptance

- `MatrixGridShell` renders a `body` region below the grid and a `dock` region after it; with neither passed, the shell renders unchanged.
- The `body` slot accepts a nested read-only matrix and the contract then lists that as conformant, while a second editable matrix on the route is still forbidden.
- With the `inspector` open, `body` and `dock` stay visible and the page shows no horizontal scroll at desk27, laptop14 and phone; `npm run check:viewports` passes for the demo variant.
- The matrix-grid contract and the gallery demo describe the workbench variant; the inspector's behaviour (docked at desk, overlay on phone, `onBeforeSelect`) is unchanged.
- The new ADR records the decision and why the alternative was rejected.

## Related

- [[archetype-gap-matrix-grid-docked-inspector]] — shipped inspector slot this builds on (v0.29.0)
- [[archetype-gap-structure-builder]] — precedent for a new kind:page decision (ADR-0012)
- [[archetype-gap-editable-tile-layout]] — precedent for an edit mode over a new archetype (ADR-0011)
- [[matrix-grid-inline-edit-contract-contradiction]]
- [[archetype-convergence]]
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — editable tile layout is an edit mode, not a new archetype
- [ADR-0012](/docs/adr/0012-structure-builder-page-archetype.md) — structure-builder is its own kind:page archetype
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes
- [matrix-grid contract](/docs/archetypes/matrix-grid.md)

## Decision

Matrix-grid extension or new `kind: page` archetype? Initially auto-resolved to the recommended default: **extend matrix-grid** with `body` + `dock` slots. Reasons: the page's primary job is still one editable accounts × periods grid with a line inspector; the preview grids and panels are satellites, and a new archetype would duplicate matrix-grid's frame and inspector (the ADR-0011 argument). Least sure about the carve-out for read-only preview matrices: the `kombiniert` view stacks three of them, which stretches "one matrix per route". Alternative: a new `planning-workbench` archetype that composes `MatrixGridShell` as its editable region plus preview, config, dock and history slots (the ADR-0012 route). Confirm or overturn before `/feat`; if overturned, rewrite the first two What-to-do bullets.

**Answer (2026-11-07, operator delegated the call): confirmed — extend matrix-grid.** v0.29.0 already put the inspector on `MatrixGridShell`, so a separate workbench archetype would have to re-host it; the read-only preview matrices are satellites in `body`, and the carve-out keeps "one editable matrix per route" intact. The What-to-do bullets stand as written.
