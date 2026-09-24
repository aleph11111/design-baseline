---
area: archetypes
opened: '2026-09-24'
status: ready
value: high
model: opus
model_reason: "five separate ADR-0004/rule-10 keying-rule calls (ship with a contract decision rule, or reject and have mistra adapt) — real design judgment per feature, not mechanical porting"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-24T10:02:27Z'
---

# Promote mistra's consumer-ahead list-with-detail, settings-table, and RowActionsMenu features into design-baseline

## Context

Fork triage for `mistra-package-install-cutover` (`docs/backlog/wip/mistra-package-install-cutover.md`)
diffed mistra `origin/main`'s `frontend/src/components/archetypes/{list-with-detail,settings-table,shared}`
against donor tag `v0.2.3` and found five places where mistra's vendored fork is *ahead* of the donor —
features it added locally that the donor doesn't ship. Confirmed absent from the current donor tree:
`TableColumn` (`src/components/archetypes/shared/tableColumn.ts`) has no `hideBelowMd`; `ListWithDetailShellProps`
(`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`) has no `footer` or `emptyStateAction`,
and `ListWithDetailEmptyStateProps` (`ListWithDetailEmptyState.tsx`) has no `action`; `RowAction<Row>`
(`src/components/archetypes/shared/RowActionsMenu.tsx`) types `label` and `disabled` as plain values, not
`(row) => T`; `SettingsTableShellProps` (`src/components/archetypes/settings-table/SettingsTableShell.tsx`)
has no result-count `rowLabel` line. `list-with-detail` and `settings-table` are both at MANIFEST/contract
version `2.3` (`docs/archetypes/MANIFEST.json`), `promoted_from: brickshop-manager`. Each feature is an
appearance-or-behavior call under [ADR-0004](adr/0004-appearance-locality-derived-vs-inherited.md) /
`docs/RULES.md` hard rule 10 ("an appearance is either global or fixed in the component; a per-call-site
prop is legal only if derived"): a structural/behavioral prop ships as-is, an appearance prop needs a
Layer-6 contract decision rule before it can ship, and if no keying rule can be written the feature is
rejected and mistra keeps (or reworks) its local fork. This ticket blocks `mistra-package-install-cutover`,
whose runbook step 1 (fork triage) can't complete the "promote or drop" decision on these five items until
each has a donor-side ruling.

## What to do

- [x] `hideBelowMd?: boolean` on `TableColumn` (used ~17 call sites in mistra: ActionItemsTable, HealthPage,
      DashboardPage, SkillDatenPage, SpeakersPage): rule per ADR-0004 whether a "secondary/meta column"
      keying rule can be written into the shared column contract (Layer 6) — the column *kind* (metadata
      vs. primary data), not free per-call-site choice. If a keying rule holds, add the field to
      `TableColumn<Row>` (`src/components/archetypes/shared/tableColumn.ts`), thread it through
      `list-with-detail`'s and `settings-table`'s table bodies, and add the keying rule to both
      `docs/archetypes/list-with-detail.md` and `docs/archetypes/settings-table.md` Layer 6. If no keying
      rule holds, reject and record the mistra-side adaptation (e.g. a `useIsMobile()`-gated column list at
      the call site) in this ticket.
- [x] `footer?: ReactNode` on `ListWithDetailShellProps`, rendered as a band inside the card below the body
      (mistra's load-more row: LogsPage, DashboardPage): a composition slot (structure, not appearance) —
      add it to `ListWithDetailShellProps` and render it inside `<SurfaceFrame>` below `bodyContent` in
      `ListWithDetailShell.tsx`.
- [x] `emptyStateAction?: ReactNode` on `ListWithDetailShellProps`, threaded to `ListWithDetailEmptyState`'s
      new `action` prop (mistra's DashboardPage empty-state CTA): a composition slot matching the
      `StateView`/`SettingsTableShell` empty-state `action` pattern already shipped in
      `SettingsTableShell.tsx` — add `action?: React.ReactNode` to `ListWithDetailEmptyStateProps`, pass it
      through the `mode === "empty"`/`"filtered-empty"` branch's `<StateView variant="empty">`, and thread
      `emptyStateAction` from `ListWithDetailShellProps` down to it.
- [x] `RowAction<Row>.label` and `.disabled` accepting `T | (row: Row) => T` (mistra's per-row toggle label
      "Zu Mein Tag" / "Aus Mein Tag entfernen", and per-row permission gating): behavior, not appearance —
      widen both fields' types in `RowActionsMenu.tsx` and resolve the function form at render time
      (`typeof item.label === "function" ? item.label(row) : item.label`, same for `disabled`). No contract
      keying rule needed (not an appearance axis); update the RowAction doc comment.
- [x] `rowLabel: string | ((count: number) => string)` on `SettingsTableShellProps` for the result-count
      line (currently `SettingsTableShell` renders no count line at all): add the prop, render it in the
      toolbar band, and resolve the function form with `rows.length`.
- [x] For every feature that ships: bump `docs/archetypes/list-with-detail.md` and/or
      `docs/archetypes/settings-table.md` `version`, add a living demo variant to
      `src/examples/list-with-detail-demo.tsx` / `src/examples/settings-table-demo.tsx` per the
      "every documented variant axis gets a living demo" rule, and bump the corresponding
      `docs/archetypes/MANIFEST.json` entry version (rule 8 — MANIFEST version tracks any shipped-deliverable
      change).
- [x] Run `node scripts/verify-exports.mjs` and `node scripts/verify-manifest-versions.mjs` green, then cut
      a new donor tag past `v0.2.3` so `mistra-package-install-cutover` has something to pin to.

## Acceptance

- Each of the five features either ships (type change + contract keying rule where ADR-0004 requires one +
  gallery demo + MANIFEST version bump) or is recorded here as rejected with the mistra-side adaptation —
  none are silently dropped.
- `docs/archetypes/list-with-detail.md` and `docs/archetypes/settings-table.md` Layer 6 sections name a
  keying rule for `hideBelowMd` if it shipped, or the ticket states why no keying rule holds if it didn't.
- `node scripts/verify-exports.mjs` and `node scripts/verify-manifest-versions.mjs` both exit 0.
- A new git tag exists past `v0.2.3` once all decisions land.

## Related

- [[mistra-package-install-cutover]] — blocked on this ticket; its fork-triage step needs these rulings
  before it can delete mistra's vendored archetype copies.
- [archive/archetype-convergence-list-with-detail-close-api.md](../archive/archetype-convergence-list-with-detail-close-api.md) — the Phase 1 closure this promotion must not reopen carelessly.
- [archive/archetype-convergence-settings-table-close-api.md](../archive/archetype-convergence-settings-table-close-api.md) — same closure for D2.
- [archive/test-gap-row-actions-menu-zero-tests.md](../archive/test-gap-row-actions-menu-zero-tests.md) — RowActionsMenu test coverage context for the label/disabled function-form change.
- [archive/refactor-identifier-cell-column-config-duplication.md](../archive/refactor-identifier-cell-column-config-duplication.md) — the shared `TableColumn` extraction `hideBelowMd` extends.
- [[archetype-convergence]] — parent roadmap.
- ADR-0004 — appearance locality (derived vs. inherited), the governing rule for every keying-rule call above.
- `docs/RULES.md` hard rules 8 (version-field semantics) and 10 (appearance locality enforcement).

## Outcome (2026-09-24)

All five features **ship** — none rejected. Contracts `list-with-detail` / `settings-table` 2.0 → 2.1
(one new keyed rule each); MANIFEST 2.3 → 2.4 both; package 0.2.3 → 0.2.4 (tag `v0.2.4` on the merge commit).

- **`hideBelowMd`** — ships with a Layer-6 keying rule in both contracts, keyed to the column's *role*:
  identifier (never hides — enforced in `hideBelowMdClass`, the flag is ignored on `isIdentifier`),
  row-state token (status / priority / stage) and the one ranked figure stay; every context column
  (relational, descriptive, record metadata) carries it. Mistra's ~17 call sites (company / project /
  topics / comment / created / size / duration / email) all fall in the "context" bucket, so they
  conform unchanged. Table bodies only (card-grid / action-row ignore it).
- **`footer`** — ships as a structural band in the list column (below the body, beside the rail),
  chrome fixed in the shell (`border-t px-4 py-3`). Contract Layer 5 allowed variation.
- **`emptyStateAction`** → `ListWithDetailEmptyState.action` — ships; Layer 7 allowed variation.
- **`RowAction.label` / `.disabled` function forms** — ships (behavior); resolved at render in `RowActionsMenu`.
- **`rowLabel`** — ships as **optional** (mistra had it required): it implements the already-required
  Layer 4 result count, but making it required would break every other consumer; omitted = no line.
  Mistra-side adaptation: none needed (its required usage type-checks against the optional prop).
  Hidden during bulk selection (the "{n} selected" count replaces it), matching mistra.

Mistra-side deltas the cutover must still reconcile (not features — fork drift): mistra's shell renders
the footer full-width below the rail and localizes the empty-state defaults (German) — pass
`emptyStateMessage` instead of relying on the fork's default copy.
