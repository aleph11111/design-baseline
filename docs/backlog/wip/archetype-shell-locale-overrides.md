---
area: archetypes
opened: '2026-09-30'
status: ready
value: high
model: sonnet
model_reason: "per-call-site override props following the existing `closeLabel` precedent; implementation exists on the mistra-cutover branch"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-30T14:40:00Z'
---

# Make every built-in string in the list, settings and crud shells overridable per call site

## Context

The mistra archetype cutover ([[mistra-package-install-cutover]]) exposed this gap. Package
shells import the package's own `ui/` relatively, so a German consumer's locale forks of
`src/components/ui/state-view.tsx` and `search-input.tsx` never reach them. Several strings have
no override at all: `"Close"` in `CrudDialogHeader`, `"Select all rows"`/`"Select row"` in
`SettingsTableShell`, and `"Try again"` in `StateView`. Re-pointing mistra turned its German
loading, error and empty planes English. `docs/PACKAGE.md` states the rule these shells break:
the packaged surface is English defaults overridable per call site. That is the precedent
`SheetContent`/`DialogContent` `closeLabel` and the `layout-primitives-hardcoded-german` fix
already follow.

A second gap turned up in the same pass. The list table's sortable header in
`src/components/archetypes/list-with-detail/presentations/TableBody.tsx` is a clickable `<th>`
with no keyboard path. mistra's fork used a `<button>` there.

mistra's `design-baseline-archetypes-cutover` pins the tag this ships as, so it must land first.

## What to do

- [ ] `StateView`: add `retryLabel` (default "Try again").
- [ ] `SearchInput`:
  - use `type="search"` and hide WebKit's cancel X;
  - derive the default accessible name from the placeholder (strip a trailing ellipsis, and
    fall back to "Search" when the placeholder is empty);
  - add `clearLabel` (default "Clear search").
- [ ] `CrudDialogHeader` and `CrudDialogSheet`: add `closeLabel` (default "Close").
- [ ] `SettingsTableShell` gains `labels`: loading, error title, retry, the bulk-select
      checkboxes, and the bulk caption and delete button.
- [ ] `ListWithDetailShell` gains `labels`: loading, error title, retry, empty,
      filtered-empty, and the mobile Sheet close button.
- [ ] Make the sortable header a real `<button>` inside the `aria-sort` cell.
- [ ] Bump MANIFEST for list-with-detail, settings-table and crud-dialog, and bump the package
      version.

## Acceptance

- Each override renders the passed string in place of the English default, and omitting it
  still renders the English default. `src/components/archetypes/locale-overrides.test.tsx`
  asserts both for every seam.
- No other user-visible string rendered by these shells is left without an override.
- The sortable header is reachable with Tab and fires `onSortChange` on activation, with
  `aria-sort` unchanged on the header cell.
- `npx tsc --noEmit`, `npm test` and `node scripts/lint-design.mjs` (0 errors) all pass.

## Related

- [[mistra-package-install-cutover]]: the consumer cutover that needs this tag.
- [[layout-primitives-hardcoded-german]]: the same English-defaults-overridable rule, applied
  to `ThemeToggle`/`BottomNav`.
- [PACKAGE.md](/docs/PACKAGE.md): "English defaults overridable per call site".
