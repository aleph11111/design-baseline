# 0014 — Transaction documents are their own `kind: page` archetype (transaction-document, Td)

- **Status:** Accepted
- **Date:** 2026-11-09
- **Closes:** backlog `archetype-gap-transaction-document`
- **Respects:** [ADR 0001](0001-grandfather-authored-report-calendar.md) (no new authored entry), [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (no appearance props), [ADR 0008](0008-one-page-frame-slot-owned-placement.md) (one frame, slot-owned placement).

## Context

brickshop-manager's `/orders/:id` page (`DetailOverviewShell layout="rail"`) repeats every money fact three to four times: detail-overview offers a rail plus a free main column with no rule that a fact has one home, and its header took nine buttons. Offers and purchase orders have the same shape. No shipped `kind: page` archetype fits a transaction document, and RULES.md hard rule 12 forbids a stopgap page.

## Decision

1. **New `kind: page` archetype, not a detail-overview variant.** The point is removing detail-overview's free main column. A variant (the ADR-0011 / ADR-0013 pattern) would keep that escape hatch; a shell with five typed slots — identity, next step, ledger, facts, history — and no content slot cannot repeat a fact by construction. Key **Td**.
2. **The primary action has one home: the next-step panel.** The header takes the typed `PageFrame` action model (#706) without `primary`; a primary passed anyway is demoted. On a phone the primary pins to the bottom of the screen.
3. **Ledger columns are declared per document type**, each with a priority; a column that doesn't fit moves into the row's second line, so the ledger never scrolls sideways. The ledger has a read-only and an editable mode.
4. **Locks carry a reason and a way out**, supplied by the consumer and rendered one way. Automatic side effects live in the next-step panel, not a sixth slot.
5. **Provenance: `promoted_from: brickshop-manager`, fleet-synthesis.** The evidence is thin: the source is the anti-pattern order page plus the operator's mockup (2026-11-07/08 "Transaction documents plan"), not a matured fixed shape; `/promote-archetype` was bypassed. Three consumers (sales order, offer, purchase order) are named and waiting, and rule 12 forbids a stopgap, so waiting for a matured page is not an option. Not an authored entry; ADR 0001's closed set is untouched.

## Consequences

- brickshop-manager rebuilds `/orders/:id`, the offer pages and the purchase-order page on `design-baseline/archetypes/transaction-document`.
- The duplicate-fact invariant (a check that a fact renders once) is split into its own ticket, `invariants-duplicate-fact-check`; until it ships, one-home-per-fact is enforced by the shell's slot shape and the acceptance gate.
- Invoices and incoming invoices are later consumers; they did not shape this contract.
