---
area: archetype-rollout
opened: '2026-10-01'
status: done
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - related
  failed:
    - acceptance: >-
        no testable assertion (uses words: shows / returns / measures / disables / enables / exits /
        unchanged / fails / no longer / after / when / matches / is-or-are + participle)
  graded_at: '2026-10-01T16:52:41.575Z'
---

# Sticky detail rail hides its foot on short viewports

## Context

In `layout="rail"` the rail is `lg:sticky lg:self-start` and holds `summary` followed by `references` (documents, linked records), per [src/components/archetypes/detail-overview/DetailOverviewShell.tsx](/src/components/archetypes/detail-overview/DetailOverviewShell.tsx). On a laptop-height window, a rail with a long key/value list plus a references section is taller than the viewport. A sticky element taller than the viewport pins its top, so its bottom (the references, the last master-data rows) can only be reached once the main column has scrolled to its end. On a short main column they may never come fully into view. The contract forbids a second scroll region in the rail, so the answer cannot be an inner scroll box.

## What to do

- [ ] On a wide viewport, every row of the rail, including `references`, is reachable by scrolling the page, however tall the rail is relative to the viewport.
- [ ] A rail shorter than the viewport keeps its sticky pinned behaviour.
- [ ] Add a gallery demo case with a rail taller than a laptop viewport so the behaviour is visible and reviewable.

## Acceptance

- In the gallery at 1280x600, scrolling the page brings the last rail row fully into view while the main column is still taller than the rail.
- With a short rail, the rail still stays pinned while the main column scrolls.
- The rail introduces no independent scroll container.

## Related

- [src/components/archetypes/detail-overview/DetailOverviewShell.tsx](/src/components/archetypes/detail-overview/DetailOverviewShell.tsx)
- [docs/archetypes/detail-overview.md](/docs/archetypes/detail-overview.md)
