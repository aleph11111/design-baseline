---
area: archetypes
opened: '2026-11-18'
status: needs-enrichment
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "unresolved design fork under ## Open question — needs an interactive operator decision before /feat"
  graded_at: '2026-11-18T00:00:00Z'
---

# statement-with-filters phone label column squashed to one character

## Context

At 390px the committed phone baseline `tests/screenshots/phone/statement-with-filters.png` (origin/main) renders the REVENUE rows as 'H', 'W', 'M', 'G' (Honey sales, Wax & candles, Membership fees, Grants): the label column is a single character wide while the three numeric columns (2026, 2025, delta) take the full width. Cause: `STMT_GRID` in `src/components/archetypes/shared/FigureTable.tsx` builds `minmax(0,1fr)` + N × fixed `5.5rem` + `gap-x-3`; with 3 numeric columns that is ~300px of fixed track, leaving the label `minmax(0,1fr)` track ~0 at 390px, and `StatementRow` labels are `truncate`. The pixel baseline locks the defect in, and `check:viewports` (`scripts/check-viewports.mjs`) does not flag it. Repro: `npm run gallery`, open statement-with-filters at 390px.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Fix the column allocation in `STMT_GRID` / `statementGridClass` (`src/components/archetypes/shared/FigureTable.tsx`): give the label track a floor (`minmax(7rem,1fr)`, ~6ch+) so numeric columns never take it below that.
- [ ] Under `sm`, let the numeric columns yield by wrapping `StatementTable` in a horizontal scroll container (`overflow-x-auto`) so no figure is dropped from the read-only statement; header and rows keep sharing one grid.
- [ ] Check the report archetype's fixed `1fr_3rem_5.5rem_6rem` grid (same `FigureRow`) at 390px for the same squeeze and fix it at the same shared point if it shows.
- [ ] Add a viewport invariant to `scripts/check-viewports.mjs`: a figure-table label/first column is never narrower than ~6ch at the device triad.
- [ ] Regenerate the phone baseline with `npm run screenshots:update` and review the PNG diff.

## Acceptance

- At 390px the statement-with-filters REVENUE rows show readable labels (e.g. "Honey sales" not 'H') and the label column measures at least ~6ch.
- `check:viewports` fails when a figure-table label column is narrower than ~6ch, and passes after the fix.
- No other figure-table consumer (statement-with-filters, report) renders a label column narrower than ~6ch at phone width.
- The regenerated `tests/screenshots/phone/statement-with-filters.png` no longer shows single-character labels.

## Related

- [[phone-screenshot-baselines-flake]] — same phone pixel-baseline surface
- [[refactor-figure-table-grid-report-statement]] — origin of the shared `FigureTable` grid
- [[table-column-hide-below-tier]] — existing hide-below-tier precedent for wide tables
- [[device-triad-check-viewports]] — the check:viewports device triad the new invariant extends
- [[page-header-actions-squeeze-title-on-phones]] — same class of phone squeeze defect

## Open question

Numeric columns yielding under `sm`: horizontal scroll (asserted above, Recommended — drops no figure from a financial statement) vs hiding the trailing comparison/delta column below `sm` (keeps one screen width, loses a figure on phones). Operator to confirm before `/feat`.
