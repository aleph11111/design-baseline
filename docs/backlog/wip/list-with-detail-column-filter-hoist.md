---
area: archetypes
opened: 2026-07-04
status: ready
model: sonnet
model_reason: loop-invariant hoist in one shell, mechanical with clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Hoist the loop-invariant column filter out of ListWithDetailShell row map

## Context

Severity: **low** (performance). In the card-grid and action-row presentations, `ListWithDetailShell` derives the non-identifier columns inside the per-row `rows.map(...)` body: `columns.filter((c) => c !== idCol)` (card-grid, `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:356`) and `columns.filter((c) => c !== idCol).slice(0, 2)` (action-row, `:381`). Both `idCol` (computed once at `:325`) and `columns` (a prop) are loop-invariant, so this allocates a fresh, identical filtered array for every row on every render — O(rows × columns) throwaway allocations with zero benefit. It's a reference archetype shell meant to be copied, so the wasteful pattern propagates.

## What to do

- [ ] Do red/green verification: add a failing check (introduce `vitest`; the repo is typecheck-only today) or an extracted-helper unit test proving the secondary-column list is computed once per render, not per row; then make it pass. (At minimum, a code-level assertion that the `.filter` no longer sits inside `rows.map`.)
- [ ] Hoist `const secondaryColumns = columns.filter((c) => c !== idCol)` (and its `.slice(0,2)` variant) above the `rows.map` and reference it inside the loop (ListWithDetailShell.tsx:356, 381).

## Acceptance

- The non-identifier column list is computed once per render and reused across rows; no `columns.filter(...)` remains inside `rows.map`.
- Rendered output is unchanged.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [list-with-detail-forwardref-dropped.md](list-with-detail-forwardref-dropped.md) — same shell, separate defect
- [settings-table-selected-set-perf.md](settings-table-selected-set-perf.md) — sibling shell render-cost cleanup
