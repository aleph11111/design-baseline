---
area: tooling
opened: 2026-08-03
status: ready
model: opus
model_reason: schema extension (tag-scan -> pattern-scan) plus a severity/scope policy call, not a mechanical port
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-03T12:39:09Z
---

# Port audit-signals conformance rules into the adherence lint config

## Context

`_adherence.json` — the mechanical half of ADOPTION.md gate 2 (per ADR-0003) — ships only three
warn-severity, tag-scan rules (`no-bare-h1`, `no-raw-table`, `no-bare-button`), each matched by
`scripts/lint-design.mjs`'s bare-open-tag regex (`scripts/lint-design.mjs:61`). `docs/audit-signals.json`
measures a different, fleet-wide `conformance` set for the dashboard's periodic audit scan:
`literal-color`, `weak-focus-ring`, `raw-html-control` (`docs/audit-signals.json:19-21`). Because
`lint:design` never checks those three, a consumer can pass it clean while still carrying literal
Tailwind color classes — 196 `literal-color` hits in brickshop-manager per the 2026-08-03 fleet
scan. `docs/ADOPTION.md`'s gate-2 row already advertises "raw hex/px/palette classes" as something
gate 2 catches (`docs/ADOPTION.md:60`), which is aspirational, not true of the current scanner.

## What to do

- [ ] Add `pattern`-based rule support to the `_adherence.json` schema alongside the existing
  `tag` rules, and extend `scripts/lint-design.mjs` to match an arbitrary regex per rule, not
  just the bare-open-tag prefix it hardcodes today (`scripts/lint-design.mjs:61`).
- [ ] Port `literal-color`, `weak-focus-ring`, and `raw-html-control` from `docs/audit-signals.json`'s
  `conformance` array into `_adherence.json` as new `pattern` rules, translating the ripgrep PCRE
  regexes to JS-`RegExp`-compatible form (ADR-0003 mandates the scanner stay zero-dependency — no
  shelling out to `rg`) and reusing each entry's `shouldUse` text as the rule `message`.
- [ ] Scope the ported `raw-html-control` pattern to `input|select|textarea` only, dropping
  `button` (and `table`, if present) since those tags already have dedicated rules
  (`no-bare-button`, `no-raw-table`) — porting the full alternation would double-warn the same line.
- [ ] Ship the three new rules at `"severity": "warn"`, matching the existing rules' rollout
  convention documented in `_adherence.NOTES.md` ("Warnings allowed during rollout; flip a rule
  to `error` ... as its violation class is cleaned") — flipping straight to `error` would break CI
  in any consumer carrying existing violations, e.g. brickshop-manager's 196 `literal-color` hits.
- [ ] Update `docs/ADOPTION.md`'s gate-2 row wording to match what the mechanism now actually
  catches, once the three rules are ported (`docs/ADOPTION.md:60`).
- [ ] Remove the three ported checks from `_adherence.NOTES.md`'s "Candidate rules — still awaiting
  custom tooling" ledger — they're now mechanized, not AST-blocked (`_adherence.NOTES.md:26-43`).

## Acceptance

- [ ] `node scripts/lint-design.mjs` run against a fixture file containing a literal-color class
  (e.g. `bg-slate-100`) reports a `warn` line citing the new rule, matching what `docs/audit-signals.json`'s
  `literal-color` regex flags in the fleet scan.
- [ ] `docs/ADOPTION.md`'s gate-2 row no longer claims coverage (raw hex/px/palette classes) the
  scanner doesn't have, once the port lands.
- [ ] `_adherence.NOTES.md`'s candidate-rule ledger no longer lists `literal-color`, `weak-focus-ring`,
  or a bare-tag ban that duplicates the ported `raw-html-control` rule.

## Related

- [docs/adr/0003-adherence-lint-zero-dep-scanner.md](../adr/0003-adherence-lint-zero-dep-scanner.md) —
  the zero-dep-scanner decision this ticket extends, not replaces
- [archive/adherence-lint-oxlint-mechanism-nonfunctional.md](archive/adherence-lint-oxlint-mechanism-nonfunctional.md) —
  prior gate-2 mechanism fix (oxlint config to `lint-design.mjs`); this ticket is the next gap in
  the same mechanism
