---
area: ops-health
opened: '2026-10-01'
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
  graded_at: '2026-10-01T18:37:49.914Z'
value: low
---

# Land or drop the orphaned lint-design exclude-glob test branch

## Context

Local and remote branch `feat/lint-design-exclude-glob-literal-dot` (commit `67f00fe`, 2026-09-07) holds one unmerged commit: `test(lint-design): pin an exclude glob's . to a literal near-miss case`, +24 lines in `scripts/lint-design-core.test.mjs`. It has no worktree (`git worktree list` shows none), no PR (`gh pr list --head feat/lint-design-exclude-glob-literal-dot --state all` returns `[]`), no entry in `~/.claude/state/pending-ships.jsonl`, and no ticket in `docs/backlog/` (including `wip/` and `archive/`). `/ship` evidently never ran, so a finished regression test sits unreviewed for 3+ weeks while `origin/main` moves on.

## What to do

- [ ] Rebase the branch on `origin/main` and check the test still passes against current `scripts/lint-design-core.mjs`.
- [ ] If still valid, ship it via `/ship`; if superseded, delete the local and remote branch.

## Acceptance

- After the fix, `git branch --list 'feat/lint-design-exclude-glob-literal-dot'` no longer shows an ownerless branch.
- The near-miss test is present in `origin/main`'s `scripts/lint-design-core.test.mjs`, or the branch is gone with a stated reason.

## Related

- [scripts/lint-design-core.test.mjs](/scripts/lint-design-core.test.mjs)
