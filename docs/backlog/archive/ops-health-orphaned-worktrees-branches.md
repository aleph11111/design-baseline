---
area: ops-health
opened: 2026-07-19
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# Four ownerless git worktrees/branches accumulated in design-baseline with no ticket or ship-log trail

## Context

An ops-health sweep of `git worktree list` and `git branch -a` against `/Users/christoph/Documents/dev/design-baseline` found four `feat/*` worktrees/branches with no matching live owner — no entry in `~/.claude/state/pending-ships.jsonl`, and either no backlog ticket at all or a ticket whose lifecycle state contradicts the branch's actual merge status:

1. **`feat/style-baseline-stack-aware-preflight`** (worktree at `.worktrees/style-baseline-stack-aware-preflight`, HEAD `ea1e990`) — fully merged into `origin/main` (`git rev-list --left-right --count origin/main...feat/style-baseline-stack-aware-preflight` → `45  0`, i.e. zero commits ahead). Its ticket, `docs/backlog/archive/style-baseline-stack-aware-preflight.md`, is already `status: done`. This is exactly the case `/ship-cleanup` exists to reconcile (remove worktree, delete local branch, pull main) — it evidently never ran for this one.
2. **`feat/command-rail-primitives-surface`** (branch only, no worktree, HEAD `0d60378`, last commit 2026-06-21) — fully merged into `origin/main` (`65  0`). No matching ticket exists anywhere under `docs/backlog/` (root, `wip/`, or `archive/`), and no `pending-ships.jsonl` entry references it. A merged branch with zero paper trail — the worktree side was cleaned up at some point but the local branch ref was left behind.
3. **`feat/plex-ledger-board-finish`** (branch only, no worktree, HEAD `dea1f61`, last commit 2026-06-23) — same pattern as #2: fully merged into `origin/main` (`56  0`), no backlog ticket, no `pending-ships.jsonl` entry, stale local branch ref only.
4. **`feat/matrix-grid-per-cell-tooltip-perf`** (worktree at `.worktrees/matrix-grid-per-cell-tooltip-perf`, HEAD at last commit 2026-07-05) — **not** merged (`43  3`: 3 commits ahead of `origin/main`, unmerged). No backlog ticket exists for this slug in any of `docs/backlog/{,wip/,archive/}` (the only `matrix-grid-*` ticket on file, `archive/matrix-grid-page-header-inconsistency.md`, is an unrelated, already-archived issue). The worktree has sat untouched for two weeks with in-progress, unshipped work and nothing tracking it.

Per the ops-health ritual's read-only constraint, none of these worktrees, branches, or their contents were modified, removed, or merged during this sweep — this ticket is the only artifact produced.

## What to do

- [ ] For `feat/style-baseline-stack-aware-preflight`: confirm the corresponding PR is merged, then run the normal `/ship-cleanup` reconciliation (remove `.worktrees/style-baseline-stack-aware-preflight`, delete the local branch, pull `main`).
- [ ] For `feat/command-rail-primitives-surface` and `feat/plex-ledger-board-finish`: confirm both are merged into `origin/main` (evidence above), then delete the stale local branch refs (no worktree remains to remove for either).
- [ ] For `feat/matrix-grid-per-cell-tooltip-perf`: determine whether the 3 unmerged commits are live in-progress work (in which case file a proper backlog ticket for it and move it through the normal `/feat` → `/ship` lifecycle) or abandoned scratch work (in which case discard the worktree/branch deliberately, not silently).
- [ ] Consider whether `/ship-cleanup`'s reconciliation should be made more resilient to branches that get merged via a path it didn't observe (e.g. a merge from a since-removed worktree), since three of the four cases here involve a branch that outlived its worktree.

## Acceptance

- `git worktree list` in `design-baseline` no longer shows `.worktrees/style-baseline-stack-aware-preflight` or `.worktrees/matrix-grid-per-cell-tooltip-perf` (once each is resolved per above).
- `git branch -a` no longer lists `feat/style-baseline-stack-aware-preflight`, `feat/command-rail-primitives-surface`, or `feat/plex-ledger-board-finish` once confirmed merged and cleaned up.
- `feat/matrix-grid-per-cell-tooltip-perf` either has a corresponding backlog ticket tracking its unmerged work, or is explicitly removed with the decision recorded in this ticket's resolution.

## Related

- `~/.claude/CLAUDE.md`, "Parallel-Safe Workflow" — `/ship-cleanup` is the documented mechanism for reconciling merged PRs (remove worktree, delete local branch, pull main); these four cases are exactly what it's meant to catch.
- `docs/backlog/archive/style-baseline-stack-aware-preflight.md` — the archived, `status: done` ticket whose worktree/branch were never cleaned up.
- `[[feedback-donor-master-trunk-shipping]]` memory — notes that `gh`'s local branch-delete can fail under worktrees, a plausible root cause for why cleanup silently didn't complete for some of these.

## Resolution — 2026-07-19

**Root cause (supersedes the `gh`-branch-delete hypothesis above).** `gh api "repos/aleph11111/design-baseline/pulls?state=all&head=aleph11111:feat/<slug>"` returns **zero PRs for all four branches**. They were merged directly into `main` before this repo gained its GitHub origin on 2026-07-09. `/ship-cleanup` is driven entirely by `pending-ships.jsonl` entries keyed on `pr_number`, plus a step-10 reaper that sweeps only *remote* branches — so a locally-merged branch has neither a key to match nor a remote ref to sweep. Nothing failed silently; the cases were structurally invisible.

Merge status re-verified against a fresh `git fetch origin` (`git rev-list --left-right --count origin/main...<branch>`):

| Branch | Count | Disposition |
|---|---|---|
| `feat/style-baseline-stack-aware-preflight` | `47 0` | worktree removed, branch deleted |
| `feat/command-rail-primitives-surface` | `67 0` | branch deleted (no worktree) |
| `feat/plex-ledger-board-finish` | `58 0` | branch deleted (no worktree) |
| `feat/matrix-grid-per-cell-tooltip-perf` | `45 3` | **kept** — see below |

All three deletions used `git branch -d` (safe mode, which refuses unmerged branches) rather than `-D`, so git independently confirmed the merge status a second time. The `style-baseline` worktree was checked with `git status --porcelain -uno` before removal.

**Case 4 was deliberately not discarded.** `feat/matrix-grid-per-cell-tooltip-perf` holds complete, tested work: `MatrixGridShell.tsx` shares one `Tooltip` across all cells instead of one per cell, plus a new 104-line `MatrixGridShell.test.tsx`; the worktree is clean and its own ticket was already self-archived on the branch. Discarding it would have destroyed finished work with test coverage. Filed as [ship-stranded-matrix-grid-tooltip-branch.md](../ship-stranded-matrix-grid-tooltip-branch.md) — the branch and worktree are left in place for that ticket to rebase and ship. This satisfies the third acceptance criterion via its "has a corresponding backlog ticket tracking its unmerged work" arm.

**Item 4 (the `/ship-cleanup` resilience question) is answered and filed**, not implemented here: the fix belongs in `~/.claude/lib/ship-reconcile.sh` and `~/.claude/commands/ship-cleanup.md`, which are global config and cannot ride a design-baseline PR. Filed as [ship-cleanup-local-orphan-reaper.md](../ship-cleanup-local-orphan-reaper.md) with `kind: ops`.
