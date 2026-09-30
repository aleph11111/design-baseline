---
area: layout
opened: 2026-09-28
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T12:00:00Z
---

# MetricRow lacks the px-5 gutter KeyValueRow has in the detail-overview rail

## Context

In a `DetailOverviewShell layout="rail"` the rail stacks a `MetricList` ("Kennzahlen") above a `KeyValueList` ("Stammdaten"). `KeyValueRow` (`src/components/archetypes/detail-overview/KeyValueRow.tsx`) pads every row `px-5 py-2.5`. `MetricRow` (`src/components/layout/MetricList.tsx`) pads only `py-2.5`, so its labels sit flush left and its values touch the rail's right border, which misaligns the two lists. hk-crm worked around this on 2026-09-28 (PR #1095) by passing `className="px-5"` to every `MetricRow` on `companies/[id]` and `projects/[id]`. Its `opportunities/[id]` rail has the same gap, and there the disclosure trigger can't take the class. Every consumer that puts a `MetricList` in a rail inherits the gap.

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Give `MetricRow` and the `MetricList` disclosure trigger the same `px-5` gutter as `KeyValueRow`. Keep the dividers full-width, as `KeyValueList` does.
- [x] Update the MetricList test and the detail-overview demo, bump the version and cut the tag. Consumers then drop their per-row `className="px-5"`. *(v0.2.14. The demos now put `MetricList` in a `flush` section, like `KeyValueList`. `metric-row-accent-prop-promotion` did not ship in the same bump: it re-adds the `accent` flag that #214 deleted under ADR-0004, which needs a contract keying rule first.)*

## Acceptance

- In the gallery's rail demo, `MetricRow` labels and values line up with the `KeyValueRow` labels and values below them. The disclosure trigger is inset by the same gutter, and no other `MetricList` call site (dashboard, analytics) shows double padding.

## Related

- [[metric-row-accent-prop-promotion]] — same component, same consumer, can ship in one bump
- [[test-gap-metric-list-no-tests]]
