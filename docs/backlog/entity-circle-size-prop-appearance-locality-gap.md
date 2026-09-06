---
area: archetypes
opened: '2026-09-06'
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
  graded_at: '2026-09-06T00:00:00Z'
value: normal
model: opus
model_reason: >-
  the core deliverable is a design decision (keep-and-key vs delete the prop) that requires
  investigating real fleet placements, not a mechanical pattern-follow
roadmap: archetype-convergence
---

# Entity-circle EntityAvatar size prop is an inherited default, not a derived one

## Context

`src/components/archetypes/entity-circle/EntityAvatar.tsx:14` ships `size?: EntityAvatarSize` (`"xs" | "sm" | "md"` at `EntityAvatar.tsx:5`), defaulting to `"sm"`. The contract `docs/archetypes/entity-circle.md` L84 (Layer 6 — Mobile affordance) says only "Size is chosen by the caller from a small discrete scale (L7), not by the viewport" — and L7 (Theming) enumerates the `tone` rule, not a size rule. Per `docs/RULES.md` hard rule 12 / [ADR-0004](../adr/0004-appearance-locality-derived-vs-inherited.md), a per-call-site prop with a backwards-compatible default is disqualifying on its own — the value was inherited, not derived. `size` survives today only because `_adherence.json`'s `archetype-look-union-prop` regex matches an inline string-literal union and does not see through the `EntityAvatarSize` type alias.

The sibling prop `tone` on the same component already went through this exact test: [entity-circle-component-kind-appearance-gap](archive/archetype-convergence-component-kind-appearance-gap.md) (shipped 2026-09-06) keyed `tone` to the entity's identity role (`entity-circle.md` L91–98) and `_adherence.json`'s `archetype-look-union-prop` exclusion quotes that keying rule. That ticket's own scope named only `entity-circle`'s `tone` and `overline-typed`'s `tone` — it did not cover `size`, leaving this gap.

`src/examples/entity-circle-demo.tsx` uses all three sizes (`xs`/`sm`/`md` at lines 51, 64–66, 76, 80, 89) but as a scale showcase, not evidence of three real placements — the demo predates and is orthogonal to whatever the real fleet call sites (brickshop-manager, mistra — outside this donor repo) actually need.

## What to do

- [ ] Decide between: (a) write a keying rule into `entity-circle.md` that derives size from the context the circle sits in (e.g. inline-in-a-row/list-cell vs page-or-card identity header), exhaustively enumerated so two engineers holding the same placement derive the same value, and keep the prop; or (b) fix the size in the component and delete the prop if the fleet's real usage collapses to one scale. This requires checking actual downstream call sites (not the demo) before choosing — prefer (a) if the placements are genuinely distinct.
- [ ] Write the contract in role-level, stack-agnostic language naming no primitive and no Tailwind class (RULES.md hard rule 3), with any class binding confined to `entity-circle.baseline.md`.
- [ ] Re-read every "Allowed variation" block in `entity-circle.md` against the derived-vs-inherited test while in there — a variation permitted without a keying rule is a design space, not a contract.
- [ ] Bump the MANIFEST `entity-circle` entry (currently `1.1`, `docs/archetypes/MANIFEST.json:364`) — MAJOR if the prop is deleted, MINOR if the contract gains the keying rule and the API is unchanged.
- [ ] Record the outcome in `_adherence.json`: either an `error`-severity rule scoped to `src/components/archetypes/entity-circle/**` forbidding the deleted prop (mirroring `detail-overview-surface-prop`), or fold a keying-rule exclusion clause into the existing `archetype-look-union-prop` entity-circle exclusion the way the `tone` exclusion already quotes `entity-circle.md` L91–98.

## Acceptance

- `npx tsc --noEmit` and `npm test` pass; the gallery still renders the entity-circle demo.
- `node scripts/lint-design.mjs` reports no standing appearance-prop warn naming an entity-circle file and exits 0.
- `entity-circle.md` either states the size keying rule with its values exhaustively enumerated, or no longer mentions a caller-chosen size scale — no third state (an unkeyed scale left undocumented).

## Related

- [archetype-convergence-component-kind-appearance-gap](archive/archetype-convergence-component-kind-appearance-gap.md) — the sibling ticket that closed the identical gap for `tone` on this same component and for `overline-typed`'s `tone`; this ticket is its missed scope.
- ADR-0004 — Appearance locality: global or fixed in the component; per-call-site only when derived (amendment 2026-09-06 on `kind: "component"` governance).
- `docs/RULES.md` hard rule 12.
