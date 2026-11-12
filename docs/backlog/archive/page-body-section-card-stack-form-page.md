---
area: archetypes
opened: '2026-11-12'
status: done
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

# Move the form-page shell onto the section-card stack with one card per field group

## Context

Phase 4 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 4 — Remaining archetypes". The orchestrator decided form-page stacks, because its body is already a list of titled field groups.

Today `src/components/archetypes/form-page/FormPageShell.tsx` renders `<PageFrame className={WIDTH_MAP[width]}>` around a `space-y-5` inset div. The nested `SectionCard` field groups lose their border and fill inside the one frame, by ADR-0015 rule 2.

The pattern to copy is shipped in `TransactionDocumentShell.tsx`:
- `body="stack"`;
- one `SectionCard` per section;
- the sticky phone bar outside every card.

## What to do

- [ ] `FormPageShell` passes `body="stack"` and drops the inset wrapper. Each field-group `SectionCard` child becomes a raised, bordered card on the canvas, and the `width` preset still bounds the column.
- [ ] Form actions (`FormPageActions`, sticky on the phone) stay outside every card, with the same sticky behaviour as Td's `td-next-step-bar`.
- [ ] If a form page passes `toolbar`, the band lands on the first card through `ToolbarLeadContext` (already shipped).
- [ ] Update `docs/archetypes/form-page.md`, keeping it role-only. Bump the MANIFEST minor version, add a CHANGELOG entry, and update the demo if needed.
- [ ] Update the shell tests:
  - a stack body is present;
  - each field group is a card with `border` and `rounded-lg`;
  - the actions sit outside every card.
- [ ] Regenerate the form-page screenshot baselines on desk27, laptop14 and phone, and run `npm run check:viewports`.

## Acceptance

- The form-page demo renders `[data-page-body="stack"]` with one bordered, rounded card per field group and a canvas gap between them.
- At phone width the form actions stay visible at the bottom while the page scrolls, and they are not inside any card.
- `npm test`, `npx tsc --noEmit`, `node scripts/lint-design.mjs`, `npm run screenshots` and `npm run check:viewports` pass at desk27, laptop14 and phone.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p4)
- [[page-body-section-card-stack-transaction-document]] — the shipped pattern
- [[page-body-section-card-stack-keep-frame-decisions]] — the archetypes that keep one frame
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame (§3 superseded by ADR-0015)
