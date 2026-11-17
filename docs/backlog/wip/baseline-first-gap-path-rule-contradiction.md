---
area: docs
opened: 2026-11-06
status: ready
value: high
model: sonnet
model_reason: "scoped prose rewrite of two known lines; cause established, no design left open"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-06T00:00:00Z
---

# CLAUDE.md and RULES.md rule 1 contradict the baseline-first gap rule

## Context

`CLAUDE.md` line 76 (Project-Specific Notes) and `docs/RULES.md` rule 1 both say "Baseline never originates archetypes" and require a `promoted_from` source project that matured the shape first (Phase-4 migration started, stable one session). That contradicts the operator's archetype-gap rule (2026-10-28, extended to variants 2026-11-06): when a consumer lacks an archetype or variant, the design-baseline gap ticket ships FIRST, the consumer bumps its design-baseline dependency, and only then builds on the export; the consumer never hand-rolls a stopgap to mature. Repro: on 2026-11-06 a session read the CLAUDE.md line, launched controlling-app's `planset-line-editor-docked-inspector` before the baseline ticket `archetype-gap-matrix-grid-docked-inspector`, and had to halt it mid-build. The same wrong sentence is also in that gap ticket's own Context and What to do (consumer-matures-first).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Grep the whole repo (`CLAUDE.md`, `docs/RULES.md`, `docs/archetypes/README.md`, `docs/adr/`, `docs/PROMOTION-RADAR.md`, `docs/ARCHITECTURE.md`, `docs/backlog/`) for "never originates" / "mature in <consumer> first" wording and reword every hit, not only the two known lines. (Known today: `CLAUDE.md:76`, `docs/RULES.md:7`; `docs/archetypes/README.md` has no matching line.)
- [ ] Reword `CLAUDE.md` Project-Specific Notes so the gap path is baseline-first: gap ticket ships in baseline, consumer bumps its dependency, then builds on the export; no consumer stopgap to mature. `promoted_from` names the consumer shapes that motivated the archetype (fleet-synthesis precedent, as for `skeleton-loader`, MANIFEST `promoted_from: "brickshop-manager (fleet synthesis; hk-crm, controlling-app)"`).
- [ ] Reword `docs/RULES.md` rule 1 the same way, keeping its Why (baseline generalizes evidenced shapes, not invented ones — the evidence is the named consumer shapes) and the closed `report`/`calendar` exception set per [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md).
- [ ] Reword the consumer-matures-first lines in [[archetype-gap-matrix-grid-docked-inspector]] (Context final paragraph, first two What to do bullets) so that ticket is dispatchable baseline-first; do this in the same PR since the ticket carries the identical error.
- [ ] Check whether ADR-0001's "load-bearing invariant" paragraph needs a one-line pointer to the reworded rule; do not rewrite the accepted ADR's decision.

## Acceptance

- `CLAUDE.md` and `docs/RULES.md` rule 1 no longer say a consumer must mature an archetype before baseline ships it, and state the baseline-first gap path.
- A repo-wide grep for "never originates" and "mature in <consumer> first" returns no remaining hit that contradicts the baseline-first rule, including every other doc and every open ticket body, not only the two named lines.
- `docs/RULES.md` rule 1 still lists `report` and `calendar` as the closed exception set.
- `archetype-gap-matrix-grid-docked-inspector` no longer says it is blocked on consumer-side maturation.

## Related

- [[archetype-gap-matrix-grid-docked-inspector]] — carries the same wrong sentence; reworded in this PR
- [[page-requires-archetype-shell-no-pageframe-alone]] — origin of the no-stopgap rule (2026-10-28)
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — grandfathers `report`/`calendar`; states the invariant being reworded
- [docs/RULES.md](/docs/RULES.md) — rule 1
