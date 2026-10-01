---
area: archetype-rollout
opened: '2026-10-01'
status: done
value: normal
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T21:48:01.000Z'
---

# CRUD dialog loading skeleton always draws two columns regardless of layout

## Context

In [src/components/archetypes/crud-dialog/CrudDialogBody.tsx](/src/components/archetypes/crud-dialog/CrudDialogBody.tsx), `BodySkeleton` unconditionally renders a pair of paired-field sections (now sharing the loaded body's `LAYOUT_CLASS["two-column"]`), so the skeleton always has a two-column paired shape. But `CrudDialogBody`'s `layout` prop also allows `"flat"` (a single `space-y-4` stack) and `undefined` (no wrapper, for mixed/tabbed bodies); when such a body loads, the desktop skeleton shows a two-column shape and the loaded body one column, so the content visibly reflows on load. Flagged by the PR #414 reviewer on this ticket's parent ticket; the shipped mobile criterion is met, the shape mismatch remains on desktop.

## What to do

- [ ] Before editing, grep every caller of `BodySkeleton` / the `layout` prop; fix at the shared point (`BodySkeleton` takes `layout`), not only the call site this report names.
- [ ] Pass `layout` into `BodySkeleton` and key its shape to it: `layout="two-column"` keeps the current paired sections (unchanged), `layout="flat"` renders a single stacked column of skeleton fields matching `LAYOUT_CLASS["flat"]`, and `layout` omitted renders the plain stacked shape.
- [ ] Extend the donor tests + the demo so a `layout="flat"` (or no-layout) body's skeleton uses a skeleton shape matching the loaded body's layout class.

## Acceptance

- For `layout="flat"` and no `layout`, the skeleton renders no paired two-column grid section — in the class-list comparison against the loaded body's layout (the same test pattern as the shipped collapse check in `CrudDialogBody.test.tsx`), every skeleton grid matches the loaded body's layout class-list at every column count.
- With `layout="two-column"`, the skeleton is unchanged from PR #414 behavior (every existing collapse test in `CrudDialogBody.test.tsx` passes unchanged).
- no other body in the baseline reflows between skeleton and loaded state for any `layout` value — every `layout` value the `layout` prop accepts yields a skeleton with the same structural shape as the loaded body.

## Related

- [[archetype-rollout-crud-dialog-loading-skeleton-silent-and-cramped]] — parent ticket (PR #414); its reviewer flagged this leftover shape mismatch.
- [src/components/archetypes/crud-dialog/CrudDialogBody.tsx](/src/components/archetypes/crud-dialog/CrudDialogBody.tsx)
