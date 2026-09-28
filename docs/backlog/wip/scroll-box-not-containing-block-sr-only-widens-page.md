---
area: layout
opened: 2026-09-28
status: ready
value: high
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T18:40:00Z
---

# Horizontal scroll boxes are not a containing block so sr-only text widens the whole page

## Context

Tailwind's `sr-only` is `position: absolute`. When it sits inside a horizontal scroll box that is not itself positioned, the absolute span's containing block is an ancestor outside the box. The box's `overflow-x-auto` then does not clip it, and a span scrolled past the right edge extends the document's scrollable width. Since the v0.2.19 window-scroll `AppShell`, that shows up as page-level sideways scroll into empty canvas.

Measured in hk-crm at 1440px on design-baseline v0.2.20. The document grows to 2654px on `/matrix/potenzial` and 3170px on `/matrix/overview`: the matrix cells' sr-only labels sit inside `SurfaceFrame overflow="auto"` (`src/components/layout/SurfaceFrame.tsx:112`). It grows to 1495px on `/opportunities`: the card action buttons' sr-only "Aktionen" sit inside `BoardShell`'s `overflow-x-auto` (`src/components/archetypes/kanban-board/BoardShell.tsx:48`). Hiding the escaping `sr-only` spans brings the width back to 1440. hk-crm's old local AppShell (`<main overflow-auto>`) gave the same document widths, so the bug predates window scroll. It is just visible now.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `relative` to every horizontal scroll container in `src/components/`. That makes each one the containing block of its absolute descendants, so its overflow clips them. Covers `SurfaceFrame`'s `overflow="auto"` mode, `BoardShell` (both branches), `CalendarShell`, `ListWithDetailShell`, `SettingsTableShell` and `StatementWithFiltersShell`.
- [ ] Add a regression test: a `SurfaceFrame overflow="auto"` with a wide child holding an `sr-only` span, asserting the frame carries `relative`.

## Acceptance

- In a consumer with a wide matrix grid or kanban board, `document.documentElement.scrollWidth` equals the viewport width at 1440px after the fix, and the page no longer scrolls sideways.
- No other `overflow-x-auto` container in `src/components/` is left without `relative`.

## Related

- [archive/detail-overview-rail-sticky-ineffective.md](../archive/detail-overview-rail-sticky-ineffective.md)
- [archive/refactor-matrix-grid-cell-and-head-extraction.md](../archive/refactor-matrix-grid-cell-and-head-extraction.md)
