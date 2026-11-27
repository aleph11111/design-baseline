---
area: tooling
opened: 2026-11-24
status: done
value: normal
model: sonnet
model_reason: "cause established: two checks lack the cap and dedupe the sibling checks already carry; pattern is in the same function"
blocked_on_branch: feat/layout-invariants-nested-overflow
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-24T00:00:00Z
---

# Cap and dedupe textClip and textOverlap failure lists

## Context

`src/testing/invariants.mjs` (`measure`, PR #859 / v0.65.0, branch `feat/layout-invariants-nested-overflow`, not yet on `origin/main`) adds `textClip` and `textOverlap`. Unlike `clipped` and `nestedOverflow`, which report `slice(0, 5)` of the outermost offenders only (contains-dedupe), `textClip` and `textOverlap` push one problem line per offender with no cap. A page with a broken band or a bad table can flood the failure list with dozens of lines. In `textOverlap` the `break` after a hit dedupes only per outer element `a`, so an element already reported as `a` can be reported again as the `b` of a later pair.

Second, `textOverlap` compares every `ownText` element pair (O(n²)) inside one `page.evaluate`. Fine for today's demos, but a matrix-grid demo with thousands of cells could slow a consumer's Playwright suite, since the check runs per width.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Collect `textClip` offenders and report only the outermost ones (skip an element contained by an already-collected offender), capped with `slice(0, 5)`, the same pattern as `clipped` and `nestedOverflow` in the same function.
- [ ] In `textOverlap`, skip any element already reported in either role (`a` or `b`) and cap the reported pairs with `slice(0, 5)`.
- [ ] ? Cut the O(n²) pair scan only if timings matter: early-exit on a cheap box-level test (e.g. sort rects by top and stop the inner loop once `b.top >= a.bottom`) before reaching for a spatial index; measure on a thousands-of-cells matrix-grid fixture first.

## Acceptance

- A fixture with more than 5 text-clipped elements returns at most 5 `textClip` problems, and a clipped element nested inside another clipped element is not listed separately.
- A fixture with more than 5 overlapping text boxes returns at most 5 `textOverlap` problems, and no element appears in more than one reported pair.
- No other failure code in `measure` reports an unbounded number of lines: every per-element check is capped at 5 outermost offenders.
- Results are unchanged for pages with fewer than 6 offenders (same codes, same messages), and `check:viewports` still records `transaction-document@1024:textOverlap` as before.

## Related

- [[layout-invariants-nested-overflow]] — ships `textClip` and `textOverlap` (PR #859); this ticket waits for that branch to merge
- [[transaction-document-header-title-action-overlap-1024]] — consumer of `textOverlap` output via `SWEEP_GAPS`
- [[invariants-page-title-collapse]] — sibling check in the same helper
- [[invariants-duplicate-fact-check]] — sibling check in the same helper
