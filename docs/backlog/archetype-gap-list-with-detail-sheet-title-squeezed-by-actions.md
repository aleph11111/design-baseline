---
area: archetypes
opened: 2026-11-18
status: ready
value: high
model: sonnet
model_reason: "scoped layout fix in one shell header plus test, demo and version bump; cause is established and the stacking precedent exists in HeadingRow"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# List-with-detail sheet title squeezed to zero width by detailActions

## Context

`ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`, ~l.364-386, seen in v0.47.0) renders the detail sheet header through `SurfaceHeaderBar`. The `SheetContent` is `sm:w-min sm:min-w-md`, the `detailActions` wrapper is `flex shrink-0 items-center gap-2`, and the title sits in a `[contain:inline-size]` div with `truncate` (ADR-0010 rule 3: the title never widens the overlay). The title therefore contributes no width, and the `shrink-0` actions take what is left. Measured in the consumer behandlungskompass on `/praxis/patienten` (`detailTitle` = patient name): two actions leave the title at 54 px (`Max...`); three actions (`Zum Portal einladen (SMS)`, `Zum Portal einladen (E-Mail)`, `Neue Strecke`) leave it 0-1 px, at 1180 px and 1440 px viewport alike, because the width depends on the action count, not the viewport. In that consumer this is a wrong-patient risk: the dentist cannot see whose record is open when pressing `Neue Strecke`.

Repro in any consumer: render `ListWithDetailShell` with a `detailTitle` of about 30 characters and three text buttons in `detailActions`, open the sheet.

A consumer-side workaround (moving the actions into the detail body) was rejected by the /ship review gate in behandlungskompass PR #130 as the wrong place; the consumer ticket `patient-detail-sheet-name-hidden` waits for this fix and a design-baseline release to bump to.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. `SurfaceHeaderBar` (`src/components/layout/SurfaceHeaderBar.tsx`) is also used by `CrudDialogHeader`; check whether the squeeze exists there too and fix it in the shared bar if so.
- [ ] In the `detailPanel` header of `ListWithDetailShell.tsx`, give the title its own full-width line and let the actions wrap below it (drop `shrink-0` on the actions wrapper, add `flex-wrap`, keep the `pr-8` clearance for the Sheet close button), following the HeadingRow precedent ([[heading-row-actions-squeeze-title-container-query]]). Class change only: no new prop (ADR-0004, ADR-0010 rule 5).
- [ ] Keep ADR-0010 rule 3: the title still never widens the sheet; it truncates only when it exceeds the sheet's own width (which reaches the `100vw − 4rem` ceiling only for wide content).
- [ ] Add a render test (vitest) with a ~30-character `detailTitle` and three text-button `detailActions` asserting the title element keeps a non-zero, readable width; extend the list-with-detail demo (`src/examples/list-with-detail-demo.tsx`) with a many-actions variant per the living-demos convention.
- [ ] Note the amendment on ADR-0010 rule 3 / the `docs/archetypes/list-with-detail.md` Layer 11 sizing text, bump the contract version and MANIFEST, and bump `package.json` so the consumer can take a release.

## Acceptance

- With a 30-character `detailTitle` and three text-button `detailActions`, the sheet shows the full title on its own line and the actions below it, at 1180 px and 1440 px viewports.
- With zero or one action the header looks unchanged (title and action on one line where they fit).
- A title longer than the sheet's width still truncates and never widens the sheet.
- No other `SurfaceHeaderBar` call site (including `CrudDialogHeader`) renders its title at zero width with many actions.
- `npx tsc --noEmit` and `npm test` pass.

## Related

- [[list-with-detail-sheet-sizes-to-content]]
- [[heading-row-actions-squeeze-title-container-query]]
- [[page-header-actions-squeeze-title-on-phones]]
- [[archetype-rollout-desktop-detail-rail-drops-title-and-actions]]
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — The list-with-detail overlay sizes to its content
