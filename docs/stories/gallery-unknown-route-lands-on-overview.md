---
persona: operator
status: draft
origin: operator
opened: '2026-11-16'
roadmaps: []
surfaces:
  - page:*
---

# As an operator, I open a stale or mistyped gallery link and land on the archetype overview

## Situation
I open the design-baseline gallery (standalone, or iframed in the dashboard hub) through a bookmarked or hand-typed hash URL that matches no route, for example `#/archetypes/foo` instead of `#/a/foo`. The catch-all route `page:*` in `gallery/Gallery.tsx` handles it.

## Outcome
- A gallery URL that matches neither `/`, `/a/:slug` nor `/l/:slug` redirects to the overview at `#/`.
- The address bar shows `#/` after the redirect, and the back button does not return to the broken URL.
- I never see an empty main area inside the gallery shell.

## Not
- Does not cover an unknown slug under `/a/` or `/l/`; those pages redirect on their own and are part of the archetype and layout-primitive page surfaces.
- Does not show a "page not found" message; the overview is the answer.

## Open questions

## Related
- [[backlog-coherence-invariants-duplicate-fa3091]] — operator decision to keep the route (Option A)
- [[story-coverage-gallery-catchall-route-serves-no-story]] — the audit card this story answers
