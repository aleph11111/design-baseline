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
  graded_at: '2026-08-25T10:49:12.308Z'
model: sonnet
model_reason: >-
  single-file structural split with an established in-repo precedent (list-with-detail's
  presentations/ dir) and existing demo coverage to diff against; behaviour-preserving
---

# Split MatrixGridShell's nested cell and header logic into its own presentation components

## Context

Severity: **medium** (complexity / deep nesting). `MatrixGridShell` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx`) is 276 lines of which a single JSX expression spans lines 131–258, and the whole grid renders inside one function with no intermediate seams. The inner cell block (`MatrixGridShell.tsx:204-256`) sits four levels deep — `<tbody>` → `rows.map` → `columns.map` → the cell body — and packs seven interacting decisions into ~60 lines of one arrow function:

- fill resolution (`isFilledFn(cell)`), context construction, `cellStyle(ctx)` invocation, conditional `renderCell(ctx)`
- clickability (`activate`) and its three consequences (cursor classes, focus ring, `getInteractiveRowProps`)
- a three-way tooltip discrimination — none / plain-text via the native `title` attribute / rich via Radix
- hover-key state (`hoveredCellKey`) threaded through `onMouseEnter` / `onMouseLeave` closures compared against a composed `${rowKey}::${col.key}` string
- a late `if (isRichTooltip && hoveredCellKey === cellKey)` that re-wraps the already-built `td` in `<Tooltip><TooltipTrigger asChild>`, so the element is constructed once and conditionally re-parented

The single-shared-Tooltip design is deliberate and correct (the comment at `MatrixGridShell.tsx:110` explains why a per-cell Radix root is unaffordable in a dense R×C matrix), but it is the reason the cell carries hover state, which is exactly the logic that most wants to be its own component and its own test. There is currently no `MatrixGridShell.test.tsx` at all, and testing the plain-vs-rich tooltip branch or the keyboard activation path means driving the whole grid.

The banded header is a second seam: `hasAnyGroup` plus the `groupSpans` accumulation loop (`MatrixGridShell.tsx:118-127`) and the two `<tr>`s it feeds (`:145-181`) are a self-contained column-merging concern with no dependency on rows or cells. The body's `{emptyState ? emptyState : (<table>…)}` ternary also wraps 120 lines and leaves its closing `)}` mis-indented at the outer level, which is the readability tell.

The repo already has the shape for this fix: `src/components/archetypes/list-with-detail/presentations/` holds `TableBody`, `CardGridBody` and `ActionRowBody` as separate files behind a shell that only routes to them.

## What to do

- [ ] Add `src/components/archetypes/matrix-grid/MatrixCell.tsx` taking the resolved `MatrixCellContext`, the `cellStyle` result, the activate handler, and the shared hover-key state, and owning the tooltip discrimination and the `td` construction.
- [ ] Add `src/components/archetypes/matrix-grid/MatrixGridHead.tsx` owning `hasAnyGroup`, the `groupSpans` merge loop, and both header rows.
- [ ] Reduce `MatrixGridShell` to the frame, the `toolbar` / `emptyState` routing, the shared hover state, and the two `map`s — flattening the 120-line `emptyState` ternary with an early return for the empty case.
- [ ] Keep the single-shared-Tooltip behaviour exactly as documented at `MatrixGridShell.tsx:110`: one Radix root mounted only for the hovered cell, plain-text tooltips still on the native `title` attribute.
- [ ] Add `MatrixGridShell.test.tsx` covering the three tooltip modes (absent / plain `title` attribute / rich Radix content on hover), keyboard activation of a clickable cell via `getInteractiveRowProps`, and the group-merge spans for adjacent same-group columns.
- [ ] Keep `MatrixGridShellProps` and the generic-preserving export cast unchanged, and bump the `matrix-grid` `version` in `docs/archetypes/MANIFEST.json`.

## Acceptance

- `MatrixGridShell.tsx` no longer contains the cell body or the group-merge loop; each lives in its own file and the shell's longest JSX expression is under ~40 lines.
- A new `MatrixGridShell.test.tsx` asserts a plain-string tooltip renders as a `title` attribute with no Radix root in the tree, and that a rich tooltip mounts exactly one Radix root when a cell is hovered.
- The test shows a clickable cell exposes `role="button"` and fires `onCellClick` on Enter and Space.
- `matrix-grid-demo.tsx` renders the same grid, groups, tooltips and click behaviour as before the split.
- `npx tsc --noEmit` and `npm test` pass, and `MatrixGridShellProps` is unchanged so no consumer needs an edit.

## Related

- [list-with-detail-shell-presentation-split.md](../archive/list-with-detail-shell-presentation-split.md) — the precedent: the same shell-routes-to-presentation split, already applied to archetype A.
- [matrix-grid-per-cell-tooltip-perf.md](../archive/matrix-grid-per-cell-tooltip-perf.md) — the ticket that introduced the shared-Tooltip + hover-key design this split must preserve.
- [ship-stranded-matrix-grid-tooltip-branch.md](../archive/ship-stranded-matrix-grid-tooltip-branch.md) — the stranded branch from that work; a tested cell component is what keeps the next attempt landable.
- [src/components/archetypes/list-with-detail/presentations/TableBody.tsx](../../src/components/archetypes/list-with-detail/presentations/TableBody.tsx) — the file layout to mirror.
