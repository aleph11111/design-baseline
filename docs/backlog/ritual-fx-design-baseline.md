---
area: ritual-fx
opened: 2026-07-19
status: ready
---

# Ritual effectiveness review — design-baseline (3 runs, 4 tickets filed, 4 shipped)

## Context

Meta-review joining the append-only run log at `~/.claude/state/ritual-runs.jsonl` against the current fate of every credited ticket slug across all four backlog lanes (`docs/backlog/`, `wip/`, `archive/`, `discarded/`). The question: are the rituals firing against this repo earning their cadence, or filing noise that rots?

The log holds **60 lines total, 0 malformed**; three of them name `design-baseline` as `project`. (A fourth line matches a naive `design-baseline` grep but belongs to `controlling-app` — the string appears inside its roadmap slug `frontend-tailwind4-design-baseline-realignment`. It is excluded.)

**Ticket fate — all 4 credited slugs resolved, 0 untracked:**

| ritual | runs | filed | shipped | discarded | still-open | median age (open) | untracked |
|---|---|---|---|---|---|---|---|
| `refactor` | 1 | 3 | 3 | 0 | 0 | — | 0 |
| `hygiene-week` | 1 | 1 | 1 | 0 | 0 | — | 0 |
| `design` | 1 | 0 | 0 | 0 | 0 | — | 0 |

Per-ritual read (from the numbers, not vibes):

- **`refactor` (2026-07-11) — high yield, 100% shipped. Keep.** Filed `refactor-list-state-resolution-helper`, `refactor-mode-aware-footer-core-duplication`, `refactor-shell-surface-header-slot-duplication`; all three are in `docs/backlog/archive/` and trace to shipped PR #7 (plus the follow-on #12/#13 shell-slot adoption work visible in `git log`). Best-performing ritual on this repo: three findings, three ships, zero rot, zero discard.
- **`hygiene-week` (2026-07-11) — low yield but 100% shipped. Prompt is fine; cadence is not.** Its single finding (`hygiene-week-dead-and-orphaned-exports`) is archived, shipped as PR #8. The run's own notes record that *every other* probe (stale TODO/FIXME, skipped tests, `ts-ignore` pragmas, empty catches, churn hotspots) "came back clean". One cluster found, everything else clean, on a repo that at the time was 28 days old — that is the signature of a sweep running tighter than the repo generates work.
- **`design` (2026-07-03) — not judgeable on ticket yield.** Logged as a one-off interactive Fable session with no `findings_count` and no `tickets_created`. Per `server/types.ts`, `design` is donor-scoped and interactive by construction (it opens a cmux session rather than spawning a headless ticket-filer), so a zero ticket count is expected behavior, not failure. It cannot be scored by this ritual's method and should be excluded from yield judgments.

**Never exercised on this repo (present in `RITUALS`, zero runs — cannot be judged yet):** `deps`, `security`, `arch-drift`, `docs-drift`, `archetype-audit`, `roadmap-drift`, `roadmap-completion-review`, `ops-health`, `test-gap`, `ritual-effectiveness` (this run is its first). Also `db-hygiene`, but that one is a definitional no-op here — it is documented as a no-op on repos without `supabase/config.toml`, and this repo has none.

**Two caveats that bound how hard these numbers can be leaned on:**

1. **n=4 tickets across 3 runs.** A 100% ship rate on four tickets is encouraging but not yet a stable signal. No ritual on this repo has enough history to justify a retirement.
2. **`runs` is a floor, not a true total.** `server/types.ts` documents the sibling `roadmap-decompose-runs.jsonl` as compacted to the latest line per key and describes that as mirroring `ritual-runs` — implying `ritual-runs.jsonl` retains only the most recent line per `project::ritual`. Consistent with that, each design-baseline ritual shows exactly one line. So "1 run" means "≥1 run, most recent shown"; historical cadence adherence is not recoverable from this file. This does not affect the ticket-fate join (which resolves slugs against the live backlog), only the run counts.

## What to do

One proposed action per ritual. **This ticket proposes only — the review run performed none of them.** No ritual definition, prompt, cadence, or existing ticket was modified; this file is the run's only write. The user decides and acts.

- [ ] `refactor` — **no change.** Earning its keep outright: 3 filed, 3 shipped, 0 rot. Leave the 30d cadence and prompt as-is.
- [ ] `hygiene-week` — **change cadence: slow 7d → 30d for this repo.** Rationale is yield, not quality: the prompt found a real cluster and it shipped, but every other probe returned clean on a then-4-week-old repo. This is a documentation/reference donor, not a running app — it does not accrue TODOs, flaky tests, or churn hotspots at a weekly rate. A 30d cadence matches the rate the repo actually generates hygiene work and stops burning runs on all-clean sweeps. (Cadence lives in `RITUALS` in `~/.claude/dashboard/server/types.ts` — outside this repo.)
- [ ] `design` — **no change**, and exempt it from effectiveness scoring. Interactive-by-design with no ticket-filing contract; scoring it on ticket yield is a category error. Worth considering whether future `ritual-fx` runs should skip it explicitly rather than re-deriving this each time.
- [ ] No ritual is a **retire** candidate. Retirement requires sustained negative value (many runs, near-zero shipped, high discard/rot); nothing here has either the run count or the rot to support it.
- [ ] No ritual is a **tune prompt** candidate. Tuning is indicated by tickets that rot or get discarded — this repo has zero of both.

## Acceptance

- [ ] User has read the per-ritual table and issued a verdict on each of the three exercised rituals.
- [ ] If the `hygiene-week` cadence proposal is accepted, `cadenceDays` for `hygiene-week` is changed in `~/.claude/dashboard/server/types.ts` (or scoped per-repo if the matrix supports it) — a change made deliberately by the user, not by this ritual.
- [ ] This ticket is moved to `archive/` (verdict acted on) or `discarded/` (verdict: no action warranted). Leaving it in `docs/backlog/` blocks the next `ritual-effectiveness` run by its own skip rule, so it should not sit here indefinitely.

## Related

- `~/.claude/state/ritual-runs.jsonl` — the append-only run log this review reads (read-only; outside this repo)
- `~/.claude/dashboard/server/types.ts` — `RITUALS` matrix, `RitualRun` shape, and the `design`-is-standalone note (read-only; outside this repo)
- `docs/backlog/archive/refactor-list-state-resolution-helper.md`, `refactor-mode-aware-footer-core-duplication.md`, `refactor-shell-surface-header-slot-duplication.md` — the `refactor` run's three shipped tickets (PR #7)
- `docs/backlog/archive/hygiene-week-dead-and-orphaned-exports.md` — the `hygiene-week` run's one shipped ticket (PR #8)

## Open question

Whether cadence should be per-repo rather than global. The `hygiene-week` proposal above only makes sense scoped to design-baseline — a 7d hygiene sweep is plausibly right for an app repo like `controlling-app` and clearly too tight for a docs/reference donor. If `RITUALS` cannot express per-repo cadence today, that limitation is the real finding, and the honest options are to add per-repo overrides or to accept a global compromise value. Not investigated here — it lives in the dashboard repo, outside this ritual's write scope.
