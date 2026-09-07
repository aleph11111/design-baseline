---
area: archetypes
opened: '2026-09-07'
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
  graded_at: '2026-09-07T06:06:46Z'
value: high
model: sonnet
model_reason: "established regex idiom (archetype-alias-union-prop's negative-lookahead pattern) replicated per closed folder; legal props are enumerated below and acceptance is fully testable — no open design judgment left"
---

# Closed archetype folders leak new appearance props past the lint gate

## Context

`_adherence.json`'s per-archetype ratchet valve (implemented in
adherence-lint-warn-to-error-ratchet, #201) works like this: once an
archetype closes, its whole folder is `exclude`d from the shared drain rules
(`archetype-appearance-noun-prop`, `archetype-look-union-prop`,
`archetype-numeric-union-prop`, `archetype-alias-union-prop`,
`archetype-appearance-slot`), and a per-folder `severity: "error"` rule is
added instead — but that per-folder rule only bans the props that were
*deleted* by name (`detail-overview-surface-prop`, `-rhythm-prop`,
`-headerfill-prop`, `-appearance-slot`, `-shell-class-name`, and the
equivalents for form-page, list-with-detail, settings-table, crud-dialog,
analytics-dashboard). Any *other* or *new* appearance prop added inside a
closed folder is invisible to every rule: the generic drain rules are
excluded there, and the per-folder rules match only a fixed name list. That
undercuts `docs/superpowers/specs/2026-08-17-archetype-convergence-design.md:251`'s
class-level acceptance for the `archetype-convergence` roadmap's `lint`
phase — "no further [archetype-rollout-shaped] ticket" should be filable
against a closed archetype's API.

It has already bitten: `src/components/archetypes/detail-overview/DetailSection.tsx:36`
declares `tone?: "default" | "muted"` (with a `tone = "default"` default)
inside the closed detail-overview folder. `node scripts/lint-design.mjs`
currently exits with 0 errors on this tree — confirmed by running it — and
none of the three rule families reach that prop: the generic noun/union
rules are excluded for detail-overview's folder, and no
`detail-overview-*` rule names `tone`. `docs/archetypes/detail-overview.md:517-519`
("Surface grading: data sections use the default tone; reference panels use
`tone="muted"`.") does contract-key `tone` to the data-section-vs-reference-panel
distinction, the same way `entity-circle.md` L7 and `calendar.md` Layer 7
key their own `tone` exemptions in `archetype-appearance-noun-prop`'s
message — so `DetailSection.tone` is legal by that same grading rule, not a
defect to delete, but it is legal *by accident of the gate having no
opinion*, not because any rule says so.

## What to do

- [ ] Before editing, grep every appearance-shaped prop (`tone`, `variant`,
      `density`, `appearance`, `surface`, `rhythm`, `fill`, a
      string/numeric-literal union, or a union-type alias) across all seven
      closed folders (detail-overview, form-page, list-with-detail,
      settings-table, crud-dialog, report, analytics-dashboard) — not just
      `DetailSection.tone` — so the allowlist below is triaged against what
      actually exists today, not just the one instance this ticket names.
- [ ] For each closed folder, add one `severity: "error"` rule in
      `_adherence.json` — call it `<archetype>-residual-appearance-prop` —
      scoped (`include`) to that folder, using the same generic
      noun/look-union/alias-union pattern shape the drain rules use, guarded
      by a leading negative lookahead naming that archetype's enumerated
      legal props (the idiom `archetype-alias-union-prop`'s
      `(?!(?:surface|variant|tone|...)\?\s*:)` prefix already establishes).
      Enumerated legal props per folder: detail-overview `layout`, `width`,
      `DetailSection.tone` (contract-keyed per
      `docs/archetypes/detail-overview.md:517-519`'s data-section-vs-reference-panel
      grading — cite that line in the rule's `message`, matching the
      entity-circle/calendar exemption convention); form-page `width`;
      list-with-detail `presentation`; crud-dialog `layout`, `width`; report
      `width`; analytics-dashboard `DashboardWidget.span`. Anything else
      appearance-shaped in a closed folder is then an error.
- [ ] Keep each new rule's `message` naming the contract line each allowed
      prop derives from, mirroring how the existing drain-rule `message`s
      cite `entity-circle.md`/`calendar.md`/`report.md`/`analytics-dashboard.md`
      line numbers — so the *why* travels with the gate, not just the ban.

## Acceptance

- `node scripts/lint-design.mjs` exits 0 with 0 errors on the current tree
  (or the offending prop is deleted/keyed first, if triage finds it
  illegal).
- Adding an unkeyed `tone?: "brand" | "loud"`, `density?: ...`, or
  `variant?: "x" | "y"` prop to any file inside any closed archetype folder
  makes the lint exit 1 — no other new appearance prop in any closed folder
  escapes the gate the way `DetailSection.tone` did.
- The currently-allowed props (`layout`, `width`, `presentation`, `span`,
  and detail-overview's `tone`) still produce no hit.
- `scripts/lint-design.test.mjs` gains a case for both directions: a new
  unkeyed prop in a closed folder is flagged, and an enumerated legal prop
  is not.
- `npx tsc --noEmit` and `npm test` pass.

## Related

- [adherence-lint-warn-to-error-ratchet](archive/adherence-lint-warn-to-error-ratchet.md) — shipped the per-folder exclude/ratchet valve this ticket closes a hole in.
- [archetype-convergence-appearance-prop-lint](archive/archetype-convergence-appearance-prop-lint.md) — introduced the five drain rules this ticket's per-folder rules parallel.
- [adherence-lint-alias-rule-size-noun-gap](archive/adherence-lint-alias-rule-size-noun-gap.md) — same shape of bug (a rule's negative-lookahead prefix list not kept in sync with another rule's owned-noun set).
- [archetype-convergence](archetype-convergence.md) — the active roadmap whose `lint` phase's class-level acceptance this gap undercuts.
- ADR-0004 — appearance locality: derived vs. inherited (the keying rule `DetailSection.tone`'s exemption invokes).
