---
area: archetypes
opened: 2026-07-04
status: ready
model: sonnet
model_reason: memoized-Set swap on a shared shell, mechanical with clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Replace SettingsTableShell per-row selectedIds scan with a memoized Set

## Context

Severity: **low** (performance). `SettingsTableShell` keeps `selectedIds` as a plain `string[]` (`src/components/archetypes/settings-table/SettingsTableShell.tsx:79`) and scans it with `.includes()` once per row inside the render map (`selectedIds.includes(rowId)` at `:276`), plus the header `allSelected` does `allIds.every((id) => selectedIds.includes(id))` (`:156`) and `handleBulkDelete` scans per row (`:180`). All are O(rows × selected). The worst case is the common one — after "select all", `selectedIds` is every row id, so each subsequent render pays a full O(n²) sweep. It's a shared donor shell copied into every settings surface. (Confirmed real; severity low — settings tables are typically tens of rows, so real-world impact is modest, but the fix is trivial and the O(n²) pattern is a bad reference for a copied shell.)

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) that renders the shell with all rows selected and asserts row-selection lookups go through a Set (e.g. via a spy/behavioral check that membership is O(1)); then make it pass. (Or a focused unit test on an extracted `isSelected` helper.)
- [ ] Build `const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])` once and use `selectedSet.has(rowId)` in the row map (SettingsTableShell.tsx:276), the `allSelected` computation (`:156`), and `handleBulkDelete` (`:180`).

## Acceptance

- Row/header selection membership is computed via a memoized `Set` (O(1) per lookup); the per-render cost is O(rows) not O(rows × selected).
- Selection/bulk-delete behavior is unchanged.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [list-with-detail-column-filter-hoist.md](list-with-detail-column-filter-hoist.md) — sibling shell render-cost cleanup
- docs/archetypes/settings-table.md — the settings-table archetype contract
