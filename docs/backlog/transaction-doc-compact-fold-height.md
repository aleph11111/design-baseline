---
area: archetypes
opened: 2026-11-18
status: ready
value: high
model: sonnet
model_reason: "two scoped class-level layout changes on a shipped primitive, gated behind existing compact signals; acceptance is a measured number"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Transaction-document compact fold height in the warning state

## Context

Consumer brickshop-manager `/orders/:id` (shipped, no carrier scan, `laptop14Window` 1133x739) still ends the ledger Total row at 774px on design-baseline v0.54.0, 35px below the 739px fold ([[transaction-document-ledger-header-and-actions-row-compact]]). Two package-owned costs remain in `src/components/archetypes/transaction-document/`: the `SideEffects` "Running alongside:" block in `TransactionDocumentShell.tsx` renders as its own padded line under a toned (warning/error) next-step panel, and the `LedgerTable.tsx` header row plus the ledger card's top offset above it with `compactRowLocks`. Blocks brickshop-manager ticket `orders-detail-ledger-total-below-laptop-fold`. PR #816 implements it.

## What to do

- [ ] In `TransactionDocumentShell.tsx`, when the next-step panel is toned and every side effect is failed, render the effects inside the description column instead of a separate block; the default-tone path stays as is.
- [ ] With `ledger.compactRowLocks`, shrink the `LedgerTable` header row to `h-7` and pull the ledger card body up 12px (not when the ledger carries its own lock note).
- [ ] Update `TransactionDocumentShell.test.tsx`, add a CHANGELOG entry and bump `package.json` to v0.55.0.

## Acceptance

- A toned panel with only failed side effects shows every failed effect inside the description column, and a default-tone panel renders its block as before.
- The non-compact ledger renders unchanged, and no other consumer page or gallery screenshot changes.
- In brickshop-manager the `/orders/:id (shipped, no carrier scan)` route at `laptop14Window` measures the ledger Total row ending at 739px or less.

## Related

- [[transaction-document-ledger-header-and-actions-row-compact]] — previous compaction pass that left the 35px gap
- [[transaction-document-ledger-height-compact]] — introduced `compactRowLocks` height work
