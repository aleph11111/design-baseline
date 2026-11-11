---
area: archetypes
opened: 2026-11-11
status: done
value: normal
model: opus
model_reason: "API shape is the deliverable: ledger result row, nextStep tone and identity progress extend a shipped archetype contract, plus a layout decision (bounded column; section cards deferred to the surface ADR)"
depends_on: [transaction-document-ledger-row-lock-add-remove]
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-11T21:00:00Z
---

# Transaction-document shell renders far from the operator mockup

## Context

The Td shell (`src/components/archetypes/transaction-document/TransactionDocumentShell.tsx`, `LedgerTable.tsx`, `ledger.ts`; shipped v0.33.0, #713) renders far from the operator mockup it was built for (https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw, artboard `project/V2.dc.html` "Order detail V2"). Seen in brickshop-manager `/orders/:id` (SO-2026-00049) on a wide screen after brickshop PR #1962. Four gaps are owned by the shell:

1. No content max-width and no section surfaces: `td-body` is flat `divide-y` strips, so on a 2000px viewport ledger amounts sit ~1600px from the item names. V2 uses a bounded column and white bordered rounded cards per section.
2. The sales-order ledger declares Profit and Margin as per-row columns (demo and `TransactionDocumentShell.test.tsx:44` expect Item/Charged/Cost/Profit/Margin), giving a column of em-dashes. V2 has per-line Charged and Cost only, a Total row, then one emphasized Profit footer row "39,99 € · 22,7 % margin · target 20 %".
3. The `nextStep` panel is always `bg-muted/30` grey. V2 gives it a tone (warning amber when the state is a problem, e.g. "No carrier scan 8 days after the label was created") with the title stating the problem.
4. `identity` has no progress line. V2 shows one quiet ordered list under the summary (● Placed 30.10. ● Paid ● Packed ● Label created ○ Carrier scan ○ Delivered, current step bold).

Version baseline is now `package.json` 0.37.0 (#723 shipped v0.37.0), so the release is the next minor, v0.38.0, MANIFEST entry 1.2.

Operator decision 2026-11-11: the per-section cards are **out of scope** here. ADR-0008 §3 (the frame is the page's only raised surface) and ADR-0007 §3 (no card-in-card) forbid them today, and changing that is a fleet-wide surface decision for a new ADR + per-archetype roadmap (captured to the design-baseline inbox as the "surface ADR" ticket), not a Td-local change. Sections stay inside the frame's one surface until that ADR lands; Td becomes its first slice.

## What to do

- [ ] Bound the content column in `TransactionDocumentShell.tsx`; sections stay inside the frame's one surface (ADR-0008 §3) — per-section cards are deferred to the surface ADR.
- [ ] Add a ledger result/footer row API in `ledger.ts` / `LedgerTable.tsx`: a labelled row with a value, a sub-line and a positive/negative tone, rendered after the Total row; use it for the sales-order Profit line.
- [ ] Drop the Profit and Margin per-row columns from the sales-order ledger in `src/examples/transaction-document-demo.tsx` (per-line Charged and Cost only) and update the column assertion in `TransactionDocumentShell.test.tsx:44`.
- [ ] Add `nextStep.tone` (`default | warning | danger | success`, default `default`) to `TransactionNextStep`; the panel surface follows the tone. Demo: a warning sales-order state whose title states the problem.
- [ ] Add `identity.progress` (ordered steps, each done / current / pending) to `TransactionIdentity`, rendered as one quiet ordered list under `td-summary`, current step bold.
- [ ] Update `docs/archetypes/transaction-document.md` (role only, no Tailwind or primitive names), extend `TransactionDocumentShell.test.tsx`, and bump the MANIFEST entry and `package.json` version to the next minor, v0.38.0 / MANIFEST 1.2 (per `docs/RULES.md`).

## Acceptance

- The demo at laptop14Window 1133x739 and at desk27 2560 matches V2 side by side in structure: bounded column width, profit footer row, toned panel, progress line — sections remain inside the one frame surface per ADR-0008 §3, not one card each.
- At a 2000px viewport the ledger label and amount columns sit within the bounded column, not ~1600px apart.
- The sales-order demo ledger shows only Item, Charged and Cost columns, then a Total row and one Profit result row with its sub-line; no em-dash column remains.
- A `nextStep.tone` of `warning` renders the panel in the warning surface, and omitting `tone` renders the neutral panel unchanged.
- `identity.progress` renders an ordered list with the current step in bold; omitting it renders nothing new.
- MANIFEST and `package.json` versions are bumped to the same next minor.

## Related

- [[transaction-document-ledger-row-lock-add-remove]] — must ship first: it changes the same `LedgerRow`/`LedgerTable` API, demo and test, so building this first means rebasing both
- [[archetype-gap-transaction-document]] — the gap ticket that shipped the Td archetype
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one raised surface per page (§3) keeps sections out of cards until the surface ADR replaces it
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — Transaction documents are their own `kind: page` archetype
