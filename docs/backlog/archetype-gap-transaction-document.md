---
area: archetypes
opened: 2026-11-07
status: ready
value: high
depends_on: [device-triad-narrow-laptop-width-sweep]
model: opus
model_reason: "archetype shape is the deliverable: slot grammar, one-home-per-fact rule and variant-vs-new-archetype call are design decisions"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-09T00:00:00Z
---

# Archetype gap: transaction-document page for sales orders, offers and purchase orders

## Context

brickshop-manager's `/orders/:id` page repeats every money fact three to four times because `detail-overview` (`src/components/archetypes/detail-overview/`) offers a rail plus a free main column with no rule that a fact has exactly one home, and its header `actions: ReactNode` invites nine-button headers. The same shape recurs for offers and purchase orders, so no `kind: page` archetype in MANIFEST fits a transaction document. Mockup: https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw (rows "V2", "Create and process", "On a phone", "Offers").

Scope is three consumers: sales order, offer (valuation and offer phases), purchase order. Invoices and incoming invoices are later consumers and do not shape this ticket.

Typed slots, placed by the shell (slot-owned placement per [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md)):

- `identity` — nowrap id with copy, one status plus one attention flag, a one-sentence summary, and an optional **document chain line** linking related documents (e.g. Lead › Valuation › Offer › Purchase order; the current document unlinked).
- `nextStep` — state-keyed panel and the sole owner of the primary action. It also renders the document's **automatic side effects** ("running alongside": e.g. invoice created on payment, BrickLink updated on ship) as a declared list of `{ label, state: done | pending | failed, link? }` under the panel. Decision: part of `nextStep`, not a sixth slot — the list belongs to the current state, and a separate slot would be one more home for state facts.
- `ledger` — the one money table. **Columns are declared per document type**, each with a priority, so the table reflows without horizontal scroll: sales order Charged · Cost with profit and margin; offer Their ask · Market · Max · Our offer · Profit; purchase order Cost · expected market value with expected margin. A **read-only and an editable mode** (offer valuation edits our price per set inline).
- `facts` — auto-fit grid of typed, locale-formatted values; each fact may carry its own Change link.
- `history` — collapsed by default.

**Locks.** Any slot or field can be locked with a stated reason and a way-out link (e.g. "Lines come from BrickLink — change them there"; "Address locked — create a replacement label"). The consumer supplies the locks, since they depend on status and sales channel; the shell renders them one way everywhere.

**Header.** Exactly 0 primary and at most 2 secondary actions inline, through the typed `PageFrame` action model `{ primary, secondary, menu }` shipped in #706 (v0.31.0); the rest goes to its ⋯ menu. The primary action lives only in `nextStep`.

**Phone.** The `nextStep` primary action is pinned to the bottom of the screen, and ledger lines render as 2-line rows (label and charged amount, then secondary columns underneath).

Per the archetype-gap rule a consumer never hand-rolls the shape; brickshop-manager waits on this ticket, then rebuilds `/orders/:id` on the shipped export. Source for `promoted_from` is the brickshop-manager order page (`src/components/detail-views/order/StandaloneOrderDetailView.tsx`, `DetailOverviewShell layout="rail"`) plus the mockup — fleet-synthesis style promotion, `/promote-archetype` bypassed. That evidence is thin: the source is the anti-pattern page, not a matured fixed shape, so the promotion rests on the fleet-synthesis exception.

Operator decisions (2026-11-07, revised 2026-11-08 in the "Transaction documents plan" after an independent review):

- **New `kind: page` archetype `transaction-document`, not a `detail-overview` variant.** The point is removing detail-overview's free main column; a variant (the ADR-0011 pattern) would keep that escape hatch. Precedent: ADR-0012; placement per ADR-0008.
- **No own bounded-action implementation.** The shell consumes the typed action model from [[page-header-action-hierarchy-overflow-menu]] (shipped, #706).
- **The duplicate-fact invariant is split out** into [[invariants-duplicate-fact-check]]; this ticket does not carry it.
- **Ledger columns are per document type, the ledger has an editable mode, locks carry a reason and a way out, side effects live in `nextStep`** (2026-11-08).

## What to do

- [ ] Write the role-only contract `docs/archetypes/transaction-document.md` (rules 2–3 of `docs/RULES.md`): the five slots, the one-home-per-fact rule, the side-effects list in `nextStep`, the lock state, the header rule, per-type ledger columns.
- [ ] Ship the typed shell under `src/components/archetypes/transaction-document/` with export `design-baseline/archetypes/transaction-document`, a MANIFEST entry with `promoted_from`, and a package version bump.
- [ ] Make `nextStep` the only slot that renders a primary action; the header takes only the typed `PageFrame` action model with 0 primary and at most 2 secondary, overflowing into its ⋯ menu.
- [ ] Type the ledger columns as a per-document declaration with column priorities; implement read-only and editable modes.
- [ ] Add the lock state (reason + way-out link) for a slot or a single field, and the optional chain line in `identity`.
- [ ] Gallery demo `src/examples/transaction-document-demo.tsx` with three variants: a sales order (9 actions, a long title, a locked ledger), an offer in the valuation phase (editable ledger with the offer columns), and a purchase order.
- [ ] Phone layout: pinned `nextStep` primary action, 2-line ledger rows.

## Acceptance

- The `transaction-document` demo renders identity, nextStep, ledger, facts and history, and the shell places each slot.
- Only the `nextStep` slot renders a primary-styled action; the header shows 0 primary and at most 2 secondary actions, the rest behind ⋯, for the demo with 9 actions.
- The sales-order and offer variants render different ledger columns from their declarations, and the offer variant's ledger cells are editable while the sales-order ledger shows its lock reason and way-out link.
- `npm run check:viewports` passes for all three variants at desk27, laptop14, phone and the 1133 × 739 `laptop14Window`, with no horizontal scroll in the ledger and the long title shown in full.
- On phone the `nextStep` primary action stays visible at the bottom of the viewport while the page scrolls.
- The contract names no Tailwind classes or primitive names, and the MANIFEST entry carries `promoted_from`.

## Related

- [[device-triad-narrow-laptop-width-sweep]] — must ship first: it adds the 1133 × 739 `laptop14Window` this ticket's acceptance runs against
- [[page-header-action-hierarchy-overflow-menu]] — shipped in #706 (v0.31.0); this shell consumes its typed action model
- [[archetype-gap-work-queue-list]] — sibling page type from the same plan; its groups use the same next-step states
- [[invariants-duplicate-fact-check]]
- [[detail-overview-rail-switch-container-query]]
- [[archetype-gap-print-statement-document]]
- [[archetype-gap-matrix-grid-docked-inspector]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — a variant of an existing archetype versus a new one
- [ADR-0012](/docs/adr/0012-structure-builder-page-archetype.md) — precedent for a new `kind: page` archetype
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes
