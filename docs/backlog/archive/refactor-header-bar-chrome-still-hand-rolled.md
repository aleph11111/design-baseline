---
area: refactor
opened: '2026-08-25'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-25T10:49:12.081Z'
model: sonnet
model_reason: >-
  the target seam is already named in the predecessor ticket's own third bullet — extract the bar
  chrome so the three Radix/heading-constrained headers compose it; no contract decisions remain
---

# Extract the header-bar chrome the three remaining shells still hand-roll off headerFillClasses

## Context

Severity: **medium** (DRY / abstraction consistently bypassed). `SurfaceHeader` (`src/components/layout/SurfaceHeader.tsx:34`) documents itself as the canonical on-surface header: "Every framed archetype shell mounts this at the top of its one bounded card so the whole fleet shares one header treatment." Three shells still don't, and instead reach past it to the raw class table:

- `src/components/archetypes/detail-overview/DetailOverviewShell.tsx:133` — `<div className={cn("px-5 py-4", hfc.bar)}>` wrapping a `NestedPageHeading`
- `src/components/archetypes/crud-dialog/CrudDialogHeader.tsx:60` — `cn("flex items-start justify-between gap-4 px-6 py-4 shrink-0", hfc.bar)` with `SheetTitle` / `SheetDescription` inside
- `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:238` — `cn("flex shrink-0 items-center justify-between gap-3 px-5 py-4", hfc.bar)` for the mobile detail Sheet's bar

`headerFillClasses` is imported in four places (`grep -rn headerFillClasses src/components`): `SurfaceHeader` plus those three. So the header-fill contract — the inversion selectors in `SOLID_INVERT`, the bar background, the title/kicker/subtitle overrides — is applied four times by four different callers, each choosing its own padding (`px-5 py-4` twice, `px-6 py-4` once) and its own title classes. `ListWithDetailShell.tsx:246` re-types the title as `"min-w-0 truncate text-lg font-semibold leading-tight"` — `SurfaceHeader.tsx:69`'s treatment, hand-copied — while `CrudDialogHeader` maps its subtitle onto `hfc.kicker` rather than the `hfc.subtitle` slot that exists for exactly that purpose.

This is the unshipped half of a fix already made once. `surface-header-compose-not-copy` moved `ReportShell` and `CalendarShell` onto `SurfaceHeader` and its third bullet explicitly deferred the rest: "If detail-overview / crud-dialog need custom internals, extract the shared bar chrome (padding + header-fill wrapper) into `SurfaceHeader` so all shells share one implementation." Those three shells do have real constraints — two must render Radix `SheetTitle`/`SheetDescription` for the dialog's accessible name, and detail-overview must render the fixed-scale `NestedPageHeading` — so the answer is the bar chrome, not the whole component.

## What to do

- [ ] Add a `SurfaceHeaderBar` element to `src/components/layout/` owning the bar wrapper: the canonical padding, the `hfc.bar` application, and the left-block / right-actions flex layout, with `children` for the title block so a caller can supply `SheetTitle` or `NestedPageHeading` instead of a plain div.
- [ ] Rebuild `SurfaceHeader` on top of it so there is one implementation, not a parallel one.
- [ ] Move `DetailOverviewShell.tsx:133`, `CrudDialogHeader.tsx:60` and `ListWithDetailShell.tsx:238` onto the bar, deleting their `headerFillClasses` imports and their local padding/title class strings.
- [ ] Settle the padding: three callers currently use two values (`px-5 py-4`, `px-6 py-4`); pick one and state it in the bar, or expose it as a named density mode if the dialog genuinely needs the wider gutter.
- [ ] Point `CrudDialogHeader`'s subtitle at the `hfc.subtitle` slot instead of `hfc.kicker`, which is what that slot's JSDoc in `headerFill.ts` describes.
- [ ] Add a test asserting all four header sites render the shared bar (a common `data-slot`) and that a `headerFill="solid"` context inverts the title in each.
- [ ] Bump the `detail-overview`, `crud-dialog` and `list-with-detail` `version`s in `docs/archetypes/MANIFEST.json`.

## Acceptance

- `grep -rn "headerFillClasses" src/components/archetypes` returns no hits — only the layout layer reads the class table.
- The bar's padding and `hfc.bar` application appear once; a change to the header-fill treatment needs one edit and shows up in the detail-overview, crud-dialog and list-with-detail demos.
- No shell re-types `text-lg font-semibold leading-tight` for a surface title; `grep -rn "text-lg font-semibold leading-tight" src/components/archetypes` returns no hits.
- `CrudDialogHeader`'s subtitle renders through `hfc.subtitle`, so it matches every other shell's subtitle on a solid header.
- `npx tsc --noEmit` and `npm test` pass; the crud-dialog Sheet still exposes an accessible name and description (existing Radix-warning coverage stays green).

## Related

- [surface-header-compose-not-copy.md](../archive/surface-header-compose-not-copy.md) — the predecessor; it shipped report/calendar and left this extraction as its own deferred third bullet.
- [refactor-shell-surface-header-slot-duplication.md](../archive/refactor-shell-surface-header-slot-duplication.md) — the eleven-shell slot extraction; these three are the shells that could not use the slot and so kept their own bars.
- [header-fill-anchor-button-invert.md](../archive/header-fill-anchor-button-invert.md) — a header-fill contract fix that had to be reasoned about per bar; with one bar it is one edit.
- [src/components/layout/headerFill.ts](../../src/components/layout/headerFill.ts) — the class table whose four independent callers this ticket reduces to one.
