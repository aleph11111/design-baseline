# 0018 — The matrix-grid inspector is the standard edge overlay, not a docked panel

- **Status:** Accepted
- **Date:** 2026-11-20
- **Closes:** backlog `matrix-grid-inspector-edge-overlay`
- **Amends:** matrix-grid (M) Layer 6 "Inspector slot" (Placement, Selection, Rejected), Layer 5 "Workbench satellites", Layer 11 — contract v4.0 / MANIFEST 4.0; [ADR 0013](0013-matrix-grid-workbench-body-dock.md) §2 (grid, `body` and `dock` no longer share a narrowed column beside the inspector).
- **Respects:** [ADR 0010](0010-detail-overlay-sizes-to-content.md) (the overlay geometry reused here), [ADR 0008](0008-one-page-frame-slot-owned-placement.md) (one page frame, slot-owned placement).

## Context

Since v3.6 the matrix-grid `inspector` docked at about 480px beside the grid on desktop and laptop, with no backdrop: the grid narrowed and reflowed, and stayed clickable so a click on another line re-rooted the panel. Only phone used the full-screen overlay. Every other side surface in the baseline — the list-with-detail detail overlay (ADR 0010) and the crud-dialog sheet — slides in from the viewport edge over a dimmed backdrop. In controlling-app's planning pages that gave the same gesture, clicking a line, two different behaviours. The operator rejected the docked variant (ruling 2026-11-19).

The docked panel existed so the user could watch the grid update while tuning a line. The inspector body now leads with the line's own row and its live result, so the panel itself shows what the grid beside it used to.

## Decision

1. **One placement on every viewport.** The inspector renders as the standard edge overlay over a dimmed backdrop, with list-with-detail's geometry: `min-content` wide from `sm`, floor 28rem, ceiling the viewport minus 4rem, full-screen below `sm`. Both surfaces read one shared class (`archetypes/shared/detailOverlay`), so the geometry cannot drift.
2. **The grid never narrows.** The overlay portals out of the page; grid, `body` and `dock` keep their full column width and never reflow when it opens.
3. **The grid is inert while open.** Switching lines is prev / next (re-roots the open panel, keeping the column) or close plus click. A backdrop click, Escape and the close button all close through `onBeforeSelect`; a blocked close leaves selection and overlay unchanged. There is no in-place re-root from a grid click any more.
4. **Everything else in Layer 6 stands:** consumer-owned selection, prev / next stepping, `onBeforeSelect` on every switch (may answer late), no save model, a tab-free body with the live result first. The props are unchanged.

## Rejected alternative

Keep the docked panel on desktop and only add a backdrop toggle. Rejected: two placements for one gesture is exactly the inconsistency the ruling removes, and a toggle is an appearance prop ADR 0004 forbids.

## Consequences

- Breaking in placement only (MANIFEST 4.0); no prop changes. controlling-app `workspace/planung` (`PlanGrid` passes `inspector=`) re-baselines its screenshots and drops any layout that assumed a narrowed grid (consumer follow-up).
- `npm run check:viewports` checks the inspector at the device triad for a backdrop, the list-with-detail width band, an unchanged grid width and an inert grid; the workbench case no longer checks `body` against a docked panel.
