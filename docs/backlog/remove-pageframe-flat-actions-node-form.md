---
area: layout
opened: 2026-11-08
status: ready
value: low
depends_on: [page-header-action-hierarchy-overflow-menu]
model: sonnet
model_reason: "mechanical narrowing of a prop type along an established deprecation path; cause and edit sites are named"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-08T00:00:00Z
---

# Remove deprecated flat ReactNode PageFrame actions form

## Context

[[page-header-action-hierarchy-overflow-menu]] (v0.31.0) adds typed header actions `{ primary, secondary, menu, renderLink }`, rendered by `src/components/layout/HeaderActions.tsx`, and keeps a rendered `React.ReactNode` working for one minor, marked `@deprecated` in the `actions` JSDoc of `src/components/layout/PageFrame.tsx`. A node bypasses the 1-primary + 2-secondary cap and the destructive-only-in-menu rule, so the deprecated form is a hole in the hierarchy contract. This ticket is the follow-up breaking bump that closes it, once the downstream consumers (controlling-app, hk-crm, brickshop-manager) pass the typed form. The shell side is `src/components/archetypes/structure-builder/StructureBuilderShell.tsx`, which has a fragment branch for the node form.

## What to do

- [ ] Precondition, checked before editing: controlling-app, hk-crm and brickshop-manager no longer pass a rendered node as `actions` on any page (grep each repo's pages on its truth ref); if one still does, stop and report it rather than breaking it.
- [ ] Narrow `PageFrameProps.actions` in `src/components/layout/PageFrame.tsx` from `React.ReactNode` to `HeaderActions`, and drop the `isHeaderActions` branching there.
- [ ] Drop the fragment branch for the node form in `src/components/archetypes/structure-builder/StructureBuilderShell.tsx`.
- [ ] Update the existing tests and demos that still pass a node as `actions` to the typed form.
- [ ] Add a breaking-change entry to `CHANGELOG` and bump the package version (minor, as pre-1.0 breaking changes ship) in `package.json` and the MANIFEST versions checked by `npm run verify:manifest`.
- [ ] Update the page-frame slot table in `docs/PLACEMENT.md` so the `actions` row names only the typed form.

## Acceptance

- `npx tsc --noEmit` fails on a page passing a bare `<Button/>` as `actions` and passes on `{ primary, secondary, menu }`.
- `npm test` and `npm run check:viewports` pass after the change.
- No `isHeaderActions` reference and no `@deprecated` note on `actions` remain in `src/`.
- `docs/PLACEMENT.md` shows the typed form only, and the CHANGELOG marks the bump as breaking.

## Related

- [[page-header-action-hierarchy-overflow-menu]] — must ship first: it introduces the typed form and the deprecation this ticket removes
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one PageFrame, slot-owned placement
- [PLACEMENT.md](/docs/PLACEMENT.md) — page-frame slot table
