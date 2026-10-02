---
area: archetype-rollout
opened: '2026-10-02'
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-02T00:00:00Z'
---

# SettingsTableShell row checkbox labels are identical when the identifier cell is JSX

## Context

`SettingsTableShell.resolveRowSelectLabel` ([src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx)) ships a per-row accessible name for the bulk-selection checkbox by default, but only when the `isIdentifier` column's `cell` returns a plain `string`/`number` — then it renders `Select row: {cell}`. The PR that fixed the "every checkbox announces identical Select row" defect merged in #424 (ticket `archetype-rollout-settings-table-bulk-selection-outlives-filter`); this finding is the residual edge the shell's tests codify: the shell test block "a JSX identifier cell falls back to the flat default" proves that a consumer whose identifier cell returns a React element (a styled name span, a link, an icon+label row) still gets the flat default `"Select row"` on **every** row checkbox — the same assistive-tech defect #424 fixed, just undetected for that class of consumer because no override is discoverable from the rendered output. Today the only way out is the documented `labels.selectRow: (row) => string` function override, which a consumer has to know to reach for.

## What to do

- [ ] Before editing, grep every caller of `resolveRowSelectLabel` / every read site of `labels.selectRow`; fix at the shared point in `SettingsTableShell.tsx`, not only the one path this report names.
- [ ] Give the shell a way to recover a meaningful per-row name when the identifier cell is not a primitive — e.g. a `getRowLabel?: (row: Row) => string` prop (mirroring the `getRowId` naming the shell already uses) that becomes the default-label source when `identifierCol.cell(row)` is a non-primitive, falling back to the existing `"Select row"` only when neither yields text.
- [ ] Surface the silent fallback instead of hiding it — a dev-time warning (guarded to dev / dev-only) when the flat fallback is used for more than one row, naming the `labels.selectRow` escape hatch — so a consumer with a JSX identifier column discovers the gap instead of shipping it.
- [ ] Update `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` (the JSX-fallback block) and, if the demo's identifier cell ever becomes non-primitive, `src/examples/settings-table-demo.*`.

## Acceptance

- With two rows whose identifier cell returns a React element and no `labels.selectRow` override, every row checkbox no longer matches the flat default `"Select row"` — the new prop drives distinct, non-duplicate accessible names, asserted via `getByRole("checkbox", { name: … })` on each row's label.
- The shell's locale behavior is unchanged: a fixed-string `labels.selectRow` override still replaces the default on every row (existing `locale-overrides` assertions hold).
- No row checkbox accessible name ever contains the literal `[object Object]`, across primitive, JSX, and override call sites.

## Related

- [[archetype-rollout-settings-table-bulk-selection-outlives-filter]] — #424, which fixed the all-checkboxes-share-one-name defect and codified this JSX fallback as a test rather than closing it.
- [[archetype-rollout-table-row-selection-not-exposed-to-assistive-tech]] — the settings-table a11y lane this belongs to.
- [src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx) — `resolveRowSelectLabel`, `SettingsTableLabels.selectRow`.
- PR #424 — https://github.com/aleph11111/design-baseline/pull/424 (merge commit carrying the fix this follow-up extends).

## Open question

Mechanism — a `getRowLabel` prop, a dev-mode warning, or both? This ticket was captured headless from a review-gate follow-up (no author available to confirm at capture time). **Resolved at capture time to "both"**, per the review gate's original finding ("A `getRowLabel` prop or a dev-mode warning would close it"); the prop is the Recommended default because it mirrors the existing `getRowId` naming and gives consumers a direct escape hatch, and the warning is cheap insurance for consumers who never read the JSDoc. Both bullets in *What to do* stand independently; drop either during `/feat` if the implementer judges it out of scope, but the property that a JSX identifier cell stops shipping identical names (Acceptance bullet 1) is the non-negotiable one.
