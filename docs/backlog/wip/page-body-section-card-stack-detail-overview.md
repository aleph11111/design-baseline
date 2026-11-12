---
area: archetypes
opened: '2026-11-12'
status: ready
value: normal
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: opus
model_reason: "three layouts (rail, vertical, width presets) and a sticky rail; the stack has to keep the rail sticking and the layout decision table intact"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# Move the detail-overview shell onto the section-card stack with sections and rail as cards

## Context

Phase 4 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 4 — Remaining archetypes". The orchestrator decided detail-overview stacks, because its body is titled `DetailSection`s (`SectionCard`). It is the closest sibling of transaction-document.

Today `src/components/archetypes/detail-overview/DetailOverviewShell.tsx`:
- renders `<PageFrame className={layout !== "rail" && WIDTH_MAP[width]}>{body}</PageFrame>`;
- in the `rail` layout, places a sticky rail of chromeless `SectionCard`s divided by `divide-y` beside the main column;
- relies on `SurfaceFrame`'s `overflow: clip` (not `hidden`), so the rail sticks to the page.

The pattern to copy is shipped in `TransactionDocumentShell.tsx` (`body="stack"`, one `SectionCard` per section).

## What to do

- [ ] `DetailOverviewShell` passes `body="stack"`, and each main-column `DetailSection` becomes a raised, bordered card on the canvas.
- [ ] Rail layout: the main column and the rail sit side by side on the canvas.
  - The main column is a stack of section cards.
  - The rail is one raised card holding its chromeless sections with their hairline dividers, and it keeps sticking to the page while the main column scrolls.
- [ ] Vertical layout and the `width` presets keep their current column bounds.
- [ ] When the toolbar is set, the band lands on the first card through `ToolbarLeadContext`.
- [ ] Keep the layout decision table in `docs/archetypes/detail-overview.md` unchanged. Add the stack body and the rail card to the contract, keeping it role-only.
- [ ] Bump the MANIFEST minor version, add a CHANGELOG entry, and update the demos (rail and vertical variants, per the living-demos convention).
- [ ] Update the tests:
  - a stack body is present;
  - each main section is a card with `border` and `rounded-lg`;
  - the rail is one card whose inner sections carry no border.
- [ ] Regenerate the detail-overview screenshot baselines on desk27, laptop14 and phone, and run `npm run check:viewports` and `npm run check:detail-sheet` (if the overlay embeds a detail-overview).

## Acceptance

- The detail-overview demo, in both the rail and vertical variants, renders `[data-page-body="stack"]` with one bordered, rounded card per main section and a canvas gap between them.
- In the rail variant the rail is one bordered card and keeps sticking while the main column scrolls at desk27 and laptop14.
- `npm test`, `npx tsc --noEmit`, `node scripts/lint-design.mjs`, `npm run screenshots` and `npm run check:viewports` pass at desk27, laptop14 and phone.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p4)
- [[page-body-section-card-stack-transaction-document]] — the shipped pattern
- [[page-body-section-card-stack-keep-frame-decisions]] — the archetypes that keep one frame
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — the list-with-detail overlay that embeds details
