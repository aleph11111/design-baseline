---
area: archetypes
opened: 2026-07-11
status: ready
model: sonnet
model_reason: mechanical follow-on to an already-landed pattern (SurfaceHeaderSlot) — no design decisions left, just apply the same substitution to one more shell.
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-11T07:59:39Z
---

# Migrate WizardShell's on-surface header onto the shared SurfaceHeaderSlot

## Context

`refactor-shell-surface-header-slot-duplication` added `SurfaceHeaderSlot` (`src/components/layout/SurfaceHeaderSlot.tsx`) — a shared component + `SurfaceHeaderSlotProps` type that centralizes the `title !== undefined` guard and the `kicker`/`title`/`headerActions`/`headerFill` prop bag, and migrated it into all eleven shells that had the full four-prop bag (matched by `grep -rln headerActions src/components`). `WizardShell` (`src/components/archetypes/import-wizard/WizardShell.tsx`) was out of scope for that sweep because it only declares three of the four props — `kicker`, `title`, `headerFill` (no `headerActions`, see `WizardShellProps` around line 33-38) — so it didn't match the scoping grep. It still hand-declares those three props with their own JSDoc and hand-rolls `title !== undefined && (<SurfaceHeader kicker={kicker} title={title} actions={undefined} headerFill={headerFill} />)` around line 101-108, the same guard shape the other eleven shells used to have.

## What to do

- [ ] Replace WizardShell's inline `kicker`/`title`/`headerFill` prop declarations with `Omit<SurfaceHeaderSlotProps, "headerActions">` (or the full `SurfaceHeaderSlotProps` if a future `headerActions` slot turns out useful there too), matching the intersection pattern used by the eleven already-migrated shells.
- [ ] Replace the inline `title !== undefined && <SurfaceHeader .../>` block with `<SurfaceHeaderSlot kicker={kicker} title={title} headerFill={headerFill} />`.
- [ ] Keep the change contract-preserving: no consumer-facing prop rename, no import churn for consumers of `WizardShell`.

## Acceptance

- `grep -n "<SurfaceHeader " src/components/archetypes/import-wizard/WizardShell.tsx` no longer matches — the shell renders through `SurfaceHeaderSlot`, same as the other eleven framed shells.
- `npx tsc --noEmit` passes and `src/examples/import-wizard-demo.tsx` renders unchanged.
- `npm test` passes with no new failures.

## Related

- [refactor-shell-surface-header-slot-duplication.md](wip/refactor-shell-surface-header-slot-duplication.md) — added `SurfaceHeaderSlot` and migrated the other eleven shells; this ticket finishes the sweep.
- `src/components/layout/SurfaceHeaderSlot.tsx` — the shared slot this shell should adopt.
