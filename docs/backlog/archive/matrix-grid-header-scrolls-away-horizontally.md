---
area: layout
opened: 2026-09-28
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T21:00:00Z
---

# Matrix grid header band and toolbar scroll away with the table horizontally

## Context

`MatrixGridShell` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx:124-126`) makes the whole `SurfaceFrame overflow="auto"` the horizontal scroll container. By design, "the header band + toolbar + table scroll together", so the sticky first column pins against the frame. In hk-crm at 1440px on v0.2.21, the grid on `/matrix/bestand` is about 2.4x the frame width. After scrolling it sideways:
- The title ("Bestands-Matrix") and the Stichtag date toolbar leave the viewport.
- The header band's fill ends partway across (it is only as wide as the frame's client box), leaving an unfilled block to its right.

Seen in light and dark mode. The sticky first column and its opaque head cells (`matrix-grid-sticky-head-cells-translucent`) are fine.

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Make only the table the horizontal scroll container: wrap it in an inner `relative overflow-x-auto` box, and give the frame `overflow="clip"`. The header band and toolbar then stay full-width and in view, and the sticky first column still pins against the inner box.
- [x] Update the `MatrixGridShell` comment and the matrix-grid gallery demo, bump the version and cut the tag.

## Acceptance

- After scrolling the gallery matrix-grid demo horizontally, the title and toolbar stay visible, the header band's fill spans the frame, and the first column still pins at offset 0.
- No other `SurfaceFrame overflow="auto"` consumer changes its rendering, and the page stays exactly viewport-wide (the `scroll-box-not-containing-block-sr-only-widens-page` guarantee holds).

## Related

- [[matrix-grid-sticky-head-cells-translucent]]
- [[matrix-grid-page-header-inconsistency]]

## Decision

**Question:** Should the header band and toolbar stay pinned while the grid scrolls sideways?

**Answer (operator, 2026-09-28):** Yes. Only the table scrolls sideways, following hk-crm's recommendation. Shipped in v0.2.24:
- `MatrixGridShell` renders the default clipped `SurfaceFrame`, and wraps the table in `<div data-slot="matrix-scroll" className="relative overflow-x-auto">`. The empty state also uses the clipped frame.
- matrix-grid.md goes to v1.5 (MANIFEST 2.6) with the new Layer 5 overflow keying rule: surface clipped, table box is the one scroller.
- `SurfaceFrame`'s `overflow="auto"` now has no donor consumer. It is kept for API compatibility, and its `_adherence.json` note says so.

Measured on the built gallery matrix-grid demo at 800px in headless Chromium. Scrolling the table 300px leaves the header band at x=328–728, the full frame width, and the sticky first column stays at x=328. A 300px window scroll keeps the app header at top 0, and the document stays 800px wide. A sweep of all 41 gallery pages at 1440 and 800px finds none wider than the viewport, and the sticky head cells stay opaque in light and dark. A new test asserts the header and toolbar sit outside the scroll box and every sticky cell sits inside it.
