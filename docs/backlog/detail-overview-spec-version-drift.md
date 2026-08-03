---
area: archetypes
opened: 2026-08-03
status: ready
model: sonnet
model_reason: mirrors the two archived version-drift/backfill precedents; a spot-check audit already shows the primitives implement every v2.1-v2.5 gate — remaining work is a formal citation pass plus a one-line frontmatter bump, no design judgment left.
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-03T00:00:00Z
---

# Detail-overview archetype (C) source_spec_version drift between contract frontmatter and MANIFEST

## Context

`docs/archetypes/detail-overview.md` (key `C`, `promoted_from: hk-crm`,
`promoted_at: 2026-05-23`) carries `source_spec_version: 1.0` in its frontmatter,
while the matching entry in `docs/archetypes/MANIFEST.json` carries
`"source_spec_version": "1.6"` — the two copies of the same field have drifted
apart. Per the Versioning section `docs/archetypes/README.md:195-198` (written by
the archived `archetype-doc-manifest-version-drift` ticket),
`source_spec_version` is "a third, unrelated version" tracking the upstream
source project's own spec revision pinned at promotion — distinct from the
contract's own semver (this spec is at `version: 2.5`) and the deliverable
counter (MANIFEST `version: "2.19"`), which are documented as *intentionally*
independent. So the original framing ("source_spec_version 1.6 vs spec v2.5")
compares two axes that aren't meant to track each other; the real, confirmed
defect is the contract-doc-vs-MANIFEST mismatch on `source_spec_version` itself.
A repo-wide scan shows this same doc-vs-MANIFEST mismatch on 7 other promoted
archetypes (`list-with-detail`, `form-page`, `settings-table`, `crud-dialog`,
`grouped-list`, `matrix-grid`, `tabbed-settings`) — the doc frontmatter value
was only ever backfilled once (`archetype-spec-frontmatter-version-backfill`)
and never re-synced by later `/promote-archetype --update` passes.

## What to do

- [ ] Audit `docs/archetypes/detail-overview.baseline.md` and
      `src/components/archetypes/detail-overview/` against every v2.1-v2.5
      acceptance-gate box in `docs/archetypes/detail-overview.md` (Mode A header
      title scale, `badges` slot, `surface="unified"` chrome suppression,
      `layout="rail"`, S5 tabular/mono figures). A spot-check already found each
      implemented — `badges` at `DetailOverviewHeader.tsx:23`, unified/rail at
      `DetailOverviewShell.tsx`, chrome suppression at `DetailSection.tsx:63`,
      mono/tabular figures at `detail-overview.baseline.md:159`, and the Mode A
      title scale delegated to `<PageHeader>` as single source of truth
      (`detail-overview.baseline.md:88`) — so confirm formally, gate-by-gate,
      and file a follow-up only if a real gap turns up.
- [ ] Bump `docs/archetypes/detail-overview.md` frontmatter
      `source_spec_version` from `1.0` to `1.6` to match `MANIFEST.json` (the
      MANIFEST value is the one `/promote-archetype --update` actually
      maintains; the doc copy is the stale one).
- [ ] ? The same mismatch exists on 7 other archetypes — decide whether to fix
      fleet-wide here or keep this ticket scoped to `detail-overview` only (see
      Open question).

## Acceptance

- `docs/archetypes/detail-overview.md`'s `source_spec_version` matches
  `MANIFEST.json`'s `detail-overview` entry (`1.6`) after the bump.
- The audit pass documents a file:line citation for each v2.1-v2.5 gate showing
  it's already implemented, or opens a follow-up ticket when a gap is found.
- `git diff` shows no changes to `MANIFEST.json`'s `version` field or to any
  primitive file — confirming this is a bookkeeping fix, not a functional one.

## Related

- [archive/archetype-doc-manifest-version-drift.md](archive/archetype-doc-manifest-version-drift.md)
- [archive/archetype-spec-frontmatter-version-backfill.md](archive/archetype-spec-frontmatter-version-backfill.md)
- `docs/archetypes/README.md` (Versioning section)

## Open question

Fix the same doc-vs-MANIFEST `source_spec_version` mismatch fleet-wide (7 more
archetypes) in this same ticket, or keep it scoped to `detail-overview` only as
originally asked? Defaulted to scoping narrowly per the original ask — no
answer recorded yet.
