---
area: tooling
opened: 2026-07-20
status: done
kind: ops
model: opus
model_reason: requires judgment on whether unmerged work is redundant or genuinely lost — a wrong call silently discards tests
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T00:00:00Z
---

# Decide the fate of the stranded feat/test-gap-wizard-shell-no-tests branch

## Context

While verifying `ship-cleanup-local-orphan-reaper` against live state, two local branches in `design-baseline` turned up with **no remote ref** (`origin/...: entfernt`), **no worktree**, and **no entry in `pending-ships.jsonl`** — invisible to every existing `/ship-cleanup` step:

| branch | `merge-tree` vs `origin/main` | verdict |
|---|---|---|
| `ticket/ship-rest-fallback-deletes-head-ref` | tree unchanged | redundant — safe to reap |
| `feat/test-gap-wizard-shell-no-tests` | **4 files, +138 lines** | carries work not in `main` |

The second is the concern. Its remote branch was deleted — the signature of a completed `/ship` — yet its content is demonstrably absent from `origin/main`. Nearby history is ambiguous: `96b875c test(import-wizard): cover WizardShell step/footer state logic (#32)` looks like the same work landing under a different branch, while `3d48e9d feat/test gap logger zero tests (#34)` is a differently-slugged sibling. So the +138 lines are either a redundant duplicate of #32 or genuinely lost test coverage.

The new section-4 reaper (dashboard PR #66) correctly routes this branch to `needs_decision` rather than deleting it — but it stays stranded until someone adjudicates. This ticket is that adjudication.

## What to do

- [ ] Diff `feat/test-gap-wizard-shell-no-tests` against `origin/main` and against the merge commit of PR #32 to determine whether its 138 lines are a duplicate of the WizardShell coverage already shipped.
- [ ] If redundant: delete the local ref with `git branch -D` and record the finding, so the next `/ship-cleanup` run stops reporting it.
- [ ] If it carries unique coverage: open a `/feat` worktree from it, rebase onto current `origin/main`, and ship the tests via PR.
- [ ] Reap `ticket/ship-rest-fallback-deletes-head-ref` — `merge-tree` already confirms its work is fully in `origin/main`. (Note the `ticket/` prefix is outside the `feat|hotfix|chore|docs` set the reapers historically swept; section 4 adds it.)

## Acceptance

- `git branch --list 'feat/test-gap-wizard-shell-no-tests' 'ticket/ship-rest-fallback-deletes-head-ref'` returns empty after the work is resolved.
- If unique coverage was found, `npm test` on `origin/main` runs the WizardShell assertions that the stranded branch contained.
- A `ship-reconcile.sh` run reports `local_needs_decision=0` for the `design-baseline` repo.

## Related

- [docs/backlog/ship-cleanup-local-orphan-reaper.md](ship-cleanup-local-orphan-reaper.md) — the reaper that surfaced these two branches; dashboard PR #66 is its fix.
- [docs/backlog/archive/ops-health-orphaned-worktrees-branches.md](archive/ops-health-orphaned-worktrees-branches.md) — the earlier sweep that found the first generation of orphans.
- [docs/backlog/archive/test-gap-form-page-shell-no-tests.md](archive/test-gap-form-page-shell-no-tests.md) — sibling test-gap ticket, shipped.

## 2026-07-20 — resolved: branch deleted, nothing lost

Adjudicated during a `/ship-cleanup` run. `feat/test-gap-wizard-shell-no-tests`
was **fully superseded**; the local branch has been deleted (`git branch -D`,
was `de0179d`).

Evidence that nothing was lost:

- `src/components/archetypes/import-wizard/WizardShell.test.tsx` is **byte-identical**
  to the copy already on `origin/main` (shipped as #32) — `git diff` between the two
  blobs is empty.
- `vitest.config.ts` was the only other substantive file, and the branch's version is
  **strictly worse** than main's. Both set `testTimeout: 30_000`, but main additionally
  carries `maxWorkers: 4` with measured justification (7 failing files uncapped → 1 at
  `--maxWorkers=2`; wall-clock ~49s → ~4s). Merging the branch would have *removed*
  the worker cap.

Worth noting for the `ship-cleanup-local-orphan-reaper` design: the `merge-tree`
content test correctly reported this branch as "contributes content" — the content
was simply a **regression**. That is why the content test must route to
`needs decision` and never auto-delete: "differs from main" and "is worth keeping"
are not the same question.
