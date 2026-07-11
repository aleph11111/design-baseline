---
area: hygiene-week
opened: 2026-07-11
status: ready
---

# Dead and orphaned exports across ui/crud-dialog/layout primitives

## Context

A hygiene-week sweep for unimported exports and never-rendered components found a small cluster of genuinely dead artifacts in `src/`:

- `src/components/ui/confirmation-dialog.tsx` exports `ConfirmationDialog`, but it is never imported anywhere in `src/` or `gallery/` — not by any archetype, demo, or the crud-dialog flow it's documented as supporting. Its only trace is a JSDoc mention in `src/components/archetypes/crud-dialog/CrudDialogFooter.tsx:83` ("the consumer is responsible for opening a `<ConfirmationDialog>`..."), which reads as an intent that was never wired up.
- `src/components/archetypes/crud-dialog/crudStrings.ts` exports `CRUD_ERRORS` and `CRUD_DISCARD_PROMPT`, both re-exported through `src/components/archetypes/crud-dialog/index.ts:31`. Neither is imported by `src/examples/crud-dialog-demo.tsx` (the only consumer of the barrel) or anywhere else — `CRUD_DISCARD_PROMPT` is used only internally as `confirmDiscard`'s default parameter.
- `src/components/archetypes/crud-dialog/useCrudDialogController.ts` exports `DEFAULT_CRUD_DIALOG_LABELS`, re-exported via `index.ts:22`, but it's referenced only inside its own defining file (as the spread default in `useCrudDialogController`) — never imported by name elsewhere.
- `src/components/layout/SectionNav.tsx` exports `SectionNavShell`, and `src/examples/section-nav-demo.tsx` (its only consumer) is not wired into the gallery — not imported by `gallery/layout-demos.tsx` or `gallery/Gallery.tsx`, unlike every other primitive/archetype demo. `docs/STYLE.md:217` points readers at `section-nav-demo.tsx` as "a router-free worked example," but there is no visible gallery surface to actually see it render, breaking the project's own guideline (`docs/RULES.md` Guidelines: "Every documented variant axis gets a living demo … the gallery is the review surface").

None of this is standard shadcn boilerplate (partial-adoption of a vendored multi-part primitive like `sidebar.tsx` is expected and was explicitly excluded from this finding) — these are baseline-authored artifacts with no live consumer.

## What to do

- [ ] Decide per artifact whether to delete or finish wiring it up, then act:
  - [ ] `ConfirmationDialog` (`src/components/ui/confirmation-dialog.tsx`) — either wire it into `CrudDialogFooter`'s delete-confirmation flow (the JSDoc's evident intent) or remove the component and the stale JSDoc reference.
  - [ ] `CRUD_ERRORS`, `CRUD_DISCARD_PROMPT` (`src/components/archetypes/crud-dialog/crudStrings.ts`) — drop from the barrel re-export (`index.ts:31`) if truly unneeded externally, or demonstrate their intended external use in the demo.
  - [ ] `DEFAULT_CRUD_DIALOG_LABELS` (`src/components/archetypes/crud-dialog/useCrudDialogController.ts`) — same treatment: drop the barrel re-export (`index.ts:22`) or use it from the demo to show the override pattern it documents.
  - [ ] `SectionNavShell` / `section-nav-demo.tsx` — add a `SectionNavDemo` entry to `gallery/layout-demos.tsx` (or `gallery/Gallery.tsx`) so it's actually visible in the gallery, matching every other primitive's living-demo coverage.

## Acceptance

- [ ] `git grep` for each removed export/re-export returns zero matches outside its own definition, or the export now has a real consumer in a demo/gallery file.
- [ ] `SectionNavShell` is rendered somewhere reachable from `npm run gallery`, or `section-nav-demo.tsx` and the `docs/STYLE.md:217` reference to it are removed together.
- [ ] `npx tsc --noEmit` and `npm test` still pass after cleanup.

## Related

- `docs/RULES.md` Guidelines — "Every documented variant axis gets a living demo in `src/examples/<slug>-demo.tsx`"
- `docs/STYLE.md:217` — the stale pointer to `section-nav-demo.tsx`
