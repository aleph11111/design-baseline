---
area: archetypes
opened: 2026-07-19
status: done
model: opus
model_reason: rebase requires judgment about which commits to drop vs keep against a main that moved 45 commits
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# Rebase and ship the stranded matrix-grid per-cell tooltip perf branch

## Context

The worktree at `.worktrees/matrix-grid-per-cell-tooltip-perf` holds finished, tested, never-shipped work. Its branch `feat/matrix-grid-per-cell-tooltip-perf` carries 3 commits and has been untouched since 2026-07-05, sitting 45 commits behind `origin/main` and 3 ahead, with a clean working tree. The work itself: `src/components/archetypes/matrix-grid/MatrixGridShell.tsx` is changed to share a single `Tooltip` across all grid cells instead of instantiating one per cell (the perf fix, +35/-… lines), accompanied by a new 104-line `MatrixGridShell.test.tsx`. Its own backlog ticket was already moved to `docs/backlog/archive/matrix-grid-per-cell-tooltip-perf.md` **on that branch**, which is why no ticket for it is visible from `main` — the branch was completed and self-archived but the `/ship` step never fired.

The complication is the third commit, `ae94820 "fix: align test infra with the convention already landed on master"`, which adds a `vitest.config.ts`, `package.json` test-script changes, and 1169 lines of `package-lock.json` churn. That test infra has **since landed on `main` independently** — `docs/backlog/vite-config-worktree-root-climb.md` records `vitest.config.ts` arriving via the `segmented-control-radio-keyboard` work, and `CLAUDE.md` now documents `npm test` (vitest run) as a standing donor command. So the branch's test-infra commit is redundant against current `main` and is the part most likely to conflict on rebase.

Discovered by the ops-health orphaned-worktrees sweep (`docs/backlog/archive/ops-health-orphaned-worktrees-branches.md`). It was deliberately **not** discarded during that sweep, because it is finished work carrying its own test coverage.

## What to do

- [ ] Rebase `feat/matrix-grid-per-cell-tooltip-perf` onto current `origin/main` from inside its existing worktree.
- [ ] Drop or reconcile commit `ae94820` — its `vitest.config.ts` / `package.json` / `package-lock.json` changes duplicate the test infra already on `main` (per `docs/backlog/vite-config-worktree-root-climb.md`). Take `main`'s version of all three files rather than the branch's.
- [ ] Keep commit `e1b7adb` — the shared-`Tooltip` change to `MatrixGridShell.tsx` and its `MatrixGridShell.test.tsx` are the actual deliverable.
- [ ] Drop commit `8e2e863` (the `wip/` backlog move) and reconcile the ticket file: the branch archives it as `docs/backlog/archive/matrix-grid-per-cell-tooltip-perf.md`, so ensure exactly that one path survives the rebase.
- [ ] Confirm `MatrixGridShell.test.tsx` still matches the test conventions on current `main` (it was written against the branch's own vitest setup, which is being dropped).
- [ ] Run `npx tsc --noEmit` and `npm test`, then `/ship`.

## Acceptance

- `git rev-list --left-right --count origin/main...feat/matrix-grid-per-cell-tooltip-perf` shows `0` on the left after the rebase (branch is on top of current main).
- `npm test` passes and its output includes the `MatrixGridShell` test file, showing the archetype's tests actually run under `main`'s vitest config.
- `git diff origin/main...HEAD --stat` after the rebase no longer lists `vitest.config.ts`, `package.json`, or `package-lock.json` — only the `MatrixGridShell` source, its test, and the archived ticket.
- `npx tsc --noEmit` returns clean.
- After `/ship` merges, `git worktree list` no longer shows `.worktrees/matrix-grid-per-cell-tooltip-perf` and `git branch` no longer lists the branch.

## Related

- [docs/backlog/archive/ops-health-orphaned-worktrees-branches.md](archive/ops-health-orphaned-worktrees-branches.md) — the ops-health sweep that found this branch stranded and deliberately preserved it.
- [docs/backlog/vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — records the `vitest.config.ts` that landed on `main` independently, making this branch's test-infra commit redundant.
- [docs/backlog/archive/matrix-grid-page-header-inconsistency.md](archive/matrix-grid-page-header-inconsistency.md) — the other, unrelated `matrix-grid-*` ticket; already archived, easy to confuse with this one.
- `docs/ARCHITECTURE.md` §3 "Component map" — where `src/components/archetypes/matrix-grid/` sits.
