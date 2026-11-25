---
area: archetypes
opened: 2026-11-17
status: done
value: normal
model: sonnet
model_reason: "class swap plus @container on the padding wrapper, following the DetailOverviewShell pattern; cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-17T00:00:00Z
---

# CrudDialogBody two-column layout keys on viewport width

## Context

`CrudDialogBody` (`src/components/archetypes/crud-dialog/CrudDialogBody.tsx:156`) builds its `"two-column"` layout from `LAYOUT_CLASS["two-column"]` = `grid grid-cols-1 gap-4 sm:grid-cols-2`. `sm:` is a viewport breakpoint, but the dialog's width is fixed independent of the viewport, so the paired fields switch to two columns based on a width the body never has. Leftover from [[viewport-breakpoints-container-query-audit]], whose list did not include this primitive. `LAYOUT_CLASS["two-column"]` is shared by the loaded body and `BodySkeleton`, so one change at that constant fixes both. The prop JSDoc at line 42 also names `sm:grid-cols-2`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make the body's padding-box wrapper (`BODY_INSET`, shared by skeleton, error and loaded states) an `@container`, and swap `sm:grid-cols-2` in `LAYOUT_CLASS["two-column"]` for `@md:grid-cols-2`. Class only, no new prop (per ADR-0004; same pattern as [[detail-overview-rail-switch-container-query]]).
- [ ] Update the `layout` prop JSDoc (line 42) to name the container-query class instead of `sm:grid-cols-2`.
- [ ] Pin the container-query classes in `CrudDialogBody.test.tsx` for both the loaded body and the skeleton, and add the `CHANGELOG.md` entry and version bump (`scripts/verify-package-version.mjs` fails `npm test` otherwise).

## Acceptance

- In a narrow dialog on a wide viewport, `layout="two-column"` shows a single column; in a dialog wider than the `@md` threshold it shows two columns, unchanged from today.
- No `sm:`/`md:`/`lg:` viewport variant remains in `CrudDialogBody.tsx`, and no other crud-dialog primitive under `src/components/archetypes/crud-dialog/` keys layout on viewport width.
- The loading skeleton collapses at the same container width as the loaded body.

## Related

- [[viewport-breakpoints-container-query-audit]] — the audit this is a leftover of
- [[detail-overview-rail-switch-container-query]] — precedent `@container` conversion
- [[archetype-rollout-crud-dialog-skeleton-shape-unkeyed-from-layout]] — skeleton shares the layout class
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — fixed in the component, no appearance prop
