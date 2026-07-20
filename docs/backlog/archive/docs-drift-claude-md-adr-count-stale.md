---
area: docs-drift
opened: 2026-07-19
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# CLAUDE.md Doc Paths block claims no ADRs exist, but three are recorded

## Context

`CLAUDE.md`'s "Doc Paths" block (line 21) reads:

> - `decisions: docs/adr/` *(per-file ADRs `<NNNN>-<slug>.md`; index at `docs/adr/INDEX.md`; no ADRs recorded yet)*

`ls docs/adr/` shows three ADRs already recorded plus the index: `0001-grandfather-authored-report-calendar.md`, `0002-adopt-baseline-upstream-methodology.md`, `0003-adherence-lint-zero-dep-scanner.md`, and `INDEX.md`. `docs/ARCHITECTURE.md` §9 independently confirms ADR 0001 exists and that "further ADRs are expected as this repo's own architecture decisions mature" — i.e. the donor's own architecture doc already treats ADRs as an established, in-use mechanism, not an empty placeholder.

This is a Doc Paths navigational annotation (not ADR content itself, which is arch-drift's territory) — its job is to tell an operator what to expect at `docs/adr/` before they go look, and it currently tells them the opposite of what's there. An operator relying on this line to decide "is there governing-ADR precedent for X" would wrongly conclude there is none to check.

## What to do

- [ ] Update or remove the `no ADRs recorded yet` parenthetical in `CLAUDE.md`'s Doc Paths block now that `docs/adr/` holds three ADRs, or replace it with a non-drifting phrase that doesn't need to be updated every time a new ADR is filed (e.g. drop the count claim entirely and just point to `docs/adr/INDEX.md`).

## Acceptance

- `CLAUDE.md`'s Doc Paths block no longer states or implies `docs/adr/` is empty while `docs/adr/*.md` (excluding `INDEX.md`) is non-empty.

## Related

- `docs/adr/INDEX.md` — the authoritative, already-current list this annotation should defer to instead of restating a count.
