---
area: tooling
opened: 2026-11-07
status: ready
value: normal
depends_on: [layout-invariants-nested-overflow]
model: sonnet
model_reason: "scoped addition to one existing check function, following the file's stable-code pattern"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T00:00:00Z
---

# Page invariants miss duplicate money facts in main

## Context

`src/testing/invariants.mjs` (`measure`, run by `checkPageInvariants` at line 143, exported as `design-baseline/testing/invariants`) has no check for the same fact rendered repeatedly on one page. brickshop-manager `src/components/detail-views/order/StandaloneOrderDetailView.tsx` (`DetailOverviewShell` with `layout=rail`, `formatCurrency` threaded into 3+ sections around lines 406/430/538) renders the same money facts 3-4 times in main, and every invariant stays green. Split out of [[archetype-gap-transaction-document]] (where it was an "optional check") so that archetype shell can ship without it; this ticket owns the check. `check:viewports` and every consumer Playwright suite share this one implementation, so the check lands fleet-wide.

## What to do

- [ ] Add a `duplicateFact` check in `measure`: collect the visible text tokens of the main region that match a formatted money or percent pattern (digits with a thousands/decimal separator plus a currency symbol or code, or digits plus `%`), and report any identical token rendered more than twice, as `duplicateFact: "<token>" rendered N times in main`.
- [ ] Make token matching locale-tolerant (both `1,234.50 €` and `1.234,50 €` forms, normalising whitespace and NBSP) and keep it a heuristic; document the known limits in the check's comment.
- [ ] Use the stable-code pattern already in the file (`<code>: <message>`, so `options.knownGaps` can downgrade it, per the existing `clipped` / `tapTargets` codes), update `invariants.d.mts`, document the code in `docs/STYLE.md` "The device triad", and bump the version with a `CHANGELOG.md` entry.
- [ ] Cover it in `src/testing/invariants.test.ts`: a fixture with one money token rendered three times fails; the same token twice passes; once `src/examples/transaction-document-demo.tsx` exists (from [[archetype-gap-transaction-document]]), it passes too.
- [ ] Run it in `npm run check:viewports` over every `kind: page` demo; record any real finding as a `knownGaps` entry with a ticket instead of loosening the check.

## Acceptance

- A page with one formatted money token rendered three times inside main fails `checkPageInvariants` with a `duplicateFact` failure naming the token.
- The same token rendered twice, and a distinct token each time, pass.
- Both `1,234.50 €` and `1.234,50 €` forms are counted, and a `knownGaps` entry for `duplicateFact` moves the problem into `knownGaps` unchanged otherwise.
- `npm run check:viewports` passes over every `kind: page` demo, with no demo silently exempted.

## Related

- [[archetype-gap-transaction-document]] — the gap this was split from; its demo is the passing case once shipped
- [[layout-invariants-nested-overflow]] — must ship first: it adds checks to the same `measure` function, `invariants.d.mts`, STYLE.md section and version bump, so building both in parallel means a guaranteed conflict
- [[invariants-overflow-blind-under-mobile-emulation]] — sibling edit to the same file
- [[export-page-invariants]] — shipped the `design-baseline/testing/invariants` export this extends
