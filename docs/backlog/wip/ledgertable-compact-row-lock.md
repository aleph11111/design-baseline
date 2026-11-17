---
area: archetypes
opened: 2026-11-17
status: needs-enrichment
value: high
model: sonnet
model_reason: "additive optional prop on a shipped archetype; follows the existing LockNote/Lock pattern, design fork resolved to a recommended default"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved ## Open question caps readiness at 4"
  graded_at: 2026-11-17T00:00:00Z
---

# LedgerTable compact row-lock variant above the laptop fold

## Context

`LedgerTable` (`src/components/archetypes/transaction-document/LedgerTable.tsx:94-97`) renders one full-width `LockNote` sentence per locked row cell (`LedgerRow.locks`, shipped in the archived [[transaction-document-ledger-row-lock-add-remove]]), about 25px per row. A 2-item sales order therefore pushes the ledger Total below the laptop14 fold. Evidence: consumer brickshop-manager `/orders/:id` (shipped, no carrier scan) ends its Total at 918px on design-baseline v0.50.4 against a 739px fold. The consumer ticket `orders-detail-ledger-total-below-laptop-fold` (brickshop-manager) is blocked on this one.

Ask: add a compact row-lock variant: a lock icon kept in the locked Cost cell, with the reason and way-out reachable from it, instead of a sentence under the item label. The default rendering stays as today so no other locked-cell consumer loses its reason text.

## What to do

- [ ] Add an opt-in compact mode for `LedgerRow.locks` in `LedgerTable.tsx` (a `LedgerTable` prop, default = current `LockNote` rendering): the locked cell shows `LockIcon` with an accessible name, and the reason and `wayOut` action are reachable from it. Reuse the shared `Lock` type and `ActionLink` from `parts.tsx`; no new lock data shape.
- [ ] Make the compact trigger a `Popover` (`src/components/ui/popover.tsx`) so the `wayOut` link is keyboard- and touch-reachable; keep the reason text available to assistive tech without opening it (sr-only, as `LockNote` does with `L.locked`).
- [ ] Surface the prop through the shell's `ledger` slot in `TransactionDocumentShell.tsx` and add a locked-row compact case to `src/examples/transaction-document-demo.tsx` (the locked-cost demo near line 219).
- [ ] Update `docs/archetypes/transaction-document.md` (Ledger and Locks, role only: no Tailwind or primitive names), extend `TransactionDocumentShell.test.tsx`, add a laptop14 height assertion to the viewport check, then cut a release (MANIFEST version bump per `docs/RULES.md`).

## Acceptance

- A 2-item ledger with locked Cost cells in compact mode ends its Total at or above 739px at laptop14 (1512x982@2), measured in the gallery demo.
- In compact mode the locked reason and way-out remain reachable: opening the lock trigger shows both, and the way-out link is focusable by keyboard.
- Ledgers that do not opt in render exactly the current `LockNote` sentences, so no other locked-cell consumer loses its reason text.
- A locked cell in compact mode no longer fires `onCellChange` on blur or Enter, same as the full variant.

## Related

- [[transaction-document-ledger-row-lock-add-remove]] — shipped `LedgerRow.locks` this variant condenses
- [[transaction-document-ledger-row-media]] — also edits the `LedgerTable` row cell (`LedgerRow` optional fields); independent, no ordering needed
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — Transaction documents are their own `kind: page` archetype

## Open question

Tooltip or popover for the compact lock? The thought said "tooltip". Resolved to **Popover (Recommended)** because the way-out is an interactive link and a hover tooltip is not reachable by touch or reliably by keyboard. Alternatives: a plain `Tooltip` (reason only, way-out dropped or shown only on hover/focus), or an always-visible one-line truncated note (keeps text but saves less height). Confirm before `/feat`.
