# 0003 — Adherence lint ships as a zero-dep scanner, not an oxlint config

- **Status:** Accepted
- **Date:** 2026-07-07
- **Supersedes:** the `_adherence.oxlintrc.json` mechanism decided in [ADR-0002](0002-adopt-baseline-upstream-methodology.md) (the four methodology docs it adopted stand unchanged).

## Context

ADR-0002 shipped `_adherence.oxlintrc.json` as the mechanical half of ADOPTION.md gate 2 — three bare-tag bans (`<h1>`/`<table>`/`<button>`) built on oxlint's `no-restricted-syntax` — and `/adopt-baseline` distributed and wired it into consumers. **It never ran.** Discovered while wiring it into hk-crm:

1. **oxlint does not implement `no-restricted-syntax`** — the rule all three bans depend on. It errors `Rule 'no-restricted-syntax' not found in plugin 'eslint'`.
2. **oxlint rejects the config's non-schema keys** (`_doc`, `_candidate_rules_todo`) — `unknown field`.

So the config failed to load and enforced nothing. The v0.3.0 verification only ran `python3 -m json.tool` (JSON syntax), never oxlint, so this shipped undetected. Gate 2 was a no-op in every consumer that adopted it.

Two mechanisms were on the table: (a) a small zero-dep Node scan script, or (b) an ESLint flat-config using `no-restricted-syntax` (ESLint, unlike oxlint, does implement it).

## Decision

**Replace the oxlint config with a zero-dependency Node scanner.**

- **`scripts/lint-design.mjs`** — walks the target dirs for `.tsx` files and flags the bare banned tags with a heuristic source scan. Case-sensitive, so the DS primitives `<Button>`/`<Table>` are never flagged. Warnings exit 0 (allowed during rollout); any `error`-severity hit exits 1 — the ratchet.
- **`_adherence.json`** — schema-clean rules data (`targets` + `rules[]`, each with `tag`/`severity`/`message`). Replaces `_adherence.oxlintrc.json`. No `_`-prefixed comment keys — the prose moved out.
- **`_adherence.NOTES.md`** — the `_doc` intro + `_candidate_rules_todo` ledger, sibling to the config so the config stays pure data.
- `/adopt-baseline` distributes all three and wires `lint:design` -> `node scripts/lint-design.mjs`; `--check` scores gate 2 on the new artifacts.

**Why (a) over (b):** the whole point of gate 2 is that a consumer gets a working check out of the box. A zero-dep script needs only Node — no ESLint added as a required mechanism, no config-format lock-in. (b) would make gate 2 depend on the consumer already running ESLint, which many baseline targets do not. The zero-dep script is the proven interim already running in hk-crm.

## Consequences

- Gate 2 actually runs now. A fresh consumer's `lint:design` exits 0 and reports the three bans as warnings — no `Rule not found` / `unknown field` errors.
- The mechanism is still **partial by design** — only the three bare-tag bans are expressible as a tag scan. The rest (AppShell frame, one-primary-per-header, RowActionsMenu, ad-hoc error colors, no local skeletons, version stamps) stay in the `_adherence.NOTES.md` ledger and human review (gate 4) until the scanner grows AST-aware checks. Wiring it is "gate 2 is started," not "done."
- ADOPTION.md bumps 1.0 → 1.1, MANIFEST `adoption` 1.0 → 1.1, `plugin.version` 0.3.1 → 0.3.2. PLACEMENT.md needed no change — it already described gate 2 mechanism-agnostically ("the baseline adherence lint").
- The `targets` field lets a consumer retarget the scan to its app-page dirs (the donor default `["src"]` also scans the primitive definitions, which legitimately contain the raw elements they wrap).
