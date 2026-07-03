---
area: archetypes
opened: 2026-06-23
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-06-23T07:20:00Z
---

# Sync archetype spec docs to the Plex Ledger on-surface board form

## Context

Commit `dea1f61` restructured eleven page archetypes (settings-table,
list-with-detail, grouped-list, form-page, matrix-grid, tabbed-settings,
feed-inbox, kanban-board, import-wizard, analytics-dashboard) plus crud-dialog
to the Plex Ledger board form: the title + actions now sit ON the bounded
surface via the shared `SurfaceHeader` (`src/components/layout/SurfaceHeader.tsx`)
— a header-fill bar at the top of one framed card on a muted mat — replacing the
separate `<PageHeader>` that previously floated above the card. The shells gained
`kicker` / `title` / `headerActions` / `headerFill` props, and the dialog header
joined the same contract (board frame 09).

But the contracts in `docs/archetypes/*.md` still document the old composition.
This is the exact mandate called out in
`decouple-archetype-contract-from-reference-impl.md`: Layer 3 mandates a
`<PageHeader>` with `text-2xl font-semibold tracking-tight` above the page shell.
A reader consulting the spec now sees a layout the shipped primitive no longer
produces.

## What to do

- [ ] Update each adopted archetype's anatomy/layout section (the Layer 2/3 page-shell + header layers) in `docs/archetypes/*.md` to make the on-surface `SurfaceHeader` the default — title + actions on the bounded surface, not a `<PageHeader>` above it.
- [ ] Document the new shell props (`kicker` / `title` / `headerActions` / `headerFill`) in each spec's reference-primitive section.
- [ ] Note the 2-token contract: `--primary` (brand accent, per-app) + `--header-fill` (per-project, default `solid`); status `<Badge>`s stay semantic on solid headers; form-page and import-wizard keep their primary actions in the footer, not the header.
- [ ] Bump each touched spec's frontmatter `version:` and reconcile against the MANIFEST counter (coordinate with `archetype-doc-manifest-version-drift.md` so the two counters don't re-diverge).

## Acceptance

- [ ] Each of the eleven adopted `docs/archetypes/<slug>.md` describes the on-surface header as the default and no longer mandates a separate `<PageHeader>` above the card.
- [ ] Each spec documents the `kicker` / `title` / `headerActions` / `headerFill` props and states the default `--header-fill` is `solid`.
- [ ] The spec text matches what the shipped shell renders (header on the surface, one frame on a muted mat) — verifiable by diffing a spec's anatomy against its `*-demo.tsx`.

## Related

- [decouple-archetype-contract-from-reference-impl.md](decouple-archetype-contract-from-reference-impl.md) — the `<PageHeader>` mandate lives in the same Layer 3 being rewritten; sequence these together
- [archetype-doc-manifest-version-drift.md](archetype-doc-manifest-version-drift.md) — the doc-vs-MANIFEST version counters are bumped here too
- [detail-overview-blueprint-rail-variant.md](detail-overview-blueprint-rail-variant.md) — sibling spec/blueprint-sync follow-up

## Resolution (2026-07-03)

Done on feat/plex-ledger-hygiene: all 14 specs synced to the board form (SurfaceHeader, ledger title scale, header-fill contract, single-owner molecule references); MANIFEST version + source_spec_version bumped across the board.
