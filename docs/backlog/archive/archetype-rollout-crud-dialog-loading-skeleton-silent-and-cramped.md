---
area: archetype-rollout
opened: '2026-10-01'
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
  graded_at: '2026-10-01T16:52:59.872Z'
---

# CRUD dialog loading skeleton is silent and cramped on mobile

## Context

In [src/components/archetypes/crud-dialog/CrudDialogBody.tsx](/src/components/archetypes/crud-dialog/CrudDialogBody.tsx) the loading skeleton is `aria-hidden` and carries no busy or status semantics, so a screen-reader user opening a dialog hears the title and then nothing while the entity loads. The skeleton also hard-codes two columns, while the real body collapses to one column on small screens, so on a full-viewport mobile sheet the loading layout differs from the loaded one and the content visibly jumps.

## What to do

- [ ] Announce the loading state to assistive tech while the skeleton shows, and clear it when fields appear.
- [ ] Make the skeleton collapse to one column wherever the loaded body does.

## Acceptance

- While loading, the body exposes a busy/loading status to screen readers; after load it no longer does.
- At a mobile viewport the skeleton shows one column, matching the loaded body, with no layout shift on load.

## Related

- [src/components/archetypes/crud-dialog/CrudDialogBody.tsx](/src/components/archetypes/crud-dialog/CrudDialogBody.tsx)
- [[archetype-rollout-crud-dialog-fetch-error-state-missing]]
