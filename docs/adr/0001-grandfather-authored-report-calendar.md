# 0001 — Grandfather the baseline-authored `report` and `calendar` archetypes

- **Status:** Accepted
- **Date:** 2026-07-05

## Context

The load-bearing invariant of this donor is **"baseline never originates archetypes"** (`docs/RULES.md` Rule 1): every archetype must trace back to a `promoted_from` source project that built and used the shape first, so the baseline only ever generalizes *proven* shapes. Twelve of the fourteen MANIFEST entries satisfy this — each carries a `promoted_from` (a single source project, or a `fleet-audit-*` multi-source promotion).

Two entries do not. `report` (key `R`) and `calendar` (key `Cal`) carry `authored: "2026-06-23"` with **no `promoted_from`**. Their origin is recorded in commit `e0c50ea` ("Add two new archetypes from the Plex Ledger Gallery board: report + calendar"): they were drafted directly in the donor from the **Plex Ledger gallery mockup board** — the donor's own House Style B design surface (`docs/STYLE.md` §B), *not* a consuming project. The commit is explicit: *"authored, not promoted; single-mockup origin, so they enter as v1.0 baseline-authored archetypes."*

This was flagged as a known exception in three places (`CLAUDE.md` project notes, `docs/RULES.md` Rule 1, `docs/ARCHITECTURE.md` §4) but never resolved, so it read as un-audited drift rather than a sanctioned decision.

Two dispositions were possible:

- **(a) Backfill** a real `promoted_from` — rejected. No consuming source project exists. A gallery mockup board is not a project that "built and used" the shape through Phases 1–4; recording one would falsify provenance and is strictly worse than an honest exception.
- **(b) Grandfather** — accept them as a closed, documented set of baseline-authored exceptions.

## Decision

**Grandfather `report` and `calendar` as sanctioned baseline-authored archetypes.**

- Each MANIFEST entry keeps its `authored` date and gains an explicit `authored_reason` field that states the single-mockup origin, cites this ADR, and marks the set as closed.
- This ADR is the **governing ADR** referenced by the promotion maturity gate (`docs/RULES.md` Rule 4a: "source spec has `status: locked` OR a governing ADR exists"). It sanctions these two specifically; it does **not** open a general path for authoring new archetypes in the donor.
- `report` and `calendar` are the **complete and closed set** of authored exceptions. No future entry may be added with `authored`/no `promoted_from`; Rule 1 continues to bind for everything else.

## Consequences

- Every MANIFEST entry now either has a `promoted_from` value or an explicit, ADR-backed `authored_reason` — no entry is silently un-sourced.
- Rule 1 in `docs/RULES.md` names these two as the closed sanctioned set and points here.
- `docs/ARCHITECTURE.md` §4 reframes the two rows from an open "authored directly (no `promoted_from`)" flag to a resolved, ADR-referenced exception; §9 no longer implies the provenance gap or the absence of ADRs is an open question.
- The invariant is *strengthened*, not weakened: the exception is now bounded and auditable. Should either archetype later be genuinely promoted from a real project that adopts it, this ADR can be superseded and the `authored_reason` replaced with `promoted_from`.
