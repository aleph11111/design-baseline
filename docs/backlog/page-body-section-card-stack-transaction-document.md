---
area: archetypes
opened: '2026-11-12'
status: ready
value: high
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: opus
model_reason: "first real stack consumer plus a new AppShell column marker; sets the pattern every later slice copies"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# Move the transaction-document shell onto the section-card stack with one column bound

## Context

Phase 2 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 2 — transaction-document slice".

Phase 1 shipped the pieces this ticket uses:
- ADR-0015;
- `PageFrame`'s `body?: "frame" | "stack"`, which renders a `data-page-body="stack"` gap container and hands the toolbar band to the first child through `ToolbarLeadContext` (`src/components/layout/ToolbarBand.tsx`);
- the bordered chrome on `SectionCard` and `SurfaceFrame`.

`src/components/archetypes/transaction-document/TransactionDocumentShell.tsx` still renders its next step, ledger, facts and history as `divide-y` strips inside one frame. It also still carries a local `COLUMN = "max-w-4xl"` bound next to `AppShell`'s `--db-content-max` column, which `src/styles/tokens.layer.css` sets to 1180px with two wide-desk steps. That is two width bounds. The operator mockup ("Order detail V2", https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw) shows one bordered card per section on the canvas.

## What to do

- [ ] Pass `body="stack"` to `PageFrame` in `TransactionDocumentShell` and drop the `divide-y` `td-body` wrapper.
  - Next step, ledger, facts and history (when present) each render as their own raised card (`SectionCard`). Keep every `data-slot` (`td-next-step`, `td-ledger`, `td-facts`, `td-history`) on the card.
  - Replace the local `Slot` helper with a `SectionCard`, keeping the lock note.
- [ ] The next-step card keeps its contract-keyed tone fill (`NEXT_STEP_TONE`, already allowed by the `_adherence.json` exclude, RULES rule 10) as the toned callout, with the hairline border kept (ADR-0015 rule 6).
- [ ] Keep the phone sticky primary bar (`td-next-step-bar`) outside every card, pinned to the bottom of the page body.
- [ ] Replace the local `COLUMN = "max-w-4xl"` with one bound:
  - add a derived marker `DOCUMENT_COLUMN_CLASS` next to `FULL_BLEED_CLASS` in `src/components/layout/surface.ts`;
  - in `src/components/layout/AppShell.tsx`, make the content column read it the way it reads `.db-full-bleed`: `has-[.db-document-column]:max-w-(--db-document-max)`;
  - add a `--db-document-max: 896px` token to `src/styles/tokens.layer.css`, with no wide-desk steps;
  - the shell puts the marker on its root, and the marker is skipped when nested (mirroring `useFullBleedClass`).
- [ ] Record the column bound as an ADR-0007 §1 amendment inside `docs/adr/0015-page-body-section-card-stack.md`.
- [ ] Update `docs/archetypes/transaction-document.md`, keeping it role-only:
  - the body is a stack of section cards;
  - the next-step card is the toned callout;
  - the column is the document column.
- [ ] Bump the MANIFEST entry to 1.3 and add a CHANGELOG entry.
- [ ] Update `src/examples/transaction-document-demo.tsx` if it needs anything.
- [ ] Update `TransactionDocumentShell.test.tsx`:
  - the `max-w-4xl` assertion becomes a marker assertion;
  - one card per slot;
  - the sticky bar sits outside the cards.

  Then add an `AppShell.test.tsx` case for the document marker.
- [ ] Regenerate the Td screenshot baselines (`npm run screenshots:update`, then review the PNG diffs) and run `npm run check:viewports`.

## Acceptance

- The Td demo renders `[data-page-body="stack"]`, with one bordered, rounded card each for next step, ledger and facts, and a canvas gap between them. The next-step card shows its tone fill.
- `grep -n "max-w-4xl" src/components/archetypes/transaction-document/` returns no line.
- The `AppShell` content column inside a Td page measures at most 896px at desk27, laptop14 and phone, and the wide-desk steps no longer widen it.
- At phone width the sticky primary bar stays visible at the bottom while the page scrolls, and it is not inside any card.
- `npm test`, `npx tsc --noEmit`, `node scripts/lint-design.mjs`, `npm run screenshots` and `npm run check:viewports` pass.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p2)
- [[page-body-section-card-stack-primitive]] — shipped the stack mode and chrome this slice uses
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — transaction-document archetype
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §1 content column, amended here
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — the column marker is derived from the archetype, never a call-site prop
