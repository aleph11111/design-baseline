---
area: archetypes
opened: 2026-08-03
status: ready
model: sonnet
model_reason: mechanical backfill with the authoritative side already decided by the archived detail-overview precedent; seven one-line frontmatter edits plus a green verify run, no design judgment left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-03T20:05:00Z
---

# Backfill source_spec_version on the seven archetype specs that still fail verify:manifest

## Context

`scripts/verify-manifest-versions.mjs` (shipped by the archived
`archetype-manifest-version-verify-script` ticket, PR #82) is wired as the `pretest`
npm lifecycle hook, so `npm run verify:manifest` runs before every `npm test`. It
currently exits 1 with seven `source_spec_version` mismatches between each spec's
frontmatter and its `docs/archetypes/MANIFEST.json` entry — `list-with-detail`
(doc=1.2 manifest=1.9), `form-page` (1.1/1.7), `settings-table` (1.0/1.4),
`crud-dialog` (1.3/1.4), `grouped-list` (1.0/1.6), `matrix-grid` (1.0/1.4),
`tabbed-settings` (1.1/1.4). Because it is `pretest`, plain `npm test` never reaches
vitest at all — the donor's whole suite is unreachable through the documented command
in `CLAUDE.md`, and `/ship`'s auto-detected `test` script fails for reasons unrelated
to whatever branch is shipping (worked around on `feat/adherence-lint-conformance-rule-gap`
by calling `npx vitest run --configLoader runner` directly).

This is the residue of a deliberately narrow scope, not a new defect: the archived
`detail-overview-spec-version-drift` ticket fixed exactly one archetype's frontmatter
and left "fix the same mismatch fleet-wide (7 more archetypes)" as its recorded Open
question, defaulted to *not* fixing. Then #82 landed the mechanism that turns that
unfixed residue into a red gate — its own acceptance criteria state the script "exits 1
and prints the 8 known mismatches" as the expected state at merge time. So the gate is
red by design and stays red until the seven siblings are backfilled.

Which side is authoritative is already settled by the same precedent: the MANIFEST value
is the one `/promote-archetype --update` maintains, the doc frontmatter copy is the stale
one (per `archive/detail-overview-spec-version-drift.md`, What-to-do bullet 2). Per
`docs/archetypes/README.md`'s Versioning section, `source_spec_version` is the pinned
upstream-source-spec revision and is meant to be an exact copy in both files — unlike
the doc `version` (contract semver) and MANIFEST `version` (deliverable counter), which
are intentionally independent and must not be touched here.

## What to do

- [ ] Update the frontmatter `source_spec_version` in each of the seven specs
      (`docs/archetypes/list-with-detail.md`, `form-page.md`, `settings-table.md`,
      `crud-dialog.md`, `grouped-list.md`, `matrix-grid.md`, `tabbed-settings.md`) to
      the value its `MANIFEST.json` entry carries — MANIFEST is authoritative per
      `archive/detail-overview-spec-version-drift.md`.
- [ ] Leave every `version` field alone, in both the specs and MANIFEST — doc contract
      semver and MANIFEST deliverable counter are documented as independent
      (`docs/archetypes/README.md`, Versioning section); only `source_spec_version` is
      a duplicated field.
- [ ] ? Consider whether `/promote-archetype --update` should write the doc frontmatter
      `source_spec_version` too, so the next drift can't reappear — three manual
      backfills have now happened (`archetype-doc-manifest-version-drift`,
      `archetype-spec-frontmatter-version-backfill`, this one). File separately if it
      turns out to be a skill edit rather than a one-liner.

## Acceptance

- `npm run verify:manifest` exits 0 and prints `verify:manifest — all
  source_spec_version fields match`, matching #82's third acceptance criterion.
- `npm test` reaches vitest and runs the full suite (37 files / 198 tests as of
  2026-08-03) instead of failing at the `pretest` hook.
- `git diff` shows changes to exactly seven frontmatter lines and no change to any
  `version` field, `MANIFEST.json`, or primitive file — confirming this is bookkeeping.

## Related

- [archive/archetype-manifest-version-verify-script.md](archive/archetype-manifest-version-verify-script.md) —
  shipped the `pretest`-wired check that this ticket makes green
- [archive/detail-overview-spec-version-drift.md](archive/detail-overview-spec-version-drift.md) —
  fixed the eighth archetype and recorded the fleet-wide fix as its Open question
- [archive/archetype-doc-manifest-version-drift.md](archive/archetype-doc-manifest-version-drift.md) —
  the resolution that made MANIFEST authoritative for `source_spec_version`
- `docs/archetypes/README.md` (Versioning section), `scripts/verify-manifest-versions.mjs`
