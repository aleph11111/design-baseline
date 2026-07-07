---
area: tooling
opened: 2026-07-07
status: ready
model: opus
model_reason: mechanism decision (grep/AST script vs ESLint flat-config) + multi-file ripple across the config, the /adopt-baseline skill, and three methodology docs
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-07T00:00:00Z
---

# The donor _adherence.oxlintrc.json (ADOPTION.md gate 2) does not actually run in oxlint

## Context

The design-baseline ships `_adherence.oxlintrc.json` as the mechanical half of ADOPTION.md gate 2, and `/adopt-baseline` distributes + wires it into consumers. It does not work. Discovered while wiring it into hk-crm (IMPLEMENTATION Step 1): (1) **oxlint does not implement `no-restricted-syntax`** — the rule all three "active" bans (bare `<h1>`/`<table>`/`<button>`) are built on — it errors `Rule 'no-restricted-syntax' not found in plugin 'eslint'`; (2) **oxlint rejects the config's non-schema keys** (`_doc`, `_candidate_rules_todo`) — `unknown field`. So the config fails to load and enforces nothing. The earlier verification only ran `python3 -m json.tool` (JSON syntax), never oxlint, so this shipped in donor v0.3.0/0.3.1 (ADR-0002) undetected. hk-crm now runs a working zero-dep grep gate (`scripts/lint-design.mjs`, same three rules, case-sensitive so `<Button>` isn't flagged) as the interim — that script is the proven reference for option (b).

## What to do

- [ ] Pick the mechanism and rebuild `_adherence.oxlintrc.json` around it. **Recommended: a small zero-dep AST/grep script** (`scripts/lint-design.mjs`, ported from hk-crm) so consumers with no ESLint get a working gate out of the box; alternative is an ESLint flat-config using `no-restricted-syntax` (ESLint supports it, but adds ESLint as a required mechanism).
- [ ] Make the config file itself schema-valid: move the `_doc` / `_candidate_rules_todo` prose to a sibling `_adherence.NOTES.md` (pattern already used in hk-crm) so nothing but real config keys remain — regardless of which mechanism wins.
- [ ] Update `/adopt-baseline` (`~/.claude/commands/adopt-baseline.md`) to distribute + wire the working mechanism (Step 3 copy, Step 4 `lint:design` script, Step 5 scaffold), not the broken oxlint config.
- [ ] Correct the references that call it an oxlint config: `docs/ADOPTION.md` (gate 2 row), `docs/PLACEMENT.md`, `docs/ARCHITECTURE.md`, and the README methodology table.

## Acceptance

- [ ] Running the shipped `lint:design` in a fresh consumer exits 0 and reports the three bans as warnings — no `Rule 'no-restricted-syntax' not found` or `unknown field` error.
- [ ] The config file loads with no schema error (no `_`-prefixed comment keys remain in it).
- [ ] `/adopt-baseline` wires a `lint:design` that actually runs; `/adopt-baseline --check` still scores gate 2 green when it's wired.
- [ ] ADOPTION.md / PLACEMENT.md / ARCHITECTURE.md no longer describe gate 2 as an oxlint `no-restricted-syntax` config when it isn't one.

## Related

- [style-archetypes-methodology-distribution.md](archive/style-archetypes-methodology-distribution.md) — built `/adopt-baseline`, which distributes the broken config
- [style-baseline-stack-aware-preflight.md](archive/style-baseline-stack-aware-preflight.md) — sibling tooling/preflight work
- ADR-0002 — Adopt the baseline-upstream methodology docs (shipped the config)
