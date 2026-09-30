---
area: layout
opened: 2026-09-28
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T18:40:00Z
---

# Matrix grid sticky first-column head cells are translucent so scrolled headers show through

## Context

`MatrixGridHead` (`src/components/archetypes/matrix-grid/MatrixGridHead.tsx:35` and `:56`) pins the first-column head cells with `sticky left-0 z-10`, but paints them `bg-muted/50` and `bg-muted/30`. Those are translucent. When the grid is scrolled horizontally, the column headers passing underneath show through the pinned cell. In hk-crm (`/matrix/bestand`, 1440px, v0.2.20, light mode), "Unternehmen" renders over "Workshop" and reads as "aleUnternehmenop". The body's sticky first-column cells are opaque, so only the head overlaps.

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Give both sticky head cells an opaque background that keeps the current tint: layer the muted tint over the surface colour, not over transparency. Do the same for any other `sticky` cell in `src/components/archetypes/matrix-grid/`.

*(v0.2.21, shipped with `scroll-box-not-containing-block-sr-only-widens-page`. Both sticky head cells now paint `color-mix(in oklab, var(--color-muted) 50%/30%, var(--color-surface-raised))`, the same tint but opaque. The body's sticky cell was already `bg-card`. Computed background on the built gallery: before, alpha 0.5/0.3 in light and dark; after, opaque in both. A new test asserts no `bg-*/<alpha>` on any sticky matrix cell.)*

## Acceptance

- After scrolling the gallery matrix-grid demo horizontally, the pinned "company" head cells no longer show the scrolled headers through them, in light and dark mode.
- No other sticky cell in `src/components/archetypes/matrix-grid/` uses a translucent background.

## Related

- [[refactor-matrix-grid-cell-and-head-extraction]]
- [[scroll-box-not-containing-block-sr-only-widens-page]]
