---
area: archetypes
opened: 2026-10-04
status: done
value: normal
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-10-04T12:00:00Z
---

# feed-inbox overlay surface conflicts with the page-title frame

## Context

`docs/archetypes/feed-inbox.md` Layer 1 still allows the feed as a popover / sheet launched from a header bell, but `FeedShell` (`src/components/archetypes/feed-inbox/FeedShell.tsx`) now requires a page `title` and renders a page h1 through `PageFrame` (ADR-0008). In a sheet that puts a page title inside a drawer, so the contract and the shipped component disagree about which surfaces are supported.

## What to do

- [ ] Add a non-page feed body export (frameless, no page h1) to `src/components/archetypes/feed-inbox/` for overlay use, mirroring `ListWithDetailBody` (per ADR-0008 slot-owned placement; `ListWithDetailBody` is the existing frameless-body precedent).
- [ ] Update `docs/archetypes/feed-inbox.md` Layer 1, the gallery demo, and the package version so the overlay surface maps to the body export and the page surface to `FeedShell`.

## Acceptance

- A feed rendered inside a `Sheet` through the body export shows no page h1 and no raised page surface.
- `docs/archetypes/feed-inbox.md` no longer lists an overlay surface that has no shipped export, and every surface it lists maps to an exported component.

## Related

- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [[test-gap-feed-shell-untested]]
- [[list-with-detail-shell-presentation-split]]

## Open question

Fork: add a frameless feed body export for overlay use (Recommended — keeps the documented bell-launched sheet, follows the `ListWithDetailBody` precedent) vs remove the overlay surface from the feed-inbox contract (smaller change, drops a documented use case). Resolved headlessly to the Recommended option; revisit on review.
