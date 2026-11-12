---
area: story-coverage
opened: '2026-11-12'
status: blocked
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-11-12T13:33:23.294Z'
blocked_reason: 'operator decides: write the story or approve the deletion'
---

# Surfaces under src/components/archetypes/crud-dialog serve no story — write the story or delete them

## Context

Story-coverage audit found surfaces under `src/components/archetypes/crud-dialog` that no operator-origin story names:

- `dialog:crud-dialog/CrudDialogBody` — tested-unwanted — src/components/archetypes/crud-dialog/CrudDialogBody.tsx
- `dialog:crud-dialog/CrudDialogFooter` — tested-unwanted — src/components/archetypes/crud-dialog/CrudDialogFooter.tsx
- `dialog:crud-dialog/CrudDialogHeader` — tested-unwanted — src/components/archetypes/crud-dialog/CrudDialogHeader.tsx
- `dialog:crud-dialog/CrudDialogSheet` — tested-unwanted — src/components/archetypes/crud-dialog/CrudDialogSheet.tsx
- `dialog:crud-dialog/CrudDialogSubmitOnEnter` — tested-unwanted — src/components/archetypes/crud-dialog/CrudDialogSubmitOnEnter.tsx
- `dialog:crud-dialog/useCrudDialogController` — tested-unwanted — src/components/archetypes/crud-dialog/useCrudDialogController.ts
- `dialog:crud-dialog/useCrudDialogFormReport` — tested-unwanted — src/components/archetypes/crud-dialog/useCrudDialogFormReport.ts
- `dialog:crud-dialog/useCrudDialogMode` — tested-unwanted — src/components/archetypes/crud-dialog/useCrudDialogMode.ts

These are the shipped parts of the crud-dialog archetype (exported via its `index.ts`); deleting them changes the package API.

No `docs/stories/` entry lists them. Whether they are wanted is the operator's call; an unattended session must not delete or document them on its own.

## What to do

- Decide per surface: write a story in `docs/stories/` that names it, or approve deletion.
- If approved for deletion, remove the surface and any test pinning it (a `tested-unwanted` surface has a test that must go with it).
- If kept, add the story so each surface id is listed.

## Acceptance

- Either a story in `docs/stories/` lists each surface id above, or the surfaces are gone.
- After the change, the story-coverage audit no longer reports this cluster.

## Related

- [src/components/archetypes/crud-dialog/index.ts](/src/components/archetypes/crud-dialog/index.ts)
