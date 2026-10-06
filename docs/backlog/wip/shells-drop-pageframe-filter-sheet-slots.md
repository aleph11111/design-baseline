---
area: archetypes
opened: 2026-10-06
status: ready
value: high
model: opus
model_reason: "a shared frame-slot type + a lint/type-test gate extension across every page shell, deciding lint-rule vs type-level test — real implementation judgment, not a mechanical edit"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-06T19:22:56Z
---

# Shells drop PageFrame mobile filter-sheet slots via hand-picked PageFrameProps Picks

## Context

Every page archetype shell types its frame slots as a per-shell `Pick<PageFrameProps, …>` instead of inheriting the slots, so each new `PageFrame` slot is silently dropped by every shell that does not name it. Since v0.6.0 (`pageframe-mobile-filter-sheet`) `src/components/layout/PageFrame.tsx` carries the mobile filter-sheet slots `filterCount`, `filterSummary`, `onResetFilters`, and `filterLabels`, but only `src/components/archetypes/statement-with-filters/StatementWithFiltersShell.tsx` picks and spreads them. The other full-frame shells — `list-with-detail/ListWithDetailShell.tsx`, `settings-table/SettingsTableShell.tsx`, `grouped-list/GroupedListShell.tsx`, `kanban-board/BoardShell.tsx`, `matrix-grid/MatrixGridShell.tsx`, `calendar/CalendarShell.tsx`, `analytics-dashboard/DashboardShell.tsx`, and `feed-inbox/FeedShell.tsx` — pick only `title | subtitle | badges | actions | toolbar | count`, so a German app on any list/settings/board/matrix/calendar/dashboard page gets an English `Filter` / `Fertig` sheet and cannot pass the active-filter summary. gebo-stock-kiosk PR #17 had to abandon `ListWithDetailShell` for a hand-built `PageFrame` page because of exactly this. The same class shipped a fix for `viewOptions` in v0.6.1 (`shells-drop-pageframe-view-options-slots`), confirming it is the structural cause, not a one-off. `docs/STYLE.md` requires "a shell forwards every `PageFrame` slot it takes," and `_adherence.NOTES.md` records (ceiling) that the `archetype-swallowed-pageframe-slot` lint is blind to the `Pick<PageFrameProps, …>` level because there is no destructure to flag and whether the omission is deliberate lives in the archetype's prose contract.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Introduce one shared exported type for the `PageFrame` slots a page shell forwards (`title`, `subtitle`, `badges`, `actions`, `toolbar`, `count`, `viewOptions`, `viewOptionsLabel`, `filterCount`, `filterSummary`, `onResetFilters`, `filterLabels`) in `src/components/layout`, and rewrite every `Pick<PageFrameProps, …>` page-shell to build from it, so a future `PageFrame` slot reaches all shells and no shell can silently drop one. Shells whose contract deliberately omits a slot (e.g. `detail-overview`, `report`) keep that omission.
- [ ] Make the `archetype-swallowed-pageframe-slot` adherence rule (`scripts/lint-design.mjs`, `_adherence.json`) — which `_adherence.NOTES.md` documents as blind to the `Pick<PageFrameProps, …>` level — or a type-level test, fail when a page shell whose contract claims the full frame omits a shared slot.
- [ ] Add a gallery demo of a list page at 430px width with German `filterLabels`, so the localized filter sheet renders.
- [ ] Bump the `package.json` `version` and the `MANIFEST.json` archetype versions for the changed shells (per `scripts/verify:manifest` / `scripts/verify-package-version.mjs`) — required for shipped code by `docs/RULES.md` hard rule 11.

## Acceptance

- `npx tsc --noEmit` passes and `ListWithDetailShell`, `SettingsTableShell`, `GroupedListShell`, `BoardShell`, `MatrixGridShell`, `CalendarShell`, `DashboardShell`, and `FeedShell` accept `filterCount`, `filterSummary`, `onResetFilters`, and `filterLabels` and forward them to `PageFrame` — every full-frame shell, not only the one gebo-stock-kiosk named.
- The shells no longer fall back to the English `Filter` / `Fertig` sheet default: a German app's list page renders the localized sheet at 430px.
- After the change, no other full-frame shell omits a shared `PageFrame` slot (the class, not just the reported instance), enforced by the extended lint rule or the type-level test.
- `npm test` passes, including the new demo/type-level case.

## Related

- [[shells-drop-pageframe-view-options-slots]] — the same root cause already fixed for `viewOptions` (v0.6.1); this ticket generalizes the fix to the filter-sheet slots
- [[pageframe-mobile-filter-sheet]] — introduced the `filterCount` / `filterSummary` / `onResetFilters` / `filterLabels` slots in v0.6.0
- [[adherence-lint-swallowed-pageframe-slot-prop]] — the destructure-level swallow lint this ticket extends (or the type-level alternative)
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement (the slots a shell must forward)
- [_adherence.NOTES.md](/_adherence.NOTES.md) — the `Pick<PageFrameProps, …>`-level ceiling this ticket resolves
- [docs/RULES.md](/docs/RULES.md) — hard rule 11: a PR that changes shipped code bumps the package version
