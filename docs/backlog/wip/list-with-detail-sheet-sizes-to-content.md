---
area: archetypes
opened: 2026-10-15
status: ready
value: high
model: opus
model_reason: "changes a locked archetype's presentation rule plus the surface-selection doc and needs an ADR; the rule boundary (sheet vs route) is a design tradeoff, not pattern-following"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-15T00:00:00Z
---

# List-with-detail detail sheet sizes to its content and never scrolls sideways

## Context

`ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:273`) renders the `detail` slot in a `SheetContent` with one fixed width, `sm:max-w-md` (448px). The contract allows no other width; the shell API has been closed since v2.0. A data-heavy detail therefore scrolls sideways inside the sheet. Example: gebo-stock-kiosk's Artikelsuche shows one storage-bin table per company. Before PR gebo#66 its "frei" and "zählt" columns sat off-screen, and PR #66 only fixed it by squeezing cell padding to `px-1`. Operator ruling (2026-10-15): the data decides the sheet's width. Scrolling sideways inside the sheet, or nested tables you have to scroll to read, is a defect.

Second, related drift: `docs/CHOOSING-A-SURFACE.md` "The read/detail spectrum" still describes the pre-v3.0 pane, read "beside its list… the list stays mounted and the selection stays visible". It also calls a row click that navigates straight to a route, with no pane in between, "the drift". Yet list-with-detail's forbidden pattern 10 already sanctions "the overlay … or its own route". And the operator's position is that when the list's row already carries the summary, a detail with child collections belongs on its own route with no pane in between.

## What to do

- [ ] Write an ADR (next number after [ADR-0009](/docs/adr/0009-figures-in-the-house-sans.md)): the detail sheet is content-sized between a floor (today's 28rem) and a ceiling (viewport minus a gutter that keeps the list's edge visible). No horizontal scroll inside the sheet. A detail that cannot fit under the ceiling escalates to a `detail-overview` route instead.
- [ ] In `ListWithDetailShell.tsx`, replace the fixed `sm:max-w-md` with shrink-to-fit sizing: `width: max-content` clamped by `min-width`/`max-width`. Phone width stays full-screen.
- [ ] Add a dev-only overflow guard to the shell. When the detail body's `scrollWidth` exceeds its `clientWidth` at the ceiling, log one `console.warn` naming the `detailTitle` and pointing at the escalation rule.
- [ ] Update `docs/archetypes/list-with-detail.md`: Layer 11 gets the sizing rule, and a new forbidden pattern covers "horizontally scrolling or nested-scroll content inside the detail overlay". Add an Acceptance-gate line, a version note and the MANIFEST bump.
- [ ] Reconcile `docs/CHOOSING-A-SURFACE.md` "The read/detail spectrum" with v3.0+ (overlay, not an in-flow pane). Sanction row → route directly when the row already shows the entity's summary and the detail is a child collection or workspace. Add a revision-log line.
- [ ] Extend the list-with-detail demo (`src/examples/list-with-detail-demo.tsx`) with a wide-detail variant (a multi-column table in the detail), per the living-demos convention.

## Acceptance

- In the gallery, a detail containing a 7-column table opens the sheet wider than 448px, and the table renders without horizontal scroll at a 1280px viewport.
- A short summary detail still opens at the floor width (today's look, unchanged).
- At 390px the sheet stays full-screen, and any table scrolls only inside its own container.
- When the content exceeds the ceiling, the dev build emits the overflow warning, and every other detail that fits emits no warning.
- `npx tsc --noEmit` and `npm test` pass, and `CHOOSING-A-SURFACE.md` no longer describes the detail as rendered beside the list.

## Related

- [[archetype-convergence-list-with-detail-close-api]]
- [[list-with-detail-full-bleed-nested-leak]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame
