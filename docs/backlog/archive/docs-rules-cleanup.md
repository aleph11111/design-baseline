---
area: docs
opened: 2026-11-09
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-09T10:00:00Z
---

# Prune docs/RULES.md and docs/ARCHITECTURE.md of enforced and duplicated entries

## Context

`docs/RULES.md` hard rules 4, 5, 6, 7 and 9 are already owned by `commands/promote-archetype.md` (Maturity gate check, Notes), the sandbox demo typecheck and the `block-main-checkout-tracked-write` hook. `docs/ARCHITECTURE.md` carries a survey-draft disclaimer, a "known gap" note that no longer applies (`promote-archetype` now writes through `.worktrees/archetype-<slug>`), an out-of-date ADR count and a promotion-flow diagram that duplicates the command. Docs-only change; no code is touched.

## What to do

- [ ] Remove `docs/RULES.md` hard rules 4, 5, 6, 7 and 9 without renumbering the others (the lint messages in `scripts/lint-design.mjs`, `docs/adr/0009-figures-in-the-house-sans.md` and `docs/archetypes/detail-overview.md` cite rules 8, 10 and 12 by number).
- [ ] Keep hard rules 1, 2, 3, 8, 10, 11, 12 and every Guidelines bullet. Rules 10 and 12 are enforced by `lint-design`, but their numbers are cited from lint messages and `CHANGELOG.md`, so they stay as the explanation those messages point to.
- [ ] In `docs/ARCHITECTURE.md`: drop the "initial map, drafted from a survey" disclaimer clause, the "Known gap" paragraph, and the ADR count "0001–0007 as of 2026-10-01"; replace the Promotion flow diagram with a one-line pointer to `commands/promote-archetype.md`.
- [ ] Keep the archetype table in section 4 and all product invariants.

## Acceptance

- `docs/RULES.md` no longer contains rules 4, 5, 6, 7 and 9, and rules 1, 2, 3, 8, 10, 11, 12 keep their numbers and text.
- `docs/ARCHITECTURE.md` no longer contains the "Known gap" paragraph, the survey disclaimer, the `0001–0007` count or the flow diagram, and every other section is unchanged.
- No file other than these two docs and this ticket changes.

## Related

- [[invariants-page-title-collapse]]
- [ADR-0009](/docs/adr/0009-figures-in-the-house-sans.md) — cites RULES rule 8
