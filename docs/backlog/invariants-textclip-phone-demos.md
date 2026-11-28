---
area: archetypes
opened: 2026-11-28
status: ready
value: normal
model: sonnet
model_reason: "scope pinned to one demo panel, cause established by probe (392-410px side-effect line in a 356px overflow-hidden section), fix is layout not check; removes the PAGE_GAPS entry it owns"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-28T03:20:00Z
---

# Fix the transaction-document demo next-step panel clipping its side-effect line on phone

## Context

The `textClip` widened nested-holder scope that shipped with v0.76.0 (`src/testing/invariants.mjs`) makes the donor's `check:viewports` flag the `transaction-document` demo on phone (all three phone variants: default, Sales order, Shipped no scan): the pinned next-step panel (`[data-slot="td-next-step"]` in `src/examples/transaction-document-demo.tsx`, class `relative overflow-hidden …`) is a 356px box holding a 392–410px side-effect line — the line `Invoice RE-2026-0388 created on payment …` (a `<span>` inside a `<li class="mr-4 inline-flex items-baseline gap-1">` inside a `ul.inline`, the "Running alongside" failed side effects) paints ~37px past the panel's right clip edge. Verified in real Chrome (phone 390x844): the section has `overflowX: hidden`, no `text-overflow: ellipsis`, no inner scroller, and a rendered text node of the line extends past `section.getBoundingClientRect().right` — text a phone user cannot read, no scroll to reach it, no ellipsis signalling the cut. `check:viewports` currently records it as the page-scoped known gap `transaction-document: { textClip: "invariants-textclip-phone-demos" }` in `scripts/check-viewports.mjs` (`PAGE_GAPS`, added v0.76.0) so the donor gate passes while the code still fails on every other page — same convention as the `headingLines` gap in the same entry. The `import-wizard` step-strip phone clip the v0.76.0 check first reported was an intended `data-scroll-region` scroller, not a defect, and is exempted by the check itself (scroller exemption), so this ticket is scoped to the panel alone.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make the next-step panel's side-effect content fully readable at the phone (390px) width in `src/examples/transaction-document-demo.tsx` — e.g. let the line wrap within the panel, or move the "Running alongside" line out of the clipped fixed-width cell — without changing the desktop layout (laptop14 and larger: the line stays on one line as today) and without touching the panel's warning/error tone styling.
- [ ] Remove the `textClip: "invariants-textclip-phone-demos"` entry from the merged `transaction-document` `PAGE_GAPS` object in `scripts/check-viewports.mjs` once the three phone variants pass without it (the `headingLines` entry in the same object stays).
- [ ] Confirm no other donor demo picks up a `textClip` finding at any triad device or sweep width after the panel fix (the v0.76.0 widened check is live on every page — `npm run check:viewports` stays 155/155 with only the pre-existing warnings).

## Acceptance

- All three `transaction-document` phone variants (default, Sales order, Shipped no scan) report no `textClip` problem in `npm run check:viewports`, with the `textClip` `PAGE_GAPS` entry removed.
- The side-effect line's full text is visible (no cut-off glyphs) at the 390px phone width in the contact sheet, on every demo that carries a failed side effect.
- The desktop renderings are unchanged at laptop14 and wider (the line stays one line; pixel baselines do not change).
- No other page or variant reports a new `textClip` (or any other invariant) problem: `npm run check:viewports` passes 155/155 with the same set of known-gap warnings as before, minus the removed entry.

## Related

- [[invariants-text-geometry-scoping]] — ships the widened nested-holder `textClip` scope (and the scroller exemption) this finding came out of; its `PAGE_GAPS` entry points at this ticket
- [[transaction-document-title-vs-heading-lines]] — the same demo's other page-scoped gap in the same `PAGE_GAPS` entry
- [[invariants-zero-clipped-inset-units]] — sibling `src/testing/invariants.mjs` hardening from the same unmerged branch family
