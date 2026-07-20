---
area: tooling
opened: 2026-07-20
status: ready
kind: ops
model: opus
model_reason: reorders control flow in a destructive reaper that runs unattended via launchd — the safety gates must keep their ordering guarantees
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T14:05:00Z
---

# ship-reconcile.sh orphan discovery is unreachable on quiet runs and blind to half the fleet

## Context

Two independent defects in `~/.claude/lib/ship-reconcile.sh` (real path: `claude-skills/lib/ship-reconcile.sh` in the `aleph11111/dashboard` repo). Line numbers below are against the 524-line post-#66 file.

**1. Both reapers are unreachable on quiet cycles.** Section 2 ends with an early exit at :132:

```bash
[ "$total" -eq 0 ] && { rm -f "$snapshot"; log "nothing to reconcile"; exit 0; }
```

Section 3 ("Orphan discovery") sits *after* it at :296, and section 4 (the local-orphan reaper added by #66) at :403. So whenever `pending-ships.jsonl` is empty, the process terminates before **either** reaper runs. `~/.claude/state/ship-reconcile.log` confirms this empirically: the 10:00, 10:20, 10:40 and 10:54 launchd cycles on 2026-07-20 all logged `snapshot: 0 entries` / `nothing to reconcile` and stopped. Both reapers therefore only fire on cycles that happen to carry pending PR entries — the exact inverse of what an orphan sweep needs, since orphans accumulate precisely when nothing is in flight.

This makes #66's section 4 substantially dead code in practice: the population it targets (branches with no PR and no JSONL entry) is most likely to exist on exactly the cycles where the JSONL is empty and the script exits early.

**2. Section 3 is blind to repos without a `githubRepo`.** Section 3 builds its repo list with `jq -r '.repos[]? | select(.githubRepo) | ...'` (:313) against `~/.claude/dashboard/config.json`. Four of the eight configured repos carry no `githubRepo` field — `design-baseline`, `hk-crm`, `pmo`, and the dashboard itself — so worktree-orphan discovery has never examined any of them. The filter exists because section 3 needs a GitHub PR fetch, but applying it at *repo-selection* scope rather than at the fetch scope excludes those repos wholesale. Section 4 already gets this right (`jq -r '.repos[]? | .path'`, :442, no filter) — section 3 should match it.

The two compound: even on a cycle that reaches section 3, `design-baseline` is filtered out.

## What to do

- [ ] Hoist sections 3 and 4 above the empty-snapshot exit at :132, or convert that `exit 0` into a skip-forward, so both reapers run on every cycle regardless of JSONL contents.
- [ ] Preserve the existing safety gate ordering when reordering — the `status --porcelain -uno` WIP pre-check, the `docs/superpowers` untracked-spec check, and the `SKIP-UNARCHIVED` ticket guard must all still run before any `worktree remove --force`.
- [ ] Narrow section 3's `select(.githubRepo)` (:313) from a repo-level filter to a guard around only the PR-fetch portion, matching section 4's unfiltered `.repos[]? | .path` (:442).
- [ ] Note that `$cfg` is defined inside section 3 but section 4 reads it too — hoisting either section must keep that definition ahead of both uses.
- [ ] Confirm the reordering doesn't double-acquire `$MAIN_LOCK` — section 3 takes it per-entry via `$WITH_LOCK`, and section 2 must not already hold it at the new call site.

## Acceptance

- A launchd cycle with an empty `pending-ships.jsonl` logs an orphan-discovery summary line to `~/.claude/state/ship-reconcile.log` instead of stopping at `nothing to reconcile`.
- A merged-PR orphan worktree in a repo whose dashboard config entry has no `githubRepo` is reported by the run, where today it is silently skipped.
- A worktree with uncommitted tracked changes is still reported `DIRTY-WIP` and still exists after a run that reaches section 3 via the new path.
- `bash -n ~/.claude/lib/ship-reconcile.sh` passes and a `--repair-only` invocation still exits before both sections.

## Related

- [archive/ship-cleanup-local-orphan-reaper.md](archive/ship-cleanup-local-orphan-reaper.md) — the ticket that asked for section 4. **Resolved by dashboard PR #66 (`592a08e`, 2026-07-20 11:09)**, archived via design-baseline PR #50. That ticket's own body predates its resolution and never records it; this line is the resolution pointer. Its `kind: ops` was a misclassification — see `docs/lessons.md`.
- [ship-cleanup-step10-squash-misdetection.md](ship-cleanup-step10-squash-misdetection.md) — the other live defect in the same reaper family (ancestry vs content merge detection).
- [archive/ops-health-orphaned-worktrees-branches.md](archive/ops-health-orphaned-worktrees-branches.md) — the sweep whose four orphan cases went undetected by the automation these defects disable.
- `~/.claude/lib/ship-reconcile.sh` — sections 2 (:118) and 3 (:267).
- `~/.claude/commands/ship-cleanup.md` — step 0 delegates the mechanical loop here.
