---
area: test-gap
opened: 2026-07-19
status: done
---

# DetailOverviewShell has no test despite being the most-changed detail-overview file

## Context

`src/components/archetypes/detail-overview/DetailOverviewShell.tsx` (203 lines) changed in 8 commits over the last 90 days — the highest churn of any file in the `detail-overview` archetype — yet has zero test coverage (no `DetailOverviewShell.test.tsx` exists, unlike sibling shells such as `ListWithDetailShell.test.tsx`, `SettingsTableShell.test.tsx`, `GroupedListShell.test.tsx`, and `MatrixGridShell.test.tsx`).

The component carries real conditional-rendering logic that regressions could easily break silently:
- `surface="separated" | "unified"` picks between two structurally different render trees (the unified branch introduces `UnifiedSurfaceContext.Provider`, rail-divider pseudo-element classes, and a "flattened" main-column class string).
- `layout="vertical" | "rail"` changes the grid structure only inside the unified branch.
- `WIDTH_MAP` / `RHYTHM_MAP` lookups gate on prop values with no fallback guard beyond the `Record` type.
- `headerFill` resolution runs through `useHeaderFill`/`headerFillClasses`, only exercised in the unified header path.

Given this is the shell every detail-overview page archetype instance renders through, a silent regression in the `surface`/`layout` branching would visually break every consumer at once.

## What to do

- [ ] Add `src/components/archetypes/detail-overview/DetailOverviewShell.test.tsx` covering: default (`surface="separated"`) render passes through `header`/`summary`/`stats`/`content`/`references` slots unchanged.
- [ ] Test `surface="unified"` with `layout="vertical"` vs `layout="rail"` renders the expected grid/rail structure and provides `UnifiedSurfaceContext` with `true` only inside the rail slot (not main).
- [ ] Test `width`/`rhythm` props map to the expected `WIDTH_MAP`/`RHYTHM_MAP` classes.
- [ ] Test the unified header renders `headerFill` classes from context when no explicit `headerFill` prop is passed.

## Acceptance

- `DetailOverviewShell.test.tsx` exists and passes under `npm test`.
- Tests fail if the `surface="unified"` branch is accidentally deleted or the `UnifiedSurfaceContext` value is flipped.

## Related

- `src/components/archetypes/detail-overview/DetailSection.tsx` — reads `UnifiedSurfaceContext`, exported from this same file.
- Sibling archetype shells' tests (`ListWithDetailShell.test.tsx`, `SettingsTableShell.test.tsx`) for the project's shell-testing convention.
