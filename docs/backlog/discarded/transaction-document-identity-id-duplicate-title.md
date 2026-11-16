---
area: archetypes
opened: 2026-11-16
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-16T09:00:00Z
---

# Transaction-document shell shows the document number twice when title equals id

## Context

`TransactionDocumentShell` (`src/components/archetypes/transaction-document/TransactionDocumentShell.tsx:171`) always renders `<DocumentId id={identity.id} />` as a copy-chip beside the h1. `identity.id` is a required string ("never wraps; carries a copy button"). A consumer that wants the document number as the h1 (brickshop-manager `SalesOrderDocument` passes `title=order_number` to match mockup `project/V2.dc.html`) therefore shows the number twice: h1 and chip text. Chosen over making `identity.id` optional: hiding the chip text keeps the copy action and leaves every caller's type unchanged.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Keep `identity.id` required (the copy button needs the value; making it optional would drop the copy action). In `TransactionDocumentShell.tsx` pass a hide-text flag to `DocumentId` when `title === identity.id`.
- [ ] In `parts.tsx` `DocumentId`, add an optional prop that omits the visible id text while keeping the `td-id` slot and the copy button (`aria-label` via `L.copyId(id)` unchanged).
- [ ] Update `docs/archetypes/transaction-document.md` (line ~50, the "document number" sentence) to state the chip text is suppressed when the title is the number.
- [ ] Add shell tests in `TransactionDocumentShell.test.tsx`: title === id renders the number once and the copy button still writes it to the clipboard; title !== id unchanged.

## Acceptance

- With `title === identity.id` the number renders once (h1 only) and the copy button still copies it.
- With `title !== identity.id` the output is unchanged; no other call site (every `TransactionDocumentShell` use, including `src/examples/transaction-document-demo.tsx`) changes output.

## Related

- [[transaction-document-mockup-fidelity]] — archived; shipped the shell this refines
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — transaction-document page archetype
