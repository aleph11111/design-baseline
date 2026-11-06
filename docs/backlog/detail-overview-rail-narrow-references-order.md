---
area: archetypes
opened: 2026-11-05
status: ready
value: normal
model: sonnet
model_reason: "cause established (one rail div holds summary and references); fix is a scoped CSS order change in one shell"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-05T00:00:00Z
---

# DetailOverviewShell rail layout shows references above stats on narrow viewports

## Context

`src/components/archetypes/detail-overview/DetailOverviewShell.tsx` renders `layout="rail"` as one rail `div` holding `{summary}{references}`, followed by `main` (stats + content). Below `lg` the rail stacks first, so `references` appears ABOVE stats and content. `docs/archetypes/detail-overview.md` ("Responsive contract") requires the narrow order `header → summary → stats → content → references`. Repro: any rail page with references (e.g. hk-sales-agent Firmenakte at phone 390px) — "Herkunft" and "Ähnliche Kunden" render before "Personen". On wide viewports references correctly stays at the rail foot (sticky rail, `--db-rail-h` clamp), so only the narrow order is wrong. The `layout="vertical"` branch is already correct (references last in main).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `DetailOverviewShell.tsx`, make the rail layout's parent `flex flex-col lg:grid …`, give the rail `div` `max-lg:contents`, wrap `summary` and `references` in their own `div`s, and order `references` after `main` below `lg` (`max-lg:order-last`). One mount per slot, so no duplicated DOM, state or ids; the wide-viewport rail (sticky, foot clamp) stays unchanged.
- [ ] Keep the inset-hairline `railDividers` working across the new wrappers (`[&>*+*]` must still target sibling sections).
- [ ] Add a render/order test in `DetailOverviewShell.test.tsx` and run `npm run check:viewports` (phone) on a rail demo that passes references.

## Acceptance

- At phone width, a `layout="rail"` page with `summary`, `stats`, `content` and `references` renders in order header, summary, stats, content, references.
- At `lg` and wider the rail still holds summary then references with the sticky foot clamp unchanged.
- Every `layout="rail"` consumer and demo follows the contract order on narrow viewports, not only the hk-sales-agent Firmenakte page.
- `layout="vertical"` output is unchanged.

## Related

- [[detail-overview-rail-sticky-ineffective]]
- [[archetype-rollout-detail-overview-rail-foot-unreachable-on-short-viewports]]
- [[detail-overview-blueprint-rail-variant]]
- [[test-gap-detail-overview-shell-no-tests]]
