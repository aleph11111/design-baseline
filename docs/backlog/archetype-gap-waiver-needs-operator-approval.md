---
area: tooling
opened: 2026-10-28
status: ready
value: normal
model: sonnet
model_reason: "doc and message wording only; policy decided, no scanner logic change"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-28T00:00:00Z
---

# Archetype-gap waiver reads as self-service without operator approval

## Context

`docs/RULES.md` hard rule 12 (line 28) and `docs/PACKAGE.md` ("The page-shape rule") say "never ship a stopgap page", yet both also call `// archetype-gap: <slug>` "the only waiver" with no condition, so consumers read the waiver as a self-service path. Evidence: the controlling-app PR #1990 review found its `_adherence.NOTES.md` and rule message saying a no-fit page "may carry the waiver" while its pattern doc says "block the page work". Operator policy (team-lead decision 2026-10-28, applied in coding-dashboard PRs #2386/#2387 and controlling-app #1990): on no fit, page work stops and the page ticket is blocked on the gap ticket; an agent never adds the waiver, and the automated `/ship` review gate always fails a page without its archetype shell; only the operator can ship a waived page, by merging it by hand (a human override of the gate). (Revised from "allowed when the operator approves, recorded in the PR body": coding-dashboard PR #2387 review showed that is forgeable, because the implementing agent writes the PR body itself during `/ship`, so the reviewer cannot tell a real approval from a fabricated line.) The waiver text consumers see at lint time is `PAGE_SHELL_HINT` in `scripts/lint-design.mjs` (appended to every page-shape hit); `findPageShellIssues` clears a file with a well-formed waiver silently, so the condition must live in the hint and docs, not in scanner logic.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `docs/RULES.md` rule 12, change "The only waiver is a `// archetype-gap: …` comment" to state the policy: an agent never adds the waiver; the automated `/ship` review gate always fails a page without its archetype shell; only the operator can ship a waived page, by merging it by hand (a human override of the gate); otherwise page work stops and the page ticket is blocked on the gap ticket. Do not use "recorded in the PR body" wording.
- [ ] In `docs/PACKAGE.md` ("The page-shape rule", the **The waiver** bullet and the **No fit** paragraph), state the same policy (agent never adds the waiver; gate always fails; operator merges by hand).
- [ ] In `scripts/lint-design.mjs`, reword `PAGE_SHELL_HINT` (and the malformed-waiver problem text in `findPageShellIssues` if it implies self-service) so the waiver reads as operator-only: an agent never adds it, and the operator ships a waived page by merging it by hand. Wording only; no change to matching, severity or the grandfather ratchet.
- [ ] Grep the repo for other statements of the waiver (`grep -rn "archetype-gap" docs scripts src`) and align any that present it unconditionally.

## Acceptance

- `docs/RULES.md` rule 12 and `docs/PACKAGE.md` "The page-shape rule" each state that an agent never adds the waiver, the `/ship` review gate always fails a page without its archetype shell, and only the operator can ship a waived page by merging it by hand; neither says "recorded in the PR body".
- The `pageShell` lint output shows the operator-only wording (agent never adds the waiver; operator merges by hand) and no longer says "requires operator approval in the PR".
- No other doc or message in the repo presents `archetype-gap:` as an unconditional or self-service waiver.
- `scripts/lint-design.mjs` matching logic and existing tests are unchanged and still pass.

## Related

- [[lint-messages-cite-wrong-rules-md-rule-number]] — same lint messages and rule-12 citations; no ordering needed (different lines)
- [[page-requires-archetype-shell-no-pageframe-alone]] — shipped rule 12 and the waiver this ticket tightens
- [docs/RULES.md](/docs/RULES.md) — hard rule 12
- [docs/PACKAGE.md](/docs/PACKAGE.md) — "The page-shape rule"
- [scripts/lint-design.mjs](/scripts/lint-design.mjs) — `PAGE_SHELL_HINT`, `findPageShellIssues`
