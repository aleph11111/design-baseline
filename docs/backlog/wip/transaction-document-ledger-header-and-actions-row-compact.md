---
area: archetypes
opened: 2026-11-18
status: ready
value: high
model: sonnet
model_reason: "two scoped class-level layout changes on shipped primitives, each following an existing pattern (compactRowLocks opt-in, HeadingRow container-query classes); acceptance is a measured number"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Transaction-document ledger header and actions row compact

## Context

Consumer brickshop-manager `/orders/:id` (SO-2026-00053, realistic order, `laptop14Window` 1133px) still ends the ledger Total at 794px on design-baseline v0.53.0, 55px below the 739px fold, even with `ledger.compactRowLocks` shipped ([[ledgertable-compact-row-lock]], [[transaction-document-ledger-height-compact]]). Two package-owned costs remain:

1. The `LedgerTable` header row (`TableHead` Item / Charged / Cost, `src/components/archetypes/transaction-document/LedgerTable.tsx:163-177`) uses the shared `TableHead` default `h-12 px-4` (`src/components/ui/table.tsx`), reported ~63px tall incl. padding; with `compactRowLocks` it should be ~36px.
2. The header `actions` cluster wraps to two rows at 1133px (Send email above, Sync + More below), which also makes the subtitle wrap to 2 lines. `HEADING_ROW_CLASSES.actions` in `src/components/layout/HeadingRow.tsx:31` is `flex min-w-0 flex-wrap ... @xl:max-w-[60%]`, so the cluster wraps once its content exceeds 60% of the row; `PageHeader`, `PageFrame` and the transaction-document shell all render through it, so the fix belongs there.

Repro: in brickshop-manager run `npm run test:visual -- --project=laptop14Window -g /orders/:id` and read `visual-report/laptop14Window/orders-id-shipped-no-scan.json`. Default non-compact rendering must stay unchanged. Blocks brickshop-manager ticket `orders-detail-ledger-total-below-laptop-fold`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `LedgerTable`, when `compactRowLocks` is set, give the header `TableHead` cells a compact height (about `h-9`, ~36px) instead of the default `h-12`; leave the non-compact header class untouched. Measure the header row in real Chrome first and confirm where the reported ~63px comes from (label wrapping vs padding) before picking the class.
- [ ] In `HEADING_ROW_CLASSES.actions` (`src/components/layout/HeadingRow.tsx`), keep a primary + secondary cluster plus the trailing overflow menu on one row at a wide container: lift the 60% cap and use `flex-nowrap` at a container breakpoint (keyed on the row's container, not the viewport, per the existing `@xl` precedent in the same file), while the title block keeps `min-w-0` so it still truncates or wraps instead of being squeezed to zero. Below that breakpoint the current wrapping stays.
- [ ] Add regression tests: `LedgerTable`/`TransactionDocumentShell.test.tsx` asserting the compact header class applies only with `compactRowLocks`, and `PageHeader.test.tsx` asserting the actions wrapper carries the one-row classes at the wide container breakpoint and still wraps below it.
- [ ] Extend the transaction-document gallery demo (`src/examples/transaction-document-demo.tsx`, compact variant) so the header and the three-action cluster are visible, and check at the device triad in real Chrome that the actions sit on one row at 1133px, the subtitle is one line, and the title is not squeezed.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (consumer: brickshop-manager bumps `design-baseline` and re-runs the visual check; breaking: no).

## Acceptance

- At `laptop14Window` (1133px) for the brickshop-manager order SO-2026-00053, the ledger Total bottom measures <= 739px.
- With `ledger.compactRowLocks` the ledger header row measures about 36px; without it the header row renders unchanged.
- At 1133px the header actions (Send email, Sync, More) render on one row and the subtitle on one line, on every `PageHeader`/`PageFrame` page and not only the transaction-document shell; no other `HeadingRow` consumer keeps a 60%-capped wrapping cluster at a wide container.
- Below the wide-container breakpoint (phone, narrow sheet) the actions still wrap beneath the title and the title keeps its width, unchanged from today.
- `npm test` fails on a version bump without a `CHANGELOG.md` entry, and passes after the entry is added.

## Related

- [[ledgertable-compact-row-lock]] — shipped `compactRowLocks`, the opt-in this ticket extends to the header row
- [[transaction-document-ledger-height-compact]] — previous height cut on the same ledger
- [[page-header-action-hierarchy-overflow-menu]] — typed actions with the trailing overflow menu this layout must keep on one row
- [[heading-row-actions-squeeze-title-container-query]] — introduced the `@xl` container-query classes being adjusted
- [[list-with-detail-actions-squeeze-title]] — open sibling on the same actions-versus-title squeeze, different surface
