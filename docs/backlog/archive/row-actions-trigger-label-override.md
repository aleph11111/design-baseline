---
area: archetypes
opened: '2026-09-30'
status: done
value: normal
model: sonnet
model_reason: "one more label key on the existing `labels` objects, following the v0.2.30 pattern"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-30T15:10:00Z'
---

# Let consumers override the row-actions trigger label inside the list and settings shells

## Context

v0.2.30 ([[archetype-shell-locale-overrides]]) made every built-in string in the list, settings
and crud shells overridable per call site, with one exception. `RowActionsMenu` in
`src/components/archetypes/shared/RowActionsMenu.tsx` has a `triggerLabel` prop, but
`SettingsTableShell` and `ListWithDetailShell` render it with no way to pass one through.
Whenever `rowActions` is set, the `⋯` trigger's accessible name stays the English default
"Row actions", which is screen-reader English on a German route. mistra's review of the
archetype cutover (mistra #1257) flagged it. mistra's two direct `RowActionsMenu` call sites,
`ActionItemsTriageList.tsx` and `RecordingDetailPage.tsx`, also omit `triggerLabel`. Those can
be fixed on the mistra side once the shells accept the key.

## What to do

- [ ] Before editing, grep every caller of `RowActionsMenu` in `src/components/`, and forward the
      label at every shell that renders it, not only the two named here.
- [ ] Add `rowActions?: string` to `SettingsTableLabels` and `ListWithDetailLabels`, and forward
      it as `triggerLabel` to each `RowActionsMenu` the shells render (the list shell's table,
      card-grid and action-row presentations included).
- [ ] Bump MANIFEST for list-with-detail and settings-table, and bump the package version.

## Acceptance

- With `labels={{ rowActions: "Zeilenaktionen" }}`, every row trigger in both shells is named
  "Zeilenaktionen" in all three list presentations. Without it, every trigger still reads
  "Row actions". Both cases are asserted in `src/components/archetypes/locale-overrides.test.tsx`.
- No other `RowActionsMenu` render in `src/components/archetypes/` is left without a path for
  a consumer label.

## Related

- [[archetype-shell-locale-overrides]]: the v0.2.30 overrides this completes.
- [[mistra-package-install-cutover]]: the cutover whose review found it.
