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
  graded_at: '2026-11-12T13:33:23.295Z'
blocked_reason: 'operator decides: write the story or approve the deletion'
---

# Surface page:/documents under documents serves no story — write the story or delete it

## Context

Story-coverage audit found surfaces under `src/examples (route /documents)` that no operator-origin story names:

- `page:/documents` — no-story-no-test — src/examples/DemoViteApp.tsx:24 ("Documents" nav item in the demo Vite app)

No `docs/stories/` entry lists them. Whether they are wanted is the operator's call; an unattended session must not delete or document them on its own.

## What to do

- Decide per surface: write a story in `docs/stories/` that names it, or approve deletion.
- If approved for deletion, remove the surface and any test pinning it (a `tested-unwanted` surface has a test that must go with it).
- If kept, add the story so each surface id is listed.

## Acceptance

- Either a story in `docs/stories/` lists each surface id above, or the surfaces are gone.
- After the change, the story-coverage audit no longer reports this cluster.

## Related

- [src/examples/DemoViteApp.tsx](/src/examples/DemoViteApp.tsx)
