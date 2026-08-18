---
area: archetypes
opened: 2026-08-18
status: ready
roadmap: archetype-convergence
value: normal
model: sonnet
model_reason: "mechanical prop removal across twelve shells, following the detail-overview precedent already closed; no design decisions left"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-18T00:00:00Z
---

# Drop className escape hatch from the twelve remaining archetype shells

## Context

Phase 1 of the [archetype-convergence roadmap](../archetype-convergence.md) (spec
`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`) closed
`DetailOverviewShell`'s API and landed the appearance-prop adherence rules in
`_adherence.json` at `severity: "warn"` with a `detail-overview` exclude (rule
`archetype-shell-class-name`, `_adherence.json:57-63`). The spec deliberately
deferred the `className` drop on the other shells to avoid a thirteen-archetype
flag day; per RULES.md hard rule 12 / ADR-0004,
`className?: string` on an archetype shell is an unenumerable superset of every
appearance prop the roadmap is retiring — `className="border-0 shadow-none"`
reconstitutes a deleted `surface="separated"` exactly, and the lint cannot see
through an arbitrary class string.

Twelve `*Shell.tsx` files still declare an outer-wrapper `className?: string`:
`analytics-dashboard/DashboardShell.tsx`, `calendar/CalendarShell.tsx`,
`feed-inbox/FeedShell.tsx`, `form-page/FormPageShell.tsx`,
`grouped-list/GroupedListShell.tsx`, `import-wizard/WizardShell.tsx`,
`kanban-board/BoardShell.tsx`, `list-with-detail/ListWithDetailShell.tsx`,
`matrix-grid/MatrixGridShell.tsx`, `report/ReportShell.tsx`,
`settings-table/SettingsTableShell.tsx`,
`tabbed-settings/SettingsPageShell.tsx`.

## What to do

- [ ] Delete the `className?: string` prop declaration, its destructured
      binding, and its `cn(...)` argument from all twelve shells listed above.
- [ ] `matrix-grid/MatrixGridShell.tsx` declares `className` twice
      (`MatrixGridShell.tsx:62` and `:83`) — only the outer-wrapper prop at
      `:83` (consumed at `:136-138`) is in scope; the per-cell
      `style.className` at `:62` is leaf styling data on a cell descriptor, not
      shell appearance, and stays.
- [ ] Fix `tabbed-settings/SettingsPageShell.tsx:43,65`'s doc comments, which
      instruct a consumer to pass `className` for its own padding wrapper —
      page inset is `<AppShell>`'s `<main>` per docs/STYLE.md, not the shell.
- [ ] No demo in `src/examples/` passes `className` today; if one turns up
      during the edit, replace it with structure inside the shell's slots
      rather than reintroducing the prop.
- [ ] In `_adherence.json`, flip rule `archetype-shell-class-name`
      (`_adherence.json:57-63`) to `"severity": "error"` and drop its
      `detail-overview` exclude — detail-overview already has its own
      error-level rules. Leave the other archetype warn rules alone; they
      drain per archetype.
- [ ] Bump each touched archetype's `version` in `docs/archetypes/MANIFEST.json`
      as a major version (the prop removal is breaking); leave
      `source_spec_version` untouched so `npm run verify:manifest` stays green.
- [ ] Remove any `<slug>.baseline.md` line documenting the shell's `className`
      prop for the twelve touched archetypes.

## Acceptance

- `grep -rn 'className?: string' src/components/archetypes/**/*Shell.tsx`
  returns nothing except the retained per-cell descriptor in
  `matrix-grid/MatrixGridShell.tsx`.
- `npx tsc --noEmit` and `npm test` pass.
- `node scripts/lint-design.mjs` reports 0 errors and no
  `archetype-shell-class-name` hit at all — not just the twelve named shells,
  every `*Shell.tsx` the rule's `include` glob matches.
- `npm run verify:manifest` passes after the version bumps.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap, Phase 1.
- [archetype-convergence-detail-overview-close-api.md](../archive/archetype-convergence-detail-overview-close-api.md)
  — closed detail-overview's API first; this ticket drains the same pattern
  across the remaining twelve.
- [archetype-convergence-appearance-prop-lint.md](../archive/archetype-convergence-appearance-prop-lint.md)
  — landed `archetype-shell-class-name` at `warn`; this ticket flips it to
  `error`.
- ADR-0004 — appearance locality: global or fixed in the component, never a
  per-call-site escape hatch.
