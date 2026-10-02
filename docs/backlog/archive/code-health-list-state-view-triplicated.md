---
area: code-health
opened: '2026-10-01'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T15:47:02.114Z'
value: normal
model: sonnet
model_reason: >-
  extract one shared adapter from three verified copies and add a labels prop;
  ListWithDetailEmptyState already sets the shape
---

# Extract one list-state renderer shared by the three list shells

## Context

Three list shells each call `resolveListState` and then map the result onto the `<StateView>` loading, error and empty planes with their own hand-written copy:

- [src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx), lines ~199-203 and ~255-282. It expands `listState` into four booleans and builds `emptyState`, `loadingState` and `errorState` inline. Its default empty text is `"No items yet."`, with a period.
- [src/components/archetypes/list-with-detail/ListWithDetailEmptyState.tsx](/src/components/archetypes/list-with-detail/ListWithDetailEmptyState.tsx), lines ~46-81. It renders the same three planes behind a `mode` prop and adds `filtered-empty`. Its default empty text is `"No items yet"`, with no period. Its JSDoc claims the planes "match settings-table and grouped-list exactly", which is no longer true.
- [src/components/archetypes/grouped-list/GroupedListShell.tsx](/src/components/archetypes/grouped-list/GroupedListShell.tsx), lines ~68-71. It renders `<StateView variant="loading" />` and `<StateView variant="error" error={error} onRetry={onRetry} />` with no labels at all.

The grouped-list copy is a user-facing gap. The other two shells pass through `labels.loading`, `labels.errorTitle` and `labels.retry`. `GroupedListShell` has no `labels` prop, so a German-locale consumer sees hard-coded English loading, error-title and retry text on grouped-list pages and has no way to override it. `src/components/archetypes/locale-overrides.test.tsx` does not cover grouped-list.

On the structural side, adding a state label key or changing a default string takes three edits. The copies have already drifted on empty-text punctuation and on whether labels pass through.

If this finding is wrong, `GroupedListShell` gets its labels from somewhere else. At filing time it declares no `labels` prop.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add a shared `ListStateView` under `src/components/archetypes/shared/`. It takes the `resolveListState` phase plus `error`, `onRetry`, `labels` (`loading`, `errorTitle`, `retry`, `empty`), `emptyMessage`, `emptyAction` and `className`, and it owns the default empty string in one place.
- [ ] Route `SettingsTableShell`, `ListWithDetailEmptyState` and `GroupedListShell` through it. Keep `filtered-empty` as a message override inside `ListWithDetailEmptyState`.
- [ ] Add a `labels` prop to `GroupedListShell` covering loading, error title and retry, using the key names the other two shells already use.
- [ ] Settle on one default empty string and update any test that pins the other spelling.
- [ ] Fold the scattered `??` label literals in `SettingsTableShell` (`selectedCount`, `deleteSelected`, `"Select all rows"`, `"Select row"`) into one defaults object merged once. `useCrudDialogController` already does this with `DEFAULT_CRUD_DIALOG_LABELS`.

## Acceptance

- No other archetype file renders `<StateView variant="error">` directly. Every list shell's error plane comes from the shared `ListStateView` (checked with grep, excluding tests).
- `GroupedListShell` rendered with `isLoading` and `labels={{ loading: "Lädt…" }}` shows `Lädt…`, and `locale-overrides.test.tsx` covers that case.
- All three shells show the same default empty string.
- `npx tsc --noEmit` and `npm test` pass.

## Related

- [src/components/archetypes/shared/resolveListState.ts](/src/components/archetypes/shared/resolveListState.ts): the shared phase resolver. Only the rendering half was never shared.
- [src/components/ui/state-view.tsx](/src/components/ui/state-view.tsx): the plane primitive the adapter wraps.
- [[code-health-field-error-ring-class-duplicated]]: the same pattern (frame shared, last mile copied) in the field layer.
