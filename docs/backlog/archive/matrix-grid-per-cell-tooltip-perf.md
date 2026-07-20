---
area: archetypes
opened: 2026-07-04
status: done
model: sonnet
model_reason: scoped shared-tooltip refactor with a clear performance acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Stop MatrixGridShell mounting one Radix Tooltip per cell in dense grids

## Context

Severity: **medium** (performance). When `cellStyle` returns a `tooltip`, `MatrixGridShell` wraps every cell in its own Radix `<Tooltip>` Root (Tooltip/TooltipTrigger/TooltipContent) at `src/components/archetypes/matrix-grid/MatrixGridShell.tsx:247` and `:249`. The matrix-grid archetype explicitly models dense R×C matrices (its own demo builds a gradebook of students × subjects with a per-cell tooltip), so a 50×20 matrix mounts ~1000 tooltip provider subtrees, each with its own state/listeners/portal — heavy mount cost, memory, and re-render surface for a feature that only ever shows one tooltip at a time. This ships in a donor archetype meant to back real data grids.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) rendering an N×M matrix with per-cell tooltips and asserting only one Tooltip Root (or zero, for the `title`-attribute path) is mounted regardless of cell count; then make it pass.
- [ ] Render a single shared Tooltip driven by the hovered cell — track the hovered cell in state and position one `TooltipContent` — instead of one `<Tooltip>` per cell (`MatrixGridShell.tsx:247-249`).
- [ ] For plain-text tooltips, fall back to a native `title` attribute; reserve the full Radix Tooltip only for rich content.

## Acceptance

- A rendered N×M matrix mounts at most one Tooltip Root regardless of cell count — no longer O(cells) tooltip subtrees.
- Hovering a cell still shows its tooltip content unchanged.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [matrix-grid-page-header-inconsistency.md](matrix-grid-page-header-inconsistency.md) — same matrix-grid shell
- docs/archetypes/matrix-grid.md — the dense-matrix archetype contract
