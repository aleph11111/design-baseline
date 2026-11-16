---
area: archetypes
opened: 2026-11-16
status: ready
value: normal
model: sonnet
model_reason: "scoped fix at one shared render point with a clear cause and acceptance"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-16T00:00:00Z
---

# TransactionDocumentShell duplicate identity id chip beside title

## Context

`TransactionDocumentShell` (`src/components/archetypes/transaction-document/TransactionDocumentShell.tsx:171`) always renders `<DocumentId id={identity.id} />` (the `td-id` copy-chip from `parts.tsx`) in the header badges, next to the h1. A consumer that wants the document number as the h1 — brickshop-manager `SalesOrderDocument` passes `title=order_number` to match mockup V2 (`project/V2.dc.html`) — therefore shows the number twice. `identity.id` is a required prop of `TransactionIdentity`, so the consumer cannot omit it. Chosen fix: dedupe in the shell when `title === identity.id` and keep the copy button, so the prop type (the contract) stays unchanged; making `identity.id` optional was the alternative and would also drop the copy affordance for these consumers.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `TransactionDocumentShell.tsx`, when `title === identity.id`, render the copy button without the repeated number text (or otherwise show the number once) while keeping the copy affordance; `DocumentId` in `parts.tsx` takes the variant.
- [ ] Grep every consumer of `TransactionIdentity` / `DocumentId`, incl. `src/examples/transaction-document-demo.tsx` (three demos, titles all differ from their ids today) and `TransactionDocumentShell.test.tsx:89`, and confirm none regresses.
- [ ] Add a gallery demo or test fixture where `title` equals `identity.id`, per the living-demos convention for documented variants.

## Acceptance

- A shell rendered with `title` equal to `identity.id` shows the document number once and still shows the copy button.
- A shell rendered with `title` different from `identity.id` is unchanged: the `td-id` chip still shows the number (`TransactionDocumentShell.test.tsx:26` still passes).
- No other call site that passes `title` equal to `identity.id` shows the number twice.

## Related

- [[transaction-document-mockup-fidelity]] — archived; introduced the shell identity and mockup alignment this follows up on
- [[archetype-gap-transaction-document]] — archived; origin of the archetype
