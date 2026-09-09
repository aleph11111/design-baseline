---
area: archetypes
opened: '2026-09-09'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-09T00:00:00Z'
value: normal
model: opus
model_reason: >-
  the ownership table is a judgement per artifact (package-owned vs dead vs project-owned-kept) and
  the MANIFEST-shrink rule has to preserve an axis in another repo; wrong calls here delete project
  knowledge in four consumers
depends_on:
  - package-ships-methodology-docs-single-version-source
roadmap: archetype-convergence
---

# Add a doc-retirement ownership table and step 6 to the vendored-consumer runbook

## Context

`docs/PACKAGE.md`'s *"Migrating a vendored consumer"* section carries five ordered steps and ends at
*"record the tag"*. It says nothing about the World-A doc corpus a vendored consumer also carries —
six methodology docs, `docs/SURFACES.md`, `docs/design-baseline-chrome.json`, the
`docs/archetypes/` fork with its `MANIFEST.json`, and the `design:`/`patterns:` `## Doc Paths` keys.
That retirement is the `docs-retire` phase of [archetype-convergence](archetype-convergence.md)
(spec section *"## Phase docs-retire — retire the copies, ship the successor"*), and per its F1/F10
it belongs in the same runbook as step 6 — a consumer that runs steps 1–5 and then hunts for a
second document is how a half-migration happens.

The roadmap's Phase-6 bullets read as a flat delete list and are wrong on three of five items,
measured across `hk-crm`, `controlling-app`, `mistra` and `brickshop-manager`:

- **`docs/archetypes/MANIFEST.json` is not deletable wholesale.** `server/archetypeDrift.ts`'s
  `LocalArchetypeEntry` (`:224`–`:240` in coding-dashboard) — the promotion-candidate axis the
  previous phase deliberately kept under E4 — reads *the consumer's* MANIFEST and reports its
  **versionless** entries. `brickshop-manager`'s six local-only slugs (`detail-view`,
  `settings-form`, `domain-hub`, `lookup`, `feed`, `item-selector`) are the only live rows that axis
  has. Deleting the file removes E4 from the consumer side one phase after it was protected from the
  dashboard side.
- **`docs/SURFACES.md` has a reader.** `hk-crm`'s is 30 filled rows of its own binding resolution,
  read at review; `/adopt-baseline` scaffolds it once and never refreshes it.
- **The `patterns:` Doc Paths key is not a blanket removal.** All four consumers carry it, and for
  `brickshop-manager` and `mistra` it points at a corpus holding project-local shapes. Only
  `controlling-app` carries a `design:` key at all.

The phase title's counts resolve differently too: *three JSON configs* is one deletion
(`docs/design-baseline-chrome.json`, whose last reader the previous phase removed), one shrink
(`MANIFEST.json`), and one keep (`_adherence.json`, by the phase's own title).

## What to do

- [ ] Add the ownership table from the spec's *"The ownership table, concretely"* to
      `docs/PACKAGE.md` as **step 6** of *"Migrating a vendored consumer"* — one row per artifact, each
      classified package-owned / dead / project-owned-kept, with the successor named for every deletion
      (F2).
- [ ] Encode the MANIFEST-shrink rule in that table: a consumer drops every `docs/archetypes/MANIFEST.json`
      entry carrying a `version:` (baseline adoptions) and keeps versionless local entries, deleting the
      file only when none remain — empty for `hk-crm` / `controlling-app` / `mistra`, six rows for
      `brickshop-manager` (F4).
- [ ] Mark `docs/SURFACES.md`, `_adherence.json` + `scripts/lint-design.mjs` + the `lint:design`
      script, and an **unversioned** `docs/ADOPTION.md` as project-owned and kept; a `docs/ADOPTION.md`
      *carrying* `version:` frontmatter is the donor contract copy and is deleted (F5).
- [ ] Make the `patterns:` Doc Paths row conditional — removed iff the MANIFEST shrink left
      `docs/archetypes/` empty, kept otherwise — and the `design:` row unconditional (F8).
- [ ] Record `brickshop-manager`'s exception in the table: its pre-donor `.md` corpus archives to
      `docs/archive/archetypes-2026/` per the roadmap, but its `MANIFEST.json` stays live at
      `docs/archetypes/MANIFEST.json` carrying the six local rows — archiving the prose must not archive
      the axis input (F9).
- [ ] Note in the table's preamble that `/adopt-baseline --update` can still re-vendor a deleted doc
      until `fleet-commands` removes it, so the order is reader, then file, then writer.

## Acceptance

- [ ] `docs/PACKAGE.md`'s *"Migrating a vendored consumer"* section carries a step 6 whose table has
      one row for every artifact in the spec's ownership table, and every row's action names either a
      successor or the reason there is none.
- [ ] The table's MANIFEST row states the versionless-entries-survive rule, so applying it to any of
      the four consumers — not only the one this ticket measured — leaves that consumer's local
      archetype rows intact.
- [ ] Dry-running the table against `brickshop-manager` keeps `docs/archetypes/MANIFEST.json` with its
      six versionless entries and its `patterns:` Doc Paths key; dry-running it against `hk-crm` deletes
      both.
- [ ] `docs/PACKAGE.md` no longer instructs any consumer to delete `docs/SURFACES.md`, `_adherence.json`
      or an unversioned `docs/ADOPTION.md`.
- [ ] `npx tsc --noEmit` clean, `node scripts/lint-design.mjs` 0 errors, `node scripts/verify-exports.mjs`
      7/7 ok, `npm run gallery:build` ok — this is a docs-only change and anything else moving is a
      regression.

## Related

- [[package-ships-methodology-docs-single-version-source]] — must ship first: the table's
  "read `node_modules/design-baseline/docs/…`" rows are a false instruction until the package actually
  ships those four files
- [archetype-convergence.md](archetype-convergence.md) — the roadmap; phase `docs-retire`, decisions F2, F4, F5, F8, F9, F10
- [archive/package-ui-ownership-and-vendored-consumer-runbook.md](archive/package-ui-ownership-and-vendored-consumer-runbook.md) — shipped the five-step runbook this ticket extends, and the `ui/` ownership split this table mirrors for docs
- [archive/plugin-version-contract-vs-bundle-split.md](archive/plugin-version-contract-vs-bundle-split.md) — removed `docs/design-baseline-chrome.json`'s last reader; this ticket schedules the file
- [archive/docs-drift-adoption-plan-transitional-doc-never-removed.md](archive/docs-drift-adoption-plan-transitional-doc-never-removed.md) — the prior instance of a transitional doc outliving its reader
