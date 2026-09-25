---
area: archetypes
opened: '2026-09-25'
status: ready
value: high
model: sonnet
model_reason: "doc + proof update with the fix already measured in brickshop; no design choice left"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-25T12:00:00Z'
---

# Document the Vite dev-server and alias wiring a package consumer needs

## Context

Found in the brickshop-manager cutover to `v0.2.5` (brickshop branch `feat/design-baseline-package-cutover`,
2026-09-25). `docs/PACKAGE.md`'s four wiring lines give a green `vite build` and green `tsc`, but a Vite 8
consumer still breaks in two places the runbook doesn't cover:

1. **Dev server renders a blank page.** Vite pre-bundles `design-baseline/archetypes/*` as a dependency.
   That also inlines a second copy of the package's `ui/` leaves (duplicate React contexts). One chunk
   also imports CJS `react/jsx-runtime` raw, which fails with
   `does not provide an export named 'jsx'`. The fix is `optimizeDeps.exclude: ['design-baseline']`. But an
   excluded package is never crawled, so its Radix/cmdk/react-day-picker imports are then served
   un-bundled and hit the same error. The consumer must also list the package's `dependencies` in
   `optimizeDeps.include`.
2. **The project-first `ui/` array (wiring line 2) is tsconfig-only.** Vite's `resolve.alias` has no
   fallback arrays, and the `@` alias runs before every plugin (including `enforce: 'pre'`). So a consumer
   that deletes its identical `ui/` files gets `UNLOADABLE_DEPENDENCY` on every `@/components/ui/*`
   import. Brickshop needed an alias that skips `components/ui/` plus a small resolver plugin that tries
   the project dir first, then the package.

The greenfield proof matrix never ran `vite dev` and never deleted a `ui/` file, so neither case showed up.

## What to do

- [ ] Add a "Vite consumers" subsection to `docs/PACKAGE.md` wiring with `optimizeDeps: { exclude: ['design-baseline'], include: <package dependencies minus CSS-only tw-animate-css> }` and the reason.
- [ ] Document the Vite side of the project-first `ui/` array: the `@` alias must not match `@/components/ui/`, and a resolver must try `src/components/ui/<name>` before `node_modules/design-baseline/src/components/ui/<name>`. Brickshop's working version is `scripts/lib/design-baseline-ui.ts` (`designBaselineUi` + `designBaselineDeps`) and could ship as a package export.
- [ ] Extend the throwaway proof to run `vite dev` against one archetype page with one deleted identical `ui/` file.

## Acceptance

- A Vite consumer following only `docs/PACKAGE.md` renders an archetype page under `vite dev` with no `jsx-runtime` page error, after deleting an identical `ui/` file.
- `docs/PACKAGE.md` names the `optimizeDeps` exclude/include pair and the alias-order constraint.

## Related

- [archive/archetype-package-consumer-wiring.md](archive/archetype-package-consumer-wiring.md)
- [archive/package-ui-ownership-and-vendored-consumer-runbook.md](archive/package-ui-ownership-and-vendored-consumer-runbook.md)
- [archive/brickshop-manager-package-install-cutover.md](archive/brickshop-manager-package-install-cutover.md)
