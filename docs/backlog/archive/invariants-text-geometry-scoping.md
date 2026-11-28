---
area: tooling
opened: 2026-11-24
status: done
value: normal
model: sonnet
model_reason: "cause established in both halves: textClip gates on ownText(el) only, fragments() falls back to the block border box; fix shape is given and extends existing tests"
blocked_on_branch: feat/layout-invariants-nested-overflow
depends_on: [layout-invariants-nested-overflow]
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-24T12:00:00Z
---

# Widen textClip and textOverlap text-geometry scoping

## Context

`textClip` and `textOverlap` in `src/testing/invariants.mjs` (`measure`, PR #859 / v0.65.0, branch `feat/layout-invariants-nested-overflow`, not yet on `origin/main`) were flagged twice by the gate reviews for two scoping limits.

1. `textClip` only visits elements that pass `ownText(el)` (a direct text node). A common shape, `<button class="overflow-hidden"><span>label</span></button>`, is never checked: the clipping button has no direct text node and the inner span does not clip itself, so the cut-off label is invisible to the check.
2. `textOverlap` `fragments()` reads `el.getClientRects()`. Chrome returns the single border box for BLOCK elements (`p`, `td`, `div`), not per-line fragments, so the promise "a wrapping title's own lines never count as an overlap" holds only for inline text holders (`span`, `a`). The multi-line border box of a wrapping block intersects any neighbour inside its bounds even when the glyphs do not touch.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In the `textClip` loop, also treat an element that clips horizontally and is wider than its box (`scrollWidth > clientWidth + 1`, not `text-overflow: ellipsis`) as an offender when it CONTAINS any `ownText` element, not only when it holds a direct text node itself.
- [ ] In `fragments()`, when the element holds inline text, intersect per line via `Range.selectNodeContents(textNode).getClientRects()` over its direct text nodes, clipped the same way as today; keep the border-box fallback for elements with no text node of their own and for jsdom (no layout).
- [ ] If per-line rects for block holders prove impractical, soften the doc claim in the `textOverlap` comment so it names inline holders only; do not leave the claim as written.
- [ ] Extend `src/testing/invariants.test.ts`: a `<button class="overflow-hidden"><span>` fixture whose text is wider than the button reports `textClip`; a fitting one does not; a wrapping block `p` beside a neighbour that sits inside its border box but clear of the glyph lines does not report `textOverlap`; real glyph overlap still does.
- [ ] Coordinate with the cap-and-dedupe ticket (`invariants-text-checks-cap-and-dedupe`), which edits the same two loops: land in whichever order, rebase the second.

## Acceptance

- A page with `<button class="overflow-hidden"><span>` whose label is wider than the button returns a `textClip` problem naming the button.
- A wrapping block text holder whose lines do not touch a neighbour no longer returns `textOverlap`, even when the neighbour lies inside the block's border box; genuinely overlapping glyphs still return it.
- No other text holder is exempt for lacking a direct text node: every element that clips horizontally and contains own-text descendants is checked by `textClip`.
- Pages with no such nested-clip or wrapping-block shape return the same problems as before (same codes, same messages), and `check:viewports` still records `transaction-document@1024:textOverlap` as before.

## Related

- [[layout-invariants-nested-overflow]] — ships `textClip` and `textOverlap` (PR #859); this ticket cannot start until that branch merges
- [[invariants-text-checks-cap-and-dedupe]] — edits the same `textClip` loop and `textOverlap` pair scan
- [[invariants-zero-clipped-inset-units]] — also edits `src/testing/invariants.mjs` from the same unmerged branch
