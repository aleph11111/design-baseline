---
area: layout
opened: 2026-09-28
status: done
value: low
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T18:35:00Z
---

# ProgressTracker gives narrow-column labels more room and documents lang

## Context

Since v0.2.22, the label in `ProgressTracker` (`src/components/layout/ProgressTracker.tsx`) carries `[overflow-wrap:anywhere] hyphens-auto`. In the detail-overview demo at 1280px, the 7-step label boxes are only 51px wide, so short single words also break mid-word. With no `lang` on an ancestor they break without a hyphen. Two small changes help:

- Consumers are not told that `hyphens-auto` does nothing until an ancestor sets `lang`.
- The last step keeps its `pr-4` right gutter even though nothing follows it. In the 1280px demo, "Delivered" breaks as "Delivere/d" only because of that 16px. This came up as a review-gate follow-up on PR #363.

## What to do

- [ ] Drop `pr-4` on the last step's label wrapper in `ProgressTracker`; keep it on every other step.
- [ ] Say in the `ProgressTracker` header comment and in its `docs/STYLE.md` row that consumers should set `lang` on the tracker or an ancestor to get real hyphenation.
- [ ] Add a unit test in `src/components/layout/ProgressTracker.test.tsx` asserting the last step's wrapper has no `pr-4` and the others keep it.

## Acceptance

- In the built gallery at 1280px (`/#/a/detail-overview`), "Delivered" renders on one line.
- Every label still has `scrollWidth` equal to `clientWidth` at 1280px and 1440px.
- Steps other than the last render unchanged.

## Related

- [[progress-tracker-long-label-overlap]]: the v0.2.22 wrap rule this builds on
- [[progress-stepper-aria-current]]
