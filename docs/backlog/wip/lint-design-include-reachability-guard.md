---
area: tooling
opened: '2026-08-27'
status: ready
value: normal
model: sonnet
model_reason: "the guard's semantics are already worked out on a parked branch; the work is porting them onto path.matchesGlob with tests"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-27T00:00:00Z
---

# Guard against a lint-design rule whose include can never match

## Context

`scripts/lint-design.mjs` scopes each rule with optional `include` / `exclude`
globs, matched by stdlib `path.matchesGlob` (#166), over a file list built with
`fs.globSync` (#169). Nothing checks the `include` globs against the configured
`targets` in `_adherence.json`. A rule whose `include` cannot intersect any
target — a stale path after a directory move, or an `include` written without the
target prefix — silently matches zero files and reports zero violations, which is
indistinguishable from a clean scan. The scanner's `--json` output carries no
per-rule scope either, so the dead rule is not inspectable.

This matters more since the archetype-layer scoping landed
([archetype-convergence-appearance-prop-lint](../archive/archetype-convergence-appearance-prop-lint.md)):
those rules exist precisely to be narrow, and ADR-0003's warn→error ratchet reads
a zero-hit rule as a class that is clean and ready to flip.

A parked branch `wip/lint-design-include-reachability` (commit `62b9db8`) has a
working implementation — `globIntersectsTarget`, `includeReachableUnder`, a
`CompileError` naming the rule/glob/targets, `--json` per-rule scope, and 54
passing tests. It is built on a hand-rolled glob engine, which is what #166/#169
deleted and what
[over-engineering-hand-rolled-glob-engine-duplicated](../archive/over-engineering-hand-rolled-glob-engine-duplicated.md)
closed out. Port the guard, not the branch.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Read `62b9db8` for the guard's semantics — the reachability rules and the
      error text are already worked out there, including the cases its tests
      pin: a zero-prefix `**` include is reachable under any target, a partially
      reachable include array still compiles because ANY entry is a live path,
      and `exclude` is never guarded because only `include` can disarm a rule.
- [ ] Implement the check on top of `path.matchesGlob` rather than reviving
      `globIntersectsTarget` — no new glob engine, per the archived
      over-engineering ticket and the stdlib-first direction of #166/#169.
- [ ] Fail at compile time, not scan time: raise the existing `CompileError`
      naming the rule id, the offending glob and the configured `targets`, so
      the scanner exits 2 (its existing config-error code) rather than reporting
      a clean run.
- [ ] Keep it structural, not an existence check — an `include` pointing at a
      real-but-currently-empty directory under a target is reachable and must
      not trip the guard. That distinction is what the parked branch's
      "unmatched empty layer is still reachable" test pins.
- [ ] Add a live per-rule `scope` to `--json` so a rule's effective reach is
      inspectable without reasoning about the globs by hand.
- [ ] Cover both in `scripts/lint-design.test.mjs` / `lint-design-core.test.mjs`,
      matching the existing pure-core test split from #161.
- [ ] Delete the `wip/lint-design-include-reachability` branch once the guard
      lands, so the superseded implementation stops looking like pending work.

## Acceptance

- [ ] A rule whose `include` cannot intersect any configured target exits 2 with
      a `CompileError` naming the rule, the glob and the targets — it no longer
      reports zero violations and reads as clean.
- [ ] Every rule currently in `_adherence.json` still compiles and the scan's
      warning/error counts are unchanged, so the guard adds no false positive to
      any existing rule — not only the archetype-layer ones.
- [ ] An `include` naming a real but empty directory under a target compiles and
      scans without tripping the guard.
- [ ] `node scripts/lint-design.mjs --json` reports a scope for each rule.
- [ ] `npm test` passes, and no new hand-rolled glob-matching helper is
      introduced — `path.matchesGlob` remains the only matcher in the file.

## Related

- [archetype-convergence-appearance-prop-lint.md](../archive/archetype-convergence-appearance-prop-lint.md)
  — shipped the archetype-layer `include` scoping the guard protects
- [over-engineering-hand-rolled-glob-engine-duplicated.md](../archive/over-engineering-hand-rolled-glob-engine-duplicated.md)
  — why the port must not revive a glob engine
- [adherence-lint-conformance-rule-gap.md](../archive/adherence-lint-conformance-rule-gap.md)
  — a prior rule-coverage gap in the same config
- ADR-0003 — adherence lint ships as a zero-dep scanner; its warn→error ratchet
  is what a silently dead rule corrupts
