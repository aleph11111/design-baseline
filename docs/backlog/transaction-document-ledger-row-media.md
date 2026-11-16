---
area: archetypes
opened: 2026-11-16
status: needs-enrichment
value: normal
model: sonnet
model_reason: "additive optional prop on a shipped archetype, follows the existing LedgerRow optional-field pattern (detail, actions)"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved ## Open question caps readiness at 4"
  graded_at: 2026-11-16T00:00:00Z
---

# Transaction-document ledger row media thumbnail slot

## Context

`LedgerRow` in `src/components/archetypes/transaction-document/ledger.ts` carries only `label` and `detail`, and `LedgerTable.tsx` renders the Line cell as label plus detail. Consumer brickshop-manager `/orders/:id` (`SalesOrderDocument`, rows built in `src/components/detail-views/order/sales/salesOrderLedger.ts` with label+detail only) has an agreed mockup (V2) whose Line cell shows a 40px item thumbnail next to the label, plus a condition line ("New · Sealed") per row. The archetype has no slot for the thumbnail, so the consumer cannot match the mockup without hand-rolling the cell.

Ask: add an optional media slot to `LedgerRow`, rendered at 40px in the Line cell beside the existing label/detail stack, document it in the archetype contract, and release a tag.

## What to do

- [ ] Add `LedgerRow.media?: ReactNode` in `ledger.ts` (same optional-field pattern as `detail` and `actions`); `LedgerTable.tsx` renders it in a fixed 40px box at the start of the Line cell, label/detail layout unchanged beside it.
- [ ] Keep the contract stack-agnostic: the consumer passes its own image element (plain `<img>`, framework image component, or an icon), so the archetype adds no `{src, alt}` shape and no image dependency (per `docs/RULES.md` rules 2–3, role-only contract).
- [ ] Update `docs/archetypes/transaction-document.md` Ledger section: describe the row media slot by role (a small identifying image for the line), no Tailwind classes or primitive names; bump the archetype version in the contract and `docs/archetypes/MANIFEST.json`.
- [ ] Add a media row to `src/examples/transaction-document-demo.tsx` (living demo per the variant-demo convention) and extend `TransactionDocumentShell.test.tsx` to cover a row with and without `media`.
- [ ] Refresh the screenshot baselines if the demo change moves them (`npm run screenshots:update`), then cut a release tag per `docs/RULES.md`.

## Acceptance

- A row with `media` renders it in a 40px box at the start of the Line cell, with label and detail still shown beside it.
- A row without `media` renders unchanged: no empty box, no layout shift, and existing ledgers pass no new props.
- On the phone viewport the media stays 40px and the first-priority figure still renders inline (`npm run check:viewports` unchanged).
- The contract in `docs/archetypes/transaction-document.md` documents the slot, and the MANIFEST version matches the released tag.

## Related

- [[transaction-document-ledger-row-lock-add-remove]] — prior additive `LedgerRow` extension; same files and release steps
- [[transaction-document-mockup-fidelity]] — earlier mockup-fidelity pass on this archetype
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — Transaction documents are their own `kind: page` archetype
- [transaction-document contract](/docs/archetypes/transaction-document.md)

## Open question

Two calls were resolved to defaults; reverse on review if wrong.

- Media type: `ReactNode` (chosen, keeps the donor image-library-agnostic) vs `{src, alt}` (simpler call site, but forces the donor to own `<img>` markup and alt/lazy-loading policy).
- Condition line ("New · Sealed"): assumed to fit the existing `LedgerRow.detail` second line, so no new field. If `detail` is currently `string` and the mockup needs it styled separately from the set number or SKU, a second optional line is a follow-up ticket, not part of this one.
