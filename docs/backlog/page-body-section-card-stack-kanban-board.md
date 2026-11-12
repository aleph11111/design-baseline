---
area: archetypes
opened: '2026-11-12'
status: ready
value: high
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: opus
model_reason: "lane/card surface inversion on a full-bleed horizontally scrolling shell; drag-and-drop refs must keep working"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# Move the kanban-board shell onto the section-card stack with raised cards in canvas lanes

## Context

Phase 3 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 3 — Weak-separation slices". ADR-0008 named kanban lanes as the case that separates too weakly inside one frame.

Today `src/components/archetypes/kanban-board/BoardShell.tsx` renders a full-bleed `PageFrame` frame (`useFullBleedClass`) holding a horizontal `overflow-x-auto` lane row. `BoardColumn.tsx` paints each lane `bg-surface-canvas` inside the frame, and `BoardCard` is the item.

Under ADR-0015 a raised surface nested in another drops its border and fill. Making the lanes raised cards would therefore strip the border from every board card inside them. So the item stays the raised object, and the lane becomes a grouping region on the canvas. (The orchestrator decided this, 2026-11-12. The rejected alternative, raised lanes, would need an exception to ADR-0015 rule 2.)

## What to do

- [ ] `BoardShell` passes `body="stack"`.
  - When the toolbar is set, it renders a band-only first card (an empty `SurfaceFrame`, spec rule 5).
  - The lane row follows as a non-card child on the canvas (the horizontal scroller), keeping the full-bleed marker.
- [ ] `BoardColumn` becomes an unbordered grouping region on the canvas:
  - a sunken tone (`bg-surface-sunken`), or no fill if the sunken tone reads too heavy on the canvas — pick one and record it in the contract;
  - overline header and count kept;
  - no `RaisedSurfaceContext` provider, so cards inside it stay raised.
- [ ] `BoardCard` is the raised, bordered, rounded card on the canvas: the ADR-0015 chrome, read from the shared surface rule, not a hand-written border string.
- [ ] Drag/drop refs and forwarding (`BoardCard`/`BoardColumn` forward refs) stay intact. The empty-lane dashed drop zone stays.
- [ ] Update `docs/archetypes/kanban-board.md`, keeping it role-only. Bump the MANIFEST minor version, add a CHANGELOG entry, and update the demo if needed.
- [ ] Update the `BoardShell`, `BoardColumn` and `BoardCard` tests:
  - a stack body is present;
  - the band-only first card appears when the toolbar is set;
  - lanes carry no border and no raised fill;
  - cards carry `border` and `rounded-lg`.
- [ ] Regenerate the kanban-board screenshot baselines on all three devices (desk27, laptop14 and phone) and run `npm run check:viewports`. The lane row still scrolls sideways on the phone.

## Acceptance

- The kanban-board demo renders `[data-page-body="stack"]`: a band-only first card with the filters, then a lane row on the canvas in which every board card is a bordered, rounded card and the lanes carry no border.
- The `AppShell` content column still drops its max width on a kanban page (full-bleed kept).
- At phone width the lane row scrolls horizontally inside its own scroller, and the page body does not scroll sideways.
- `npm test`, `npx tsc --noEmit`, `node scripts/lint-design.mjs`, `npm run screenshots` and `npm run check:viewports` pass at desk27, laptop14 and phone.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p3)
- [[page-body-section-card-stack-transaction-document]] — the pattern to copy
- [[page-body-section-card-stack-analytics-dashboard]] — sibling Phase-3 slice
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — flagged lanes as separating too weakly
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §1 full-bleed set (kanban-board is a member)
