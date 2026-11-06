---
area: archetypes
opened: 2026-11-06
status: done
value: high
model: opus
model_reason: "archetype shape is the deliverable: distil a non-modal docked slot and a line-switch guard from two consumer editors into a role-only contract"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-06T15:00:00Z
---

# Matrix-grid gap: non-modal docked inspector for selection-driven line tuning

## Context

controlling-app's planset grid (accounts × plan years) opens a raw 520px `Sheet` with eight stacked sections when a line is clicked; users call it far too loaded. The user tunes one line, watches the result, then moves to the next line without closing. The only sanctioned surfaces today are matrix-grid's side overlay (`docs/archetypes/matrix-grid.md` Layer 6 click contract, `onCellClick`, line 152) and crud-dialog J. J is modal: `CrudDialogSheet` renders `Sheet`, which always renders `SheetOverlay` (`src/components/ui/sheet.tsx:72`), so the grid is inert behind a backdrop and a 720px `lg` sheet covers half of a 1440px desk.

Proposal: an `inspector` slot on the matrix-grid shell (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx`). The selected row/cell drives the panel. At desk27 and laptop14 the panel docks (about 480px) and the grid narrows and stays interactive. On phone it falls back to the existing full-screen overlay. The body is tab-free: method, inputs and a live result first, then the derivation in collapsible sections. Wide content is reshaped, never scrolled sideways (12 months as a 6×2 grid plus a segmented toggle for the year). The full monthly view becomes expandable rows in the grid itself. Mockups: claude.ai canvas 53UrM7XBEVJpkBCH8EQHqz (Main / Herleitung / Kompakt artboards).

Rejected: a centered J variant — it buys only width, which A's content-sized overlay ([ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md)) already gives. Rejected: an editable J Tab 2 — Tab 2 read-only is load-bearing (one form, one dirty check).

**Rule of 2 is met inside controlling-app.** Two independent grid-line editors do the same select → tune → next-line job: `frontend/src/components/workspace/planset/LinePanel.tsx` (modal `Sheet`, 520px, line 285) and `frontend/src/components/workspace/planung/InspektorDrawer.tsx` (already `modal={false}` with outside clicks blocked, but a floating 380px `Sheet` over `GuvPlanGrid.tsx`, with `onSelectLine`). controlling-app ticket `planset-line-editor-docked-inspector` converges both on one side dock (decision 2026-11-06: side dock, not bottom dock, not a centered modal).

**Save model (resolved): the dock owns layout and navigation only, never saving.** The two consumers legitimately differ: LinePanel keeps explicit "Übernehmen" plus a dirty guard on line switch, because the planset API saves with optimistic locking on `planset.version` and has no undo; InspektorDrawer keeps per-field autosave on the live forecast. So the baseline slot must expose a line-switch guard (e.g. an `onBeforeSelect` callback the body uses to allow or block a switch) and must not prescribe a save model.

**Order (operator decision 2026-11-06): baseline first, then consumers.** Per the archetype-gap rule (a consumer never hand-rolls a shape the baseline lacks), this ticket ships the variant in design-baseline first; controlling-app then bumps its `design-baseline` dependency and rebuilds both editors on the shipped export. The two consumer editors plus the mockups are the source, treated like a fleet-synthesis promotion (`promoted_from` names controlling-app's LinePanel and InspektorDrawer, as with `skeleton-loader`). A started but uncommitted controlling-app draft (worktree `controlling-app/.worktrees/planset-line-editor-docked-inspector`: `InspectorDock` / `DockLayout`, prev/next, a dirty-guard handle, editable month rows in `PlansetGrid`) is reference material for the shape, not the shipped code.

## What to do

- [ ] Read the two consumer editors and the controlling-app draft for the shape; record `promoted_from` in MANIFEST.
- [ ] Extend the matrix-grid contract (`docs/archetypes/matrix-grid.md`, role-only per RULES.md rules 2–3) with an `inspector` slot: selection-driven, non-modal, docked at desk27/laptop14, full-screen overlay on phone.
- [ ] Ship the typed slot on `MatrixGridShell` (exported from `design-baseline/archetypes/matrix-grid`), a sandbox demo variant in the gallery (living-demo convention), and a MANIFEST + package version bump, so the consumer can pin the new version.
- [ ] Give the slot a line-switch guard (e.g. `onBeforeSelect` returning allow/block) covering grid clicks, prev/next and close; the shell owns no save model.
- [ ] Keep the inspector body tab-free and never horizontally scrolling; keep selection switching keyboard-operable.

## Acceptance

- The matrix-grid shell renders an `inspector` panel docked at about 480px at desk27 and laptop14, and the grid narrows and stays interactive while it is open.
- Selecting another row/cell updates the open inspector without closing it.
- When the body's guard blocks a switch, the selection and the inspector stay unchanged; with no guard the switch is immediate.
- The matrix-grid contract names no save model for the inspector; both draft-with-apply and per-field autosave bodies are conformant.
- On phone the inspector falls back to the existing full-screen overlay.
- `npm run check:viewports` passes for the matrix-grid demo at the device triad, with no horizontal scroll inside the inspector.
- The matrix-grid contract and the gallery demo describe the inspector variant, and crud-dialog J is unchanged.

## Related

- [[archetype-convergence]]
- [[list-with-detail-sheet-sizes-to-content]]
- [[matrix-grid-inline-edit-contract-contradiction]]
- [[detail-overview-blueprint-rail-variant]]
- [[archetype-gap-editable-tile-layout]]
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — the list-with-detail overlay sizes to its content
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes
- [matrix-grid contract](/docs/archetypes/matrix-grid.md)
