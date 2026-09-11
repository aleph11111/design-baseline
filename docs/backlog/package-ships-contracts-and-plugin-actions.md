---
area: archetypes
opened: '2026-09-11'
status: ready
value: high
depends_on: [archetype-baseline-sibling-retire]
model: sonnet
model_reason: "mechanical once the siblings are gone — a files entry, a manifest actions rewrite, and two located doc edits, all with a named target"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-11T00:00:00Z'
roadmap: archetype-convergence
---

# Ship `docs/archetypes/` in the package and re-point the plugin actions at the install

## Context

Phase `donor-docs` of the `archetype-convergence` roadmap, decisions G5/G6
(`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`, section
*Phase donor-docs — retire the mirrors, ship the contract*). `docs-retire`
shipped a promise this ticket pays off: `docs/PACKAGE.md:264` tells a migrated
consumer its `docs/archetypes/<slug>.md` fork is **package**-owned — "Delete."
— while `package.json`'s `files` ships `src/components`, `src/lib`,
`src/hooks`, `src/utils`, `src/styles` and the four methodology docs, and no
`docs/archetypes/` path at all. The row is a false instruction until the
contracts ship, the same defect F3 fixed for the methodology docs one level up.
Separately, `docs/archetypes/MANIFEST.json`'s `plugin.actions` still declares
`/style-baseline` and `/style-archetypes {key}` — the two commands the
`fleet-commands` phase deletes next — so this must land first or the connected
plugin advertises commands that no longer exist. A grep of the hub's `server/`
and `client/src` finds no consumer of `plugin.actions`, and
`designPlugin.ts:21` validates only `key`/`slug`, so the edit breaks no reader.

## What to do

- [ ] Add `docs/archetypes` to `package.json`'s `files` array — the 22
      contracts, `MANIFEST.json` and `README.md`, ~480 KB after the siblings
      are gone (G5).
- [ ] Rewrite `MANIFEST.json`'s `plugin.actions` to the three-entry set in the
      spec: `install-package` (naming `docs/PACKAGE.md`'s runbook),
      `promote-archetype`, `iterate-baseline`. `adopt-baseline` and
      `adopt-archetype` leave the array.
- [ ] Bump `plugin.version` `0.10.2` → `0.11.0` — a break to the `plugin`
      block's shape, which is the bump rule `docs/PLUGIN-CONTRACT.md`'s
      *Versioning* section states (and the two-number split
      `plugin-version-contract-vs-bundle-split` documented).
- [ ] Update `docs/PLUGIN-CONTRACT.md`'s example `actions` block and its
      "A repo IS a design-plugin when it has" item 3 so both match the shipped
      manifest.
- [ ] Correct `docs/PACKAGE.md:264`'s ownership row to name the real successor
      path (`node_modules/design-baseline/docs/archetypes/<slug>.md`).

## Acceptance

- [ ] `npm pack --dry-run` shows every `docs/archetypes/*.md` contract and no
      `docs/ADOPTION*.md`, `docs/FLEET-AUDIT.md` or other `docs/` entry beyond
      the four methodology docs.
- [ ] `node scripts/verify-exports.mjs` still reports 7/7 ok — docs are files,
      not exports, so no invariant moves here.
- [ ] `grep -rn 'style-baseline\|style-archetypes' docs/PLUGIN-CONTRACT.md docs/archetypes/MANIFEST.json`
      returns nothing, and `plugin.version` reads `0.11.0`.
- [ ] The hub reports the plugin `connected: true` against this checkout after
      the manifest edit, so `designPlugin.ts`'s four validation steps still
      pass with the reshaped `actions` and the dropped `reference_impl` keys.
- [ ] Donor gates unchanged: `npx tsc --noEmit` clean,
      `node scripts/lint-design.mjs` 0 errors, `npm run gallery:build` ok.

## Related

- [archetype-baseline-sibling-retire](archetype-baseline-sibling-retire.md) — must ship first: shipping `docs/archetypes/` before the siblings are deleted puts the mirror into every consumer's `node_modules`
- [archetype-convergence.md](archetype-convergence.md) — roadmap, phase `donor-docs`
- [package-doc-retirement-ownership-and-runbook-step.md](archive/package-doc-retirement-ownership-and-runbook-step.md) — wrote the ownership row this ticket makes true
- [package-ships-methodology-docs-single-version-source.md](archive/package-ships-methodology-docs-single-version-source.md) — the `files`-array precedent (F3)
- [plugin-version-contract-vs-bundle-split.md](archive/plugin-version-contract-vs-bundle-split.md) — the two-number split whose bump rule governs `plugin.version`
