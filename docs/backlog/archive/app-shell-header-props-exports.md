---
area: layout
opened: 2026-07-04
status: done
model: sonnet
model_reason: export two prop types + add to barrel, mechanical with clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Export AppShellProps and AppHeaderProps to match every other layout primitive

## Context

Severity: **low** (DX / API consistency). Every other public layout primitive both declares its props as an exported `export type XxxProps = {...}` and re-exports that type from the barrel (`PageHeaderProps`, `SectionCardProps`, `StatTileProps`, `SurfaceHeaderProps`, `AppSidebarProps`, etc. in `src/components/layout/index.ts`). `AppShell` and `AppHeader` break the pattern twice: they declare their props inline/unnamed (`src/components/layout/AppShell.tsx:8`, `src/components/layout/Header.tsx:5`) and the barrel (`index.ts:1,3`) exports only the components, not the prop types. So an adopter cannot import `AppShellProps`/`AppHeaderProps` to type a wrapper, extend props, or annotate a render prop — an inconsistency in a donor surface meant to be extended.

## What to do

- [ ] Do red/green verification: add a failing check (a `.ts` type-probe compiled by `npx tsc --noEmit`, or a `vitest` type test) importing `{ AppShellProps, AppHeaderProps } from "@/components/layout"` — currently a type error; then make it compile.
- [ ] Convert both to named exported prop types: `export interface AppShellProps` / `export interface AppHeaderProps` (or `export type`) in AppShell.tsx:8 and Header.tsx:5.
- [ ] Add `type AppShellProps` and `type AppHeaderProps` to the barrel exports in `src/components/layout/index.ts:1,3`, matching the rest of the layout surface.

## Acceptance

- `import type { AppShellProps, AppHeaderProps } from "@/components/layout"` compiles; the two primitives match every sibling's exported-props convention.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, no new TypeScript errors, lint warnings, or test failures.

## Related

- [shell-header-actions-prop-naming.md](shell-header-actions-prop-naming.md) — sibling layout/archetype API-consistency gap
- src/components/layout/index.ts — the barrel to align
