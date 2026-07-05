---
area: archetypes
opened: 2026-07-05
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-05T00:00:00Z
---

# report and calendar archetypes carry `authored` with no `promoted_from`, violating "baseline never originates"

## Context

Two entries in `docs/archetypes/MANIFEST.json` — `report` and `calendar` — are marked *authored directly* with no `promoted_from` source project, documented in `docs/ARCHITECTURE.md` §9 and the archetype map (§ lines flag both as "authored directly (no `promoted_from`)"). This contradicts the load-bearing invariant recorded in this repo's `CLAUDE.md` project notes: **baseline never originates archetypes** — every entry should trace to a `promoted_from` source project that passed the maturity gate (spec locked or ADR'd, v1+, Phase-4 migration started, stable for one session). `CLAUDE.md` already calls these two out as "a pre-existing exception to flag, not a pattern to repeat." This ticket is that flag, made durable so the exception is resolved rather than silently normalized.

## What to do

- [ ] Decide the disposition for each of `report` and `calendar`: either (a) backfill a real `promoted_from` source project + `promoted_at` if one genuinely exists, or (b) formally grandfather them as sanctioned exceptions with an explicit `authored: true`-style marker and a one-line rationale in the MANIFEST entry so they no longer read as un-audited drift.
- [ ] If grandfathering, record the decision as an ADR under `docs/adr/` (the promotion maturity gate already references "a governing ADR" as an alternative to `status: locked`), and update `docs/RULES.md` so the "baseline never originates" rule names these two as the closed set of exceptions.
- [ ] Update `docs/ARCHITECTURE.md` §9 to reflect the resolution (remove or reframe the open-question bullet).

## Acceptance

- Every entry in `MANIFEST.json` either has a `promoted_from` value or an explicit, documented exception marker — no entry is silently `authored` with no trace.
- `docs/ARCHITECTURE.md` §9 no longer lists report/calendar's missing `promoted_from` as an open question.
- The "baseline never originates" rule in `docs/RULES.md` names the exact set of sanctioned exceptions (or none, if backfilled).

## Related

- [decouple-archetype-contract-from-reference-impl.md](archive/decouple-archetype-contract-from-reference-impl.md)
- [archetype-doc-manifest-version-drift.md](archive/archetype-doc-manifest-version-drift.md)
- `docs/ARCHITECTURE.md` §9 — open questions / uncertainty
- `docs/archetypes/MANIFEST.json` — the registry carrying both entries
- `CLAUDE.md` "Project-Specific Notes" — where the exception is first flagged

## Open question

Whether a real `promoted_from` source exists for either archetype (backfill) or they were genuinely hand-authored in the donor (grandfather) — resolve before choosing disposition (a) vs (b).
