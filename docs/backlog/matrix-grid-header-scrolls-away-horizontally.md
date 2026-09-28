---
area: layout
opened: 2026-09-28
status: needs-enrichment
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "whether the header band and toolbar should stay pinned is a design choice"
  graded_at: 2026-09-28T19:00:00Z
---

# Matrix grid header band and toolbar scroll away with the table horizontally

## Context

`MatrixGridShell` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx:124-126`) makes the whole `SurfaceFrame overflow="auto"` the horizontal scroll container. By design, "the header band + toolbar + table scroll together", so the sticky first column pins against the frame. In hk-crm at 1440px on v0.2.21, the grid on `/matrix/bestand` is about 2.4x the frame width. After scrolling it sideways:
- The title ("Bestands-Matrix") and the Stichtag date toolbar leave the viewport.
- The header band's fill ends partway across (it is only as wide as the frame's client box), leaving an unfilled block to its right.

Seen in light and dark mode. The sticky first column and its opaque head cells (`matrix-grid-sticky-head-cells-translucent`) are fine.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make only the table the horizontal scroll container: wrap it in an inner `relative overflow-x-auto` box, and give the frame `overflow="clip"`. The header band and toolbar then stay full-width and in view, and the sticky first column still pins against the inner box.
- [ ] Update the `MatrixGridShell` comment and the matrix-grid gallery demo, bump the version and cut the tag.

## Acceptance

- After scrolling the gallery matrix-grid demo horizontally, the title and toolbar stay visible, the header band's fill spans the frame, and the first column still pins at offset 0.
- No other `SurfaceFrame overflow="auto"` consumer changes its rendering, and the page stays exactly viewport-wide (the `scroll-box-not-containing-block-sr-only-widens-page` guarantee holds).

## Related

- [archive/matrix-grid-sticky-head-cells-translucent.md](archive/matrix-grid-sticky-head-cells-translucent.md)
- [archive/matrix-grid-page-header-inconsistency.md](archive/matrix-grid-page-header-inconsistency.md)

## Open question

Should the header band and toolbar stay pinned while the grid scrolls sideways? The recommended answer is yes: an inner table scroller, so the date control stays reachable. The alternative is to keep scrolling everything together as documented, and only extend the band's fill to the table's scroll width.
