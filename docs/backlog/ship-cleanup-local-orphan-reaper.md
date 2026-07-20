---
area: tooling
opened: 2026-07-19
status: ready
kind: ops
model: opus
model_reason: touches a destructive shell reaper that runs unattended via launchd — safety gating needs real judgment
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T13:20:00Z
---

# Add a local-orphan reaper to /ship-cleanup for branches merged outside its view

## Context

`/ship-cleanup` cannot see a merged branch whose merge it never observed, and the ops-health sweep of `design-baseline` produced four concrete instances. Querying `gh api "repos/aleph11111/design-baseline/pulls?state=all&head=aleph11111:feat/<slug>"` returned **zero PRs for all four** — they were merged directly into `main` before this repo gained its GitHub origin on 2026-07-09.

The gap is structural, not a bug. `~/.claude/commands/ship-cleanup.md` has exactly two drivers: steps 1–9 iterate `~/.claude/state/pending-ships.jsonl`, and every one of them is keyed on a `pr_number` (step 5 resolves state via `gh api repos/<owner/repo>/pulls/<pr_number>`; step 8 deletes JSONL entries by matching that same key). Step 10's reaper then sweeps `git -C "$main" ls-remote --heads origin` — **remote** branches only. A branch merged locally has no `pr_number` to key on and no remote ref to sweep, so it is invisible to every step. Three of the four cases were merged local branches whose worktree had already been removed, leaving only a stale local ref; the fourth was a merged worktree+branch pair (`feat/style-baseline-stack-aware-preflight`) whose ticket had even reached `status: done` in `archive/` while its worktree sat untouched.

The mechanical counterpart that needs the same change is `~/.claude/lib/ship-reconcile.sh`, the pure-shell script `ship-cleanup.md` step 0 delegates to, which also runs unattended via the `com.christoph.ship-reconcile` launchd agent every 20 minutes (logging to `~/.claude/state/ship-reconcile.log`). Per that skill's own Architecture note — "if you change the mechanical loop, change it in the script, not by re-inlining it here" — the reaper logic belongs in the script, with `ship-cleanup.md` documenting it.

**This ticket targets `~/.claude/` global config, not the `design-baseline` repo**, so it cannot ship via a design-baseline PR — hence `kind: ops`.

## What to do

