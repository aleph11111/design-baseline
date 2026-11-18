---
area: archetypes
opened: 2026-11-18
status: done
value: high
model: sonnet
model_reason: "three additive opt-in layout changes on one shipped archetype, each following an existing pattern (CompactLock, LockNote, Slot header); design resolved by the ticket"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Transaction-document ledger height cut for laptop fold

## Context

Consumer brickshop-manager `/orders/:id` still ends the ledger Total 123px below the 739px laptop14 fold on design-baseline v0.51.0 (Total bottom at 734px per the compact demo, consumer needs it above the fold). v0.51.0 shipped `ledger.compactRowLocks` ([[ledgertable-compact-row-lock]]), but three height sources remain in `src/components/archetypes/transaction-document/`:

1. `CompactLock` (`LedgerTable.tsx`, `data-slot="td-lock-compact"`) is `flex flex-wrap`, so the lock icon stacks above the figure and rows are ~77px instead of ~56px.
2. In the ledger slot, the Slot title row and the separate column-lock `LockNote` row (`fieldLocks` in `LedgerTable.tsx`) are two stacked rows.
3. `identity.progress` (6 steps, `Progress` in `TransactionDocumentShell.tsx`) is rendered inside the `subtitle` passed to the page header, so it shares width with header `actions` and wraps to 2 lines at a 1133px window.

All three are opt-in or layout-only; default non-compact rendering must stay as is.

## What to do

- [ ] In `CompactLock`, drop `flex-wrap` so the lock icon sits inline left of the figure on one right-aligned row (`justify-end`, `flex-nowrap`); compact rows measure ~56px.
- [ ] With `ledger.compactRowLocks`, merge the ledger slot title row and the column-lock `LockNote` row into one: the Slot header shows the title plus a lock icon with a Popover (reason + way-out `ActionLink`, keyboard and touch reachable, sr-only reason, same trigger markup as `CompactLock`). Without `compactRowLocks` the rendering stays byte-identical to today (`fieldLocks` still emit `LockNote`).
- [ ] Render the `identity.progress` row full-width below the header (outside the `subtitle` column that shares width with header `actions`; check PageFrame subtitle vs actions placement) so the 6-step `ol[data-slot="td-progress"]` stays on one line at a 1133px window.
- [ ] Extend `scripts/check-viewports.mjs` (the "Compact locks" TD variant) to assert at laptop14: compact row height and Total bottom against the 734px v0.51.0 baseline, no separate lock-note row, progress `ol` on one line.
- [ ] Extend `TransactionDocumentShell.test.tsx` for the merged slot-header lock (popover reason + way-out, sr-only reason) and for default rendering keeping its `LockNote` row.
- [ ] Keep `docs/archetypes/transaction-document.md` role-only (no Tailwind classes or primitive names, per `docs/RULES.md` rules 2-3); document the behaviour as the contract of the existing `compactRowLocks` flag.
- [ ] Ship as one release: package version bump, `CHANGELOG.md`, MANIFEST version entry for transaction-document.

## Acceptance

- `check:viewports` on the compact demo at laptop14 shows the lock icon and figure on one row, each compact row about 56px, and the ledger Total bottom below the 734px v0.51.0 value.
- The ledger slot shows one header row (title plus lock icon); no separate lock-note row renders in compact-lock mode.
- The progress `ol` measures one line at a 1133px window for the 6-step order demo.
- Default rendering (no `compactRowLocks`) is unchanged: sentences under lines and the column `LockNote` row still render.
- `TransactionDocumentShell.test.tsx` passes with the new assertions.

## Related

- [[ledgertable-compact-row-lock]] — shipped the `compactRowLocks` variant this builds on
- [[transaction-document-ledger-row-lock-add-remove]] — shipped `LedgerRow.locks`
- [[page-header-block-subtitle-content]] — subtitle content placement in the header
- [[progress-tracker-narrow-column-label-room]] — prior progress width fix
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — transaction-document archetype
