---
area: tooling
opened: 2026-08-03
status: ready
model: sonnet
model_reason: mechanical script mirroring the existing scripts/lint-design.mjs zero-dependency-scan pattern; no design judgment beyond the field-scope correction already grounded in docs/archetypes/README.md.
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-03T12:37:46Z
---

# Verify script for archetype spec frontmatter vs MANIFEST.json version fields

## Context

`docs/archetypes/detail-overview.md` frontmatter carries `source_spec_version: 1.0`
while `docs/archetypes/MANIFEST.json`'s `detail-overview` entry carries
`"source_spec_version": "1.6"` — a drift caught manually and tracked in
`docs/backlog/detail-overview-spec-version-drift.md`, which also found the same
doc-vs-MANIFEST `source_spec_version` mismatch on 7 more archetypes
(`list-with-detail`, `form-page`, `settings-table`, `crud-dialog`, `grouped-list`,
`matrix-grid`, `tabbed-settings`). This has recurred twice before as a one-off
manual backfill (`archive/archetype-doc-manifest-version-drift.md`,
`archive/archetype-spec-frontmatter-version-backfill.md`) with no mechanism to
catch the next drift automatically.

**Scope correction on the original ask:** the check must diff `source_spec_version`
only, not `version`. Per `docs/archetypes/README.md`'s Versioning section (written
by the archived `archetype-doc-manifest-version-drift` resolution), spec-doc
`version` (contract semver) and MANIFEST `version` (deliverable/propagation
counter) are **intentionally independent** — MANIFEST `version` is documented to
always run ≥ the doc version and legitimately pull ahead (e.g. detail-overview doc
`2.5` vs MANIFEST `2.19`). A check comparing `version` doc-vs-MANIFEST would fail
by design on every archetype that's had a single `/style-archetypes --update` pass.
Only `source_spec_version` — the pinned upstream-source-spec revision — is meant to
be an exact copy between the two files.

## What to do

- [ ] Add `scripts/verify-manifest-versions.mjs`, following the zero-dependency
      scan style of `scripts/lint-design.mjs`: read `docs/archetypes/MANIFEST.json`,
      for each entry read the matching `docs/archetypes/<slug>.md` frontmatter, and
      diff only the `source_spec_version` field (not `version`) between the two.
      Print each mismatch as `<slug>: doc=<x> manifest=<y>` and exit 1 if any
      mismatch is found, exit 0 otherwise.
- [ ] Add an `npm run verify:manifest` script entry in `package.json` invoking it.
- [ ] Wire it into the `pretest` npm lifecycle hook (`"pretest": "npm run
      verify:manifest"`) so it runs automatically before `npm test` — the same
      `test` script `/ship` already auto-detects and runs
      (`~/.claude/commands/ship.md:49`), with no new `/ship` wiring needed.

## Acceptance

- `npm run verify:manifest` exits 1 and prints the 8 known mismatches
  (`detail-overview` + the 7 siblings named in `detail-overview-spec-version-drift.md`)
  when run against the current repo state.
- `npm test` fails before any test file runs when a `source_spec_version` mismatch
  exists, via the `pretest` hook.
- Running the script after `detail-overview-spec-version-drift.md` and its 7
  siblings are fixed shows `npm run verify:manifest` exits 0.
- The script does not flag any `version` (non-`source_spec_version`) field
  difference — confirming the scope correction holds.

## Related

- [detail-overview-spec-version-drift.md](detail-overview-spec-version-drift.md)
- [archive/archetype-doc-manifest-version-drift.md](archive/archetype-doc-manifest-version-drift.md)
- [archive/archetype-spec-frontmatter-version-backfill.md](archive/archetype-spec-frontmatter-version-backfill.md)
- `docs/archetypes/README.md` (Versioning section), `scripts/lint-design.mjs`
