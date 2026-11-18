---
area: archetypes
opened: 2026-11-18
status: ready
value: high
model: sonnet
model_reason: "scoped class change at one shared header constant plus test and demo; cause is established (shrink-0 actions beside a contained, truncating title)"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# List-with-detail sheet actions squeeze the detail title to zero width

## Context

In `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx` (~l.364-386) the detail sheet header passes `detailActions` into `SurfaceHeaderBar` `actions` as `<div className="flex shrink-0 items-center gap-2">`, beside a title column that is `[contain:inline-size]` around a `truncate` `SheetTitle`. The sheet is `sm:w-min` (content-sized, ADR-0010), so the title column contributes no intrinsic width. With three `detailActions` the actions take the whole bar and the title column collapses to 0 px: the title is invisible. Seen in the behandlungskompass patienten page (its ticket `patient-detail-sheet-name-hidden`); behandlungskompass worked around it by rendering the actions in the detail body. Every consumer with several actions and a long `detailTitle` hits the same defect. `SurfaceHeaderBar` (`src/components/layout/SurfaceHeaderBar.tsx`) is shared with `CrudDialogHeader`, so the fix point is the shell header row or the bar itself, not a consumer.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make the title survive any number of `detailActions`: wrap the actions below the title (or let the title wrap) in the shell header, so the title column keeps a usable minimum width. Keep the `pr-8` clearance for the built-in Sheet close button and the contained-title rule that stops a long title widening the sheet.
- [ ] Check `SurfaceHeaderBar` consumers (`CrudDialogHeader`) for the same `shrink-0` actions pattern; fix there too if the squeeze reproduces.
- [ ] Add a gallery demo / test case of `list-with-detail` with three `detailActions` and a long `detailTitle` (per the living-demos convention).

## Acceptance

- With 3 `detailActions` and a long `detailTitle`, the `SheetTitle` renders with a non-zero width and its text is visible at the sheet's `sm:min-w-md` floor and at phone width.
- No consumer with N `detailActions` (N = 0..4) hides the title: a test asserts the class of the problem, not just the 3-action case, so no other action count or `SurfaceHeaderBar` caller regresses.
- A long title still truncates or wraps without widening the sheet beyond its content-sized ceiling (ADR-0010 unchanged).

## Related

- [[heading-row-actions-squeeze-title-container-query]] — same squeeze, page heading row
- [[page-header-actions-squeeze-title-on-phones]] — same squeeze, page header on phones
- [[list-with-detail-sheet-sizes-to-content]] — introduced the `sm:w-min` content-sized sheet
- [[archetype-rollout-desktop-detail-rail-drops-title-and-actions]] — earlier title/actions loss in the detail surface
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — detail overlay sizes to content
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — drawer keeps its own header bar with SheetTitle
