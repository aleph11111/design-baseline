---
area: tooling
opened: 2026-10-28
status: ready
value: normal
model: sonnet
model_reason: "mechanical citation fix across named files; cause established, no design fork"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-28T00:00:00Z
---

# Lint messages cite the wrong RULES.md hard rule number

## Context

The appearance-prop rules in `_adherence.json` (`archetype-appearance-noun-prop`, `archetype-look-union-prop`, `archetype-numeric-union-prop`, `archetype-alias-union-prop`, `archetype-appearance-boolean-prop`, `archetype-shell-class-name`, `archetype-appearance-slot`, `archetype-render-callback-prop`, the `*-residual-appearance-prop` rules, `retired-headerfill-prop`, and the other closed-archetype appearance rules) say "RULES.md hard rule 12". In `docs/RULES.md` the appearance-locality rule is hard rule 10; since v0.15.0 (PR #606) hard rule 12 is the page-shell rule ("a consumer page renders exactly one `kind: "page"` archetype shell"). An agent that hits an appearance-prop lint error is sent to the wrong rule. The same wrong citation sits in `_adherence.NOTES.md` (lines 138, 143, 168, 310) and `scripts/lint-design.test.mjs` (line 351).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Change "hard rule 12" to "hard rule 10" in every appearance-prop rule `message` in `_adherence.json` (about 24 messages; `grep -c 'hard rule 12' _adherence.json`).
- [ ] Change the appearance-rule citations in `_adherence.NOTES.md` (the `archetype-*` section heading and body, plus the line near 310) and the comment in `scripts/lint-design.test.mjs` to hard rule 10.
- [ ] Leave the page-shell citations at 12: `_adherence.NOTES.md:95`, `scripts/lint-design.mjs:69` and `:146`, `docs/PACKAGE.md:325` and `:338`. `docs/adr/0004-appearance-locality-derived-vs-inherited.md:80` is historical wording, so check it against RULES.md before touching it.

## Acceptance

- `grep -n 'hard rule 12' _adherence.json` returns no appearance-prop rule message, and every appearance-prop message cites hard rule 10.
- No other appearance-rule citation of "hard rule 12" remains in `_adherence.NOTES.md`, `scripts/` or `docs/` outside the page-shell rule's own references.
- The page-shell rule's citations are unchanged at 12, and `npm test` passes after the change.

## Related

- [[page-requires-archetype-shell-no-pageframe-alone]] — added hard rule 12 (v0.15.0), which displaced the number the messages cite
- [[archetype-convergence-appearance-prop-lint]] — authored the appearance-rule messages citing the rule
- [[adherence-notes-ledger-misses-eleven-rules]] — maintains the `_adherence.NOTES.md` ledger
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality, the rule now numbered 10
