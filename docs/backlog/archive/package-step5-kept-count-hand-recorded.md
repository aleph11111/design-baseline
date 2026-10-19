---
area: docs
opened: 2026-10-19
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-19T00:00:00Z
---

# PACKAGE.md step 5 tells consumers to hand-record kept count in the donor radar

## Context

`docs/PACKAGE.md` "Migrating a vendored consumer" step 5 (lines 451-467) tells the consumer to record its kept-file count in this donor's `docs/promotion-radar.json` `sync` row. A consumer PR cannot edit this repo (the same paragraph says so), so the count goes stale by construction, exactly like the hand-recorded pin did (per [[promotion-radar-sync-rows-derive-from-pins]]). The `sync` row in `docs/promotion-radar.json` (lines 439-444) is a frozen 2026-10-10 snapshot of both pin and kept counts, and its `action` text and `docs/PROMOTION-RADAR.md:96` repeat the hand-record rule. Repro: follow step 5 from a consumer `/feat` worktree; the target file is in another repo.

## What to do

- [ ] Before editing, grep every caller of the touched file / key (`kept-file`, `kept count`, `sync` row text in `docs/PACKAGE.md`, `docs/PROMOTION-RADAR.md`, `docs/promotion-radar.json`, and the dashboard's radar read path); fix at the shared point, not only the call site this report names.
- [ ] Precondition: confirm the dashboard's `/promotion-radar` route derives each consumer's kept count (count consumer files under `components/ui` + `components/layout` on its truth ref, same as the pin). If it does not yet, file that dashboard work first and do not edit this repo until it lands.
- [ ] Drop the hand-recorded kept counts from the `sync` row in `docs/promotion-radar.json` and rewrite its `action` text to say both pin and kept count are derived.
- [ ] Rewrite `docs/PACKAGE.md` step 5 as "nothing to record", keeping the note that a consumer PR cannot edit this repo.
- [ ] Update `docs/PROMOTION-RADAR.md:96` to match.

## Acceptance

- `docs/PACKAGE.md` step 5 shows "nothing to record" and no longer tells a consumer to edit `docs/promotion-radar.json`.
- No other doc in this repo tells a consumer to hand-record a kept-file count or a pin in the donor radar.
- The Radar tab shows each consumer's kept count with no edit to the donor repo, after the dashboard derives it.

## Related

- [[promotion-radar-sync-rows-derive-from-pins]] — shipped the pin derivation; this finishes the same ownership move for the kept count.
- [[promotion-radar-stale-overlay-sync-pass]] — earlier pass over the same `sync` rows.
- [[package-ui-ownership-and-vendored-consumer-runbook]] — introduced the step 5 kept-count rule.
- [docs/PACKAGE.md](/docs/PACKAGE.md) — "Migrating a vendored consumer" step 5.
