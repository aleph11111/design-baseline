---
area: archetypes
opened: 2026-11-18
status: ready
value: normal
model: sonnet
model_reason: "scoped class change on one shared bar plus a shell wrapper cleanup, test, demo and version bump; cause is established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# list-with-detail detail actions squeeze the sheet title to zero

## Context

`ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`, ~l.364-386) mounts `detailActions` in `SurfaceHeaderBar` beside a `truncate` `SheetTitle` wrapped in `[contain:inline-size]`, inside a `sm:w-min sm:min-w-md` sheet (content-sized, floor 28rem, per [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md)). The shared bar (`src/components/layout/SurfaceHeaderBar.tsx`) is a non-wrapping `flex … justify-between` row whose actions wrapper is `shrink-0` (the shell additionally wraps `detailActions` in its own redundant `shrink-0` div). With 3 `detailActions` the actions row takes its full width and the `min-w-0` title column, which contributes no intrinsic width because of `contain:inline-size`, collapses to 0 px. Reported by behandlungskompass (patienten page, its ticket `patient-detail-sheet-name-hidden`), which worked around it by rendering the actions in the detail body. The same bar is used by `CrudDialogHeader` (`src/components/archetypes/crud-dialog/CrudDialogHeader.tsx`), so the defect is in the shared bar, not only the list-with-detail call site. The page-level siblings (`HeadingRow`, detail-overview, settings-page) were already fixed ([[heading-row-actions-squeeze-title-container-query]]) and do not use `SurfaceHeaderBar`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `SurfaceHeaderBar`, let the bar wrap (`flex-wrap`) and give the title block a usable basis (`min-w-0 flex-1` plus a rem-based `basis`), so an actions row that does not fit beside the title drops onto its own line below it and the title keeps the full bar width and its truncation. Class change only, no new prop (appearance stays in the bar, per [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md)).
- [ ] Keep the `pr-8` Sheet-close clearance: with actions wrapped below the title the title row must still clear the built-in close button at top-4 right-4 (move the clearance to the bar or title block if the actions row no longer sits at the right edge).
- [ ] Drop the redundant inner `shrink-0` wrapper div around `detailActions` in `ListWithDetailShell` (the bar's actions wrapper already provides the row) and confirm `CrudDialogHeader`'s own inner `shrink-0` group still wraps correctly.
- [ ] Add a regression test in `ListWithDetailShell.test.tsx` (3 `detailActions`, long `detailTitle`) asserting the wrap classes on the bar and no `shrink-0`-only layout that can collapse the title; extend `SurfaceHeaderBar.test.tsx` and check `CrudDialogHeader.test.tsx` still passes.
- [ ] Add a gallery demo variant in `src/components/archetypes/list-with-detail/list-with-detail-demo.tsx` with 3 detail actions and a long title (living-demos convention) and confirm in real Chrome at the device triad that the title is visible and truncates, actions are reachable, and the close button does not overlap either.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (consumer: behandlungskompass may drop its body-rendered actions workaround; breaking: no).

## Acceptance

- A list-with-detail sheet with 3 `detailActions` and a long `detailTitle` at `sm` and above shows the title at a non-zero width (truncated, not hidden) with the actions on a line beneath it.
- With 1 short action and a short title the bar renders unchanged: title left, actions right on the same row.
- Every `SurfaceHeaderBar` consumer (`ListWithDetailShell`, `CrudDialogHeader`) no longer lets a `shrink-0` actions row collapse the title; no other call site keeps the non-wrapping bar.
- The Sheet close button never overlaps the title or the actions in either layout.
- `npm test` fails on a version bump without a `CHANGELOG.md` entry, and passes after the entry is added.

## Related

- [[heading-row-actions-squeeze-title-container-query]] — same defect class fixed for page headers; the precedent for class-only wrap
- [[page-header-actions-squeeze-title-on-phones]] — earlier squeeze fix on the shared row
- [[list-with-detail-sheet-sizes-to-content]] — ADR-0010 sizing that makes the sheet narrow
- [[archetype-rollout-desktop-detail-rail-drops-title-and-actions]] — related title/actions loss on the detail rail
- [[refactor-shell-surface-header-slot-duplication]] — the shell header slot this bar belongs to
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — The list-with-detail overlay sizes to its content
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality
