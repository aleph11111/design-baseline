---
area: docs
opened: 2026-10-19
status: done
value: normal
model: sonnet
model_reason: "scoped doc edit across three files with an established cause; the signal definition is decided in the ticket"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-19T00:00:00Z
---

# Promotion-radar tag-lag sync rule can never clear

## Context

The "donor package tag lag" sync rule says a consumer "more than one minor behind the newest donor tag" is a `sync` row. It appears in `docs/PACKAGE.md` step 5 of "Migrating a vendored consumer" (~line 463) and in the `action` string of the tag-lag row in `docs/promotion-radar.json` (~line 446); `docs/PROMOTION-RADAR.md` (the "donor package tag lag" bullet, ~line 92) describes the row without restating the threshold. At the donor's release cadence the rule cannot be met: the newest tag is `v0.12.2` (2026-10-18) while 5 of 6 consumers (all but hk-crm at `v0.11.4`) still pin `v0.9.3`, so those five are permanently flagged and the signal carries no information. 17 tags landed on a single day (2026-09-28), so a minor-count threshold measures donor release churn, not consumer drift. Repro: `git tag --sort=-creatordate --format='%(refname:short) %(creatordate:short)'` against the consumer pins in the `projects` strings of the same `docs/promotion-radar.json` row (~lines 439-444).

Chosen fix: a time-based lag, because the alternative the report floated (flag only when a closed-API removal row lies between the consumer's tag and the newest) is not mechanically derivable. The "Closed-API removals per archetype version" table in `docs/PACKAGE.md` (~line 375) is keyed by archetype MANIFEST version in mixed formats (`(3.0, #122)`, `(v0.6.5)`, `(2.0)`), not by donor tag, so it cannot be compared against two tags without a hand-built mapping.

The rule is prose only: the dashboard's `/promotion-radar` route (`server/routes/design.ts` in coding-dashboard) overlays each consumer's pin but has no code that evaluates "minor behind", so the fix lives in this repo's docs. Separately, the rule cites "STACK.md hazard 5", which is about unstamped vendored peers (`react-day-picker`, `sonner`, ...), not tag lag; that cross-reference is wrong.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. (Grep the whole repo for `minor behind`, `tag lag` and `hazard 5` so every restatement of the rule is covered, not only the two above.)
- [ ] Replace the rule with a time-based one: a consumer whose pinned tag's date is more than 14 days older than the newest donor tag's date is a `sync` row (dates from `git tag --format='%(creatordate:short)'`). State the same rule, word for word, in `docs/PACKAGE.md` step 5 and in the `action` string of the tag-lag row in `docs/promotion-radar.json`, and add the threshold to the `docs/PROMOTION-RADAR.md` bullet.
- [ ] Keep the second trigger unchanged (kept-file count grew since last recorded) and drop or correct the "STACK.md hazard 5" citation in the `action` string.
- [ ] Re-derive which consumers the new rule flags today and keep the `projects` snapshot and any prose naming flagged consumers consistent with that result.

## Acceptance

- After the change, the tag-lag rule reads identically in `docs/PACKAGE.md` and `docs/promotion-radar.json`, and no other doc in the repo still says "one minor behind".
- A consumer pinned to the newest tag, or to a tag less than 14 days older than it, is no longer a sync row, while a consumer pinned 14+ days behind still is.
- `docs/promotion-radar.json` still parses as JSON after the `action` edit.
- No other restatement of the tag-lag rule or the "hazard 5" citation remains in the repo.

## Related

- [[promotion-radar-sync-rows-derive-from-pins]] — made the pin derived at request time; this fixes the threshold that reads it
- [[promotion-radar-stale-overlay-sync-pass]] — earlier pass on the same sync rows
- [[package-tag-post-v0-2-0-sync]] — earlier tag-sync doc ticket
