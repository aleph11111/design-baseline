---
area: tooling
opened: 2026-07-20
status: done
kind: ops
model: sonnet
model_reason: the correct mechanic is already implemented and verified in dashboard PR #66 — this is porting a known-good content test into a second call site
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T00:00:00Z
---

# /ship-cleanup step 10 uses an ancestry test to detect squash merges, so its no-PR branch never fires

## Context

Step 10 of `~/.claude/commands/ship-cleanup.md` (the remote-branch reaper) classifies each orphan remote branch with `gh pr list`. When a branch has **no PR at all**, it falls through to this test:

```bash
ahead=$(git -C "$main" rev-list --count "origin/main..origin/$b" 2>/dev/null || echo 0)
if [[ "$ahead" -eq 0 ]]; then
  git -C "$main" push origin --delete "$b" ... "(no PR, fully merged via squash)"
```

The inline label says "fully merged via squash", but `rev-list --count` is an **ancestry** test and `/ship` squash-merges — a squash rewrites the branch's commits into one new commit with a fresh SHA, so `origin/main..<branch>` is **never** 0 for a squash-merged branch. That arm is therefore unreachable in practice: every no-PR merged remote branch lands in `needs_decision` instead of being reaped, which is the exact accumulation mode the step exists to prevent (its own comment records a 2026-06-07 drift incident where 52 merged orphans piled up unseen).

This is the same defect class fixed for the *local*-orphan reaper in dashboard PR #66, which replaced the ancestry test with a content test. Verified live on `design-baseline`: `ticket/ship-rest-fallback-deletes-head-ref` reports `ahead=1` while `merge-tree` confirms its work is already fully in `origin/main`.

`~/.claude/` is **not a git repo**, so `commands/ship-cleanup.md` is unversioned global config — this ships as a direct edit, not a PR in any repo. Hence `kind: ops`.

## What to do

- [ ] Replace step 10's `rev-list --count origin/main..origin/$b` no-PR test with the content test adopted in dashboard PR #66: `git merge-tree --write-tree origin/main <ref>` compared against `origin/main^{tree}`.
- [ ] Apply it against the **remote** ref (`origin/$b`), since step 10 reaps remote branches — unlike section 4 of `ship-reconcile.sh`, which tests local refs.
- [ ] Treat a nonzero `merge-tree` exit (conflict) as "branch contributes" and route to `needs_decision`, never delete.
- [ ] Correct the now-misleading inline comment so it states that ancestry tests cannot see a squash merge.

## Acceptance

- A remote branch with no PR whose work was squash-merged into `main` is reported as reaped and no longer appears in `git ls-remote --heads origin`.
- A remote branch with no PR carrying work absent from `origin/main` still appears under `needs decision` and is still listed by `git ls-remote --heads origin` after the run.
- Step 10 no longer contains `rev-list --count` as a merge-detection primitive.

## Related

- [docs/backlog/ship-cleanup-local-orphan-reaper.md](ship-cleanup-local-orphan-reaper.md) — the sibling ticket whose fix (dashboard PR #66) established the `merge-tree` content test this one ports.
- [docs/backlog/ship-rest-fallback-deletes-head-ref-on-failed-merge.md](ship-rest-fallback-deletes-head-ref-on-failed-merge.md) — another `/ship`-path correctness ticket.
- [docs/backlog/archive/ops-health-orphaned-worktrees-branches.md](archive/ops-health-orphaned-worktrees-branches.md) — the sweep that first surfaced orphan accumulation.
- `~/.claude/commands/ship-cleanup.md` — step 10 is the site to change.
