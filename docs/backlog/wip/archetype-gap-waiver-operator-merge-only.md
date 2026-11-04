---
area: tooling
opened: 2026-11-04
status: ready
value: normal
model: sonnet
model_reason: "wording only across three known sites; policy already decided, no scanner logic change"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Archetype-gap waiver approval must not be PR-body claim

## Context

Correction to the shipped [[archetype-gap-waiver-needs-operator-approval]] (landed in #641, inbox item 2fe55dbc). That wording says the `// archetype-gap: <slug>` waiver is allowed when operator approval is "recorded in the PR body" — in `docs/RULES.md` rule 12, `docs/PACKAGE.md` ("The page-shape rule": **The waiver** bullet and the **No fit** paragraph) and `PAGE_SHELL_HINT` plus the comment above it in `scripts/lint-design.mjs`. Review of coding-dashboard PR #2387 showed this is forgeable: the implementing agent writes the PR body itself during `/ship`, so the reviewer cannot tell a real approval from a fabricated line. Revised operator policy (team-lead decision 2026-10-28): an agent never adds the waiver; the automated `/ship` review gate always fails a page without its archetype shell; only the operator can ship a waived page, by merging it by hand (a human override of the gate). The archived ticket is immutable, so this is a new ticket, not an enrich.

## What to do

- [ ] In `docs/RULES.md` rule 12, replace "requires explicit operator approval to ship before the gap closes, recorded in the PR body" with the new policy: an agent never adds the waiver; the review gate always fails a page without its archetype shell; only the operator ships a waived page, by merging it by hand.
- [ ] In `docs/PACKAGE.md` "The page-shape rule", reword **The waiver** bullet (~line 440) and the **No fit** paragraph (~line 460, "recorded in the PR body") the same way.
- [ ] In `scripts/lint-design.mjs`, reword `PAGE_SHELL_HINT` (~line 157) and the comment above it (~line 79) so the waiver reads as operator-only (an agent never writes it), with no "recorded in the PR body" or "approval in the PR" wording. Wording only; no change to waiver matching, severity or the grandfather ratchet.
- [ ] Grep every statement of the waiver and approval wording (`grep -rn "archetype-gap\|PR body" docs scripts src`) and align any that still say approval is recorded in the PR body; fix at all sites, not only the three named. Note: the skill `choosing-a-page-archetype` lives outside this repo — report it to the operator if it carries the old wording.

## Acceptance

- `docs/RULES.md` rule 12 and both spots in `docs/PACKAGE.md` state that an agent never adds the waiver and only the operator ships a waived page, by merging it by hand.
- The `pageShell` lint output no longer contains "recorded in the PR body" or "approval in the PR" and shows the operator-merges-by-hand wording.
- No other doc or message in the repo presents PR-body approval as sufficient for the waiver.
- `scripts/lint-design.mjs` matching logic is unchanged and `scripts/lint-design.test.mjs` still passes.

## Related

- [[archetype-gap-waiver-needs-operator-approval]] — shipped wording this ticket corrects
- [[page-requires-archetype-shell-no-pageframe-alone]] — origin of rule 12
- [docs/RULES.md](/docs/RULES.md) — hard rule 12
- [docs/PACKAGE.md](/docs/PACKAGE.md) — "The page-shape rule"
