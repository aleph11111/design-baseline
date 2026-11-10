---
area: archetypes
opened: '2026-11-10'
status: needs-enrichment
value: high
model: opus
model_reason: "design is the deliverable — grid-variant vs widget-kind tradeoff under ADR-0004 rule 12"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "grid-variant vs paired-period widget fork auto-resolved to Recommended default — confirm before /feat"
  graded_at: 2026-11-10T00:00:00Z
---

# Archetype gap: analytics-dashboard paired month and YTD KPI tiles

## Context

`DashboardGrid` (`src/components/archetypes/analytics-dashboard/DashboardGrid.tsx:30`) fixes its columns at 1 / 2 (`sm`) / 3 (`lg`), and rule 12 of `docs/RULES.md` (ADR-0004) bars a consumer from overriding the count. controlling-app `/workspace/dashboard` lays out KPI tiles as month + YTD pairs (Gesamtleistung Monat, Gesamtleistung YTD, Rohertrag Monat, Rohertrag YTD). At `lg` the grid wraps them in rows of 3, so row 1 = GL Monat, GL YTD, RE Monat and row 2 starts with RE YTD: the pairs no longer line up. Wanted: two tiles per row, month left, YTD right. The consumer ticket `dashboard-paired-period-tiles-misalign` (controlling-app) waits on this.

## What to do

- [ ] Add a paired-period widget kind to analytics-dashboard: one widget shows a KPI's month figure and its YTD figure side by side, so a pair can never split across grid rows.
- [ ] Derive its width from the Layer 6 span keying rule in `docs/archetypes/analytics-dashboard.md` (extend the rule with this kind; `span` stays required, no default), not from a new per-page prop (per ADR-0004).
- [ ] Add a gallery demo in `src/examples/analytics-dashboard-demo.tsx` showing two pairs (per the living-demos convention) and bump the contract version log.

## Acceptance

- A paired-period widget renders its month figure left of its YTD figure at every breakpoint that has room, and stacks them on the 1-column layout.
- Two paired-period widgets in one grid show as two rows of one pair each, with month left and YTD right, at `lg`.
- `DashboardGrid`'s column count stays unchanged and no new column-count prop exists on it.

## Related

- [[analytics-dashboard-column-span-props-unclosed]] — closed the same rule-12 question for column/span props
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality: fixed in the component unless derived
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — edit mode shares the grid and span keying rule

## Open question

Two ways to fix it; the first was asserted as the default:
- (b) Paired-period widget kind (Recommended): the data shape (a metric with month + YTD) keys the widget, which satisfies rule 12 and leaves the grid's fixed columns alone.
- (a) A 2-column `DashboardGrid` variant keyed by a derivable rule: needs a rule that picks 2 columns from the widgets' content, and a mixed grid (pairs plus ordinary widgets) has no such rule.
