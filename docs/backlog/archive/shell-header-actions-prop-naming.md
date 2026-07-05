---
area: archetypes
opened: 2026-07-04
status: ready
model: sonnet
model_reason: rename a prop on two shells to the majority name, mechanical with clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Rename CalendarShell/ReportShell actions prop to headerActions for shell consistency

## Context

Severity: **low** (DX / API consistency). Every framed archetype shell renders the same `SurfaceHeader` right-aligned actions slot, but names its prop two different ways. Nine shells call it `headerActions` (DashboardShell, FeedShell, GroupedListShell, FormPageShell, BoardShell, ListWithDetailShell, MatrixGridShell, SettingsTableShell, TabbedSettings), while `CalendarShell` (`src/components/archetypes/calendar/CalendarShell.tsx:55`) and `ReportShell` (`src/components/archetypes/report/ReportShell.tsx:28`) call it `actions`. So a consumer wiring header actions must remember which shell uses which name — a needless footgun in a fleet meant to share one on-surface header contract.

## What to do

- [ ] Do red/green verification: add a failing type-probe (`npx tsc --noEmit` on a `.ts` file passing `headerActions` to `CalendarShell`/`ReportShell` — currently a type error) or a `vitest` render test; then make it pass.
- [ ] Rename `CalendarShell`'s and `ReportShell`'s `actions` prop to `headerActions` (CalendarShell.tsx:55, ReportShell.tsx:28), matching the 9-shell majority.
- [ ] Update the two demos/usages accordingly; keep a deprecated `actions` alias only if back-compat is required (otherwise omit — donor, pre-1.0).

## Acceptance

- All framed archetype shells expose the header actions slot under the identical name `headerActions`; passing `headerActions` to CalendarShell/ReportShell typechecks.
- `grep -rn "actions[?:]" src/components/archetypes/*/[A-Z]*Shell.tsx` shows no shell still using the divergent `actions` name for the header slot.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, no new TypeScript errors, lint warnings, or test failures.

## Related

- [surface-header-compose-not-copy.md](surface-header-compose-not-copy.md) — related SurfaceHeader consolidation
- [app-shell-header-props-exports.md](app-shell-header-props-exports.md) — sibling layout API-consistency gap
- src/components/layout/SurfaceHeader.tsx — the shared header these shells feed
