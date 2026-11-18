---
area: archetypes
opened: '2026-11-18'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-11-18T19:30:06Z'
value: normal
model: sonnet
model_reason: >-
  cause established (overlay scrollbar hides an existing overflow-x-auto wrapper); scoped shell +
  demo change following the MatrixGridShell sticky-column pattern
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

## Decision

Operator-delegated decision (2026-11-18): ship the shell-level scroll cue only, as recommended. No fit-to-width change to the demo: a statement body is unbounded by contract, so the cue is the fix that holds at every width.

## Related

- [[matrix-grid-header-scrolls-away-horizontally]] — sticky first column and horizontal scroll precedent in `MatrixGridShell`
- [[archetype-gap-print-statement-document]] — origin of the print-statement archetype and its shell contract
- [[table-column-hide-below-tier]] — related narrow-width table column handling
- [[refactor-figure-table-grid-report-statement]] — shared figure-table grid used by report and statement bodies
- [[layout-invariants-nested-overflow]] — open; its `nestedOverflow` check will flag this shell's `overflow-x-auto` body wrapper unless it carries `data-scroll-region`, so whichever ships second marks the wrapper
