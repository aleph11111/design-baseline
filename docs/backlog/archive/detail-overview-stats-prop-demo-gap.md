---
area: archetypes
opened: '2026-09-27'
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T00:00:00Z'
value: normal
model: sonnet
model_reason: an established pattern to follow (the same fixture already renders MetricList; adding a stats-driven instance is additive, no design decisions left)
---

# DetailOverviewShell's stats prop has no gallery demo coverage

## Context

`DetailOverviewShell`'s `stats` prop (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx:77`, typed `StatItem[]`) renders a `StatTileRow`/`StatTile` aggregate strip (`DetailOverviewShell.tsx:119-124`) — the archetype contract's slot 3 (`docs/archetypes/detail-overview.md:143`, "aggregates: the stat-tile strip of 2–4 cells"). `src/examples/detail-overview-demo.tsx` never passes `stats` — its rail-layout fixture uses `MetricList` in the `summary` slot instead (the contract's documented alternative for the rail variant, `docs/archetypes/detail-overview.md:203`, "may be omitted... recommended for the rail variant, to avoid duplication"). Per the living-demos rule, every documented variant/axis needs a visible gallery demo, and `stats` currently has none.

## What to do

- [x] Add a second demo instance in `src/examples/detail-overview-demo.tsx` exercising `layout="vertical"` with the `stats` data prop populated (2-4 `StatItem`s), since the contract recommends `stats` for the vertical layout and `MetricList` for the rail (avoiding the duplication the doc calls out) — the existing Mode A section (vertical, no rail) is the natural place to add it rather than a third top-level fixture.
- [x] Give at least one `StatItem` a `hint` (context-line) value, matching the `StatTile` `hint` prop already shipped in #310 (house-look stat-tile context line), so the demo also shows that axis.

## Acceptance

- The gallery renders a `DetailOverviewShell` instance with a populated `stats` strip (`StatTileRow`/`StatTile`), visible without editing code.
- At least one rendered `StatTile` shows a context-line hint.

## Related

- [[house-look-stat-tile-context-line]] — #310, the slice that added `StatTile`'s hint/context-line prop this demo now exercises
- [[test-gap-detail-overview-shell-no-tests]] — sibling test-coverage gap on the same shell
- `docs/archetypes/detail-overview.md` — slot 3 (`stats`) contract

## Outcome

Added a vertical-layout `DetailOverviewShell` instance to `src/examples/detail-overview-demo.tsx` inside the Mode A section (after its collapsible section) with a 3-cell `stats` strip; Revenue and Gross profit carry `hint` context lines. Verified: `npx tsc --noEmit`, `npm test` (478 passed), `npm run gallery:build` (instance present in the built detail-overview chunk).
