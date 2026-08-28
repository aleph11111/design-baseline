---
area: docs-drift
opened: '2026-08-27'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-27T15:06:30.921Z'
---

# PROMOTION-RADAR.md candidates table lags its own JSON source of truth

## Context

`docs/PROMOTION-RADAR.md` states its own authority chain: "machine-readable source of truth is [`promotion-radar.json`](./promotion-radar.json), which the dashboard hub renders." The Markdown "Candidates" table (lines 15-24) still lists two rows as in-flight:

> `| Skeleton list loader | promote | ... | hk-crm, brickshop, controlling-app | candidate |`
> `| Chronological media feed | adopt-existing | ... | mistra, brickshop | candidate |`

and the "Next actions" section (line 50) says:

> `1. Promote the six **candidate** rows into the donor (each: primitive/variant + gallery demo + MANIFEST/version touch).`

But `docs/promotion-radar.json` — the doc's declared source of truth — records both as already resolved: `skeleton-list-loader` has `"status": "promoted", "promotedAt": "2026-07-23"`, and `media-feed-adopt-feeditem` has `"status": "promoted"` (`git log` shows commit `2c53903 feat: close media-feed-adopt-feeditem on radar (adopt-existing, archetype H) (#73)`). `docs/archetypes/MANIFEST.json` independently confirms `skeleton-loader` shipped with `"promoted_at": "2026-07-23"`. In fact every candidate in the JSON's `candidates` array is now `status: "promoted"` — zero remain `candidate` — so "Promote the six candidate rows" describes work that is already done. `git log --oneline -- docs/PROMOTION-RADAR.md` shows its last edit at commit `6b80ab0` (promote native color/file inputs, #63), while `docs/promotion-radar.json` has advanced through at least `#73`, `#74`, `#83` since — the prose table simply stopped being updated after the JSON kept moving.

An operator skimming `docs/PROMOTION-RADAR.md` for "what's still open on the radar" would wrongly believe six items await promotion and go looking for work that's already shipped.

## What to do

- [ ] Update `docs/PROMOTION-RADAR.md`'s Candidates table so `Skeleton list loader` and `Chronological media feed` reflect their `promoted` status and `promotedAt` dates from `docs/promotion-radar.json`, matching the formatting already used for the other four rows (`**promoted YYYY-MM-DD**`).
- [ ] Rewrite or remove the "Promote the six candidate rows" line in "Next actions" now that the JSON shows zero open candidates, and add the JSON-only promoted entries (`native-field-wrappers`/raw-input, `raw-label`, `raw-textarea`, `raw-select`, `overline-typed`, `segmented-toggle`, `entity-circle`) that never surfaced in the prose table at all.
- [ ] Consider noting in the doc's "How it works" section that the Markdown table is generated/curated from the JSON and needs a manual sync step, or link a process for keeping them aligned, since this is the second time the two have diverged.

## Acceptance

- `docs/PROMOTION-RADAR.md`'s Candidates table no longer shows any row as `candidate` when `docs/promotion-radar.json` records that same `id` as `promoted`.
- The "Next actions" section no longer claims six candidate rows remain when `docs/promotion-radar.json`'s `candidates` array shows zero entries with `status: "candidate"`.

## Related

- [docs/promotion-radar.json](../promotion-radar.json) — the machine-readable source this ticket brings the prose table back in line with.
- [docs/archetypes/MANIFEST.json](../archetypes/MANIFEST.json) — independently confirms `skeleton-loader`'s `promoted_at: 2026-07-23`.
