---
area: tooling
opened: 2026-11-28
status: needs-enrichment
value: normal
conventional_hours: 3
conventional_hours_by: agent
model: opus
model_reason: "design is the deliverable: which geometry separates intentionally hidden descendants (translated slide, off-canvas drawer, collapse) from genuinely cut-off text is a check-semantics decision on a gate other sessions rely on"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved fork auto-resolved to its Recommended default; capped at 4 until the operator confirms"
  graded_at: 2026-11-28T00:00:00Z
---

# Stop textClip false-positives from hidden or non-overflowing descendants

## Context

The widened `textClip` scope shipped in v0.76.0 (PR #892, `src/testing/invariants.mjs`, the `ownTextDesc` line in the `textClip` block) treats a clipping box as text-bearing when ANY descendant has an own text node: `const ownTextDesc = (el) => [...el.querySelectorAll("*")].some(ownText)`. It checks presence only, so a box with `overflow: hidden|clip` and `scrollWidth > clientWidth + 1` is reported as `textClip` even when the excess comes from a descendant that is hidden, transformed out of view, or whose text does not reach the box's right edge. Nothing visible is cut off in those cases. Donor-shipped shapes affected: carousels with translated slides inside an `overflow-hidden`/`clip` viewport, off-canvas drawers inside an `overflow-x-hidden` shell, and collapse animations. The same block already has a `visible()` helper (`src/testing/invariants.mjs:44`) that `ownTextDesc` does not use.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In the `textClip` block, replace the presence-only `ownTextDesc` with a check that only counts descendants that pass `visible()` and are not inside `[aria-hidden=true],[inert]` (which `visible()` already covers).
- [ ] Additionally require the descendant's painted text to actually be cut by the box: measure the text via `Range.selectNodeContents(textNode).getClientRects()` and count the descendant only when a text rect straddles the box's right edge (`rect.left < box.right < rect.right`), not merely sits beyond it.
- [ ] Keep the direct-`ownText(el)` path and the jsdom shorthand fallback (`oxTok`) unchanged; extend the existing `textClip` unit tests in the invariants test file with the three shapes above (translated slide, off-canvas drawer, collapsed panel) expecting no `textClip`, and the existing `<button class="overflow-hidden"><span>` case expecting one.
- [ ] Bump the testing package version per the repo's convention for `src/testing/` changes.

## Acceptance

- `textClip` no longer reports a box whose only excess width comes from a hidden, `inert`, `aria-hidden`, or fully-translated-out descendant.
- `textClip` still reports `<button class="overflow-hidden"><span>long label</span></button>` when the label's painted text straddles the button's right edge.
- No other nested-holder shape (carousel slide, off-canvas drawer, collapse animation) is reported unless its text is partially cut by the clip edge; every `kind: page` demo in `npm run check:viewports` is unchanged apart from findings that were false positives.
- Unit tests for each of the shapes above pass, and `npm test` exits 0.

## Related

- [[invariants-text-geometry-scoping]] — shipped the widened nested-holder scope (v0.76.0) this ticket narrows
- [[invariants-textclip-phone-demos]] — sibling v0.76.0 fallout: two demo findings (transaction-document panel, import-wizard scroller); this ticket changes the check, that one settles those demos, so re-verify its findings after this lands
- [[invariants-text-checks-cap-and-dedupe]] — same `textClip` block, earlier change

## Open question

Fully-beyond-the-edge vs partly-cut: the reported fix direction says "text actually extends past the box's right edge", but a translated carousel slide or off-canvas drawer also lies entirely past that edge and is intentional. Recommended (asserted above): count a descendant only when its text rect straddles the edge (partly cut), treating text fully outside the box as intentionally hidden. Alternative: count any text whose right exceeds the box's right (simpler, but keeps flagging carousels and off-canvas drawers, the exact cases this ticket exists to fix).
