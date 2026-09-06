---
area: archetypes
opened: '2026-09-06'
status: done
gate:
  score: 4
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed:
    - open_question: >-
        two prop forks (delete vs keep-with-rule) auto-resolved to Recommended default — confirm
        before /feat
  graded_at: '2026-09-06T00:00:00Z'
value: normal
roadmap: archetype-convergence
---

# Close analytics-dashboard's three unkeyed column/span props under RULES rule 12

## Context

Rule 12 (`docs/RULES.md:29`, ADR-0004) requires a per-call-site prop to carry
a contract decision rule that derives its value from the entity or its data —
a backwards-compatible default disqualifies it on its own. Three props in the
analytics-dashboard (G) archetype fail this test:

- `src/components/layout/StatTileRow.tsx:19` — `columns: 2 | 3 | 4`,
  documented only as "Must match the number of `<StatTile>` children for
  visual balance" — a count the component can't see, enforced by a comment.
  `DetailOverviewShell.tsx:119` already derives it
  (`Math.min(Math.max(stats.length, 2), 4)`), but
  `src/examples/analytics-dashboard-demo.tsx:237` still hand-passes
  `columns={4}`.
- `src/components/archetypes/analytics-dashboard/DashboardGrid.tsx:16` —
  `columns?: 2 | 3 | 4` defaulting to `3`. `docs/archetypes/analytics-dashboard.md:66`
  mentions `columns={2|3|4}` but states no keying rule; the demo
  (`analytics-dashboard-demo.tsx:168-246`) exposes it as a live picker — a
  per-page look control.
- `src/components/archetypes/analytics-dashboard/DashboardWidget.tsx:22` —
  `span?: 1 | 2 | 3` defaulting to `1`, with `analytics-dashboard.md:74`
  saying only "a primary trend line spans 2–3" — discretion, no threshold.

`_adherence.json`'s general appearance-prop warn rules
(`archetype-appearance-noun-prop`, `archetype-look-union-prop`,
`archetype-appearance-slot`) already scope to `src/components/archetypes/**`
and currently do **not** exclude `analytics-dashboard`, so they're the
mechanism flagging these two archetype-dir props today; `StatTileRow` sits
outside `src/components/archetypes/**` entirely and is caught by neither —
closing it needs a new scoped rule, mirroring `detail-overview-surface-prop`
/ `list-with-detail-unstyled-prop` (both `error`-severity, scoped to their
archetype dir, `_adherence.json:94` / `:143`).

## What to do

- [ ] `StatTileRow`: derive column count from `React.Children.count(children)`
      (clamped 2–4) and delete the `columns` prop; update
      `DetailOverviewShell` to stop computing it and the demo
      (`analytics-dashboard-demo.tsx:237`) to stop passing it.
- [ ] `DashboardGrid.columns`: derive from widget count the same way and
      delete the prop (preferred — deletion needs no contract rule); remove
      the demo's column picker (`analytics-dashboard-demo.tsx:168-246`).
- [ ] `DashboardWidget.span`: delete the prop — a widget needing more room
      is a different widget kind, and deletion needs no contract rule
      (same reasoning as `DashboardGrid.columns` above).
- [ ] Keep `analytics-dashboard.md` role-level — name no primitive, no
      Tailwind class (RULES rule 3); any binding goes in
      `analytics-dashboard.baseline.md`.
- [ ] Bump the MANIFEST `analytics-dashboard` entry past its current `2.1`
      (`docs/archetypes/MANIFEST.json`) — MAJOR, since deleting a prop
      breaks the API deliberately.
- [ ] Add an `error`-severity `_adherence.json` rule scoped to
      `src/components/archetypes/analytics-dashboard/**` for each deleted
      prop, mirroring `detail-overview-surface-prop` / `list-with-detail-unstyled-prop`.
- [ ] Add `analytics-dashboard` to the `exclude` arrays of the three general
      appearance-prop warn rules (`archetype-appearance-noun-prop`,
      `archetype-look-union-prop`, `archetype-appearance-slot`) now that its
      dedicated error rules supersede them.

## Acceptance

- `npx tsc --noEmit` and `npm test` pass.
- `grep -rn 'columns=' src/examples/analytics-dashboard-demo.tsx` finds no
  hand-passed column count, and the demo's column picker is gone.
- The KPI strip and widget grid still render with the same responsive
  collapse.
- `node scripts/lint-design.mjs` reports no appearance-prop hit naming an
  `analytics-dashboard` or `StatTileRow` file, and exits 0.

## Open question

Two props had a real fork between "delete" and "keep, backed by a written
contract rule." No `AskUserQuestion` tool was available in this session, so
both defaulted to the Recommended option (delete — matches the "prefer
deriving, since deletion needs no rule" reasoning already applied to
`StatTileRow`); confirm before `/feat`, or reopen the kept-with-rule option:

- `DashboardGrid.columns` — kept option would write a keying rule into
  `docs/archetypes/analytics-dashboard.md` deriving column count from
  widget count in prose (role-level language, no primitive names), instead
  of deleting the prop and having `DashboardGrid` compute it internally.
- `DashboardWidget.span` — kept option would enumerate span exhaustively by
  widget kind in the contract (e.g. "a time-series/trend widget spans wide,
  a single-number widget spans one"), instead of deleting the prop and
  treating a wider widget as a distinct widget kind.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — the roadmap this
  closes a warn-drain slice of (Phase-0/1/lint tickets already shipped).
- [archive/archetype-convergence-appearance-prop-lint.md](../archive/archetype-convergence-appearance-prop-lint.md)
- [archive/archetype-convergence-component-kind-appearance-gap.md](../archive/archetype-convergence-component-kind-appearance-gap.md)
- ADR-0004 — Appearance locality: global or fixed in the component; per-call-site only when derived
