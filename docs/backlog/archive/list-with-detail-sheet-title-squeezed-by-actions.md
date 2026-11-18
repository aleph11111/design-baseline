---
area: layout
opened: 2026-11-18
status: done
value: high
model: sonnet
model_reason: "scoped class change on one shared bar plus test, demo and version bump; cause is established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# List-with-detail sheet title squeezed to zero by detail actions

## Context

`SurfaceHeaderBar` (`src/components/layout/SurfaceHeaderBar.tsx`) is `flex items-start justify-between gap-5` with a `min-w-0` title block and an actions wrapper that is `flex shrink-0 items-center gap-2`. `ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`, detailPanel ~l.364-386) mounts it inside a `sm:w-min` sheet, wraps the `SheetTitle` in `[contain:inline-size]` (so the title has no intrinsic width) and adds a second `shrink-0` wrapper around `detailActions`. With 3 detailActions the actions take their full max-content width, the bar has no wrap, and the title column collapses to 0 px, so the title is invisible. Reported by consumer behandlungskompass (patienten page, ticket `patient-detail-sheet-name-hidden`), which worked around it by rendering the actions in the detail body. The cause lives in the shared bar, not the list-with-detail call site: the bar's only other consumer is `CrudDialogHeader` (`src/components/archetypes/crud-dialog/CrudDialogHeader.tsx`, same `shrink-0` actions, non-wrapping bar). `detail-overview` does not mount `SurfaceHeaderBar`; its rail header is a different component, so it is out of scope here (the sibling `HeadingRow` squeeze was already fixed, [[heading-row-actions-squeeze-title-container-query]]).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `SurfaceHeaderBar`, let the bar `flex-wrap` and give the title block a flex basis (e.g. `min-w-0 flex-1 basis-48`) so that when the actions would leave the title less than that basis they wrap onto a row beneath the title instead of squeezing it. Class change only, no new prop (ADR-0004).
- [ ] Drop `shrink-0` from the actions wrapper (or keep it only on the inner row) so the wrapped row can use the full bar width; keep `actionsClassName="pr-8"` clearance for the Sheet close button working when the actions sit on their own row.
- [ ] Remove the redundant `shrink-0` actions `div` that `ListWithDetailShell` wraps around `detailActions`, and re-check `CrudDialogHeader`'s inner `flex shrink-0` actions group (the close button must stay attached to the actions).
- [ ] Add a `SurfaceHeaderBar.test.tsx` case with a long title and 3 actions asserting the title element is rendered and the wrap/basis classes are present, plus a `ListWithDetailShell` render test (3 detailActions, long detailTitle) asserting the title is in the document and visible.
- [ ] Add a gallery demo case (long `detailTitle`, 3 `detailActions`) and confirm in real Chrome at the device triad that the title is readable (not 0 px) and nothing overflows horizontally.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` fails `npm test` on a bump without one); consumer note: behandlungskompass may move its actions back into the sheet header.

## Acceptance

- A `ListWithDetailShell` sheet with 3 `detailActions` and a long `detailTitle` shows the title at readable width, with the actions wrapped beneath it when they do not fit beside it, and no horizontal overflow of the sheet.
- No other `SurfaceHeaderBar` consumer squeezes its title to 0 px: `CrudDialogHeader` with 3 actions and a long title renders the title visible too, and no `SurfaceHeaderBar` call site keeps a non-wrapping bar or a `shrink-0` actions block.
- The same bar with one short action and a short title renders unchanged: title left, actions right-aligned on one row.
- `npm test` fails on a version bump without a `CHANGELOG.md` entry, and passes after the entry is added.

## Related

- [[heading-row-actions-squeeze-title-container-query]] — same squeeze, page header row (fixed with a container query)
- [[page-header-actions-squeeze-title-on-phones]] — earlier viewport-based fix of the same pattern
- [[surface-header-compose-not-copy]] — origin of the shared `SurfaceHeaderBar`
- [[list-with-detail-sheet-sizes-to-content]] — the `sm:w-min` / `contain:inline-size` sheet sizing this interacts with
- [[archetype-gap-list-with-detail-sheet-title-squeezed-by-actions]] — duplicate of this ticket, to be discarded
- [[list-with-detail-actions-squeeze-title]] — duplicate of this ticket, to be discarded
- [[list-with-detail-sheet-actions-squeeze-title]] — duplicate of this ticket, to be discarded

## 2026-11-18 update

Four tickets were filed for this one defect. This is the canonical one: it fixes at the shared `SurfaceHeaderBar` (also covering `CrudDialogHeader`), so two parallel `/feat` sessions must not pick the others. The three listed under Related are duplicates; the operator discards them separately. `value` raised to `high` (the duplicates carried it): in behandlungskompass `/praxis/patienten` the hidden title is a wrong-patient risk, since the dentist cannot see whose record is open when pressing `Neue Strecke`, and consumer ticket `patient-detail-sheet-name-hidden` waits on this release.

Fold in from the duplicates when implementing:

- Keep ADR-0010 rule 3: the title never widens the sheet, and truncates only when longer than the sheet's own width.
- Keep the `pr-8` Sheet-close clearance when the actions wrap onto their own row.
- Amend ADR-0010 rule 3 / `docs/archetypes/list-with-detail.md` sizing text if the wrap changes the documented behaviour.
- Acceptance across action counts: a test covers N = 0..4 `detailActions`, not only the 3-action case.
