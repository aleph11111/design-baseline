---
area: refactor
opened: '2026-08-25'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-25T10:49:11.995Z'
model: sonnet
model_reason: >-
  replacing a hand-written map with a glob-driven lookup plus a MANIFEST kind backfill; the
  convention is already uniform across all 22 entries so the transformation is mechanical, but it
  needs a real check that the built gallery still lazy-loads per route
---

# Derive the gallery demo registry from the MANIFEST instead of hand-listing every archetype

## Context

Severity: **medium** (duplication of a registry that already exists). `gallery/registry.ts` opens by stating that archetype metadata "comes straight from `docs/archetypes/MANIFEST.json` so this never drifts from the source registry; the gallery only adds the lazily-loaded demo component." The file then hand-writes a 100-line `DEMOS` map (`gallery/registry.ts:33-129`) with one four-line entry per archetype — 22 of them — each re-encoding two things the MANIFEST already knows or that follow mechanically from the slug:

- the demo module path, always `@/examples/<slug>-demo`, which is `MANIFEST.archetypes[].example` minus its `src/` prefix and `.tsx` suffix — verified identical for all 22 entries;
- the export name, always `PascalCase(slug) + "Demo"` — `raw-input` → `RawInputDemo`, `statement-with-filters` → `StatementWithFiltersDemo` — with no exceptions in the current set;
- `kind`, which the MANIFEST also carries.

The `kind` duplication is the one already causing a real inconsistency. `kind` is present on only 8 of the 22 MANIFEST entries (`statement-with-filters` and the seven component-kind archetypes); the other 14 — every `page` entry plus `crud-dialog`'s `dialog` — have no `kind` field at all, so `gallery/registry.ts` is the de facto authority for them while the MANIFEST is the authority for the rest. Two files own one field, split by row.

The drift is silent in the direction that matters. `ARCHETYPES` is built by `manifest.archetypes.filter((a) => DEMOS[a.slug] !== undefined)` (`gallery/registry.ts:141`), so an archetype promoted into the MANIFEST without a hand-added `DEMOS` entry simply does not appear in the gallery — no error, no warning, no failing typecheck. The gallery is the dashboard hub's mounted surface per `docs/PLUGIN-CONTRACT.md`, and `docs/archetypes/README.md`'s guideline is that every documented variant gets a living demo *because* the gallery is the review surface. A registry that can drop an archetype quietly is the wrong shape for that job.

## What to do

- [ ] Back-fill `kind` on the 14 MANIFEST entries that lack it (`page` for the page archetypes, `dialog` for `crud-dialog`) so the field has one owner.
- [ ] Replace the hand-written `DEMOS` map with a lookup built from `import.meta.glob` over `src/examples/*-demo.tsx` (eager: false, so each demo still code-splits), resolving each MANIFEST entry's `example` path to its module and its export via the `PascalCase(slug) + "Demo"` convention.
- [ ] Read `kind` from the MANIFEST entry rather than from the gallery-local map, and drop `ArchetypeEntry`'s dependence on the local `DEMOS` record.
- [ ] Replace the silent `.filter(…)` drop with a loud failure: a MANIFEST archetype whose demo module or export is missing should surface in the gallery as a visible broken-entry card (and log), not vanish.
- [ ] Keep `section-nav-demo.tsx` out of the archetype list — it is a layout demo consumed by `gallery/layout-demos.tsx`; the MANIFEST-driven join already excludes it, so assert that rather than filtering by name.
- [ ] State the demo file/export naming convention in `docs/archetypes/README.md` so `/promote-archetype` writes a demo the glob can find without a registry edit.

## Acceptance

- `gallery/registry.ts` contains no per-archetype literal: adding an archetype to `docs/archetypes/MANIFEST.json` with a conventionally named demo makes it appear in the gallery with no edit to the registry.
- `kind` is present on all 22 MANIFEST archetype entries and is read from there; `grep -n '"page"' gallery/registry.ts` shows no hand-assigned kind.
- A MANIFEST entry with a missing or mis-named demo export renders a visible broken-entry card in the gallery instead of being dropped from `ARCHETYPES`.
- `npm run gallery:build` succeeds and the built `gallery-dist/` still emits one lazy chunk per demo (the per-demo code-split is not collapsed into the entry bundle).
- `npx tsc --noEmit` and `npm test` pass, and every archetype route in the gallery renders the same demo it did before.

## Related

- [archetype-dir-manifest-count-drift.md](../archive/archetype-dir-manifest-count-drift.md) — the same class of finding: a second place counting archetypes drifting from the MANIFEST.
- [archetype-manifest-version-verify-script.md](../archive/archetype-manifest-version-verify-script.md) — prior work making the MANIFEST the checked source of truth rather than one of several.
- [docs/PLUGIN-CONTRACT.md](../../PLUGIN-CONTRACT.md) — the gallery is the hub-mounted surface, which is why a silently missing archetype matters.
- [gallery/registry.ts](../../gallery/registry.ts) — the file whose 100-line map this ticket deletes.
