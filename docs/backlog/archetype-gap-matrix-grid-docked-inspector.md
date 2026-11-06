---
area: archetypes
opened: 2026-11-06
status: needs-enrichment
value: normal
model: opus
model_reason: "archetype shape is the deliverable: a non-modal docked slot plus an unresolved save model are open design tradeoffs"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved ## Open question (save model) caps the score at 4"
  graded_at: 2026-11-06T00:00:00Z
---

# Matrix-grid gap: non-modal docked inspector for selection-driven line tuning

## Context

controlling-app's planset grid (accounts × plan years) opens a raw 520px `Sheet` with eight stacked sections when a line is clicked; users call it far too loaded. The user tunes one line, watches the result, then moves to the next line without closing. The only sanctioned surfaces today are matrix-grid's side overlay (`docs/archetypes/matrix-grid.md` Layer 6 click contract, `onCellClick`, line 152) and crud-dialog J. J is modal: `CrudDialogSheet` renders `Sheet`, which always renders `SheetOverlay` (`src/components/ui/sheet.tsx:72`), so the grid is inert behind a backdrop and a 720px `lg` sheet covers half of a 1440px desk.

Proposal: an `inspector` slot on the matrix-grid shell (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx`). The selected row/cell drives the panel. At desk27 and laptop14 the panel docks (about 480px) and the grid narrows and stays interactive. On phone it falls back to the existing full-screen overlay. The body is tab-free: method, inputs and a live result first, then the derivation in collapsible sections. Wide content is reshaped, never scrolled sideways (12 months as a 6×2 grid plus a segmented toggle for the year). The full monthly view becomes expandable rows in the grid itself. Mockups: claude.ai canvas 53UrM7XBEVJpkBCH8EQHqz (Main / Herleitung / Kompakt artboards).

Rejected: a centered J variant — it buys only width, which A's content-sized overlay ([ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md)) already gives. Rejected: an editable J Tab 2 — Tab 2 read-only is load-bearing (one form, one dirty check).

Baseline never originates archetypes ([ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md)): this must mature in controlling-app first (Phase 1–4, stable one session), then be promoted via `/promote-archetype`. This ticket records the gap and the target shape; it is not dispatchable for implementation until the consumer-side pattern has matured.

## What to do

- [ ] Mature the docked inspector in controlling-app's planset grid first, against the three mockup artboards, and record the promotion source.
- [ ] On promotion, extend the matrix-grid contract (`docs/archetypes/matrix-grid.md`, role-only per RULES.md rules 2–3) with an `inspector` slot: selection-driven, non-modal, docked at desk27/laptop14, full-screen overlay on phone.
- [ ] Ship the typed slot on `MatrixGridShell`, a sandbox demo variant in the gallery (living-demo convention), and a MANIFEST version bump.
- [ ] Keep the inspector body tab-free and never horizontally scrolling; keep selection switching keyboard-operable.

## Acceptance

- The matrix-grid shell renders an `inspector` panel docked at about 480px at desk27 and laptop14, and the grid narrows and stays interactive while it is open.
- Selecting another row/cell updates the open inspector without closing it.
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

## Open question

Save model for the inspector. Options: (a) draft with an "Übernehmen" button plus a dirty guard when switching lines — **recommended default**: one form, one dirty check, matches the Tab-2 rationale, no dependency on planset history; (b) autosave per field — only viable if the planset can undo or version changes. Auto-resolved to (a) for filing; the operator confirms before the consumer builds it.
