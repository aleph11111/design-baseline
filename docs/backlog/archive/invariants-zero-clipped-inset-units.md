---
area: tooling
opened: 2026-11-24
status: done
value: normal
blocked_on_branch: feat/layout-invariants-nested-overflow
model: sonnet
model_reason: "one parser in one helper, cause and fix shape established; unit-parsing with two existing test cases to extend"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-24T12:00:00Z
---

# zeroClipped misreads unit-bearing clip-path inset values

## Context

`zeroClipped()` in `src/testing/invariants.mjs` (added by the unmerged `feat/layout-invariants-nested-overflow`, commit 4b17b2f, v0.65.0 — it is not on `origin/main` yet) decides whether an element is a zero-clipped `.sr-only` label. It reads `clip-path: inset(...)` values with `parseFloat`, which drops the unit: `parseFloat('50px')` is 50, so `inset(50px 0 50px 0)` on a tall card counts as a collapsed dimension and `visible()` treats the element as invisible to `clipped`, `headingLines`, `tapTargets` and `figureTable`. The real `.sr-only` uses `inset(50%)`, which works today, but a px-based reveal such as `clip-path: inset(0 0 120px 0)` would go silently invisible to every check that gates on `visible()`. The same function's legacy clip regex `/^rect\(0[^,]+,0[^,]+,0[^,]+,0[^,]+\)$/` requires a unit after each `0`. Chrome serializes `clip` as `rect(0px, 0px, 0px, 0px)`, so it holds today, but a bare `rect(0,0,0,0)` from a non-normalizing engine would not match. The `.sr-only` test would then fail loudly, but the unit assumption is fragile.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Parse each `inset()` value with its unit in `zeroClipped()` in `src/testing/invariants.mjs`: a percentage counts as collapsed only when the opposing sides sum to 100% or more, a length only when the opposing sides sum to the element's own box size or more (or compare against the computed box), never by bare number.
- [ ] Accept the legacy `clip` form with or without units: normalize `rect(0, 0, 0, 0)` and `rect(0px, 0px, 0px, 0px)` on parse, instead of requiring a unit after each `0`.
- [ ] Extend the `.sr-only` cases in `src/testing/invariants.test.ts`: `inset(50%)` and `rect(0px, 0px, 0px, 0px)` stay zero-clipped, `inset(50px 0 50px 0)` on a tall box and `inset(0 0 120px 0)` do not, and bare `rect(0,0,0,0)` does.
- [ ] Start this ticket only after `feat/layout-invariants-nested-overflow` merges: `zeroClipped()` does not exist on the truth ref until then.

## Acceptance

- `zeroClipped()` returns false for `clip-path: inset(50px 0 50px 0)` on a box taller than 100px, so `visible()` keeps the element in `clipped`, `headingLines`, `tapTargets` and `figureTable`.
- `zeroClipped()` returns false for `clip-path: inset(0 0 120px 0)` on a box taller than 120px.
- `zeroClipped()` still returns true for `inset(50%)` and for both `rect(0px, 0px, 0px, 0px)` and bare `rect(0,0,0,0)`.
- No other unit-bearing clip-path or clip value is read as a bare number: every `parseFloat` on a clip value in `src/testing/invariants.mjs` is unit-aware, and the `invariants.test.ts` sr-only cases are green.

## Related

- [[layout-invariants-nested-overflow]] — introduces `zeroClipped()`; this ticket cannot start until that branch merges
- [[invariants-page-title-collapse]] — also edits `measure()` in `src/testing/invariants.mjs`
- [[scroll-box-not-containing-block-sr-only-widens-page]] — earlier `.sr-only` handling in the invariants
