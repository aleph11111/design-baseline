---
area: archetypes
opened: 2026-11-27
status: needs-enrichment
value: normal
model: opus
model_reason: "check-vs-reference-demo tradeoff: exempt an intentional multi-surface restatement, restructure the fixture, or narrow the check — a design choice a future operator should make"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved fork auto-resolved to the Recommended default; operator must confirm"
  graded_at: '2026-11-27T14:30:00Z'
---

# Reference demos render duplicate money facts by design — settle the duplicateFact handling

## Context

The `duplicateFact` check shipped in v0.72.0 (`src/testing/invariants.mjs`, `measure`, run by `checkPageInvariants` in the donor's `npm run check:viewports`) flags any formatted money or percent fact rendered more than twice in `main`. Two donor `kind: page` reference demos — `detail-overview` and `print-statement` (`src/examples/detail-overview-demo.tsx`, `src/examples/print-statement-demo.tsx`) — trip it by design. `detail-overview` is the money-dense **Command Rail** reference: the same order's `55,08 €` (gross profit) and `34.0%` (margin) are restated in the rail's `MetricList` "Revenue & profit" summary, the inline "Financial breakdown" profit highlight, AND the nested `PageFrame` stat strip — three surfaces deliberately showing the same headline figures flow correctly through every slot. `print-statement`'s deterministic seasonal model (`amount() = base + swing * season`, a single-peak sine) renders the same line's off-season value across seven month cells, so e.g. `18.400 €` appears in 7 cells of the `CashStatementTable`.

`check:viewports` records both as page-scoped known gaps in `PAGE_GAPS` (`scripts/check-viewports.mjs`) so the donor suite passes while the code still fails on every other page — the same pattern as the `transaction-document` / `headingLines` gap. The check is a deliberate loose heuristic; it cannot yet distinguish an intended multi-surface restatement (`detail-overview`) or a fixture-generated repetition (`print-statement`) from an accidental duplication in a real app — this ticket settles that per demo and then removes the `PAGE_GAPS` entries so the code re-asserts.

## What to do

- [ ] Decide per demo how `duplicateFact` should treat the intentional reference restatement: either mark the reference-demo restatement surfaces with an explicit `data-fact-exempt` marker (a documented, per-call-site opt-out the check skips — mirroring `nestedOverflow`'s `data-scroll-region`), or restructure the demo fixtures so a fact renders at most twice so no exemption is needed. Apply the same decision to both `detail-overview` and `print-statement`; do not loosen the check itself.
- [ ] If an exemption marker is chosen, add the `data-fact-exempt` skip to the `duplicateFact` scan in `src/testing/invariants.mjs` (a visible element or one of its ancestors carrying the marker is an opted-out intended surface, counted but not reported), document it in `docs/STYLE.md` "The device triad", and add a unit case in `src/testing/invariants.test.ts` (a marked token > 2× passes; an unmarked one still fails).
- [ ] If fixture restructuring is chosen, make the off-season `print-statement` month values distinct per line and reduce the `detail-overview` restatement to at most two surfaces per fact, keeping the archetype shapes the demos exist to demonstrate (the rail slots, the seasonal 12-column table).
- [ ] Remove both `duplicateFact` entries from `PAGE_GAPS` in `scripts/check-viewports.mjs`.
- [ ] Bump `package.json` and add a `CHANGELOG.md` entry once the resolution ships.

## Acceptance

- `npm run check:viewports` passes every `detail-overview` and `print-statement` pass (desk27, laptop14, phone, 1024, 1133, 1280) with no `PAGE_GAPS` entry for either demo.
- No `kind: page` OTHER than these two silently passes a > 2× money fact: a page rendering one formatted figure three times in `main` still fails `checkPageInvariants` with a `duplicateFact` failure naming the token (no demo silently exempted, the check not loosened).
- Whichever resolution ships, the reference demos still exercise the money-dense shapes they were written to demonstrate (the rail's multi-slot restatement, the seasonal 12-column table), so they remain living references.

## Related

- [[invariants-duplicate-fact-check]] — ships the `duplicateFact` check and records these two demos as page-scoped known gaps
- [[invariants-overflow-blind-under-mobile-emulation]] — sibling check in the same `measure` function and the same `data-scroll-region` / `PAGE_GAPS` exemption machinery
- [[layout-invariants-nested-overflow]] — the `nestedOverflow` / `data-scroll-region` marker pattern an exemption would mirror

## Open question

How should `duplicateFact` treat an intentional reference-demo restatement of a money fact? Chosen (Recommended): (a) an explicit `data-fact-exempt` marker the scan skips — a visible, per-call-site opt-out exactly like `nestedOverflow`'s `data-scroll-region`, so the check stays strict everywhere the marker is absent. Alternatives:

- (b) restructure the demo fixtures so a fact renders at most twice, no marker at all. Cheaper for the check; but `detail-overview`'s point is to show the same figure flowing through the rail summary, the breakdown and the nested stat strip, so deduping hollows out the reference.
- (c) narrow the heuristic (e.g. ignore facts inside a table or a rail summary). Broadest; but weakens the check for real apps that do restatements in exactly those places.
