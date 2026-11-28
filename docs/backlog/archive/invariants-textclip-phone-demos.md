---
area: archetypes
opened: 2026-11-28
status: done
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

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. — `SideEffects` is a file-local component rendered by `TransactionDocumentShell` (its only renderer), which every `transaction-document` consumer — including the donor demo's five variants — renders through; the single call site is the shared point.
- [x] **Case 1 — fix the transaction-document panel.** The clipped markup lives in the shipped shell's `SideEffects` component (`TransactionDocumentShell.tsx`), not the demo file — the demo only feeds it `nextStep.sideEffects` (e.g. the `RE-2026-0388` line). The inline list starts mid-line after the "Running alongside:" label, so an item clamped to 100% of the panel (316px) still overruns the card's clip edge; the list now takes its own full-width row on the phone (`block sm:inline`) with `max-w-full` items and a `min-w-0` label span. Desktop (`sm` = 640px and up — every checked sweep width, laptop14, desk27) stays `inline`: the line stays on one line at identical geometry, confirmed by the pinned pixel baselines (57/57 pass byte-identical). Tone styling untouched.
- [x] **Case 1 — remove its gap.** The `textClip` key is removed from `transaction-document` in `PAGE_GAPS` (`headingLines` stays); the comment records the closure. All three phone variants pass re-asserted.
- [x] **Case 2 — settle the scroller-card semantics.** Settled as **(b) the per-page settlement is the final home**. The box-level scroller-aware exemption (case 2a) stays rejected for the documented reason (a box clipping its OWN text while coincidentally holding a wide scroller would be wrongly exempted; the verified probe geometry cannot discriminate at box level). The `import-wizard` `PAGE_GAPS` entry is kept as the **recording** of that settlement (comment now marks it FINAL SETTLEMENT and the exemption closed); the `invariants.mjs` textClip block comment records the closure so no later branch re-tries the exemption. The unchanged v0.76.0 unit test (card 356/487, marked scroller → still reports) stays as the pinning control.
- [x] Either way: the `import-wizard` `textClip` `PAGE_GAPS` key is **kept** (case 2b) — the branch that closed case 2 names it here and in the CHANGELOG v0.77.0 entry.
- [x] Confirm no other donor demo picks up a `textClip` finding at any triad device or sweep width — `npm run check:viewports` lands at 155/155 (130 ok / 25 warn / 0 FAIL) with only the warnings the settlement leaves: the pre-existing `duplicateFact`×12 and `headingLines`×12 (other tickets) plus the settled `import-wizard` `textClip`×1.

## Acceptance

- All three `transaction-document` phone variants (default, Sales order, Shipped no scan) report no `textClip` problem in `npm run check:viewports`, with the `textClip` key removed from `transaction-document` in `PAGE_GAPS`.
- The side-effect line's full text is visible (no cut-off glyphs) at the 390px phone width in the contact sheet, on every demo that carries a failed side effect.
- The desktop renderings are unchanged at laptop14 and wider (the line stays one line; pixel baselines do not change).
- The `import-wizard` phone demo's step strip either passes with no `textClip` gap entry at all (case 2a shipped: the check exempts the scroller card by a rule its unit test exercises on the probe geometry) or stays a recorded page-scoped known gap (case 2b) — and the branch that closed case 2 names which.
- No other page or variant reports a new `textClip` (or any other invariant) problem: `npm run check:viewports` passes 155/155.

## Outcome — v0.77.0 (PR pending)

- **Case 1:** the `transaction-document` phone panel's side-effect line now wraps within the panel (the `SideEffects` items in the shipped shell clamp to the panel width and take their own line on the phone; every width ≥640px keeps `inline` so desktop is unchanged). The `textClip` `PAGE_GAPS` key is removed from `transaction-document`; all three phone variants (default, Sales order, Shipped no scan) pass re-asserted with no `textClip` problem, and the line's full text is inside the clip edge at 390px (probe: widest line ends 37px INSIDE the panel's right clip edge; panel `scrollWidth` == `clientWidth`). Desktop pixel baselines (laptop14, desk27) are byte-identical — the pinned `npm run screenshots` run passes 57/57; the phone baseline is also untouched because its baseline is a 390×844 viewport capture and the changed row sits below the fold (y 894–1014, probe-verified) — the wrapped line is the intended below-fold improvement.
- **Case 2:** closed as **(b) per-page settlement is the final home**. The `import-wizard` phone step strip stays a recorded page-scoped known gap (`PAGE_GAPS` entry kept, now commented as the settlement's recording) and the box-level scroller-aware exemption is closed — the `invariants.mjs` textClip block comment records the geometry and the decision so a later branch does not re-try it. The v0.76.0 unit test pinning the report at the probe geometry is unchanged and still passing (it is the control proving genuine clips keep reporting).
- **Assumptions (PR body):** (1) the case-1 fix lands in the shipped shell primitive `TransactionDocumentShell.tsx` (its `SideEffects` component), not the demo file the ticket names — the demo only feeds the data, and the 2026-11-16 operator decision (archived `transaction-doc-compact-fold-height`) already mandates this line wraps; (2) case 2b over 2a: the pinned test and the v0.76.0 comment settle it (the documented default wins).
- **Verification:** `npx tsc --noEmit` clean; `npm test` 118 files / 1211 tests pass; `npm run verify:package-version` + `verify:manifest` clean (0.77.0, MANIFEST 1.9); `npm run check:viewports` 155/155 (130 ok / 25 warn / 0 FAIL); `npm run screenshots` (pinned image) 57/57 pass.

## Related

- [[invariants-text-geometry-scoping]] — ships the widened nested-holder `textClip` scope and the per-page settlement this ticket takes over; its `PAGE_GAPS` entries point at this ticket
- [[transaction-document-title-vs-heading-lines]] — the same demo's other page-scoped gap in the same `PAGE_GAPS` object
- [[invariants-zero-clipped-inset-units]] — sibling `src/testing/invariants.mjs` hardening from the same unmerged branch family
