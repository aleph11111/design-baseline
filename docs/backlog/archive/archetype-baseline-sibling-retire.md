---
area: archetypes
opened: '2026-09-11'
status: done
value: high
model: opus
model_reason: "per-archetype salvage judgement — deciding which sibling prose the types and demo already carry is design reading, not a mechanical delete"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-11T00:00:00Z'
roadmap: archetype-convergence
---

# Retire the 22 archetype `.baseline.md` reference-implementation siblings

## Context

Phase `donor-docs` of the `archetype-convergence` roadmap, decisions G2/G3/G4
(`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`, section
*Phase donor-docs — retire the mirrors, ship the contract*). Every archetype in
`docs/archetypes/` ships as a pair: the stack-agnostic contract `<slug>.md` and
the baseline reference implementation `<slug>.baseline.md`. Read end to end, a
sibling is the shipped code retyped — `skeleton-loader.baseline.md:26-31` is
three `<ListSkeleton …/>` call forms the gallery demo renders live and the prop
types already declare. The split's own cited justification (`docs/RULES.md:9`
rule-2 *Why*, `docs/archetypes/README.md:18`, `docs/ARCHITECTURE.md:113`) is
stack-agnostic fit-scoring via `docs/FLEET-AUDIT.md`, which the same phase
retires, and its beneficiary is measured zero: every fleet repo carrying
archetypes runs the baseline stack (hk-crm `tailwind ^4` + 16 `@radix-ui`,
brickshop-manager `^4.3.3` + 18). No dashboard code reads `reference_impl`, and
`designPlugin.ts:21` validates only `key`/`slug`, so the connector is
unaffected. After `warn-drain` all 22 archetypes are closed, so the component's
props are the binding.

## What to do

- [ ] Per archetype, salvage the residue a sibling carries that the prop types
      and the `src/examples/<slug>-demo.tsx` demo do not — a role→primitive
      decision such as `StateView` rendering `loadingSkeleton` verbatim — into
      the primitive's JSDoc or its demo, never into the contract (G3; keeps
      `docs/RULES.md` rule 3 intact).
- [ ] Delete all 22 `docs/archetypes/*.baseline.md` files (133 KB).
- [ ] Rewrite `docs/RULES.md` rule 2 to "one contract + the exported
      component" (MANIFEST keeps `spec` + `primitives_dir`); leave rule 3
      byte-identical.
- [ ] Replace each contract's head *Reference implementation* blockquote
      (e.g. `calendar.md:38`, `raw-input.md:33`) with one line naming the
      package import path for that archetype's primitives; move
      `grouped-list.baseline.md:56`'s delegation into `grouped-list.md`.
- [ ] Drop `reference_impl` from every `docs/archetypes/MANIFEST.json`
      archetype entry.
- [ ] Grow `scripts/verify-manifest-versions.mjs` with the guard — no
      `reference_impl` key, no `docs/archetypes/*.baseline.md` file — and test
      it in both directions, mirroring the `methodology[].version` guard that
      `package-ships-methodology-docs-single-version-source` added.
- [ ] Update the located doc-set references: `docs/archetypes/README.md`
      `:16,18,174,186`; `docs/ARCHITECTURE.md` `:44,63,111,113,133`;
      `CLAUDE.md` `:25,49,58`; `docs/PLUGIN-CONTRACT.md` `:37,47`.
- [ ] File the `coding-dashboard` edit so `/promote-archetype`
      (`fleet/commands/promote-archetype.md` steps `:386`, `:448`, `:657`,
      `:675`, manifest writer `:555`, `:713-725`) stops authoring siblings —
      executed from a coding-dashboard session, not here (G1).

## Acceptance

- [ ] `ls docs/archetypes/*.baseline.md` matches nothing, and every MANIFEST
      archetype entry's `reference_impl` is absent — all 22 entries, not only
      the closed-folder ones.
- [ ] `node scripts/verify-manifest-versions.mjs` exits non-zero on a manifest
      with a re-added `reference_impl` key and on a re-added `*.baseline.md`
      file, and exits 0 on the shipped tree.
- [ ] `grep -rn 'baseline\.md' docs/ src/ CLAUDE.md README.md _adherence.json`
      returns no live reference outside `docs/backlog/`, `docs/audits/` and the
      design spec.
- [ ] `docs/RULES.md` rule 3 is unchanged byte-for-byte, and
      `grep -rEn 'src/components/|\bbg-|\btext-(xs|sm|lg|xl)\b' docs/archetypes/*.md`
      finds no hit outside `README.md` — no contract in the entire set gained a
      primitive name or a Tailwind class from the salvage.
- [ ] Donor gates unchanged: `npx tsc --noEmit` clean,
      `node scripts/lint-design.mjs` 0 errors, `npm run gallery:build` ok.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — roadmap, phase `donor-docs`
- [decouple-archetype-contract-from-reference-impl.md](../archive/decouple-archetype-contract-from-reference-impl.md) — shipped the split this ticket retires
- [style-archetypes-carry-baseline-sibling.md](../archive/style-archetypes-carry-baseline-sibling.md) — taught the copy channel to carry the sibling
- [package-ships-methodology-docs-single-version-source.md](../archive/package-ships-methodology-docs-single-version-source.md) — the `methodology[].version` guard this ticket's manifest guard mirrors
- ADR-0004 — appearance locality: derived vs inherited (why the API is closed)
