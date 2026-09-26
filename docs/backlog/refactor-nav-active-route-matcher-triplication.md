---
area: refactor
opened: '2026-09-26'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-26T20:28:32.843Z'
value: normal
model: sonnet
model_reason: >-
  mechanical extraction of one pure helper plus an item-type alias with a deprecated flag name; no
  design choice left
---

# Share one active-route matcher across the three nav primitives

## Context

The three layout nav primitives each declare their own private, near-identical `isPathActive(pathname, item)`:

- `src/components/layout/Sidebar.tsx:87` in `AppSidebar`, keyed on `NavItem.exact`
- `src/components/layout/SectionNav.tsx:43` in `SectionNavShell`, keyed on `NavItem.exact`
- `src/components/layout/BottomNav.tsx:47` in `BottomNav`, keyed on `BottomNavItem.end`

All three bodies are the same line for line. `/` matches only itself, an exact-flagged item matches only
itself, and anything else matches itself or a `path + "/"` prefix.

The item types have forked as well. `BottomNavItem` (`BottomNav.tsx:14`) re-declares `NavItem`'s `path` /
`title` / `icon` fields, and it calls the exact-match flag `end` (react-router's name) where `NavItem` calls
it `exact`. A project that builds its sidebar and its mobile bottom bar from one route list therefore has
to rename `exact` ↔ `end` on every item. `BottomNav`'s own JSDoc says its `renderLink` "mirrors the
`renderLink` contract on `<AppSidebar>` / `<SectionNavShell>` so a project wires every nav the same way",
but the item shape underneath doesn't match.

Active-route matching is a behaviour rule (trailing slashes, query strings, a basename prefix). Any future
fix to it has to land three times, and a copy that gets missed shows up as one nav highlighting a
different item than the others for the same URL.

## What to do

- [ ] Extract one exported `isNavPathActive(pathname, item)` into a small layout module (e.g. `src/components/layout/navMatch.ts`), and delete the three private copies in `Sidebar.tsx`, `SectionNav.tsx` and `BottomNav.tsx`.
- [ ] Make `BottomNavItem` an alias of `NavItem` (or an extension of it) so `path` / `title` / `icon` are declared once.
- [ ] Keep `exact` as the canonical flag, and accept `end` on `BottomNavItem` as a `@deprecated` alias that the shared matcher still reads, so no current consumer breaks.
- [ ] Add a unit test for the shared matcher covering root, exact, prefix and a sibling-prefix non-match (`/orders` must not activate for `/orders-archive`).

## Acceptance

- `grep -rn "function isPathActive" src/components/layout` returns no match, and `Sidebar.tsx`, `SectionNav.tsx` and `BottomNav.tsx` all import the one shared matcher.
- One `NavItem[]` route list renders in both `<AppSidebar>` and `<BottomNav>` with no per-item field renaming, and both highlight the same item for the same `pathname`.
- The new matcher test passes, and the existing `Sidebar.test.tsx` / `BottomNav.test.tsx` pass unchanged.
- `npx tsc --noEmit` passes, and a consumer that still passes `end` still gets exact matching.

## Related

- [src/components/layout/BottomNav.tsx](../../src/components/layout/BottomNav.tsx) — the forked `BottomNavItem` and its `end` flag.
- [src/components/layout/Sidebar.tsx](../../src/components/layout/Sidebar.tsx) — the `NavItem` type the others should share.
- [archive/refactor-identifier-cell-column-config-duplication.md](archive/refactor-identifier-cell-column-config-duplication.md) — the same "two private copies of one rule drift apart" pattern, resolved for table columns.
