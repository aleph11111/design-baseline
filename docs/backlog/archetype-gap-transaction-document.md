---
area: archetypes
opened: 2026-11-07
status: ready
value: high
depends_on: [page-header-action-hierarchy-overflow-menu]
model: opus
model_reason: "archetype shape is the deliverable: slot grammar, one-home-per-fact rule and variant-vs-new-archetype call are design decisions"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
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

Per the archetype-gap rule a consumer never hand-rolls the shape; brickshop-manager waits on this ticket, then rebuilds `/orders/:id` on the shipped export. Source for `promoted_from` is the brickshop-manager order page (`src/components/detail-views/order/StandaloneOrderDetailView.tsx`, `DetailOverviewShell layout="rail"`) plus the mockup — fleet-synthesis style promotion, `/promote-archetype` bypassed. That evidence is thin: the source is the anti-pattern page, not a matured fixed shape, so the promotion rests on the fleet-synthesis exception.

Operator decisions (2026-11-07):

- **New `kind: page` archetype `transaction-document`, not a `detail-overview` variant.** The point is removing detail-overview's free main column; a variant (the ADR-0011 pattern) would keep that escape hatch. Precedent: ADR-0012; placement per ADR-0008.
- **No own bounded-action implementation.** The shell consumes the typed action model plus overflow menu that [[page-header-action-hierarchy-overflow-menu]] adds to `PageHeader`/`PageFrame`; that ticket ships first (or in the same PR). Fallback only if it stalls: a minimal typed `secondaryActions` list on the shell. `nextStep` stays the sole primary-action owner.
- **The duplicate-fact invariant is split out** into its own ticket (captured in the design-baseline inbox, `dd72c0b0`); this ticket no longer carries it.

## What to do

- [ ] Write the role-only contract `docs/archetypes/transaction-document.md` (rules 2–3 of `docs/RULES.md`): the five slots, and the rule that every fact has one home.
- [ ] Ship the typed shell under `src/components/archetypes/transaction-document/` with export `design-baseline/archetypes/transaction-document`, a gallery demo in `src/examples/transaction-document-demo.tsx`, a MANIFEST entry with `promoted_from`, and a package version bump.
- [ ] Make `nextStep` the only slot that renders a primary action; the header takes no free `actions: ReactNode`, only the bounded secondary actions from the `PageHeader` action model of [[page-header-action-hierarchy-overflow-menu]], overflowing into its menu.
- [ ] Give `ledger` Charged/Cost columns with declared column priorities so it reflows at laptop14 and phone without horizontal scroll.

## Acceptance

- The `transaction-document` demo renders identity, nextStep, ledger, facts and history, and the shell places each slot.
- Only the `nextStep` slot renders a primary-styled action; the header shows no more than the bounded secondary actions.
- `npm run check:viewports` passes for the demo at desk27, laptop14 and phone with no horizontal scroll in the ledger.
- The contract names no Tailwind classes or primitive names, and the MANIFEST entry carries `promoted_from`.

## Related

- [[page-header-action-hierarchy-overflow-menu]] — must ship first: it adds the typed `PageHeader` action model and overflow menu this shell's header consumes instead of building its own
- [[detail-overview-rail-switch-container-query]]
- [[archetype-gap-print-statement-document]]
- [[archetype-gap-matrix-grid-docked-inspector]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — a variant of an existing archetype versus a new one
- [ADR-0012](/docs/adr/0012-structure-builder-page-archetype.md) — precedent for a new `kind: page` archetype
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes
