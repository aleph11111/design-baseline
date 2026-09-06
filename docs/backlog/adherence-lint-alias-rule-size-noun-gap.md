---
area: tooling
opened: 2026-09-06
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-06T00:00:00Z
model: sonnet
model_reason: pattern-following one-line regex fix with an explicit acceptance test already specified
---

# Adherence lint alias rule misses `size` noun, double-owns entity-circle prop

## Context

`node scripts/lint-design.mjs` reports one warn hit on `src/components/archetypes/entity-circle/EntityAvatar.tsx:26` (`size?: EntityAvatarSize`) under rule `archetype-alias-union-prop`, defined in `_adherence.json`. That rule's own `pattern` is `^\s*(?!(?:surface|variant|tone|density|appearance|rhythm|fill|framed|bordered|compact|padded)\?\s*:)\w+\??:\s*(?:{{unionAliases}})\b` — the negative-lookahead alternation omits `size`, while the sibling rule `archetype-appearance-noun-prop`'s pattern (`^\s*(surface|variant|tone|density|appearance|rhythm|fill|framed|bordered|compact|padded|size)\?\s*:`) carries `size` and already excludes `src/components/archetypes/entity-circle/**` with an inline triage citing `docs/archetypes/entity-circle.md` L6 (size is contract-keyed to the scope of the thing the entity is the subject of; an omitted size resolves to `sm`, the keying rule's answer for that scope — not a compatibility fallback). Because the alias rule's lookahead doesn't know about `size`, an aliased `size?: EntityAvatarSize` escapes it and gets reported a second time, bypassing the noun rule's triage.

## What to do

- [ ] Add `size` to the negative-lookahead alternation in `archetype-alias-union-prop`'s `pattern` in `_adherence.json`, so its skipped-name set matches `archetype-appearance-noun-prop`'s owned-noun set exactly.
- [ ] Update `archetype-alias-union-prop`'s `message` to name the shared noun set generally, rather than citing only `tone?:` as the example.
- [ ] Do not add `src/components/archetypes/entity-circle/**` to the alias rule's `exclude` list — the noun rule already owns and triages `size`; a per-archetype exclusion duplicated on both rules would need to be kept in sync forever.

## Acceptance

- `node scripts/lint-design.mjs` reports zero hits for `archetype-appearance-noun-prop`, `archetype-look-union-prop`, `archetype-numeric-union-prop`, `archetype-alias-union-prop`, and `archetype-appearance-slot`; the ADR-0003 rules (`no-bare-h1`, `no-bare-button`, `no-raw-table`, `literal-color`, `raw-html-control`) still show their pre-existing warnings, unchanged by this ticket.
- The updated `archetype-alias-union-prop` pattern still matches `  circleSize?: EntityAvatarSize;` and no longer matches `  size?: EntityAvatarSize;`.
- `npx tsc --noEmit` and `npm test` pass, with no `src/` file changes.

## Related

- [entity-circle-size-prop-appearance-locality-gap.md](archive/entity-circle-size-prop-appearance-locality-gap.md)
- [adherence-lint-union-prop-blind-spot.md](archive/adherence-lint-union-prop-blind-spot.md)
- [adherence-lint-multiline-union-alias-gap.md](archive/adherence-lint-multiline-union-alias-gap.md)
- ADR-0003 — Adherence lint ships as a zero-dep scanner, not an oxlint config
- ADR-0004 — Appearance locality: global or fixed in the component; per-call-site only when derived
