---
area: tooling
opened: 2026-09-11
status: done
value: normal
model: sonnet
model_reason: mechanical deletion of an already fleet-decided dead hook, no design judgment left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-11T00:00:00Z
---

# Delete dead unwired warn-backlog-archive.sh hook script

## Context

`.claude/hooks/warn-backlog-archive.sh` (65 lines) is a PreToolUse hook script that never fires: this repo has no `.claude/settings.json` at all (confirmed via `find .claude -maxdepth 2 -type f` — the only file in `.claude/` is the hook script itself), so there is no wiring anywhere that could invoke it. Fleet decision 2026-09-06 (coding-dashboard `docs/backlog/archive/fleet-delete-dead-machinery.md`) retired this hook fleet-wide: it lives in neither `~/.claude/hooks` nor `fleet/hooks`, `/ship`'s `ship-archive-wip.sh` already enforces archive coherence by moving the wip ticket to `archive/` in the same PR, and the per-repo copies (this one included) are unowned forks of an early fleet scaffold that generate false-positive refactor tickets. That fleet decision requires a delete ticket per consumer repo; this is the one for design-baseline.

## What to do

- [ ] Delete `.claude/hooks/warn-backlog-archive.sh`. Do not replace it with anything — `/ship`'s `ship-archive-wip.sh` already owns the archive-coherence invariant this hook duplicated.

## Acceptance

- `grep -rn warn-backlog-archive .claude docs` returns nothing
- `.claude/hooks/warn-backlog-archive.sh` no longer exists in the repo
- no settings file anywhere in the repo points at a missing hook (moot here in practice — this repo carries no `.claude/settings.json` at all, so there was never a wiring entry to remove)

## Related

- [fleet-delete-dead-machinery.md](../../coding-dashboard/docs/backlog/archive/fleet-delete-dead-machinery.md) — the fleet-wide decision (2026-09-06) that retired `warn-backlog-archive.sh`; this ticket is the design-baseline instance of the per-consumer-repo delete it requires
