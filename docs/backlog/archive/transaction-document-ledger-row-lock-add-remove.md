---
area: archetypes
opened: 2026-11-10
status: done
value: normal
model: opus
model_reason: "ledger API shape is the deliverable: row-level lock grammar, add/remove slots and per-row actions extend a shipped archetype contract"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-10T00:00:00Z
---

# Transaction-document ledger: per-row cell locks and add/remove rows

## Context

`transaction-document` v0.33.0 (`src/components/archetypes/transaction-document/ledger.ts`, `LedgerTable.tsx`) makes editability a per-column property only: `LedgerColumn.editable` plus `LedgerColumn.lock`. `LedgerRow` carries no editability or lock, and the ledger has no add-row, delete-row or per-row action API. Consumer brickshop-manager `/orders/:id` (`SalesOrderDocument.tsx`, ticket `orders-detail-one-ledger-next-step-panel`) therefore renders a Cost input on item lines whose cost comes from the stock lot and rejects the edit with a toast, deletes cost lines by clearing the cell, and opens Add cost / Add charge from the header More menu. Repro: open a sales order; the item row Cost cell is an input that cannot save.

Ask: let a row lock a single cell with the shared `Lock` (reason + wayOut, same type and `LockNote` rendering as `LedgerColumn.lock`), and give the ledger `onAddRow` / `onRemoveRow` slots and per-row actions so add and delete live in the ledger, not in the header menu.

## What to do

- [ ] Add `LedgerRow.locks?: Record<string, Lock>` (keyed by column `key`, reusing the existing `Lock` type in `ledger.ts`); `LedgerTable.canEdit` renders a locked cell read-only and shows its reason (via `LockNote`/`wayOut`), as it does for `LedgerColumn.lock`.
- [ ] Add `onAddRow` and `onRemoveRow` props to `LedgerTable` / the shell's `ledger` slot, plus optional per-row actions, so adding and deleting a ledger line happens in the ledger.
- [ ] Update `docs/archetypes/transaction-document.md` (Ledger and Locks sections, checklist) — role only, no Tailwind or primitive names.
- [ ] Update `src/examples/transaction-document-demo.tsx` with a locked-cost item row and add/remove rows, extend `TransactionDocumentShell.test.tsx`, then cut a release (MANIFEST version bump per `docs/RULES.md`).

## Acceptance

- A row with `locks: { cost: { reason, wayOut } }` renders its Cost cell read-only and shows the reason and way out, while other rows keep editable Cost inputs.
- A locked cell no longer fires `onCellChange` on blur or Enter.
- After clicking add, the ledger calls `onAddRow`; per-row remove calls `onRemoveRow` with the row id, so no add/remove control is needed outside the ledger.
- Ledgers that pass no `locks`, `onAddRow` or `onRemoveRow` render unchanged.

## Related

- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — Transaction documents are their own `kind: page` archetype
- [[archetype-gap-transaction-document]] — the archetype's origin ticket (ledger, locks, one-home rule)
- [transaction-document contract](/docs/archetypes/transaction-document.md)
