---
area: archetypes
opened: 2026-06-21
status: ready
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

## What to do

- [ ] Decide the intended relationship between the two counters (independent
      semantic-vs-propagation, or keep-in-sync).
- [ ] If they are meant to be independent: document the convention in
      `docs/archetypes/README.md` (the "Versioning" section already explains
      minor/major bumps but conflates the two `version` fields) so future
      amendments know which to bump.
- [ ] If they are meant to track together: reconcile the existing entries and add a
      check (e.g. in the promote/style tooling) that flags divergence.

## Acceptance

- [ ] `docs/archetypes/README.md` Versioning section explicitly distinguishes the doc
      frontmatter `version` from the MANIFEST `version` (or states they must match).
- [ ] A reader can determine, for any archetype, which number a spec amendment bumps
      vs which the propagation tooling bumps, without inferring it from the gap.

## Related

- [decouple-archetype-contract-from-reference-impl.md](decouple-archetype-contract-from-reference-impl.md)
- `docs/archetypes/MANIFEST.json`, `docs/archetypes/README.md` (Versioning)
