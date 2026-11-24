---
area: archetypes
opened: 2026-11-18
status: done
value: high
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Transaction-document ledger Total still below laptop fold

## Context

Consumer brickshop-manager `/orders/:id` (SO-2026-00053, realistic 2-line order, shipped, no carrier scan) at 1133x739 (`laptop14Window`) still ends the ledger Total row at 774px, 35px below the 739px fold, on design-baseline v0.54.0. Follow-up to [[transaction-document-ledger-height-compact]], [[transaction-document-ledger-header-and-actions-row-compact]] and [[transaction-document-next-step-panel-compact-layout]]. Two package-owned costs remain in `src/components/archetypes/transaction-document/`:

1. The v0.54.0 CHANGELOG says `compactRowLocks` makes the `LedgerTable` header row `h-9` (`headCls` at `LedgerTable.tsx:157`), yet the consumer still measures the Item / Charged / Cost header row at ~65px incl. padding. Where the 65px come from (cell wrapping, padding, or `h-9` losing to the `TableHead` default `h-12` in `src/components/ui/table.tsx`) is unmeasured. That column-header row is also redundant when the card header already says Lines.
2. The warning-state `nextStep` panel renders `sideEffects` ("Running alongside", `SideEffects` at `TransactionDocumentShell.tsx:300`) on its own line plus padding, ~30px. When only a failed effect remains it could sit inline with the shipment line.

Repro: in brickshop-manager remove the `tests/visual/known-failing.json` entry for "/orders/:id (shipped, no carrier scan)" laptop14Window, run `npm run test:visual -- --project=laptop14Window -g "/orders/:id"`, read `visual-report/laptop14Window/orders-id-shipped-no-scan.json`. Blocks brickshop-manager ticket `orders-detail-ledger-total-below-laptop-fold`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Measure first in real Chrome (gallery at 1133x739, a 2-line ledger with the warning-state `nextStep`) where the ~65px header row comes from; fix that cause in `LedgerTable` for `compactRowLocks` only.
- [ ] Compact the ledger column-header row further in compact mode (drop it or hide it visually when the card header already labels the ledger, keeping an `sr-only` header for accessibility), compact mode only.
- [ ] In compact mode, render `SideEffects` inline with the shipment line instead of on its own padded line when only a failed effect remains (`TransactionDocumentShell.tsx:300`); default rendering unchanged.
- [ ] Apply either or both until the Total row bottom is at most 739px at `laptop14Window`; add a gallery demo for the realistic 2-line warning-state case (per living-demos convention) and cover it in `check:viewports` or a vitest layout assertion.
- [ ] Add a CHANGELOG entry and bump the package version (consumer then bumps `design-baseline` and re-baselines screenshots).

## Acceptance

- The ledger Total row bottom measures at most 739px at 1133x739 in real Chrome for the realistic 2-line warning-state order demo.
- Default (non-compact) rendering of `LedgerTable` and the `nextStep` panel is unchanged; existing pixel baselines for non-compact demos do not move.
- No other `compactRowLocks` call site or `TableHead` consumer in the archetype gets a different header height as a side effect; the compact header height holds for every call site, not only the order demo.
- After the version bump, brickshop-manager passes the `/orders/:id (shipped, no carrier scan)` laptop14Window case with its known-failing entry removed.

## Related

- [[transaction-document-ledger-height-compact]]
- [[transaction-document-ledger-header-and-actions-row-compact]]
- [[transaction-document-next-step-panel-compact-layout]]
- [[ledgertable-compact-row-lock]]
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — Transaction documents are their own `kind: page` archetype
