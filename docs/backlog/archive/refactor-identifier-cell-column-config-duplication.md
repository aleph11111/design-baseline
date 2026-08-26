---
area: refactor
opened: '2026-08-25'
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
  graded_at: '2026-08-25T10:49:12.109Z'
model: opus
model_reason: >-
  the two column types belong to two separately versioned archetype contracts (A list-with-detail,
  D2 settings-table) whose decision rules for align and identifierMono differ in prose; unifying
  them is a contract decision, not a mechanical move
---

# Unify the duplicated table column config and identifier-cell recipe across archetypes A and D2

## Context

Severity: **medium-high** (DRY, with a live behavioural divergence). Two archetype table bodies independently declare the same column-descriptor type and independently re-derive the same cell recipes from it:

- `SettingsColumn<Row>` — `src/components/archetypes/settings-table/SettingsTableShell.tsx:33` (`key`, `header`, `cell`, `align`, `isIdentifier`, `identifierMono`)
- `ListColumn<Row>` — `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:39` (the same six fields plus `width`, `sortable`, `sortFn`)

Both files then declare a private, byte-identical `alignClass()` helper — `SettingsTableShell.tsx:114` and `presentations/TableBody.tsx:20` — mapping the same three-value union to the same three Tailwind classes. Both files then hand-build the identifier cell's className from `isIdentifier` / `identifierMono`. Those two hand-builds have already come apart, and every difference is silent:

| | `SettingsTableShell.tsx:295-306` | `presentations/TableBody.tsx:144-160` |
|---|---|---|
| `identifierMono` default | `=== true` → **off** by default | `!== false` → **on** by default |
| mono type scale | `font-mono text-sm` | `font-mono text-[13px]` |
| clickable cursor | always `cursor-pointer` when `isIdentifier` | only when a handler exists |
| focus ring | none | `interactiveRowFocusRing` |
| keyboard activation | none | `getInteractiveRowProps(activate)` |

The last two rows are the consequential ones: `src/components/archetypes/shared/interactiveRow.ts` exists precisely so a clickable non-button cell becomes a tab stop that fires on Enter/Space, and `TableBody` uses it — but `SettingsTableShell`'s identifier cell carries a bare `onClick` with no `role`, no `tabIndex`, and no key handler. D2's identifier click is documented in that same file as "D2's core click contract", and it is keyboard-inoperable. A shared cell primitive is what would have carried the fix to both; two copies is why one got it.

The `align` divergence is contract-level too: `SettingsColumn.align`'s JSDoc spells out a decision rule keying the value to the column's value kind (numeric/monetary/date → `right`, short tokens → `center`), while `ListColumn.align` documents no rule at all — so the same column in two archetypes can legitimately be aligned differently.

## What to do

- [ ] Add a shared column descriptor and cell renderer under `src/components/archetypes/shared/` — a base `TableColumn<Row>` type (`key`, `header`, `cell`, `align`, `isIdentifier`, `identifierMono`) plus one `alignClass()` and one identifier-cell class/props builder that returns the className *and* the `getInteractiveRowProps` spread.
- [ ] Redefine `SettingsColumn<Row>` as the base type and `ListColumn<Row>` as the base plus its sort/width extensions, so neither archetype re-declares the six shared fields.
- [ ] Route both `SettingsTableShell`'s cell loop and `presentations/TableBody`'s cell loop through the shared builder, deleting both private `alignClass` copies.
- [ ] Resolve the divergences explicitly rather than picking one silently: settle the `identifierMono` default (currently opposite in the two archetypes), settle the mono type scale (`text-sm` vs `text-[13px]`), and carry the `align` decision rule from `SettingsColumn`'s JSDoc into the shared type so both contracts key alignment the same way.
- [ ] Make the settings-table identifier cell keyboard-operable via the shared builder — `role="button"`, `tabIndex`, Enter/Space activation, and `interactiveRowFocusRing`.
- [ ] Add a test asserting a `SettingsTableShell` identifier cell is a tab stop and fires `onRowEdit` on Enter and on Space, mirroring the existing list-with-detail coverage.
- [ ] Bump the `list-with-detail` and `settings-table` `version`s in `docs/archetypes/MANIFEST.json`, and reconcile the changed `identifierMono` default / mono scale in `docs/archetypes/settings-table.baseline.md` and `list-with-detail.baseline.md`.

## Acceptance

- `grep -rn "function alignClass" src/components/archetypes` returns exactly one definition.
- The six shared column fields are declared once; `ListColumn` and `SettingsColumn` both resolve to that base plus their own extensions, and `npx tsc --noEmit` passes.
- A test shows the settings-table identifier cell exposes `role="button"` and `tabIndex=0` and calls `onRowEdit` on both Enter and Space — it no longer relies on a mouse.
- Both archetypes' identifier cells render the same mono type scale and honour the same `identifierMono` default, and the chosen value is stated in both `.baseline.md` files.
- `npm test` passes and every table demo in `src/examples/` renders the same rows it did before, apart from the intended identifier-cell corrections.

## Related

- [clickable-rows-keyboard-operability.md](../archive/clickable-rows-keyboard-operability.md) — shipped `getInteractiveRowProps` / `interactiveRowFocusRing`; it reached the list-with-detail copy of the identifier cell and not the settings-table one, which is the cost this extraction removes.
- [refactor-list-state-resolution-helper.md](../archive/refactor-list-state-resolution-helper.md) — the same two shells, the same class of copy-paste, already resolved for the loading/error/empty derivation.
- [list-with-detail-column-filter-hoist.md](../archive/list-with-detail-column-filter-hoist.md) — prior work on `ListColumn`'s surface.
- [src/components/archetypes/shared/interactiveRow.ts](../../src/components/archetypes/shared/interactiveRow.ts) — the keyboard contract the shared builder must apply to both archetypes.
