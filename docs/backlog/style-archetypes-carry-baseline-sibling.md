---
area: archetypes
opened: 2026-07-03
status: ready
model: sonnet
model_reason: scoped copy-logic change in two plugin skills, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-03T15:50:00Z
---

# Teach /style-archetypes and /promote-archetype to carry the .baseline.md sibling

## Context

The `decouple-archetype-contract-from-reference-impl` feature split every archetype doc into a stack-agnostic contract (`docs/archetypes/<slug>.md`) and a baseline reference-implementation sibling (`docs/archetypes/<slug>.baseline.md`), recorded in `MANIFEST.json` as a new `reference_impl` field alongside `spec`. The archetypes `README.md` documents the two-file convention (including "what gets copied per archetype") as the intended behavior. But the `/style-archetypes` and `/promote-archetype` plugin skills are external to this repo and still only handle `docs/archetypes/<slug>.md` + `src/components/archetypes/<slug>/` — they don't yet carry the sibling. Until they catch up, a baseline-stack target that adopts an archetype gets the portable contract but not its reference-implementation binding doc.

## What to do

- [ ] `/style-archetypes`: add the entry's `reference_impl` file to the per-archetype copy set (alongside `spec` and `primitives_dir`), so baseline-stack targets receive `<slug>.baseline.md`.
- [ ] Preserve the non-baseline path: a target that only wants the portable contract can still take `<slug>.md` alone; the sibling is additive, never required to read the contract.
- [ ] `/promote-archetype` create path: author the `<slug>.baseline.md` sibling as a donor file (the de-source-ification step already separates primitives from contract — route the concrete primitives + class strings into the sibling).
- [ ] `/promote-archetype --update` path: diff the sibling too, not just the contract, when the source spec advances.
- [ ] Update the skills' own "what gets copied" documentation to match the archetypes README.

## Acceptance

- After `/style-archetypes <slug>` on a baseline-stack target, the target's `docs/archetypes/` contains both `<slug>.md` and `<slug>.baseline.md`, and `MANIFEST.json` merged the `reference_impl` field.
- `/promote-archetype <slug>` on a new archetype writes a `<slug>.baseline.md` donor file and a `reference_impl` MANIFEST entry.
- The archetypes README "what gets copied" paragraph no longer describes behavior the skills don't implement.

## Related

- [decouple-archetype-contract-from-reference-impl.md](wip/decouple-archetype-contract-from-reference-impl.md) — the split that created the siblings
- [style-baseline-stack-aware-preflight.md](style-baseline-stack-aware-preflight.md) — sibling stack-awareness work
- docs/archetypes/README.md — the two-file convention this ticket makes the skills honor
