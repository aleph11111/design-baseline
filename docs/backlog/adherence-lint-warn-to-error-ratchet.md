---
area: archetypes
opened: '2026-09-06'
status: ready
value: normal
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
---

# Ratchet archetype appearance-prop lint rules to blocking severity

## Context

`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md:258-259`
states the ratchet: *"Warnings exit 0 (allowed during rollout); any
`error`-severity hit exits 1 — that is the ratchet: flip a rule to
`"severity": "error"` in `_adherence.json` once its class is clean."* The
`lint` phase of the `archetype-convergence` roadmap
([archetype-convergence.md](archetype-convergence.md)) shipped five rules at
`warn` for exactly this reason
([archetype-convergence-appearance-prop-lint.md](archive/archetype-convergence-appearance-prop-lint.md)):
`archetype-appearance-noun-prop`, `archetype-look-union-prop`,
`archetype-numeric-union-prop`, `archetype-alias-union-prop`, and
`archetype-appearance-slot`. The roadmap's `warn-drain` phase that was meant
to clear the remaining hits before the flip is now marked `open: false` with
every one of its tickets archived (`adherence-lint-union-prop-blind-spot`,
`analytics-dashboard-column-span-props-unclosed`,
`entity-circle-size-prop-appearance-locality-gap`, and siblings), per RULES.md
hard rule 12 / [ADR-0004](../adr/0004-appearance-locality-derived-vs-inherited.md).

**The class is not actually clean yet.** `node scripts/lint-design.mjs`
currently still reports one hit at `warn` for one of the five rules:
`src/components/archetypes/entity-circle/EntityAvatar.tsx:26` under
`archetype-alias-union-prop`, on `size?: EntityAvatarSize`. Commit `cb54c09`
(`feat/entity circle size prop appearance locality gap`, #192 — the ticket
this roadmap named as the prerequisite) added `size` to
`archetype-appearance-noun-prop`'s pattern so entity-circle's `size` is keyed
and excluded there, but it never added `size` to
`archetype-alias-union-prop`'s negative-lookahead prefix list (still
`(?!(?:surface|variant|tone|density|appearance|rhythm|fill|framed|bordered|compact|padded)\?\s*:)`
in `_adherence.json`), so the alias-typed `size` prop still matches that rule
and entity-circle isn't in its `exclude` list either. `archetype-alias-union-prop`'s
own `message` field documents that this lookahead exists precisely so a
noun-owned prop name is "reported once — by that rule, under its triage — not
twice" — #192 updated one side of that pairing and not the other. Flipping
severities now would fail CI on this leftover hit immediately, per the design
spec's own caveat.

All six of the other `exclude` rationales across the five rules were re-read
against the contract file each cites and confirmed still present and current:
`entity-circle.md` L6/L7 (`tone`, `size`), `calendar.md` Layer 7 (`tone`),
`report.md` Structure's width keying rule (`width`),
`statement-with-filters.md` Layer 6's indent keying rule (`indent`),
`analytics-dashboard.md` Layer 6's widget span keying rule (`span`), and
`overline-typed.md` L8/L11 (`as`) plus `raw-input.md` L39/L4 (`type`). None
are stale — the `entity-circle` gap above is the only load-bearing exclusion
that's actually missing.

## What to do

- [ ] Close the residual gap first: in `_adherence.json`, add `size` to
      `archetype-alias-union-prop`'s negative-lookahead prefix list so it
      matches `archetype-appearance-noun-prop`'s pattern (which #192 already
      extended). Confirm `node scripts/lint-design.mjs` no longer flags
      `src/components/archetypes/entity-circle/EntityAvatar.tsx:26` before
      touching any severity field.
- [ ] In `_adherence.json`, change `"severity": "warn"` to `"severity": "error"`
      on `archetype-appearance-noun-prop`, `archetype-look-union-prop`,
      `archetype-numeric-union-prop`, `archetype-alias-union-prop`, and
      `archetype-appearance-slot`. Leave the six generic ADR-0003 rules
      (`no-bare-h1`, `no-raw-table`, `no-bare-button`, `literal-color`,
      `weak-focus-ring`, `raw-html-control`) at `warn` — different class,
      live outstanding hits, out of scope.
- [ ] Record the flip in `docs/RULES.md` hard rule 12's enforcement note, so
      the next archetype promotion knows the archetype-layer appearance-prop
      gate is now hard-failing, not advisory.

## Acceptance

- `node scripts/lint-design.mjs` exits 0 and reports `0 error(s)` — the
  archetype-layer appearance rules produce no hits at error severity.
- A temporary probe (`density?: "cozy" | "compact"` added to a non-excluded
  archetype shell's props) makes `node scripts/lint-design.mjs` exit non-zero
  and name that file, confirming the gate bites; then reverted.
- No `src/components/ui/` file is named by any archetype-layer hit — the
  rules' `include` scoping (`src/components/archetypes/**` /
  `src/components/layout/**`) never reaches `src/components/ui/**`.
- `npx tsc --noEmit` and `npm test` pass.

## Related

- [archetype-convergence.md](archetype-convergence.md) — the roadmap whose
  `warn-drain` phase this ticket closes out.
- [archetype-convergence-appearance-prop-lint.md](archive/archetype-convergence-appearance-prop-lint.md)
  — shipped the five rules at `warn`.
- [entity-circle-size-prop-appearance-locality-gap.md](archive/entity-circle-size-prop-appearance-locality-gap.md)
  — #192, the fix that left the `archetype-alias-union-prop` lookahead
  update undone.
- [adherence-lint-union-prop-blind-spot.md](archive/adherence-lint-union-prop-blind-spot.md),
  [analytics-dashboard-column-span-props-unclosed.md](archive/analytics-dashboard-column-span-props-unclosed.md),
  [adherence-lint-multiline-union-alias-gap.md](archive/adherence-lint-multiline-union-alias-gap.md)
  — the other `warn-drain` phase tickets.
- ADR-0003 — adherence lint ships as a zero-dep scanner with the warn/error ratchet.
- ADR-0004 — the derived-vs-inherited test hard rule 12 encodes.
