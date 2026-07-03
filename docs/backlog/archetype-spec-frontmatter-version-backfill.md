---
area: archetypes
opened: 2026-07-03
status: ready
model: sonnet
model_reason: mechanical backfill mirroring sibling frontmatter from MANIFEST values; no design judgment
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-03T17:07:01Z
---

# Backfill spec frontmatter version on the four frontmatter-less archetype specs

## Context

Four archetype specs promoted from the 2026-06-13 fleet audit —
`docs/archetypes/analytics-dashboard.md`, `feed-inbox.md`, `import-wizard.md`,
`kanban-board.md` — open directly with a `# Archetype …` heading and carry **no
frontmatter at all**, so they have no spec `version:` field. Every other archetype
spec carries full frontmatter (`key`, `slug`, `kind`, `version`, `promoted_from`,
`promoted_at`, `source_spec_version`). The newly documented Versioning convention in
`docs/archetypes/README.md` (from archetype-doc-manifest-version-drift) defines the
spec frontmatter `version:` as the archetype's **contract** version and handles these
four via an explicit fallback clause ("treat as unversioned, effectively `1.0`"). This
ticket removes the need for the fallback by giving all four an explicit `version: 1.0`
so the "which number does an amendment bump" rule holds literally for every archetype.

## What to do

- [ ] Add a frontmatter block to each of the four specs, mirroring the sibling spec
      shape, with values pulled from the matching `MANIFEST.json` entry (`key`, `slug`,
      `kind: page`, `promoted_from`, `promoted_at`, `source_spec_version`) and
      `version: 1.0` (the contract baseline — do NOT copy the MANIFEST deliverable
      `version`, which is higher).
- [ ] Do not change the MANIFEST `version` for these entries — deliverable versions
      stay as-is; only the spec contract version is being established.

## Acceptance

- [ ] `awk '/^version:/{print; exit}'` returns `version: 1.0` for all four specs.
- [ ] The Versioning fallback clause in `docs/archetypes/README.md` no longer applies
      to any shipped archetype (every spec carries a frontmatter `version:`).
- [ ] `git diff` on `MANIFEST.json` is empty (no deliverable-version numbers changed).

## Related

- [wip/archetype-doc-manifest-version-drift.md](wip/archetype-doc-manifest-version-drift.md)
- [decouple-archetype-contract-from-reference-impl.md](decouple-archetype-contract-from-reference-impl.md)
- `docs/archetypes/README.md` (Versioning), `docs/archetypes/MANIFEST.json`
