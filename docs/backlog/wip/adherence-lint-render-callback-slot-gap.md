---
area: tooling
opened: '2026-09-07'
status: needs-enrichment
value: normal
model: opus
model_reason: >-
  choosing a regex shape for a *function-typed* prop (`render*?: (…)=>ReactNode`)
  while separating *appearance* render-callbacks from *structural* ones (Sidebar /
  SectionNav `renderLink`, PageHeader `renderBackLink` — router / navigation
  adapters, not appearance) is a judgment the ADR-0003 zero-dep scanner cannot
  auto-derive; mirrors adherence-lint-boolean-classvalue-gap's model_reason
roadmap: archetype-convergence
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed:
    - open_question: the render-callback pattern and the appearance-vs-structural
      boundary are a real design fork, not an asserted bullet
  graded_at: '2026-09-07T00:00:00Z'
---

# Widen adherence lint to the render-callback appearance prop the other five rules miss

## Context

`_adherence.json`'s appearance-prop rules (RULES.md hard rule 12) match exactly these
prop shapes: an appearance-noun name followed by `:` (`archetype-appearance-noun-prop`),
an inline literal union (`archetype-look-union-prop` / `archetype-numeric-union-prop`),
a same-file union type alias (`archetype-alias-union-prop`), `className?: string` on
shells (`archetype-shell-class-name`), and an **optional** `header?`/`stats?` `ReactNode`
slot (`archetype-appearance-slot`). A **render-callback** prop — a function-typed
prop returning `ReactNode`, e.g. `GroupedListSection`'s
`renderHeader?: (args: { title, description, rowCount }) => React.ReactNode` — is none of
these, so it escapes every rule. That prop was the concrete instance that motivated
[adherence-lint-appearance-slot-layout-gap](../archive/adherence-lint-appearance-slot-layout-gap.md)
closing the `SectionCard.header` slot below it, and it is being **deleted** by that ticket;
but the general shape is still unguarded, so a per-call-site appearance can be smuggled
back in one level of indirection up — the same unenumerable escape hatch the other five
rules ban, wearing a function signature.

The blind spot is live and not just theoretical: `Sidebar` and `SectionNav`
(`src/components/layout/Sidebar.tsx:65`, `SectionNav.tsx:30`) and `PageHeader`
(`src/components/layout/PageHeader.tsx:55`) already carry `renderLink?` / `renderBackLink?`
function-typed `ReactNode`-returning props — except those are **structural** (a router
link-adaptor / back-link hook), not appearance, and a naive `render*?: (…) => ReactNode`
pattern would over-flag them. The appearance-vs-structural line is the real design fork.

Filed alongside (not widened into) [adherence-lint-boolean-classvalue-gap](adherence-lint-boolean-classvalue-gap.md) — the same "prop-shape blind spot" family (prop shapes the appearance rules miss), but a **distinct shape class** (function-typed, not boolean / `className?: ClassValue`), so it gets its own ticket rather than being folded into that one.

## What to do

- [ ] Before editing, grep every prop declaration under `src/components/archetypes/**` and `src/components/layout/**` for a function-typed prop returning `ReactNode` (`render*` / `*Render?` / bare `on*Render`), not only the `GroupedListSection.renderHeader` instance this report names — re-run after the rule changes to confirm the hit set is what the pattern actually owns.
- [ ] Fix the appearance-vs-structural boundary at the pattern level, not one-by-one excludes: structural render callbacks (`Sidebar` / `SectionNav` `renderLink`, `PageHeader` `renderBackLink` — router / navigation adapters) stay out at the pattern, the way `archetype-alias-union-prop`'s lookahead keeps the noun rule's owned set out of double-ownership.
- [ ] Add a render-callback appearance rule to `_adherence.json`, `include` scoped to both `src/components/archetypes/**` and `src/components/layout/**` (the second root is required because the shared chrome lives outside `src/components/archetypes/`, the same widen as the sibling rules).
- [ ] Triage every hit the way the earlier drain tickets ([`adherence-lint-union-prop-blind-spot`](../archive/adherence-lint-union-prop-blind-spot.md)) did: delete the prop and rework call sites / demos when no contract keying rule derives it, or add an exact-path `exclude` whose `message` cites the contract line that does.
- [ ] Cover both the flagged shape and a structural callback it must NOT flag in `scripts/lint-design.test.mjs`, the way the sibling tickets pin their include/exclude behaviour.

## Acceptance

- [ ] `node scripts/lint-design.mjs` exits 0 with 0 errors on a clean tree.
- [ ] Adding a fresh `renderHeader?: (args) => React.ReactNode` (or similar appearance render-callback) to any archetype shell or shared-chrome component under the widened roots makes `node scripts/lint-design.mjs` exit 1.
- [ ] It names no structural render callback — `Sidebar` / `SectionNav` `renderLink` and `PageHeader` `renderBackLink` stay green — no other structural callback is left flagging.
- [ ] Every deleted render-callback appearance prop's call sites and `src/examples/` demos are updated to match; no other similar render-callback appearance prop elsewhere in the tree is left referencing the deleted shape.
- [ ] `scripts/lint-design.test.mjs` covers the render-callback appearance shape plus a structural callback (`renderLink` / `renderBackLink`) the rule must not flag.
- [ ] `npx tsc --noEmit` and `npm test` pass.

## Related

- [adherence-lint-boolean-classvalue-gap.md](adherence-lint-boolean-classvalue-gap.md) — the sibling "prop-shape blind spot" ticket this is filed alongside (boolean / `className?: ClassValue` shapes); same family, distinct shape class.
- [adherence-lint-appearance-slot-layout-gap.md](../archive/adherence-lint-appearance-slot-layout-gap.md) — the ticket that deletes the concrete `GroupedListSection.renderHeader` instance and whose layout-layer widen this shares.
- [archive/adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — the drain-ticket precedent for the triage method (delete-unkeyed / promote-then-exclude, cite the line in `message`).
- [archive/report-calendar-appearance-prop-lint.md](../archive/report-calendar-appearance-prop-lint.md) — promote-contract-prose-then-exclude precedent.
- ADR-0004 (`docs/adr/0004-appearance-locality-derived-vs-inherited.md`) — the derived-vs-inherited test each render-callback prop is graded against.
- RULES.md hard rule 12 — the enforcement mechanism this rule belongs to.

## Open question

The render-callback pattern and the appearance-vs-structural boundary are a real design
choice, not an asserted one. Two readings: (a) a **name allowlist** of render-callback
props returning `ReactNode`, with an explicit structural-role allow-out for router /
navigation adapters (`renderLink`, `renderBackLink`, link / router render props) — broader,
catches a new appearance render-callback under a fresh name but must enumerate the
structural exceptions; or (b) a **narrower heuristic** scoped to appearance-context
render props only (title-bar / section / header slots) with no wildcard — safer, but
stops catching a future appearance render-callback introduced outside those contexts.
Recommended default is (a); confirm before `/feat`.
