---
area: tooling
opened: '2026-08-26'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T04:59:45Z'
model: sonnet
model_reason: >-
  bounded widen of the tsconfig `include` from `src/**/*` to also cover the gallery harness and
  vite configs; the drift it surfaces is already decided by the archetype-convergence design
  (D2: `headerFill` is context-only, no override prop) and ADR 0004 / RULES hard rule 12, so the
  fixes are mechanical (5 context-provider wraps, 1 dead const, add Vite ambient types) with
  clear tsc/test/build gates to verify
---

# Widen the typecheck surface to the gallery harness and fix the drift it exposes

## Context

`tsconfig.json` sets `include: ["src/**/*"]`, so `npx tsc --noEmit` — the donor's stated
verification gate ("strict typecheck, no build") — never checks the gallery harness
(`gallery/`), the vite config, or the vitest config. The `gallery/` harness is the
dashboard-hub-installed surface (see `docs/PLUGIN-CONTRACT.md`) and now contains real,
tested logic in `gallery/registry.ts` (the MANIFEST-derived demo registry) and
`gallery/registry.test.tsx`, none of which is typechecked. `npm run gallery:build` builds it
fine because Vite/esbuild transpile without typechecking — but a type error or a wrong prop
in the gallery silently ships to the hub.

Surfacing that surface is already known to be non-clean. During
`refactor-gallery-demo-registry-derive-from-manifest` (which added `gallery/registry.ts`
using `import.meta.glob`), probing `include: ["src/**/*", "gallery/**/*", "vite.config.ts",
"vitest.config.ts"]` produced exactly eight errors and was reverted so that ticket left the
typecheck surface unchanged:

- `gallery/Gallery.tsx(35,7) TS6133` — `REPO` is declared but never read (dead const left
  over from an earlier spec-links attempt).
- `gallery/layout-demos.tsx(579, 585, 591, 604, 615) TS2322` — five sites in the
  `SurfaceHeaderDemo` pass `headerFill="solid" | "tint" | "white"` directly to
  `<SurfaceHeader …/>`, but `SurfaceHeaderProps` has no such prop. The `headerFill` override
  was intentionally deleted from `SurfaceHeader` by the archetype-convergence design
  (`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`, decision D2) and RULES
  hard rule 12 (appearance locality: a context axis carries **no** override prop; the only
  channel is `<AppShell headerFill=…>` → `HeaderFillContext` → `useHeaderFill()`). After that
  change these five props are silently ignored, so the demo's three `SurfaceHeader` fill
  variants all render with the default `solid` context — the drift is not just a type error,
  it is a demo that is not showing what its labels claim.
- `gallery/registry.ts(33,33)` and `gallery/registry.test.tsx(40,33) TS2339` — `Property
  'glob' does not exist on type 'ImportMeta'`. Once `gallery/**/*` is included, the Vite
  ambient types (which declare `import.meta.glob`/`import.meta.env`) are not in the program.

These are all pre-existing or mechanical, none is a design fork: D2/ADR 0004 already fix what
the `headerFill` demo site must become, and the Vite ambient-types gap is a one-line tsconfig
matter.

## What to do

- [ ] Add the gallery harness and configs to the typecheck surface: widen `tsconfig.json`
  `include` to `["src/**/*", "gallery/**/*", "vite.config.ts", "vitest.config.ts"]` (keep the
  existing `exclude` list).
- [ ] Bring the Vite ambient types into the program so `import.meta.glob` / `import.meta.env`
  typecheck in the newly included `gallery/registry.ts` and `gallery/registry.test.tsx` —
  either a `/// <reference types="vite/client" />` file picked up by the widened include (e.g.
  `gallery/vite-env.d.ts`) or an explicit `"types": [ …, "vite/client" ]` entry that also keeps
  the other required globals. Do not reduce the global type surface by narrowing the `types`
  array.
- [ ] Remove the dead `REPO` const at `gallery/Gallery.tsx:35` (it is unused; the comment
  about repo-relative spec links can collapse to nothing if nothing else references it).
- [ ] Fix the five `headerFill` sites in `gallery/layout-demos.tsx` (`SurfaceHeaderDemo`,
  lines ~579/585/591/604/615) by the D2-consistent channel: wrap each `<SurfaceHeader …>` in a
  `HeaderFillContext.Provider value="solid"|"tint"|"white">` (already exported from
  `@/components/layout`) so the demo shows its three distinct fills. Do **not** re-add a
  `headerFill` prop to `SurfaceHeader` — that is the exact escape-hatch defect the
  convergence design and RULES hard rule 12 remove.
- [ ] Leave `src/**/*` untouched (its typecheck surface and gate are unchanged); the only
  allowed behavioral diff is the `SurfaceHeaderDemo` now rendering its labelled fills.

## Acceptance

- `npx tsc --noEmit` passes with the widened `include` (previously it only covered
  `src/**/*`); the eight errors above no longer appear.
- `npm test` passes (`gallery/registry.test.tsx` still green — the new ambient types must not
  break the jsdom test) , and `npm run gallery:build` succeeds.
- In the built gallery, the `SurfaceHeaderDemo` route shows three visually distinct header
  fills (solid/tint/white), matching its labels, instead of three `solid` bars.
- `grep -n 'headerFill="' gallery/layout-demos.tsx` shows no `headerFill` passed as a prop to
  `SurfaceHeader` (only `HeaderFillContext.Provider` values remain); `grep -n 'REPO'
  gallery/Gallery.tsx` is empty.
- Adding `gallery/**/*` to `include` surfaces **no** new errors from `src/**/*` (the surface
  is a strict superset; verify a clean second run).

## Related

- [`refactor-gallery-demo-registry-derive-from-manifest.md`](wip/refactor-gallery-demo-registry-derive-from-manifest.md) — surfaced this while probing the tsconfig surface (deliberately reverted out of that ticket).
- `docs/superpowers/specs/2026-08-17-archetype-convergence-design.md` — decision D2: the `headerFill` override prop is deleted; `HeaderFillContext` is the only channel.
- `docs/RULES.md` — hard rule 12 (appearance locality): a context axis carries no override prop.
- [`archetype-convergence-appearance-prop-lint.md`](../archive/archetype-convergence-appearance-prop-lint.md) — sibling drift finding: a lint that polices exactly the escape-hatch a `headerFill` prop would create.
