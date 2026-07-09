---
area: docs
opened: 2026-07-09
status: ready
model: sonnet
model_reason: doc reconciliation against verified current git state, no design decisions
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-09T14:52:47Z
---

# CLAUDE.md's local-only/no-GitHub-remote claim is now stale

## Context

`CLAUDE.md`'s "What This Is" section states: *"This repo is local-only (no GitHub remote); its own truth ref is local `main`."* The "Project-Specific Notes" section repeats this: *"Local-only repo: no GitHub remote; truth ref is local `main`. `/ship` merges directly rather than opening a PR."* Both claims are now false — `git remote -v` shows a real GitHub origin (`https://github.com/aleph11111/design-baseline.git`). This was confirmed during the `list-with-detail-shell-presentation-split` ticket (2026-07-09): `/ship`'s mode-detection (`git remote get-url origin`) correctly picked GitHub mode and ran the standard push → PR → auto-merge flow (PR #2, squash-merged into `main`), not the local trunk-squash flow the doc describes. The "How We Work Together" section's "no remote" framing and the lifecycle line about `/ship` landing "directly onto local `main` rather than opening a PR" are affected by the same drift.

## What to do

- [ ] Update `CLAUDE.md`'s "What This Is" section to drop or correct the "local-only (no GitHub remote)" claim now that `origin` points at `github.com/aleph11111/design-baseline`.
- [ ] Update "Project-Specific Notes" → "Local-only repo" bullet to describe the current GitHub-backed `/ship` flow (push branch, open PR, auto-merge squash) instead of "merges directly ... rather than opening a PR".
- [ ] Update "How We Work Together" section's lifecycle line ("no remote ... `/ship` lands the branch directly onto local `main` rather than opening a PR") to match.
- [ ] ? Confirm with the user whether the GitHub origin is a deliberate, permanent change or a temporary/experimental addition — if temporary, note that explicitly in the doc instead of rewriting it as the new steady state.

## Acceptance

- `CLAUDE.md` no longer asserts "no GitHub remote" or "local-only" anywhere while `git remote -v` shows a configured `origin`.
- The doc's description of `/ship`'s behavior matches what `/ship` actually does today (GitHub mode: push + PR + auto-merge), verified by re-reading the updated section against the `/ship` skill's mode-detection logic.

## Related

- Auto-memory `feedback-donor-master-trunk-shipping` (updated 2026-07-09) — documents the same drift and the classifier-confirmation workaround needed for the merge step under the current GitHub-mode flow.
- PR #2 (`feat/list-with-detail-shell-presentation-split` → `main`) — the ship that surfaced this drift.
