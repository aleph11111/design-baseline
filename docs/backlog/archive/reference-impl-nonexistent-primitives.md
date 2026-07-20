---
area: docs
opened: 2026-07-04
status: done
model: sonnet
model_reason: doc-and-comment fixes binding to real exports, clear grep-verifiable acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Fix reference-impl baseline docs that bind to primitives which do not exist

## Context

Severity: **medium** (docs correctness). Two `*.baseline.md` reference-implementation docs (and one code comment) bind archetype roles to primitives that do not exist anywhere in `src/`, so an adopter following the reference impl imports a component that isn't there. (1) `docs/archetypes/crud-dialog.baseline.md:61,93,101` binds the confirm-dialog role to `<ConfirmDeleteDialog>`, and `src/components/archetypes/crud-dialog/CrudDialogFooter.tsx:67` tells the consumer to open a `<ConfirmDeleteDialog>` — but the baseline's actual confirm primitive is `ConfirmationDialog` (`src/components/ui/confirmation-dialog.tsx`). (2) `docs/archetypes/detail-overview.baseline.md:121-122` (Layer 6d) mandates a `<RecordTable>` ("same primitive used by list-with-detail") and lists `<Table>` as "Forbidden inline markup" — but no `RecordTable` exists, list-with-detail ships `ListWithDetailShell`, and `<Table>` is the actual shared table molecule. These are drift introduced/surfaced by the contract/reference-impl split.

## What to do

- [ ] Do red/green verification (grep as the test): first assert failing — `grep -r 'ConfirmDeleteDialog\|RecordTable' docs/ src/` finds the phantom names; then fix and assert the grep returns nothing.
- [ ] Replace `<ConfirmDeleteDialog>` with `<ConfirmationDialog>` in `crud-dialog.baseline.md` (lines 61, 93, 101) and the `CrudDialogFooter.tsx:67` comment, matching the real export and `docs/STYLE.md`.
- [ ] Rewrite detail-overview.baseline.md Layer 6d (lines 121-122) to bind the embedded read-only table to the shared `<Table>` (via a table shell), remove the phantom `<RecordTable>`, and drop the "`<Table>` forbidden" line so it aligns with `docs/STYLE.md:266`.

## Acceptance

- `grep -r 'ConfirmDeleteDialog\|RecordTable' docs/ src/` returns no matches; every primitive named in the two baseline docs resolves to a real export.
- The crud-dialog confirm role and the detail-overview embedded table bind to `ConfirmationDialog` and `Table` respectively.
- Meets the quality bar: clean, readable, accurate docs with no new errors/warnings; the referenced components exist and typecheck.

## Related

- [decouple-archetype-contract-from-reference-impl.md](archive/decouple-archetype-contract-from-reference-impl.md) — the split that surfaced these
- [style-archetypes-carry-baseline-sibling.md](style-archetypes-carry-baseline-sibling.md) — the .baseline.md siblings this corrects
- docs/STYLE.md — the shared-primitive ownership these docs must match
