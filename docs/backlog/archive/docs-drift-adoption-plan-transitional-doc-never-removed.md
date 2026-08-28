---
area: docs-drift
opened: '2026-08-27'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-27T15:06:30.913Z'
---

# adoption-plan.md still marked transitional-and-to-delete seven weeks after its migration

## Context

`docs/adoption-plan.md` closes with its own disposal instruction (line 59):

> "_Transitional artifact — delete `docs/adoption-plan.md` in a follow-up commit once you're satisfied._"

The file documents the 2026-07-05 migration of this repo into a managed git project (per `CLAUDE.md`'s "now a managed git project (as of 2026-07-05...)" note). Today is 2026-08-27 — over seven weeks later — and the file is still present and still carries that self-contradicting instruction: an operator reading it now is told by the doc itself that it should already be gone.

Compounding this, the doc's own "Risk notes" section (line 56) is separately stale:

> "No `docs/backlog/README.md` documenting this repo's ticket frontmatter schema."

`docs/backlog/README.md` exists now (confirmed present) and is exactly the schema-authority doc this line says is missing — the gap this transitional plan flagged has since been closed, but the plan was never updated or removed to reflect that.

Both point to the same root cause: this "transitional" doc was never revisited after the migration it planned actually landed, so it now misleads on two independent claims.

## What to do

- [ ] Decide whether `docs/adoption-plan.md` still carries information not captured elsewhere (e.g. in `CLAUDE.md` or `docs/backlog/README.md`); if not, delete it per its own stated disposal instruction.
- [ ] If any part is worth keeping, fold it into a living doc (`CLAUDE.md` / `docs/backlog/README.md`) and then delete `docs/adoption-plan.md`, rather than leaving a "delete me" note unresolved indefinitely.
- [ ] If the file is kept intentionally as historical record, strike the stale "No `docs/backlog/README.md`" risk note and the "delete this file" closing instruction so it stops contradicting current repo state.

## Acceptance

- `docs/adoption-plan.md` either no longer exists, or no longer contains a "delete this file" instruction alongside a "no `docs/backlog/README.md`" claim while `docs/backlog/README.md` is present.

## Related

- [docs/backlog/README.md](../../backlog/README.md) — the schema-authority doc whose existence contradicts the plan's "Risk notes" claim.
- [docs-drift-promotion-radar-md-stale-candidate-status.md](docs-drift-promotion-radar-md-stale-candidate-status.md) — another instance in this same ritual of an operator doc that stopped being updated after the milestone it tracked passed.