- [ ] Add a local-orphan reaper to `~/.claude/lib/ship-reconcile.sh`, and document it as a new step in `~/.claude/commands/ship-cleanup.md` (keeping the two in sync per that file's Architecture section).
- [ ] Enumerate local branches matching `^(feat|hotfix|chore|docs)/` — the same prefix set step 10 already uses for its remote sweep.
- [ ] Skip any branch that has a live entry in `~/.claude/state/pending-ships.jsonl` — those are in flight and belong to the existing PR-driven path.
- [ ] For each remaining branch, run `git -C "$main" rev-list --count origin/main..<branch>`; treat `0` as fully merged.
- [ ] For a merged branch, remove its worktree gated by the existing `git -C "$worktree" status --porcelain -uno` WIP pre-check that step 6 already documents, then delete the ref with `git branch -d` (safe mode — it refuses unmerged branches, giving a second independent safety check on top of the rev-list count).
- [ ] Route branches with commits ahead into the existing `needs_decision` bucket surfaced to the user; never delete them.
- [ ] Iterate the branch list with `while IFS= read -r`, not `for b in $var` — step 10's inline comment records that zsh does not word-split unquoted vars in `for` loops, which silently made an earlier reaper run once over a newline-joined blob.

## Acceptance

- Running `~/.claude/lib/ship-reconcile.sh` against a repo containing a locally-merged `feat/*` branch with no PR and no JSONL entry reports that branch as reaped, and `git branch` afterwards no longer lists it.
- A `feat/*` branch with commits ahead of `origin/main` is reported under `needs decision` and still appears in `git branch` after the run.
- A worktree with uncommitted tracked changes (non-empty `git status --porcelain -uno`) is skipped with a message and still exists after the run.
- A branch with an open PR recorded in `pending-ships.jsonl` is untouched by the new reaper — it continues to be handled by the existing steps 5–9.
- The unattended launchd run logs the new reaper's summary line to `~/.claude/state/ship-reconcile.log`.

## Related

- [docs/backlog/archive/ops-health-orphaned-worktrees-branches.md](archive/ops-health-orphaned-worktrees-branches.md) — the sweep that produced the four-case evidence; its item 4 is this ticket.
- [docs/backlog/ship-stranded-matrix-grid-tooltip-branch.md](ship-stranded-matrix-grid-tooltip-branch.md) — the one unmerged case from that same sweep, deliberately preserved rather than reaped.
- `~/.claude/commands/ship-cleanup.md` — steps 0, 6, and 10 are the ones this change extends.
- `~/.claude/lib/ship-reconcile.sh` — the mechanical script where the loop belongs.
- `~/.claude/CLAUDE.md`, "Parallel-Safe Workflow" — defines `/ship-cleanup` as the documented reconciliation mechanism.

## 2026-07-20 — evidence: still unimplemented, and the plan above would not work

Three findings from a live `/ship-cleanup` run on `design-baseline`. The first two
are verifiable right now; the third is reported deliberately without attribution.

### 1. `ship-cleanup.md` already claims this is done — it is not

`~/.claude/commands/ship-cleanup.md:152` (step 11) states:

> **Implemented mechanically in `~/.claude/lib/ship-reconcile.sh` section 4** — per the
> Architecture note below, the loop lives in the script; this entry documents it. Step 0's
> delegation already runs it, so there is nothing to inline here.

**There is no section 4.** `ship-reconcile.sh` carries exactly three numbered sections:
`1. Self-heal` (:72), `2. Snapshot under lock` (:118), `3. Orphan discovery` (:267). No
code path in the script enumerates local branches for reaping.

This is worse than the gap being open, because the skill now *asserts* the gap is closed.
Anyone — human or agent — reading `ship-cleanup.md` will believe local orphans are
handled and stop looking. The doc ran ahead of the script. Whoever implements this ticket
must land the code and the doc together; whoever does not should revert :152 to describe
it as pending.

Note also that section 3 is a **worktree**-orphan reaper, not a local-branch one, and it
early-exits on `[ -z "$pr_num" ] && continue` — a branch that never had a PR is invisible
to it by construction. That is precisely the population this ticket exists to cover.

### 2. The "What to do" above is stale — it prescribes an ancestry test

Two bullets specify `git rev-list --count origin/main..<branch>` with `0` meaning merged,
and `git branch -d` as "a second independent safety check". Both are **ancestry** tests,
and `ship-cleanup.md`'s own step 11 text now contradicts them directly:

> For a fully-merged branch `rev-list --count origin/main..<b>` is therefore **never 0**,
> `git branch -d` **refuses** it (same ancestry test — not an independent check)

`/ship` squash-merges, which rewrites the branch into one new commit with a fresh SHA, so
neither test can recognise a merged branch. Implemented as written, the reaper would never
fire on anything — the same defect as the sibling ticket
[ship-cleanup-step10-squash-misdetection.md](ship-cleanup-step10-squash-misdetection.md).
The correct test is the content one: `git merge-tree --write-tree origin/main <branch>`
equal to `origin/main^{tree}`. Update these bullets before implementing, and keep
`branch -D` (not `-d`) since `-d` cannot see a squash merge.

### 3. A branch and worktree disappeared; cause unattributed

During the same run, `feat/crud-dialog-footer-submitting-label` (local-only, never pushed,
no PR, no JSONL entry, clean worktree) lost both its ref and its worktree. It was present
and healthy earlier in the session — `git worktree list` showed it, and a rebase was
attempted in it and cleanly aborted.

**No cause was established, and none should be assumed.** The two scripts run during the
window cannot account for it: `ship-reap-remote-branches.sh` only issues
`git push origin --delete` (remote-only, verified — no local `branch -d`/`-D` anywhere in
it), and `ship-reconcile.sh` section 3 skips branches with no merged PR. Several sessions
work this repo in parallel, so another session remains a plausible and unexamined
explanation. Recording it here as an **observation, not a diagnosis**.

No work was lost: commit `068a0f5` remained in the object store with its parent chain
intact and the ref has been restored via `git branch feat/crud-dialog-footer-submitting-label 068a0f5`.
The worktree was not recreated. Separately, that branch turns out to be fully superseded —
`main` implements the same localizable-submitting-label feature better, via shared
`ActionFooterBar` + `archetypes/shared/submittingLabel.ts` (#10), with the i18n case
already covered in `FormPageActions.test.tsx`; merging the branch would revert that
refactor.

The transferable point for this ticket's acceptance criteria: a reaper must treat
"differs from `main`" as a prompt to ask, never as licence to delete. Both branches
adjudicated in this session reported "contributes content" under the content test, and in
both cases the content was a **regression** against what had already landed.
