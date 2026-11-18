---
area: archetypes
opened: 2026-11-18
status: ready
value: high
model: sonnet
model_reason: "one-class responsive gate on a shipped offset; acceptance is a measured number plus a phone tap check"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Transaction-document compact ledger offset only at wide widths

## Context

v0.55.0 ([[transaction-doc-compact-fold-height]]) pulls the ledger card body up 12px with `-mt-3` under `ledger.compactRowLocks` in `src/components/archetypes/transaction-document/TransactionDocumentShell.tsx` (the `Slot` body). On a phone the ledger card header's lock button edge then reaches the next-step panel's `Refresh tracking` button: brickshop-manager `/orders/:id (shipped, no carrier scan)` at the `phone` project fails `tapOverlap`. The offset only matters for the laptop fold, so it belongs at wide widths.

## What to do

- [ ] Apply the compact offset only from the `sm` breakpoint (`sm:-mt-3`) in the `Slot` body of `TransactionDocumentShell.tsx`, so 1133px laptop keeps it and a 390px phone does not.
- [ ] Update the offset test in `TransactionDocumentShell.test.tsx` and add a CHANGELOG entry plus a patch version bump.

## Acceptance

- The compact ledger body carries `sm:-mt-3` and never a bare `-mt-3`; a ledger lock note and the non-compact ledger stay unchanged.
- In brickshop-manager `/orders/:id (shipped, no carrier scan)` at `laptop14Window` the ledger Total row still ends at 739px or less.
- In brickshop-manager the same route at `phone` reports no `tapOverlap`.

## Related

- [[transaction-doc-compact-fold-height]] — introduced the unconditional `-mt-3`
