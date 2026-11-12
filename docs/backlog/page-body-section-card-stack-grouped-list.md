---
area: archetypes
opened: '2026-11-12'
status: ready
value: normal
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: sonnet
model_reason: "follows the shipped transaction-document and analytics-dashboard slice pattern"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# Move the grouped-list shell onto the section-card stack with one card per group

## Context

Phase 4 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 4 — Remaining archetypes". The orchestrator decided grouped-list stacks, because its body is already a list of titled groups.

Today `src/components/archetypes/grouped-list/GroupedListShell.tsx` renders one `PageFrame` frame holding `ListStateView` and a `space-y-8` group div. `GroupedListSection.tsx` reads `RaisedSurfaceContext` and renders a `SectionCard`, which flattens inside the one frame.

The pattern to copy is shipped in `TransactionDocumentShell.tsx` (`body="stack"`, one `SectionCard` per section).

## What to do

- [ ] `GroupedListShell` passes `body="stack"`.
  - Each `GroupedListSection` becomes a raised, bordered card on the canvas.
  - The `space-y-8` wrapper goes; the stack gap replaces it.
- [ ] The loading, empty and error states (`ListStateView`) render inside one card, so a page with no groups still shows one bounded surface.
- [ ] When the toolbar is set, the band lands on the first card through `ToolbarLeadContext`.
- [ ] Review `GroupedListSection`'s `RaisedSurfaceContext` read against ADR-0015 rule 2. A group directly on the canvas is un-nested and carries the border.
- [ ] Update `docs/archetypes/grouped-list.md`, keeping it role-only. Bump the MANIFEST minor version, add a CHANGELOG entry, and update the demo if needed.
- [ ] Update the tests:
  - a stack body is present;
  - each group is a card with `border` and `rounded-lg`;
  - the empty state sits in one card;
  - the band is on the first card.
- [ ] Regenerate the grouped-list screenshot baselines on desk27, laptop14 and phone, and run `npm run check:viewports`.

## Acceptance

- The grouped-list demo renders `[data-page-body="stack"]` with one bordered, rounded card per group, a canvas gap between them, and the toolbar band on the first card.
- A grouped list with no groups renders its empty state inside one bordered card.
- `npm test`, `npx tsc --noEmit`, `node scripts/lint-design.mjs`, `npm run screenshots` and `npm run check:viewports` pass at desk27, laptop14 and phone.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p4)
- [[page-body-section-card-stack-transaction-document]] — the shipped pattern
- [[page-body-section-card-stack-keep-frame-decisions]] — the archetypes that keep one frame
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame (§3 superseded by ADR-0015)
