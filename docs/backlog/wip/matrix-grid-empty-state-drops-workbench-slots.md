---
area: archetypes
opened: 2026-11-08
status: ready
value: normal
model: sonnet
model_reason: "cause established at one site (early return in MatrixGridShell); follows the v0.30.0 column pattern"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-08T02:30:00Z
---

# MatrixGridShell emptyState early return drops body and dock slots

## Context

In `src/components/archetypes/matrix-grid/MatrixGridShell.tsx` (line ~171 on origin/main), a set `emptyState` makes the shell return `PageFrame` with only `emptyState`. That return skips the v0.30.0 workbench slots `body` (config panel, read-only preview matrices) and `dock` (summary) from ADR-0013, and they disappear without warning. Repro: render `MatrixGridShell` with `rows={[]}`, `emptyState={<StateView … />}`, `body={<ConfigPanel />}` and `dock={<Summary />}`. Only the empty state renders. Impact: controlling-app `workspace/planung` with no plan lines yet loses the `BSPlanConfigPanel` it needs to bootstrap the plan. Found by the ship review gate on PR #704.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `MatrixGridShell`, render `emptyState` in place of the grid only: keep it inside the same grid / `body` / `dock` column the v0.30.0 change introduced, so `body` and `dock` still render below it. With no `body` and no `dock`, the empty-state DOM stays unchanged.
- [ ] Add a unit test in `MatrixGridShell.test.tsx`: `emptyState` plus `body` plus `dock` renders all three, in order.
- [ ] Contract `docs/archetypes/matrix-grid.md`, Layer 5 "Workbench satellites": state that `body` and `dock` stay visible when the grid shows its empty state. Bump the version log, MANIFEST and the package patch version, with a CHANGELOG entry.

## Acceptance

- With `emptyState`, `body` and `dock` all set, the shell renders the empty state, then `body`, then `dock`.
- With `emptyState` set and neither `body` nor `dock`, the rendered DOM is unchanged from v0.30.0, and the existing empty-state tests pass.
- No other early return in `MatrixGridShell` drops `body` or `dock`: every render path that shows the frame also renders both slots when they are passed.

## Related

- [[archetype-gap-planning-workbench]]: shipped the `body` / `dock` slots (v0.30.0)
- [ADR-0013](/docs/adr/0013-matrix-grid-workbench-body-dock.md): planning workbench is matrix-grid with `body` and `dock` slots
- [matrix-grid contract](/docs/archetypes/matrix-grid.md)
