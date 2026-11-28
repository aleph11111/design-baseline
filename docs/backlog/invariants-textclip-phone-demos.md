---
area: archetypes
opened: 2026-11-28
status: ready
value: normal
model: sonnet
model_reason: "two donor-demo cases, both caused by v0.76.0's widened textClip nested-holder scope; case 1's cause is established by probe and its fix is demo layout; case 2 is a check-semantics decision settled by verified Chrome geometry; both end states remove their PAGE_GAPS textClip keys so the code re-asserts"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-28T03:20:00Z
---

# Settle the two v0.76.0 textClip phone findings — transaction-document panel clip + import-wizard scroller card

## Context

The `textClip` widened nested-holder scope that shipped with v0.76.0 (`src/testing/invariants.mjs`) — "the offender is a clipping box whose text sits in a nested element that does not clip itself" — raised two phone findings in the donor's `check:viewports`, both currently held as page-scoped known gaps in `scripts/check-viewports.mjs` (`PAGE_GAPS`, added v0.76.0):

1. **`transaction-document` (genuine defect).** All three phone variants (default, Sales order, Shipped no scan) flag the pinned next-step panel (`[data-slot="td-next-step"]` in `src/examples/transaction-document-demo.tsx`, class `relative overflow-hidden …`): a 356px box holding a 392–410px side-effect line — `Invoice RE-2026-0388 created on payment …` (a `<span>` inside a `<li class="mr-4 inline-flex items-baseline gap-1">` inside a `ul.inline`, the "Running alongside" failed side effects) — which paints ~37px past the panel's right clip edge. Verified in real Chrome (phone 390x844): the section has `overflowX: hidden`, no `text-overflow: ellipsis`, no inner scroller, and a rendered text node of the line extends past `section.getBoundingClientRect().right` — text a phone user cannot read, no scroll to reach it, no ellipsis signalling the cut.
2. **`import-wizard` (intended scroller, ambiguous geometry).** The phone demo's main card holds a one-line step strip (`ol.min-w-max`) that scrolls sideways inside a `data-scroll-region` marked scroller. The widening made the CARD report (text nested in the scrolling `ol`, the card clips, no ellipsis): verified in real Chrome the card's `scrollWidth` is 487px in a 356px box, while the marked scroller's own border box sits at right 357px — INSIDE the card's right edge (374px) — yet the card still reports the scroller's overflow as its own `scrollWidth`. The scroller's content genuinely overflows the scroller (reachable by scroll), so the card's clip is not cut-off text; but no box-level test at the card separates "excess caused by an inner scroller" from "excess is real overflow": a card that clips its own text while also containing a wide scroller reads the same at the `scrollWidth` level. The v0.76.0 branch proposed a `holdsScrollRegion` exemption (a box is exempt when it contains a `data-scroll-region` scroller that actually scrolls) and removed it again after review: it is unprovable at box level — a box clipping REAL text while coincidentally containing a wide unmarked-marked scroller would be wrongly exempted, and the verified geometry (scroller box INSIDE the card edge, card still over-scrolling) shows the marker/box relationship cannot discriminate the two cases without page-specific knowledge.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] **Case 1 — fix the transaction-document panel.** Make the next-step panel's side-effect content fully readable at the phone (390px) width in `src/examples/transaction-document-demo.tsx` — e.g. let the line wrap within the panel, or move the "Running alongside" line out of the clipped fixed-width cell — without changing the desktop layout (laptop14 and larger: the line stays on one line as today) and without touching the panel's warning/error tone styling.
- [ ] **Case 1 — remove its gap.** Once the three phone variants pass without it, remove the `textClip: "invariants-textclip-phone-demos"` key from the merged `transaction-document` `PAGE_GAPS` object in `scripts/check-viewports.mjs` (the `headingLines` key in the same object stays).
- [ ] **Case 2 — settle the scroller-card semantics.** Either (a) implement the scroller-aware `textClip` semantics in `src/testing/invariants.mjs` with a rule a unit test can exercise on real scroller geometry (a clipping box whose own-text excess is carried by a `data-scroll-region` scroller inside it is not reported), verifying against the import-wizard probe geometry (card scrollWidth 487 / clientWidth 356, scroller box r=357 inside card r=374, scroller content 487) and keeping the genuine clip reporting — a box clipping its OWN text (no scroller) MUST still report: the case 1 panel before its layout fix is that control — as must a hypothetical box clipping its own text while coincidentally holding a wide scroller, or (b) confirm the per-page settlement is the final home: keep the `import-wizard: { textClip: … }` `PAGE_GAPS` entry and document the geometric ambiguity in the `textClip` block comment of `invariants.mjs` (already done in v0.76.0) so no later branch re-tries the box-level exemption.
- [ ] Either way: drop the `import-wizard` `textClip` `PAGE_GAPS` key when the scroller-aware semantics land (case 2a), or keep it when the per-page settlement stands (case 2b) — but record which case closed.
- [ ] Confirm no other donor demo picks up a `textClip` finding at any triad device or sweep width after the changes — `npm run check:viewports` lands at 155/155 with only the warnings the chosen settlement leaves.

## Acceptance

- All three `transaction-document` phone variants (default, Sales order, Shipped no scan) report no `textClip` problem in `npm run check:viewports`, with the `textClip` key removed from `transaction-document` in `PAGE_GAPS`.
- The side-effect line's full text is visible (no cut-off glyphs) at the 390px phone width in the contact sheet, on every demo that carries a failed side effect.
- The desktop renderings are unchanged at laptop14 and wider (the line stays one line; pixel baselines do not change).
- The `import-wizard` phone demo's step strip either passes with no `textClip` gap entry at all (case 2a shipped: the check exempts the scroller card by a rule its unit test exercises on the probe geometry) or stays a recorded page-scoped known gap (case 2b) — and the branch that closed case 2 names which.
- No other page or variant reports a new `textClip` (or any other invariant) problem: `npm run check:viewports` passes 155/155.

## Related

- [[invariants-text-geometry-scoping]] — ships the widened nested-holder `textClip` scope and the per-page settlement this ticket takes over; its `PAGE_GAPS` entries point at this ticket
- [[transaction-document-title-vs-heading-lines]] — the same demo's other page-scoped gap in the same `PAGE_GAPS` object
- [[invariants-zero-clipped-inset-units]] — sibling `src/testing/invariants.mjs` hardening from the same unmerged branch family
