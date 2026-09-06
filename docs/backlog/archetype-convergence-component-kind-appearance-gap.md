---
area: archetypes
opened: '2026-09-06'
status: ready
value: high
roadmap: archetype-convergence
depends_on:
  - archetype-convergence-phase0-appearance-locality-decision
  - archetype-convergence-appearance-prop-lint
model: opus
model_reason: "no established pattern covers a MANIFEST kind: component archetype; the call has fleet-wide precedent effects on every future component-kind promotion"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-06T07:39:50Z'
---

# Resolve component-kind archetype appearance-locality gap in ADR-0004 and RULES rule 12

## Context

`node scripts/lint-design.mjs` reports 4 remaining `warn` hits from the
appearance-prop rules the [archetype-convergence-appearance-prop-lint](archive/archetype-convergence-appearance-prop-lint.md)
ticket added to `_adherence.json`. Two sit on **component-kind** archetypes —
leaf primitives, not page shells — promoted as `kind: "component"` MANIFEST
entries: `src/components/archetypes/entity-circle/EntityAvatar.tsx:16`
(`tone?: EntityAvatarTone` = `"muted" | "primary"`, defaulting to `"muted"`)
and `src/components/archetypes/overline-typed/overline.tsx:43`
(`tone?: OverlineTone` = `"muted" | "foreground" | "primary" | "inverted"`,
defaulting to `"muted"`). Both are flagged by the `archetype-appearance-noun-prop`
rule, scoped to `src/components/archetypes/**`.

Neither `docs/RULES.md` hard rule 12 nor
[ADR-0004](../adr/0004-appearance-locality-derived-vs-inherited.md) names this
category. Rule 12 is worded as a per-call-site prop on an archetype
**composition**; ADR-0004 exempts `src/components/ui/` leaves explicitly
("They are leaves, they do not drift"). `entity-circle` and `overline-typed`
are leaves that live under `src/components/archetypes/` only because they were
promoted as `kind: "component"` MANIFEST entries
(`docs/archetypes/MANIFEST.json:363`, `:333`) rather than page shells — a third
category the existing rule and ADR never sorted. `src/components/ui/` leaves
keep `variant`/`size` props as correct shadcn practice; if a component-kind
archetype is the same thing in a different directory, both `tone` props are
legal and the lint over-fires. If not, both must be deleted and the value fixed
in the component.

## What to do

- [ ] Make the call and record it as an amendment to ADR-0004 plus a
      clarifying clause in `docs/RULES.md` rule 12: does a MANIFEST
      `kind: "component"` archetype get governed as a leaf primitive (like
      `src/components/ui/`) or as an archetype composition, and why? Apply the
      ADR's own discriminator — derived vs inherited: a prop whose value the
      contract derives from the entity or its data is legal; a prop with a
      backwards-compatible default and no keying rule is not.
- [ ] Read both contracts against the call.
      `docs/archetypes/entity-circle.md:88-89` only enumerates the sanctioned
      tones (a neutral default, a brand tone) with no rule for *when* an entity
      gets which. `docs/archetypes/overline-typed.md:106` states "Tone conveys
      emphasis, not meaning" — explicitly non-derivable. If the call is that
      these are governed leaves, either add a real keying rule to the contract
      (e.g. tone keyed to a stated entity/section role) or delete the prop and
      fix the value in the component; if the call is that they're exempt,
      leave the code alone.
- [ ] While in `overline-typed.md`, resolve its `:87` clause sanctioning "a
      one-off color the tone set does not cover" via the `className`
      passthrough. The global `archetype-shell-class-name` rule in
      `_adherence.json` is already `severity: "error"` for `*Shell.tsx`/
      `*Sheet.tsx`, and the twelve-shell className drop has shipped
      ([archetype-shell-classname-drop.md](archive/archetype-shell-classname-drop.md)); a
      contract advertising className as a sanctioned per-site deviation channel
      either contradicts that or is a documented leaf exemption — say which, in
      the contract.
- [ ] Apply the outcome to `_adherence.json`: if legal, add both archetypes to
      the `archetype-appearance-noun-prop` rule's `exclude` list (same array
      form the rule already uses for `detail-overview`/`form-page`/
      `list-with-detail`/`settings-table`) with a message naming the contract
      clause that keys them; if not legal, delete the props and update
      `src/examples/entity-circle-demo.tsx`, `src/examples/overline-typed-demo.tsx`,
      and the component tests (`entity-avatar.test.tsx`, `overline.test.tsx`).
- [ ] Bump both MANIFEST entries: major if a prop is deleted (the API
      breaks), minor if only the contract gains a keying rule.

## Acceptance

- `node scripts/lint-design.mjs` shows zero `archetype-appearance-noun-prop`
  hits naming `entity-circle/` or `overline-typed/`, matched either by an
  `_adherence.json` exclude entry whose message cites the keying contract
  clause, or by the prop no longer existing in code.
- `docs/RULES.md` rule 12 and ADR-0004 together answer, in prose, whether a
  `kind: "component"` archetype is a governed composition or an exempt leaf —
  a later reader classifies a *new* component-kind archetype without
  re-deriving the call.
- `npx tsc --noEmit` exits 0 and `npm test` passes, unchanged from before this
  ticket.
- Both archetype contracts still name no primitive and no Tailwind class
  (RULES.md rule 3) — any binding detail lands only in the `.baseline.md` half.
- Both MANIFEST entries' `version` matches what actually shipped (major on a
  deleted prop, minor on a contract-only keying-rule addition).

## Related

- [archetype-convergence.md](archetype-convergence.md) — parent roadmap; this
  fills the Phase-1 `?`-marked "audit the remaining twenty archetypes... in
  MANIFEST order" for the two component-kind entries the audit list didn't
  originally distinguish from page shells
- [archetype-convergence-phase0-appearance-locality-decision.md](archive/archetype-convergence-phase0-appearance-locality-decision.md)
  — depends on: the derived-vs-inherited discriminator this ticket applies
- [archetype-convergence-appearance-prop-lint.md](archive/archetype-convergence-appearance-prop-lint.md)
  — depends on: the rule and `exclude` mechanism this ticket configures
- ADR-0004 — the decision this ticket amends
- `docs/RULES.md` hard rule 12 — the enforceable restatement this ticket
  clarifies
