---
area: ui
opened: 2026-10-09
status: done
value: normal
model: sonnet
model_reason: "pattern-following: a new rule beside the existing page-tabs-in-toolbar toolbarTabs rule in scripts/lint-design.mjs"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-09T00:00:00Z
---

# Adherence lint flags a bare Switch in a PageFrame toolbar

## Context

`ToggleField` (`src/components/ui/toggle-field.tsx`, v0.7.0) is the on-ladder boolean toolbar filter, and `docs/STYLE.md` "Control heights" says a bare `Switch` (fixed `h-6` pill) never goes in a toolbar band. Nothing enforces it: `scripts/lint-design.mjs` has the `page-tabs-in-toolbar` rule (`toolbarTabs: true`) for tabs inside `toolbar={…}`, but no equivalent for `Switch`, so fleet repos keep shipping the 24px pill in bands until someone audits by eye. This is the enforcement half of the ToggleField ticket's "no bare `Switch` at `h-6` in a band" acceptance, which the independent review could not verify.

## What to do

- [ ] Add a `warn`-severity rule beside `page-tabs-in-toolbar` in `scripts/lint-design.mjs` that flags `<Switch` inside a `toolbar={…}` attribute and names `ToggleField` as the replacement (per ADR-0003, the zero-dep scanner).
- [ ] Reuse the `adherence-ok: <rule-id> — <reason>` opt-out the tabs rule already honours, and add a test in `scripts/lint-design.test.mjs` mirroring the `page-tabs-in-toolbar` describe block.
- [ ] Record the rule in the adherence ledger / `docs/STYLE.md` the same way the tabs rule is recorded.

## Acceptance

- A `<Switch>` inside a `PageFrame` `toolbar={…}` is reported by `lint-design` with a message naming `ToggleField`; a `ToggleField` there is not reported.
- No other bare `Switch` in any toolbar slot escapes the rule — the check is on the slot, not on one call site.
- The `adherence-ok` opt-out comment suppresses it, and the new test fails when the rule is removed.

## Related

- [[toolbar-boolean-toggle-ladder-gap]] — shipped ToggleField; this is its enforcement half
- [[adherence-lint-page-tabs-in-toolbar-need-viewswitch]] — the sibling rule to copy
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — zero-dep scanner
- [`docs/STYLE.md`](/docs/STYLE.md) — "Control heights"
