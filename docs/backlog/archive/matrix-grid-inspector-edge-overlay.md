---
area: archetypes
opened: 2026-11-19
status: done
value: normal
model: opus
model_reason: "amends a shipped contract layer and an ADR-backed rejection; overlay geometry reuse, selection/stepping semantics and gallery/check changes need design judgment"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-19T12:00:00Z
---

# Matrix-grid inspector renders as edge overlay over backdrop

## Context

Operator ruling 2026-11-19: the matrix-grid inspector (Layer 6 "Inspector slot", v3.6, `docs/archetypes/matrix-grid.md:162-171`, `MatrixGridShell` `inspector` slot, `src/components/archetypes/matrix-grid/MatrixInspector.tsx`) must stop docking beside the grid. Today on desktop/laptop it docks at ~480px with no backdrop, and the grid narrows and reflows next to it. Every other side surface in the baseline (list-with-detail overlay per [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md), crud-dialog sheet) slides in from the viewport edge over a dimmed backdrop. In controlling-app planning this yields two different behaviours for the same gesture, clicking a line. The operator strongly rejects the docked/nested variant.

The original reason for docking ("watch the grid update while tuning"; line 171 rejects the modal overlay) is covered because the inspector body now shows the line's own year row and live result. Mock of the target behaviour: https://claude.ai/artifact/A5HS9QuGg85udPRwei3ie5 (sections 1, 1b, 2).

Consumer to migrate afterwards: controlling-app `frontend/src/components/workspace/planung` (`PlanGrid` passes `inspector=`) — consumer follow-up, not part of this ticket.

## What to do

- [ ] Render the inspector on every viewport as the standard edge overlay over a dimmed backdrop, same geometry as the list-with-detail overlay (ADR-0010: content-sized, floor 28rem, ceiling `100vw − 4rem`, full-screen below the small breakpoint); the grid no longer narrows or reflows when it opens (`MatrixInspector.tsx`, `MatrixGridShell.tsx`).
- [ ] Keep everything else in Layer 6 unchanged: consumer-owned selection, re-root on line switch, prev/next stepping rows (keeping the column), `onBeforeSelect` guard on every switch, tab-free body with the live result first.
- [ ] Clicking another line while the overlay is open is close plus click (backdrop click = close, guarded by `onBeforeSelect`), or prev/next; the grid is inert behind the backdrop, so there is no in-place re-root from the grid.
- [ ] Write an ADR (next number after 0017, add to `docs/adr/INDEX.md`) amending Layer 6 and the line-171 "Rejected" paragraph of `docs/archetypes/matrix-grid.md`, and amending the docked-inspector decision recorded in [ADR-0013](/docs/adr/0013-matrix-grid-workbench-body-dock.md) (grid, `body` and `dock` no longer share a narrowed column beside the inspector).
- [ ] Update the contract text (Placement, Selection, Rejected paragraphs) and bump the matrix-grid version in `docs/archetypes/MANIFEST.json` (currently 3.10) plus the package version per the repo's version-bump rules (`docs/RULES.md`).
- [ ] Update the gallery demo (`src/examples/matrix-grid-demo.tsx`, inspector and workbench modes), `MatrixGridShell.test.tsx`, and `scripts/check-viewports.mjs` (inspector case at the device triad ~line 250: assert backdrop present, grid width unchanged when open, overlay geometry matches list-with-detail) and screenshot baselines.

## Acceptance

- With the inspector open at desk27 and laptop14, the panel slides in from the viewport edge over a dimmed backdrop and the grid column width is unchanged from the closed state.
- The overlay width follows the list-with-detail geometry (floor 28rem, ceiling `100vw − 4rem`, full-screen on phone) at the device triad in `npm run check:viewports`.
- Prev/next stepping, Escape, close and `onBeforeSelect` blocking still behave as before; a blocked switch leaves selection and overlay unchanged.
- Clicking the backdrop closes the overlay through `onBeforeSelect`; the grid is no longer clickable while it is open.
- `docs/archetypes/matrix-grid.md` no longer contains the "docks beside the grid at about 480px" wording or the modal-overlay rejection, and the new ADR is listed in `docs/adr/INDEX.md`.
- No other matrix-grid surface (workbench `body`/`dock` slots, preview shells) still assumes a narrowed column beside the inspector.

## Related

- [[archetype-gap-matrix-grid-docked-inspector]] — the shipped ticket whose docked placement this reverses
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — overlay geometry to reuse
- [ADR-0013](/docs/adr/0013-matrix-grid-workbench-body-dock.md) — workbench slots that shared the narrowed column
- [[list-with-detail-sheet-sizes-to-content]] — implementation of the overlay geometry
