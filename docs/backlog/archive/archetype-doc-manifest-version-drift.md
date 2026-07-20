---
area: archetypes
opened: 2026-06-21
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-06-21T01:38:33Z
---

# Reconcile or document the archetype doc-frontmatter vs MANIFEST version counters

## Context

Each archetype carries two `version` numbers that have silently drifted apart: the
spec doc's frontmatter `version:` (e.g. `docs/archetypes/detail-overview.md` was at
`2.0`) and the registry's `docs/archetypes/MANIFEST.json` entry `version:` (the same
archetype was at `2.6`). This was hit while implementing the v2.1 Command Rail
amendment — it's unclear which counter an amendment is meant to bump, and the gap
reads like a bug. The drift is fleet-wide, not isolated: form-page (doc `1.1` /
MANIFEST `1.6`), settings-table (doc `1.0` / MANIFEST `1.3`), etc. The working theory
is that doc `version` = semantic spec version (bumped on spec rule changes) while
MANIFEST `version` = a propagation/iteration counter bumped on every
`/style-archetypes --update`, but this is nowhere written down.

## Resolution (2026-07-03)

**Decided: independent by design.** doc frontmatter `version:` = the spec **contract**
semver; MANIFEST `version` = the whole **deliverable** (spec + primitives + demo +
blueprint) iteration counter. The deliverable counts a superset of events, so it always
runs ≥ the contract version and pulls ahead (e.g. detail-overview spec 2.5 / deliverable
2.17); majors stay aligned. Confirmed against tooling: `/promote-archetype --update` and
in-baseline iterations (demo/blueprint passes) bump MANIFEST only; the frontmatter moves
only on spec-rule changes. → documented, not reconciled (numbers legitimately differ).

## What to do

- [x] Decide the intended relationship between the two counters — **independent
      semantic-vs-deliverable** (see Resolution).
- [x] Documented the convention in `docs/archetypes/README.md` Versioning section:
      two-field table, superset/≥/major-aligned relationship, "which one does an
      amendment bump?" rule, no-frontmatter fallback.
- [~] Keep-in-sync / reconcile branch — **not taken** (counters are independent).

## Acceptance

- [x] `docs/archetypes/README.md` Versioning section explicitly distinguishes the doc
      frontmatter `version` from the MANIFEST `version`.
- [x] A reader can determine, for any archetype, which number a spec amendment bumps
      vs which the deliverable/propagation change bumps, without inferring it from the gap.
- Follow-up: docs/backlog/archetype-spec-frontmatter-version-backfill.md (backfill
  `version: 1.0` on the four frontmatter-less specs so the rule holds without the fallback).

## Related

- [decouple-archetype-contract-from-reference-impl.md](decouple-archetype-contract-from-reference-impl.md)
- `docs/archetypes/MANIFEST.json`, `docs/archetypes/README.md` (Versioning)
