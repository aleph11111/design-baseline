---
area: archetypes
opened: 2026-10-09
status: done
value: normal
model: sonnet
model_reason: "scoped responsive-class change on one primitive plus a MetricRow check, test, demo and version bump; cause is established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-09T10:00:00Z
---

# KeyValueRow does not stack label above value on phones

## Context

`KeyValueRow` (`src/components/archetypes/detail-overview/KeyValueRow.tsx`) renders the default row as `flex items-baseline justify-between gap-6` with a `shrink-0` `<dt>` and a `min-w-0 text-right` `<dd>`. At a 430px viewport the label keeps its full width, the value gets the leftover sliver, and a long value (email, name, URL) wraps letter by letter. Seen in the 2026-10-08 fleet visual pass; hk-sales-agent PR #31 worked around it with a page-local wrapper. `MetricRow` (`src/components/layout/MetricList.tsx`) is the same side-by-side `flex items-center justify-between gap-4` shape and needs checking for the same failure.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make the default `KeyValueRow` layout stack below `md`: label above value, value left-aligned and wrapping at word boundaries; keep the current side-by-side right-aligned layout from `md` up. The existing `block` prop keeps its always-stacked behaviour.
- [ ] Render `MetricRow` at 430px with a long label and a long value; if it shows the same squeeze, apply the same below-`md` stacking there, otherwise record in the CHANGELOG entry that it was checked and is unaffected.
- [ ] Add a `KeyValueRow.test.tsx` case asserting the below-`md` stacking classes on the default layout (and the `md` side-by-side classes), plus a `MetricList.test.tsx` case if `MetricRow` changes.
- [ ] Add a 430px gallery demo in `src/examples/detail-overview-demo.tsx` with long values, per the living-demos convention for documented variants.
- [ ] Bump `package.json` version and add the matching `## v<version>` entry to `CHANGELOG.md` (required by `scripts/verify-package-version.mjs`); consumers can then drop page-local wrappers such as hk-sales-agent's.

## Acceptance

- `KeyValueRow` shows the label above the value below `md` and label and value side by side from `md` up.
- A long multi-word value (a full name, a long email) wraps at word boundaries at 430px instead of letter by letter.
- No other side-by-side label/value row primitive in `src/components/` (`MetricRow` included) keeps a phone width where the value is squeezed to a sliver; every such row is stacked or recorded as checked.
- The `block` layout is unchanged.
- `npm test` passes and the CHANGELOG has an entry for the bumped version.

## Related

- [[key-value-row-mono-on-text-values]] — earlier change to the same primitive (value face)
- [[metric-row-rail-gutter]] — keeps `MetricRow` and `KeyValueRow` layout in step
- [[detail-overview-stats-prop-demo-gap]] — demo coverage for detail-overview
- [[table-column-hide-below-tier]] — prior below-tier responsive rule
- [detail-overview contract](/docs/archetypes/detail-overview.md) — archetype contract
