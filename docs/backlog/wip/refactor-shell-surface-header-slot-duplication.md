---
area: refactor
opened: 2026-07-11
status: ready
model: sonnet
model_reason: contract-preserving extraction of a repeated prop-set + render block across many shells; the target seam (SurfaceHeader/SurfaceHeaderProps) already exists, no design decisions left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-11T00:00:00Z
---

# Extract the repeated on-surface-header prop quadruple and conditional render into a shared shell slot

## Context

Severity: **medium** (DRY / primitive obsession). Eleven framed archetype shells each independently re-declare the identical four-prop "on-surface header" bag — `kicker`, `title`, `headerActions`, `headerFill` — with near-identical JSDoc, and then each repeats the same conditional render block:

```tsx
{title !== undefined && (
  <SurfaceHeader kicker={kicker} title={title} actions={headerActions} headerFill={headerFill} />
)}
```

The four props appear together in `SettingsTableShell.tsx` (`src/components/archetypes/settings-table/SettingsTableShell.tsx:98-105`), `MatrixGridShell.tsx:69-76`, `ListWithDetailShell.tsx:264-271`, `GroupedListShell.tsx:26-32`, plus `FormPageShell`, `FeedShell`, `BoardShell`, `DashboardShell`, `SettingsPageShell` (tabbed-settings), `CalendarShell`, and `ReportShell` (11 shells total per `grep -rln headerActions src/components`). `SurfaceHeader` already owns the header treatment and even exports a `SurfaceHeaderProps` type (`src/components/layout/SurfaceHeader.tsx:6`), but callers do not reuse it — they hand-copy the prop set (renaming `actions` → `headerActions`) and the guard. This is textbook primitive obsession: four loose `ReactNode`/`HeaderFill` primitives threaded together through every shell, and a copy-pasted render guard, so any change to the on-surface-header contract (a new slot, a different empty-title rule) must be edited in eleven places and will drift. It also subsumes two narrower open tickets that only patch symptoms of this same duplication.

## What to do

- [ ] Add a shared header slot to the layout layer: either a `SurfaceHeaderSlot` component that renders the `title !== undefined` guard + `<SurfaceHeader>` internally, or a reusable `SurfaceHeaderSlotProps = Pick<SurfaceHeaderProps, "kicker" | "title" | "headerFill"> & { headerActions?: React.ReactNode }` type the shells spread.
- [ ] Refactor the eleven framed shells to consume the shared slot instead of re-declaring the four props and the conditional `<SurfaceHeader>` block, so the on-surface-header contract lives in exactly one place.
- [ ] Keep the change contract-preserving: no consumer-facing prop rename beyond what `shell-header-actions-prop-naming` already mandates (`actions` → `headerActions`), no import churn for consumers.
- [ ] Add a red/green test (`vitest` + `@testing-library/react`) asserting a representative shell renders its header through the shared slot (shared `data-slot="surface-header"` present) and omits it when `title` is undefined.
- [ ] Bump the affected archetype `version`s in `docs/archetypes/MANIFEST.json` so consumers adopt via `/promote-archetype --update`.

## Acceptance

- `grep -rn "title !== undefined" src/components/archetypes` no longer shows each shell hand-rolling the `<SurfaceHeader>` guard; the guard lives in one shared slot.
- The four header props are declared once (a shared type), not re-declared in eleven shells; a new on-surface-header slot can be added by editing one file.
- `npx tsc --noEmit` passes and every archetype demo in `src/examples/` renders unchanged.
- Meets the quality bar: SOLID/DRY/KISS, no new TypeScript errors, lint warnings, or test failures.

## Related

- [shell-header-actions-prop-naming.md](archive/shell-header-actions-prop-naming.md) — the `actions` → `headerActions` rename this extraction should land on top of (prerequisite).
- [surface-header-compose-not-copy.md](archive/surface-header-compose-not-copy.md) — sibling "compose SurfaceHeader, don't re-declare its bar".
- `src/components/layout/SurfaceHeader.tsx` — owns `SurfaceHeaderProps`, the type the shells should reuse.
