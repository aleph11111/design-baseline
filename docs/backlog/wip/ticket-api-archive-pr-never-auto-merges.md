---
area: tooling
opened: 2026-07-20
status: ready
model: sonnet
model_reason: mirror an auto-merge call the /ship path already makes, plus a response-shape change; acceptance is exactly checkable
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T14:15:00Z
---

# Dashboard ticket API opens archive/enrich PRs but never enables auto-merge, so they strand

## Context

`POST /api/ticket/archive` (and the enrich endpoint alongside it) commits the ticket move and opens a PR, but never enables auto-merge. The PR then sits until a human notices. On 2026-07-20 three were open against `aleph11111/design-baseline`, all `MERGEABLE` / `CLEAN` with `autoMergeRequest = null`:

| PR | opened | what |
|----|--------|------|
| #50 | 2026-07-20 | archive `ship-cleanup-local-orphan-reaper` |
| #46 | 2026-07-20 | archive `ticket-collision-scan-misses-origin-main` |
| #5  | 2026-07-09 | enrich `vite-config-worktree-root-climb` (+14/−10) |

All three merged instantly and conflict-free under `gh pr merge --squash`. Nothing was blocking them but the missing flag — #5 had been waiting eleven days.

The consequence is not cosmetic. An archive PR that never merges leaves the ticket file at `docs/backlog/<slug>.md` on `origin/main`, so every consumer that reads that directory — `ls docs/backlog/`, the dashboard kanban, `/ticket`'s own collision scan — keeps listing resolved tickets as open. During the session that found this, both `ship-cleanup-local-orphan-reaper` and `ticket-collision-scan-misses-origin-main` showed as `status: ready` in the backlog listing *after* being archived through the API, which is actively misleading input to "what should I work on next".

The response shape compounds it. The endpoint returns `{"ok":true,"status":"archived","commit":"…","prUrl":"…"}` — `ok:true` with `status:"archived"` reads as a completed state change when the change has only been *proposed*. A caller has no way to distinguish "merged" from "PR opened, pending" without a follow-up API call.

`/ship` already gets this right: it opens its PR and then enables auto-merge (squash + delete remote branch on green CI), per the lifecycle described in `CLAUDE.md`. The fix is to make these endpoints match a behaviour the codebase already implements.

**This ships from the `aleph11111/dashboard` repo, not design-baseline** — the endpoint lives in the dashboard server, and the evidence above is simply where the stranded PRs happened to land.

## What to do

- [ ] Enable auto-merge on the PR opened by the archive endpoint, matching `/ship`'s existing behaviour (squash + delete remote branch on green CI).
- [ ] Apply the same change to the enrich endpoint — PR #5 was an enrich PR, so both paths strand.
- [ ] Distinguish proposed from applied in the JSON response: `status` should report `"pr-opened"` (or equivalent) when the change is pending a merge, and `"archived"` only once it has landed. Callers currently read `ok:true` as terminal.
- [ ] Sweep for already-stranded PRs from both endpoints across the configured repos and merge or close them — the backlog on `origin/main` is wrong for every repo where one is outstanding.

## Acceptance

- A ticket archived through `POST /api/ticket/archive` on a repo with green CI ends up in `docs/backlog/archive/` on `origin/main` with no human running `gh pr merge`.
- `gh pr list --state open --json number,autoMergeRequest` shows no archive/enrich PR with `autoMergeRequest = null` after the change.
- The archive endpoint's JSON response no longer reports `status: "archived"` at a point when the PR is still open.
- A repo whose CI is failing leaves the archive PR open rather than merging it, and the response reflects pending rather than archived.

## Related

- [backlog-archive-status-never-set-to-done.md](backlog-archive-status-never-set-to-done.md) — the other half of archive correctness, and **distinct**: that ticket is about the `status` field's *value* once a ticket lands in `archive/`; this one is about whether the archive move ever lands at all. Both must be fixed for the archive to be trustworthy.
- [archive/ship-cleanup-local-orphan-reaper.md](archive/ship-cleanup-local-orphan-reaper.md) — archived via PR #50, one of the three stranded PRs that surfaced this.
- [archive/ticket-collision-scan-misses-origin-main.md](archive/ticket-collision-scan-misses-origin-main.md) — archived via PR #46; its own subject (collision scans reading trunk) is directly degraded by stranded archive PRs, since trunk keeps showing the un-archived path.
- [archive/ship-rest-fallback-deletes-head-ref-on-failed-merge.md](archive/ship-rest-fallback-deletes-head-ref-on-failed-merge.md) — prior defect in the same PR-automation surface.
- `~/.claude/CLAUDE.md`, "Parallel-Safe Workflow" — defines the `/ship` auto-merge behaviour these endpoints should mirror.
