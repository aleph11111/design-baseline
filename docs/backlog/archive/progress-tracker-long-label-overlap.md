---
area: layout
opened: 2026-09-28
status: done
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, related]
  failed:
    - open_question: "wrap strategy for long labels is a design choice"
  graded_at: 2026-09-28T18:10:00Z
---

# ProgressTracker labels overflow into the next step when a label is one long word

## Context

`ProgressTracker` (`src/components/layout/ProgressTracker.tsx`) lays its steps out as `repeat(n, minmax(0,1fr))` grid columns, and each `li` carries `min-w-0`. The label `div` (`text-sm font-medium leading-tight`, inside `pr-4 pt-2.5`) has no wrap rule, so a label with no break opportunity overflows its column and draws over the next step's label. hk-crm's deal pipeline (`/opportunities/[id]`, 7 stages in the rail layout's main column) shows it at 1440px: "Konzeptionierung/Demo" runs into "Angebot vorbereiten". Each column is about 99px wide, less the 16px `pr-4`. The stage labels are settings-managed data (hk ADR-0019), so the consumer cannot shorten them.

Measured in hk-crm by patching the DOM:
- `overflow-wrap: anywhere` alone removes the overflow but breaks mid-word without a hyphen ("Konzeptioni / erung/Demo").
- `hyphens: auto` needs a `lang` on an ancestor, and hk's `<html lang="en">` is wrong for its German-only UI. Alone it still overflows, because "nierung/Demo" has no break point.
- `lang="de"` plus `hyphens: auto` plus `overflow-wrap: anywhere`, with a zero-width space after "/", reads cleanly at 1440px ("Konzep- / tionierung/ / Demo"). At 1280px, though, it hyphenates almost every label ("Gewon-nen", "Verhand-lung").

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Give the `ProgressTracker` label a wrap rule so a long label never paints outside its column. Use `[overflow-wrap:anywhere]` as the minimum, plus `hyphens-auto` so a consumer that sets `lang` gets proper hyphenation. Add a demo step with a long single-word label.
- [x] Bump the version and cut the tag. hk-crm needs no local change beyond the pin; it tracks the consumer side in `deal-detail-layout-defects` (archived).

*(v0.2.21. Only caller is the detail-overview re-export and its demo, so the fix sits in `ProgressTracker` itself: the label gets `[overflow-wrap:anywhere] hyphens-auto`, and the demo's activity grows to 7 steps with "Consolidation/Customs". Open question settled as wrap (truncation hides stage names, scrolling hides stages). Measured on the built gallery (`/#/a/detail-overview`, headless Chrome): at 1280px (51px label boxes) and 1440px (74px), 0 of 7 labels have `scrollWidth` > `clientWidth`. Short labels stay on one line at 1440px.)*

## Acceptance

- In the gallery demo with 7 steps and a long single-word label, labels no longer overlap at 1280px and 1440px: every label's `scrollWidth` matches its `clientWidth`.
- Every other `ProgressTracker` step (short labels, `meta` lines) renders unchanged.

## Related

- [archive/progress-stepper-aria-current.md](../archive/progress-stepper-aria-current.md)

## Open question

How should long labels degrade on narrow columns: wrap with hyphenation (recommended; keeps every label readable), truncate with a tooltip, or let the tracker scroll horizontally below a minimum column width? The recommended default is the wrap rule above. Truncation hides stage names, and scrolling hides stages.
