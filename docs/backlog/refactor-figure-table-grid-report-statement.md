---
area: refactor
opened: '2026-08-25'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-25T10:49:11.959Z'
model: opus
model_reason: >-
  merging two separately promoted archetypes' table primitives (R report, F statement-with-filters)
  means reconciling a fixed four-column grid against an N-column one and deciding which contract
  owns the result
---

# Extract the shared figure-table grid behind ReportLineTable and StatementTable

## Context

Severity: **medium** (DRY). Archetype R (report) and archetype F (statement-with-filters) each ship their own hairline-divided figure table, and the two are the same primitive written twice:

- `src/components/archetypes/report/ReportLineTable.tsx` — `ReportLineTable` + `ReportLineRow`
- `src/components/archetypes/statement-with-filters/StatementTable.tsx` — `StatementTable` + `StatementRow` + `StatementTotalRow`

The overlap is literal, not conceptual. `COL_HEAD` is declared in both files with the identical string `"text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground"` (`ReportLineTable.tsx:7`, `StatementTable.tsx:20`) under an identical comment ("The tiny table-column-header overline (9.5px, per house style B)"), and inlined a third time at `CalendarShell.tsx:128`. Both tables then wrap their header row in `cn(GRID, "border-b border-border py-2", COL_HEAD)` and their body in `<div className="divide-y divide-border/70">` — the same two lines, in the same order. Both row components render figure cells as `text-right font-mono text-[13px] tabular-nums text-muted-foreground` with the terminal column promoted to `font-semibold text-foreground`.

`ReportLineTable.tsx:29` states the intent that the copy defeated: it "owns the 4-column grid and the 9.5px column-header overlines so every report (invoice, quote, **statement**) shares one table signature". The statement archetype was then promoted with its own copy of that signature, so the primitive that names statements as its clients does not serve them.

There is already a shared owner for the neighbouring constant: `src/components/layout/overline.ts` exports `OVERLINE_CLASS` as `"text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground"` — the same string at 10.5px. So the fleet now carries two overline scales, one shared and one duplicated, differing by one point.

The genuine difference is narrow: report's grid is fixed (`1fr_3rem_5.5rem_6rem`, name/qty/unit/sum), statement's is derived from the column count. That is one parameter, not two primitives. Separately, `statementGrid()` (`StatementTable.tsx:9`) composes its grid class from a runtime `columnCount` via string concatenation — the same dynamic-class hazard `native-field.tsx` calls out in its own comment — which the shared primitive should resolve with a static column-count map.

## What to do

- [ ] Move the 9.5px column-header overline into `src/components/layout/overline.ts` beside `OVERLINE_CLASS` as a named second rung, and have `ReportLineTable`, `StatementTable` and `CalendarShell.tsx:128` all read it instead of declaring or inlining the string.
- [ ] Add a shared figure-table primitive (a `FigureTable` + `FigureRow` under `src/components/archetypes/shared/`) owning the header-row wrapper, the `divide-y divide-border/70` body, and the figure-cell recipe including the terminal-column promotion.
- [ ] Parameterize the grid: the shared primitive takes the column template so report can pass its fixed four-column form and statement its derived N-column form.
- [ ] Replace `statementGrid()`'s runtime-concatenated `grid-cols-[…repeat(N,5.5rem)]` with a static lookup keyed by column count, so every emitted class is visible to Tailwind's scanner.
- [ ] Refactor `ReportLineTable` / `ReportLineRow` and `StatementTable` / `StatementRow` / `StatementTotalRow` to thin wrappers over the shared primitive, keeping each archetype's own row semantics (report's `meta` sub-line; statement's `indent` tiers and `section` rows).
- [ ] Add a test asserting both archetypes' tables render the same column-header treatment and the same terminal-cell figure treatment.
- [ ] Bump the `report` and `statement-with-filters` `version`s in `docs/archetypes/MANIFEST.json` and update `report.baseline.md` / `statement-with-filters.baseline.md` to bind the shared primitive.

## Acceptance

- `grep -rn "9.5px" src/components` shows the overline scale declared once, in `src/components/layout/overline.ts`; no archetype re-declares or inlines it.
- `grep -rn "divide-y divide-border/70" src/components/archetypes` returns one hit — the shared figure table.
- No grid-template class is built from a runtime value: `grep -rn "grid-cols-\[" src/components` shows only static strings.
- After the change, altering the column-header treatment or the figure-cell scale is one edit and both the report and statement demos in `src/examples/` reflect it.
- `npx tsc --noEmit` and `npm test` pass, and `report-demo.tsx` / `statement-with-filters-demo.tsx` render the same figures and dividers as before.

## Related

- [refactor-mode-aware-footer-core-duplication.md](archive/refactor-mode-aware-footer-core-duplication.md) — the precedent for extracting a shared core behind two archetypes' near-identical primitives and keeping thin per-archetype wrappers.
- [surface-header-compose-not-copy.md](archive/surface-header-compose-not-copy.md) — the same "the primitive's JSDoc claims it is canonical, the code says otherwise" finding, for the header bar of these same two shells.
- [plex-ledger-primitive-doc-drift.md](archive/plex-ledger-primitive-doc-drift.md) — prior reconciliation of house-style-B figure treatments against their docs.
- [src/components/layout/overline.ts](../../src/components/layout/overline.ts) — the existing shared owner of the overline scale the duplicated `COL_HEAD` should join.
