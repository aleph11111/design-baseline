---
area: tooling
opened: 2026-07-20
status: done
kind: ops
model: sonnet
model_reason: single scoped edit to one skill file with a clear before/after; no design ambiguity beyond the fetch question already answered below
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T09:26:19Z
---

# /ticket's collision scan is blind to tickets already on origin/main

## Context

`/ticket`'s step 4 ("Check for collisions") only looks at the working tree — `docs/backlog/<slug>.md`, `<root>/wip/`, `<root>/archive/` — and step 3's slug scan likewise reads `ls docs/backlog/*.md docs/backlog/archive/*.md`. In a repo where every feature runs in a `/feat` worktree cut from `origin/main`, the working tree is stale **by construction**: it shows the backlog as of branch-cut, not as of now. Any ticket filed to main after that point is invisible to the scan, so `/ticket` cannot detect the collision it exists to prevent, and its "Idempotent … Never duplicate" guarantee silently doesn't hold.

Concretely, 2026-07-19 in the `test-gap-logger-zero-tests` worktree (15 commits behind `origin/main`): `/ticket` filed `settings-table-set-spy-test-timeout` describing a vitest timeout flake. Three tickets for that same flake were already open on main — `settings-table-set-membership-test-times-out.md`, `settings-table-shell-selection-test-times-out.md`, `vitest-default-timeout-flaky-suite.md` — and the underlying issue had already been fixed there (`vitest.config.ts` `testTimeout: 30_000` + `maxWorkers: 4`, plus PR #25). The duplicate was caught by hand and deleted before shipping; nothing prevented it.

**Implementation target is outside this repo.** The skill body lives at `~/.claude/commands/ticket.md`, and `~/.claude` is not a git repository — so this change leaves no git artifact in `design-baseline` and cannot be done from a `/feat` worktree here (hence `kind: ops`). The ticket is filed in this backlog because this repo is where the failure was observed and where the parallel-worktree workflow that causes it is documented (`CLAUDE.md`, "Parallel-Safe Workflow").

## What to do

- [ ] In `~/.claude/commands/ticket.md` step 4, extend the collision check to consult the trunk ref in addition to the working tree — e.g. `git ls-tree -r --name-only origin/main docs/backlog/` — so tickets added to main after branch-cut are seen. Match against the same three locations (root, `wip/`, `archive/`).
- [ ] Extend step 3's slug-prefix scan the same way, so a slug that already exists on main is matched rather than reinvented under a near-synonym (the observed duplicate used a different slug for the same defect, which is why filename matching alone missed it).
- [ ] Do **not** add a `git fetch` to the capture path — read whichever `origin/main` ref is already local. Rationale: `/ticket` is the user's fast capture tool and a network round-trip on every thought is the wrong tradeoff; even a somewhat-stale `origin/main` ref strictly dominates the working tree, which is the actual bug. See Open question for the alternative.
- [ ] Degrade cleanly where the assumption doesn't hold: if `origin/main` doesn't resolve (no origin — e.g. a local-mode repo, per `/ship`'s own mode detection), skip the trunk half of the scan silently rather than erroring.
- [ ] When a trunk-only collision is found, surface it rather than silently extending: the existing "extend the file" branch edits a path that isn't in the working tree, so report it to the user instead of writing.

## Acceptance

- Running `/ticket <thought>` from a worktree whose branch predates a ticket on `origin/main` matches that existing ticket instead of filing a near-duplicate — reproducible against the observed case: from a branch cut before `settings-table-set-membership-test-times-out.md` landed, a vitest-timeout-flake thought no longer produces a new file.
- With no `origin` remote configured, `/ticket` still files normally and shows no error from the trunk scan.
- A collision found only on trunk is reported to the user, and no file is written to a path absent from the working tree.

## Related

- [stranded-test-gap-wizard-shell-branch.md](stranded-test-gap-wizard-shell-branch.md) — sibling parallel-session hygiene gap: branches invisible to the tooling that's supposed to reconcile them
- [ship-cleanup-local-orphan-reaper.md](ship-cleanup-local-orphan-reaper.md) — same class: reconciliation logic reading incomplete local state
- `CLAUDE.md` § "Parallel-Safe Workflow" — the `origin/main`-as-synchronization-point rule this ticket applies to `/ticket`

## Open question

Should the trunk scan `git fetch origin --quiet` first? Answered above as **no** — capture latency matters more than perfect freshness, and reading the existing `origin/main` ref already fixes the reported failure. Revisit if a duplicate is ever filed against a ticket that landed on main within the same session as the local ref's last fetch; that residual window is the known, accepted cost.
