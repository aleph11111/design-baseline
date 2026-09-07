---
area: tooling
opened: '2026-09-07'
status: ready
value: normal
model: sonnet
model_reason: one .gitignore line beside the existing tasks/ and .worktrees/ entries; no design decision left
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-07T00:00:00Z'
---

# Add /ship's .ship-tmp scratch dir to this repo's .gitignore

## Context

`/ship` creates a per-run scratch dir at `<worktree-toplevel>/.ship-tmp` for its temp files
(the spec-standalone reason, the docs-only path list, merge error bodies). This repo's
`.gitignore` does not carry the entry, so the dir shows up as an untracked change: during the
2026-09-07 ship of PR #219 `gh pr create` printed `Warning: 1 uncommitted change` and
`git status --porcelain` showed `?? .ship-tmp/`. The `/ship` skill's own mode-detection block
documents the consequence: a repo lacking the line passes step 2's clean-tree precondition on
a first ship (the check runs before the dir is created) but trips it on a **re-ship**, which
is exactly the run that matters — a re-ship happens after a rebase conflict or a partial
failure. `/init-workflow` step 6 appends the line for new scaffolds; this repo predates that.
The `.gitignore` already ignores the sibling fleet scratch paths `tasks/` (`:4`),
`.worktrees/` (`:8`) and `.captures/` (`:9`).

## What to do

- [ ] Add `.ship-tmp/` to `.gitignore` next to the existing `tasks/`, `.worktrees/` and
      `.captures/` fleet-scratch entries.

## Acceptance

- [ ] `git status --porcelain` is empty after a `/ship` run that created `.ship-tmp/`, so a
      re-ship passes the clean-tree precondition rather than refusing.
- [ ] `git check-ignore -v .ship-tmp/` names the new `.gitignore` line, and every other
      fleet-scratch path the repo already ignores (`tasks/`, `.worktrees/`, `.captures/`)
      still resolves to its own existing line — no entry is displaced.

## Related

- [archive/gitignore-node-modules-symlink-worktrees.md](../archive/gitignore-node-modules-symlink-worktrees.md) — prior .gitignore/worktree-scratch fix
- [archive/ship-cleanup-step10-squash-misdetection.md](../archive/ship-cleanup-step10-squash-misdetection.md) — prior /ship precondition defect
- [archive/ship-rest-fallback-deletes-head-ref-on-failed-merge.md](../archive/ship-rest-fallback-deletes-head-ref-on-failed-merge.md) — prior /ship recovery-path defect
