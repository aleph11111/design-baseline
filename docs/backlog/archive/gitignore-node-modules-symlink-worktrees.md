---
area: tooling
opened: 2026-08-13
status: ready
model: sonnet
model_reason: One-character .gitignore edit with a deterministic verification command.
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-13T09:55:00Z
---

# .gitignore misses the node_modules symlink in /feat worktrees

## Context

`.gitignore:1` carries the pattern `node_modules/`. The trailing slash makes it
directory-only, which is correct for the primary checkout — but a `/feat` worktree
does not get a directory. `/feat` scaffolds `node_modules` as a **symlink** back to
the shared install (`node_modules -> ../../node_modules` in
`.worktrees/<slug>/`), and a directory-only pattern does not match a symlink. The
result is that every worktree reports `?? node_modules` in `git status --porcelain`
forever. That trips `/ship`'s precondition 2 ("clean working tree"), so each ship
from a worktree has to reason about whether the untracked entry is real work or
scaffold before proceeding. It never is — the symlink is created by `/feat` and is
never committable. Note the file already writes `.design-sync/node_modules` without a
trailing slash, so the slashless form is the in-file precedent.

## What to do

- [ ] Drop the trailing slash on `.gitignore:1` — `node_modules/` becomes `node_modules`, which matches both the directory in the primary checkout and the symlink in every `/feat` worktree.
- [ ] Confirm no tracked file is newly ignored by the change (the slashless pattern is strictly broader, so a path like `src/node_modules-helper.ts` would be unaffected, but a directory *named* `node_modules` nested anywhere still matches as before).

## Acceptance

- [ ] `git check-ignore -v node_modules` run from a `/feat` worktree matches `.gitignore:1` instead of exiting non-zero.
- [ ] `git status --porcelain` in a freshly scaffolded worktree returns empty, so `/ship`'s clean-tree precondition passes with no manual reasoning.
- [ ] `git ls-files --error-unmatch` still resolves every previously tracked path — the broader pattern un-tracks nothing.

## Related

- [archive/ops-health-orphaned-worktrees-branches.md](../archive/ops-health-orphaned-worktrees-branches.md)
- [archive/vite-config-worktree-root-climb.md](../archive/vite-config-worktree-root-climb.md)
