---
area: archetypes
opened: 2026-08-17
status: ready
value: high
roadmap: archetype-convergence
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
model: opus
model_reason: "an ADR that supersedes another repo's ADR on a narrow point plus a hard rule other tickets are graded against — wording is the deliverable"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-17T00:00:00Z
---

# Record the appearance-locality decision as ADR-0004 and RULES hard rule 12

## Context

Phase 0 of the [archetype-convergence roadmap](../archetype-convergence.md). The
roadmap's stated rule — *a visual choice is either global or fixed in the
component; never a per-call-site prop* — does not survive contact with the code
in either direction, and the design spec
(`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`) reformulates
it.

Too loose: `headerFill`, the roadmap's own model of the correct shape, ships a
per-instance override prop at `SurfaceHeader.tsx:28`, `SurfaceHeaderSlot.tsx:17`
and `DetailOverviewShell.tsx:58`. Too strict: `layout="rail" | "vertical"` is
per-call-site but carries a contract decision table at
`docs/archetypes/detail-overview.md:140-151` keying it to entity profile, so two
engineers with the same entity derive the same value. The discriminator is
**derived versus inherited**, not where the value is passed. `surface`'s default
is annotated in-source as *"the v2.0/v2.1 look. Zero churn."* — inherited by
every one of hk-crm's twelve tabs, chosen by none of them.

This ticket writes the decision down. Every other Phase-1 ticket is graded
against it, so it lands first.

## What to do

- [ ] Write `docs/adr/0004-<slug>.md` adopting the derived-vs-inherited rule, and
      add its row to `docs/adr/INDEX.md` (per the file's own "Add a row here when
      you add an ADR" instruction).
- [ ] Record the distribution split the roadmap's Phase 0 asks for:
      `src/components/ui/` primitives stay vendored (leaves, byte-identical
      across the fleet, shadcn's copy-in model is right for them);
      `src/components/archetypes/` compositions ship as a source package,
      because every observed divergence is compositional.
- [ ] State that this supersedes hk-crm's `docs/adr/0030-vendor-stamp-design-baseline.md`
      on its compiled-CSS skew argument **only** — a source-distributed package
      shipping no compiled CSS has no skew, because the consumer's own Tailwind 4
      build compiles every class. ADR-0030's other objection (no publishable
      artifact exists) is not refuted here; it is Phase 2's work.
- [ ] Add hard rule 12 to `docs/RULES.md` in the existing numbered format with a
      "Why:" clause, matching rules 1-11: the three tiers (token / context /
      fixed in component), the derived-vs-inherited test for a legal
      per-call-site prop, the disqualifying backwards-compatible default, and
      that an appearance-bearing `ReactNode` slot is governed identically.
- [ ] Name the closed context set explicitly in the rule: after Phase 1 it has
      exactly one member, `headerFill`, and context axes carry no override prop.

## Acceptance

- [ ] `docs/adr/INDEX.md` lists ADR-0004 with status Accepted, and the ADR body
      names hk-crm ADR-0030 and scopes the supersession to its skew argument.
- [ ] `docs/RULES.md` hard rule 12 states the derived-vs-inherited test and
      names `headerFill` as the closed context set's only member.
- [ ] Applying rule 12 to `DetailOverviewShellProps` as written today classifies
      `surface` and `rhythm` as illegal and `layout` and `width` as legal — the
      rule is specific enough to sort every existing prop, not only the one that
      prompted it.
- [ ] No ticket in the `archetype-convergence-*` scope is left citing the
      roadmap's original "never a per-call-site prop" phrasing; the ADR is the
      single statement of the rule.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap, Phase 0
- [decouple-archetype-contract-from-reference-impl.md](../archive/decouple-archetype-contract-from-reference-impl.md)
  — shipped the contract/`.baseline.md` split this rule partly retires
- ADR-0003 — adherence lint ships as a zero-dep scanner; the mechanism rule 12 is
  enforced by
