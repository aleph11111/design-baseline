---
area: archetypes
opened: 2026-08-17
status: done
value: high
roadmap: archetype-convergence
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
depends_on:
  - archetype-convergence-phase0-appearance-locality-decision
model: opus
model_reason: "adds a path-scoping capability to the shared scanner that every consumer also runs, then writes the rule set the remaining twenty archetypes are audited against"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-17T00:00:00Z
---

# Add appearance-prop adherence rules scoped to the archetype layer

## Context

Phase 1 of the [archetype-convergence roadmap](../archetype-convergence.md). Prose
has not held this rule: eighty-nine `archetype-rollout` tickets have been filed
and archived against hk-crm, forty-eight of them in August 2026 alone. The
roadmap's class-level acceptance is that no further ticket of that shape *can* be
filed, which needs a mechanical check.

The mechanism already exists. `scripts/lint-design.mjs` (ADR-0003's zero-dep
scanner) reads `{ id, tag | pattern, severity, message }` rules from
`_adherence.json`, and its own header documents the ratchet: *"Warnings exit 0
(allowed during rollout); any `error`-severity hit exits 1. That is the ratchet:
flip a rule to `"severity": "error"` in `_adherence.json` once its class is
clean."* That is exactly the rollout shape this needs — no new waiver mechanism.

One gap blocks it. Rules match file contents with no path scoping, and
`_adherence.json` targets `["src"]` as a whole, so an appearance-prop rule would
fire across `src/components/ui/` where `variant` and `size` props are correct
shadcn practice. The scanner needs a per-rule path filter first.

## What to do

- [ ] Add an optional per-rule `include` glob to `scripts/lint-design.mjs`,
      checked against each walked file's path relative to the repo root, so a
      rule can scope to `src/components/archetypes/`. Rules without it keep
      today's repo-wide behaviour.
- [ ] Cover the new filter in `scripts/lint-design.test.mjs`, which already
      exists beside the scanner.
- [ ] Add the appearance-prop rules to `_adherence.json` at `severity: "warn"`,
      each with a `message` citing hard rule 12 the way existing rules cite
      ADOPTION.md and PLACEMENT.md: a prop named from the appearance-noun list
      (`surface`, `variant`, `tone`, `density`, `appearance`, `rhythm`, `fill`,
      `framed`, `bordered`, `compact`, `padded`); a prop typed as a
      string-literal union of look-names; `className` declared on a `*Shell`
      component; an appearance-bearing `ReactNode` slot (`header`, `stats`).
- [ ] Do **not** add an inherited-default rule. Catching a prop whose default the
      contract does not state requires reading contract prose against code and is
      not expressible as a regex; it stays a review step in the contract-close
      work.
- [ ] Record the first run's `warn` hits — archetype and prop per line — as the
      audit list for the roadmap's `?`-marked "audit the remaining twenty
      archetypes... in MANIFEST order", so the decompose loop files against a
      list with a known length rather than a prediction.
- [ ] Update `_adherence.NOTES.md` alongside, the way the existing rules are
      documented there.

## Acceptance

- [ ] `node scripts/lint-design.mjs` reports the appearance-prop rules and no hit
      names a file under `src/components/ui/` — the path filter holds, so the
      shadcn leaf layer where `variant` and `size` are correct is never flagged.
- [ ] `scripts/lint-design.test.mjs` passes, covering both a rule with `include`
      and a rule without it.
- [ ] A rule flipped to `severity: "error"` with a live hit makes the scanner exit
      1, and the same rule at `warn` exits 0 — the ratchet works in both
      directions.
- [ ] The recorded audit list names every archetype-prop pair the scan flags, not
      only the `detail-overview` ones this roadmap phase closes, so no flagged
      archetype is silently omitted from the Phase-1 audit.
- [ ] A newly added archetype component declaring `surface?: "a" | "b"` is
      flagged by the scan without any rule being edited.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap, Phase 1
- [archetype-convergence-phase0-appearance-locality-decision.md](../archive/archetype-convergence-phase0-appearance-locality-decision.md)
  — depends on: the rules' `message` cites hard rule 12
- [adherence-lint-oxlint-mechanism-nonfunctional.md](../archive/adherence-lint-oxlint-mechanism-nonfunctional.md)
  — why the scanner is zero-dep rather than an oxlint config
- [adherence-lint-conformance-rule-gap.md](../archive/adherence-lint-conformance-rule-gap.md)
  — the prior rule-coverage gap in the same config
- ADR-0003 — adherence lint ships as a zero-dep scanner
