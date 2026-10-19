---
area: archetypes
opened: 2026-10-18
status: done
value: normal
model: opus
model_reason: "design is the deliverable — slot/prop API for a new archetype variant and its contract layers"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-18T00:00:00Z
---

# Add a master-detail layout to the feed-inbox FeedShell archetype

## Context

`src/components/archetypes/feed-inbox/FeedShell.tsx` (v0.12.2) is single-pane only: a `PageFrame` around one `FeedBody`. brickshop-manager has two pages that need a feed list on the left and the selected item's detail beside it (`/activity` and `/messages`), which is the Rule of 2 in `docs/CHOOSING-A-SURFACE.md` ("When nothing fits"). They run on a brickshop-local `FeedShell mode="master-detail"` with `FeedShell.Filters` / `FeedShell.List` / `FeedShell.Detail` slots, which brickshop's ADR-0172 (no local archetypes) wants gone. `list-with-detail` is not a substitute: its detail is a Sheet overlay over a table, not a side pane beside a feed.

## What to do

- [ ] Add a master-detail variant to the feed-inbox archetype: a list pane plus a detail pane inside the one `PageFrame` surface (ADR-0008), with an empty-detail state when nothing is selected and a single-column fallback below `md`.
- [ ] Update `docs/archetypes/feed-inbox.md` (contract layers + version bump) and the demo/preview.
- [ ] Ship it in a tagged release so brickshop can bump its pin.

## Acceptance

- A master-detail feed page renders exactly one page title and one raised surface, with list and detail side by side at `md` and up.
- Below `md`, selecting an item shows the detail in place of the list, and back returns to the list.
- Existing single-pane `FeedShell` consumers render unchanged (no prop change required).

## Related

- [[feed-inbox-overlay-surface-page-title]] — earlier feed-inbox change (FeedBody for overlays)
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame
