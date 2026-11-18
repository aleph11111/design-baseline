---
area: tokens
opened: 2026-11-18
status: ready
value: high
model: opus
model_reason: "amends a house-look ADR and changes the shared type scale for every archetype; the hierarchy and surface rules are design judgment, not pattern-following"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Retire the uppercase overline for a quiet sentence-case hierarchy

## Context

Visual audit item C, decided by the operator 2026-11-18: option 3 of the [operator's option artifact](https://claude.ai/artifact/5VQwfnhLaeGU91zeUnzeB5). Today the section heading (`OVERLINE_CLASS` in `src/components/layout/overline.ts`: 10.5px, 600, uppercase, +0.09em, muted) sits visually behind the cards it introduces, so a heading like "Summary" does not guide the reader; the [Refero audit](https://claude.ai/artifact/JdrHqEoSKLShybLfYWUcoS) also found the overline repeated on every container reads as templated. The overline is a fixed donor role under ADR-0007 (section 2 keeps overlines tight below the 30px display step), so retiring it needs an amending ADR first.

Target scale, top to bottom: page title 30px (unchanged, ADR-0007 section 2) > section heading 15px semibold sentence case, foreground colour > card title 13px semibold sentence case inside the card padding (no separate ruled band in `SectionCard` / `SurfaceHeaderBar`, today `border-b px-5 py-3`) > body 13px. Sidebar group labels (`Sidebar.tsx` uses `OVERLINE_CLASS`) become 12px medium muted sentence case with the chevron visible on hover. `StatTile` labels and table column headers (`COL_HEADER_CLASS`, 9.5px uppercase) become 12px medium muted sentence case. Callouts (`src/components/ui/alert.tsx` warning variant) become border-only, status colour on the edge and icon, quiet buttons.

Sequencing: runs one after the density ticket (audit item B, not yet filed), never in parallel, because both edit `docs/STYLE.md` and every screenshot baseline. This ticket goes first; the density ticket must declare `depends_on` on this slug when filed.

Consumers of the two constants today (grep on trunk): `BottomNav.tsx`, `SectionHeading.tsx`, `StatTile.tsx`, `Sidebar.tsx`, `SectionNav.tsx`, `CalendarShell.tsx`, `shared/FigureTable.tsx`, `kanban-board/BoardColumn.tsx`, `overline-typed/overline.tsx`, `src/examples/report-demo.tsx`, `src/examples/print-statement-demo.tsx`, plus `MatrixInspector.tsx` for the `border-b px-5 py-3` band.

## What to do

- [ ] Write an ADR (next number after 0015) amending ADR-0007: overline retired, new scale above; add its row to `docs/adr/INDEX.md` and a dated amendment note on ADR-0007 (per the existing "Amendment" convention in that file).
- [ ] Update `docs/STYLE.md` "Typography" and "Surfaces" to the new scale and to the card-title-inside-padding rule.
- [ ] Implement at the shared constants and primitives, not per archetype: change `OVERLINE_CLASS` and `COL_HEADER_CLASS` in `src/components/layout/overline.ts`, then `SectionHeading`, `SectionCard`, `SurfaceHeaderBar`, `Sidebar` (group label + hover chevron), `StatTile`, and `src/components/ui/alert.tsx` (warning variant border-only).
- [ ] Before editing, grep every consumer of `OVERLINE_CLASS`, `COL_HEADER_CLASS` and the `border-b px-5 py-3` header band (list above is the trunk read); fix at the shared constant, and decide per consumer whether it moves to the sentence-case label or stays; do not hand-patch a single archetype.
- [ ] Update `src/components/archetypes/overline-typed/overline.tsx`, `FigureTable.test.tsx` and `NestedPageHeading.test.tsx` assertions that pin the uppercase classes.
- [ ] Regenerate screenshot baselines (`npm run screenshots:update`, review the PNG diff), bump the `package.json` version, and add a `CHANGELOG.md` entry that names every consumer whose visuals change and says "Consumer: re-baseline screenshots", per the existing entries.

## Acceptance

- The section heading renders 15px semibold sentence case in the foreground colour, the card title 13px semibold sentence case inside the card padding with no `border-b` ruled band, and no shared label renders uppercase.
- No other consumer of `OVERLINE_CLASS`, `COL_HEADER_CLASS` or the `border-b px-5 py-3` band still renders the old 10.5px / 9.5px uppercase look: the grep over `src/` returns only the new classes.
- Sidebar group labels, `StatTile` labels and table column headers render 12px medium muted sentence case, and the sidebar chevron shows on hover.
- The `alert.tsx` warning variant shows a border-only callout with the status colour on the edge and icon.
- `npm test`, `npm run check:viewports` and `npm run screenshots` pass after the baselines are regenerated, and the changelog entry lists every affected consumer.

## Related

- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — the fixed house look this amends (section 2 display step, overline role)
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — raised section cards whose header band this changes
- [[page-body-section-card-stack]] — section-card stack roadmap this reshapes
- [[refactor-shell-surface-header-slot-duplication]] — `SurfaceHeaderBar` shared header the card title now lives in
- [[house-look-page-header-title-step]] — prior house-look type-step change, precedent for the ADR + baseline flow
