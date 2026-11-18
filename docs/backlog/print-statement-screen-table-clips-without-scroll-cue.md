---
area: archetypes
opened: 2026-11-18
status: needs-enrichment
value: normal
model: sonnet
model_reason: "cause established (overlay scrollbar hides an existing overflow-x-auto wrapper); scoped shell + demo change following the MatrixGridShell sticky-column pattern"
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "unresolved design fork under ## Open question — needs an interactive operator decision before /feat"
  graded_at: 2026-11-18T12:00:00Z
---

# Print-statement on-screen month table clips without a scroll cue

## Context

On the on-screen route of the print-statement archetype, a wide statement table overflows silently. In `tests/screenshots/laptop14/print-statement.png` (origin/main, 1512px laptop) the Kapitalflussrechnung table runs past the card edge: the DEZ column is missing and the NOV column is cut mid-number ("18.4", "-7.4", "15.1"), with no visible scrollbar, fade or sticky first column. A reader takes the truncated figures for real values. The A4-landscape print layout is not affected. Repro: `npm run gallery`, open print-statement at 1512px.

The scroll container exists: `PrintStatementShell` (`src/components/archetypes/print-statement/PrintStatementShell.tsx`) wraps the body in `<div className="overflow-x-auto print:overflow-visible">`, but overlay scrollbars on macOS hide it and nothing signals more content to the right. The demo table lives in `src/examples/print-statement-demo.tsx`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add a right-edge fade (visible only while more content lies to the right, hidden under `print:`) to the body wrapper in `PrintStatementShell.tsx`, so every statement body gets the cue, not just the demo.
- [ ] Make the first (Position) column sticky in the demo table in `src/examples/print-statement-demo.tsx` so row labels stay visible while scrolling, as `MatrixGridShell` does for its first column.
- [ ] Regenerate the pixel baselines with `npm run screenshots:update` and review the laptop14 and phone PNG diff.

## Acceptance

- At 1512px the print-statement gallery page shows a right-edge fade on the table wrapper while columns are clipped, and the Position column stays pinned when scrolled horizontally.
- Once the wrapper is scrolled to its right end the fade is no longer shown, and a body that fits its width shows none.
- Print output (A4 landscape) is unchanged: no fade, no sticky offset, `print:overflow-visible` still applies.
- No other wide statement body inside `PrintStatementShell` (every `pageSize`, including `"none"`) clips without a cue.

## Open question

Alternative to the scroll cue: fit 12 months + label at laptop width with the existing tabular 13px ledger body (no scrolling at 1512px). Recommended default above is the cue at shell level, because a statement body is unbounded by contract and any width can overflow on a narrower viewport; fitting only fixes the demo at one width. Both could be done; confirm if fit-to-width is wanted in addition.

## Related

- [[matrix-grid-header-scrolls-away-horizontally]] — sticky first column and horizontal scroll precedent in `MatrixGridShell`
- [[archetype-gap-print-statement-document]] — origin of the print-statement archetype and its shell contract
- [[table-column-hide-below-tier]] — related narrow-width table column handling
- [[refactor-figure-table-grid-report-statement]] — shared figure-table grid used by report and statement bodies
