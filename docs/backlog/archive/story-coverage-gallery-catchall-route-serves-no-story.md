---
area: story-coverage
opened: '2026-11-12'
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
  graded_at: '2026-11-12T13:33:23.295Z'
---

# Surface page:* in gallery/Gallery.tsx serves no story — write the story or delete it

## Context

Story-coverage audit found surfaces under `gallery` that no operator-origin story names:

- `page:*` — tested-unwanted — gallery/Gallery.tsx:288 (catch-all route that redirects unknown paths to `/`; a test pins it, no story asks for it)

No `docs/stories/` entry lists them. Whether they are wanted is the operator's call; an unattended session must not delete or document them on its own.

## What to do

- Decide per surface: write a story in `docs/stories/` that names it, or approve deletion.
- If approved for deletion, remove the surface and any test pinning it (a `tested-unwanted` surface has a test that must go with it).
- If kept, add the story so each surface id is listed.

## Acceptance

- Either a story in `docs/stories/` lists each surface id above, or the surfaces are gone.
- After the change, the story-coverage audit no longer reports this cluster.

## Related

- [gallery/Gallery.tsx](/gallery/Gallery.tsx)

## Resolution (2026-11-16)

Operator kept the route (Option A in [[backlog-coherence-invariants-duplicate-fa3091]]). Story `docs/stories/gallery-unknown-route-lands-on-overview.md` now lists `page:*`. Correction: no test pins the catch-all — no gallery test, `scripts/check-*.mjs` or `tests/screenshots.spec.mjs` visits an unknown route — so the `tested-unwanted` label was wrong.
