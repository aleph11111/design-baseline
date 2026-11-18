---
area: tokens
opened: 2026-11-18
status: ready
value: high
model: opus
model_reason: "design is the deliverable: a new density step across the shared primitives, an ADR, and a fleet-wide baseline regeneration; touch-vs-compact interplay needs judgment"
depends_on: [retire-overline-quiet-sentence-case-hierarchy]
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Compact density step on md+ for tables, header, sidebar and rails

## Context

Visual audit item B. The [Refero audit 2026-11-18](https://claude.ai/artifact/JdrHqEoSKLShybLfYWUcoS) measured design-baseline at about 1.5x the vertical space of reference products. Measured vs reference: table rows ~53px vs ~36px (`src/components/ui/table.tsx`: `TableCell` `p-4`, `TableHead` `h-12`, table `text-sm`; [ref](https://refero.design/pages/361d1d78-a133-43a7-b1ca-52a9ee163e15)); app header 64px (`src/components/layout/Header.tsx:48`, `h-16`) repeating the page title and holding only a theme toggle, refs 36-44px; sidebar top ~115px before the first nav item (brand row plus a separate bordered org switcher in `src/components/layout/Sidebar.tsx`) vs ~50px in one borderless row ([ref](https://refero.design/pages/217e2393-6e1d-45cb-a592-6b84dee0e2ec)); `StatTile` ~105px vs ~55px; detail-overview rail rows 38px ruled vs 28px unruled; kanban tray plus 12px card gap vs no tray and 6px; toolbar Sort/Filter/Export as heavy bordered buttons vs quiet ghost buttons.

Touch density already exists (archived [[app-touch-density-control-size]]: `ToolbarSizeContext`, `AppShell density="touch"`, `lg` = `h-11` 44pt in `docs/STYLE.md` "Control heights"). The compact step is its desktop counterpart: it applies from `md` up and never lowers a phone or touch-density target below 44pt.

Sequencing: must land after [[retire-overline-quiet-sentence-case-hierarchy]] (audit item C): both rewrite `docs/STYLE.md` and every screenshot baseline, and that ticket changes the column-header and `StatTile` label classes this one then resizes.

## What to do

- [ ] Write the ADR first: a compact density step on `md+` (touch density on phones and `density="touch"` keep 44pt targets, per `docs/STYLE.md` "Control heights"). Next free number after the one the overline ticket takes (0016), so 0017 unless 0016 is not yet merged; add the row to `docs/adr/INDEX.md`.
- [ ] Update `docs/STYLE.md` (Typography, Surfaces, Control heights) with the compact step and its measured targets.
- [ ] Compact table step in `src/components/ui/table.tsx`: row ~36-40px, 13px ledger body, `TableHead` at `h-10` or less; fix at the shared primitive, not per archetype.
- [ ] `src/components/layout/Header.tsx`: height `h-12` or less on md+; decide in the ADR whether the repeated page title stays (recommended: drop it from the header, the page title already renders in the page frame).
- [ ] `src/components/layout/Sidebar.tsx`: merge brand row and org switcher into one borderless top row (~50px before the first nav item).
- [ ] Ghost toolbar buttons (Sort/Filter/Export) in `src/components/ui/toolbar-band.tsx`; tighter `StatTile` (~55px), detail-overview rail rows (28px, unruled), kanban-board (no tray, 6px card gap).
- [ ] Before editing, grep every consumer of the touched primitives (`TableCell`, `TableHead`, `Header`, `Sidebar`, `StatTile`, `LedgerTable`, rail row, kanban column) and decide per consumer; do not hand-patch one archetype.
- [ ] One gallery demo per variant (compact vs touch) under `src/examples/`, regenerate baselines (`npm run screenshots:update`, review the PNG diff), `npm run check:viewports` green, bump `package.json` version, `CHANGELOG.md` entry naming every consumer whose visuals change with "Consumer: re-baseline screenshots".

## Acceptance

- At desktop width a default `Table` row measures 36-40px with a 13px body, the app header is 48px or less, and the sidebar reaches the first nav item within ~50px, as verified by the gallery screenshots.
- At phone width and under `AppShell density="touch"` every control target is still at least 44pt: unchanged from today.
- No other consumer of `TableCell`, `TableHead`, `Header`, `Sidebar`, `StatTile` or the rail row still renders the old 53px / 64px / 115px / 105px sizes; every similar call site picks up the step from the shared primitive.
- `npm run check:viewports` passes at the device triad and the baselines are regenerated.

## Related

- [[retire-overline-quiet-sentence-case-hierarchy]] — must ship first: both rewrite `docs/STYLE.md` and every screenshot baseline, and it changes the column-header and `StatTile` label classes this ticket resizes
- [[app-touch-density-control-size]] — the touch counterpart this step must not undercut
- [[touch-density-icon-button-step]]
- [[transaction-doc-compact-fold-height]]
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — fixed donor roles
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — section card stack

