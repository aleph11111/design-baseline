---
area: tooling
opened: 2026-07-20
status: done
model: sonnet
model_reason: two-line control-flow fix in a shell block with a precisely described failure and an obvious guard; no design decisions left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T00:00:00Z
---

# /ship's REST merge fallback deletes the PR head ref even when the merge failed

## Context

Step 10 of the global `/ship` command (`~/.claude/commands/ship.md`) has a REST fallback for when `gh pr merge --auto --squash --delete-branch` errors. That fallback runs two `gh api` calls in sequence: a `PUT repos/$repo/pulls/$pr_num/merge` to squash-merge, then a `DELETE repos/$repo/git/refs/heads/$head_ref` to clean up the remote branch. The DELETE is guarded only by `|| true` — it is *not* conditional on the PUT succeeding, so a failed merge still deletes the branch.

Observed 2026-07-20 shipping `test-gap-use-is-mobile-zero-tests` from this repo. The PUT returned `HTTP 405 "Base branch was modified"` — a benign parallel-ship race, `origin/main` advanced between `gh pr create` and the merge — but the DELETE ran anyway, removing `feat/test-gap-use-is-mobile-zero-tests` from the remote and thereby closing PR #21 unmerged. GitHub refuses `gh pr reopen` on a PR whose head ref has been deleted (`GraphQL: Could not open the pull request`), so recovery required re-pushing the branch and opening a brand-new PR (#27) — losing the original PR's identity and review thread. The failure mode is worst exactly when it is most likely: parallel `/ship` runs, which is the workflow this repo is built around.

The 405 itself is recoverable in-band — `git fetch origin && git rebase origin/main`, force-push, retry the PUT — which is the same rebase step 6 already performs before the push.

## What to do

- [ ] In `~/.claude/commands/ship.md` step 10, make the head-ref DELETE conditional on the merge PUT succeeding: wrap it as `if gh api -X PUT ".../merge" -f merge_method=squash >/dev/null; then gh api -X DELETE ".../refs/heads/$head_ref" >/dev/null 2>&1 || true; else …; fi` rather than running the two calls unconditionally in sequence.
- [ ] On a failed PUT, exit non-zero with the API error printed and the remote branch left intact, so the operator can rebase and re-run `/ship` against the still-open PR.
- [ ] Add a single retry for the specific `405 "Base branch was modified"` case: `git fetch origin && git rebase origin/main` (aborting on conflict, as step 6 does), force-push with `--force-with-lease`, then retry the PUT once before giving up.

## Acceptance

- [ ] When the REST merge PUT fails, `gh pr view --json state` still returns `OPEN` and `git ls-remote --heads origin <branch>` still shows the head ref — the branch is no longer deleted out from under an unmerged PR.
- [ ] A `/ship` run that hits `405 "Base branch was modified"` completes the merge after its own rebase+retry, without the operator opening a replacement PR.
- [ ] The successful-merge path is unchanged: after a green PUT the head ref is still deleted and `gh pr view --json state` returns `MERGED`.

## Related

- [ship-cleanup-local-orphan-reaper.md](ship-cleanup-local-orphan-reaper.md) — the other `/ship`-lifecycle gap; orphaned-worktree reaping when the JSONL record is missing.
- [ship-stranded-matrix-grid-tooltip-branch.md](ship-stranded-matrix-grid-tooltip-branch.md) — a branch stranded by a `/ship` step that never fired.
