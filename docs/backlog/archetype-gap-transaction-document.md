---
area: archetypes
opened: 2026-11-07
status: needs-enrichment
value: high
model: opus
model_reason: "archetype shape is the deliverable: slot grammar, one-home-per-fact rule and variant-vs-new-archetype call are design decisions"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-11-07T00:00:00Z
---

# Archetype gap: transaction-document detail page for orders, invoices and offers

## Context

brickshop-manager's `/orders/:id` page repeats every money fact three to four times because `detail-overview` (`src/components/archetypes/detail-overview/`) offers a rail plus a free main column with no rule that a fact has exactly one home, and its header `actions: ReactNode` invites nine-button headers. The same shape recurs for invoices, offers and purchase orders, so no `kind: page` archetype in MANIFEST fits a transaction document. Mockup: https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw.

Proposed typed slots, placed by the shell (slot-owned placement per [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md)):

- `identity` — nowrap id with copy, one status plus one attention flag, a one-sentence summary.
- `nextStep` — state-keyed panel and the sole owner of the primary action.
- `ledger` — lines, charges, costs, total and profit, with Charged/Cost columns and column priorities.
- `facts` — auto-fit grid of typed, locale-formatted values.
- `history` — collapsed by default.

Optional check: a duplicate-fact invariant in `src/testing/invariants.mjs` that flags the same formatted money or percent token rendered more than twice inside the main region.

Per the archetype-gap rule a consumer never hand-rolls the shape; brickshop-manager waits on this ticket, then rebuilds `/orders/:id` on the shipped export. Source for `promoted_from` is the brickshop-manager order page plus the mockup (fleet-synthesis style promotion, `/promote-archetype` bypassed).

## What to do

- [ ] Write the role-only contract `docs/archetypes/transaction-document.md` (rules 2–3 of `docs/RULES.md`): the five slots, and the rule that every fact has one home.
- [ ] Ship the typed shell under `src/components/archetypes/transaction-document/` with export `design-baseline/archetypes/transaction-document`, a gallery demo in `src/examples/transaction-document-demo.tsx`, a MANIFEST entry with `promoted_from`, and a package version bump.
- [ ] Make `nextStep` the only slot that renders a primary action; the header takes no free `actions: ReactNode`, only a bounded secondary-action list that overflows into a menu (see [[page-header-action-hierarchy-overflow-menu]]).
- [ ] Give `ledger` Charged/Cost columns with declared column priorities so it reflows at laptop14 and phone without horizontal scroll.
- [ ] Add the duplicate-fact invariant to `src/testing/invariants.mjs` (with `invariants.test.ts` coverage) and run it in `npm run check:viewports` for the demo.

## Acceptance

- The `transaction-document` demo renders identity, nextStep, ledger, facts and history, and the shell places each slot.
- Only the `nextStep` slot renders a primary-styled action; the header shows no more than the bounded secondary actions.
- The duplicate-fact invariant fails a fixture where one formatted money token appears three times in main and passes the demo.
- `npm run check:viewports` passes for the demo at desk27, laptop14 and phone with no horizontal scroll in the ledger.
- The contract names no Tailwind classes or primitive names, and the MANIFEST entry carries `promoted_from`.

## Related

- [[detail-overview-rail-switch-container-query]]
- [[page-header-action-hierarchy-overflow-menu]]
- [[archetype-gap-print-statement-document]]
- [[archetype-gap-matrix-grid-docked-inspector]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — a variant of an existing archetype versus a new one
- [ADR-0012](/docs/adr/0012-structure-builder-page-archetype.md) — precedent for a new `kind: page` archetype
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes

## Open question

Variant or new archetype? Auto-resolved to **new `kind: page` archetype `transaction-document`** (Recommended): its slots (nextStep, ledger) replace detail-overview's free main column rather than extend it, matching [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) and the ADR-0012 precedent. Alternative: a `detail-overview` variant with a constrained main (the ADR-0011 pattern), which keeps one archetype but leaves the free-column escape hatch. Confirm before `/feat`.
