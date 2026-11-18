---
area: archetypes
opened: 2026-11-18
status: ready
value: normal
depends_on: [statement-with-filters-phone-label-column-squashed, print-statement-screen-table-clips-without-scroll-cue]
model: opus
model_reason: "design is the deliverable: one shared column-allocation and overflow-cue rule applied across five archetypes, plus a new check:viewports invariant"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Phone column allocation and scroll cue across list-shaped archetypes

## Context

Visual audit item D (Refero audit 2026-11-18, https://claude.ai/artifact/JdrHqEoSKLShybLfYWUcoS) found no rule for how table columns share width at 390px. The committed baselines `tests/screenshots/phone/<slug>.png` on origin/main show: `matrix-grid` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx`) sticky label column takes ~50% so only two value columns show; `grouped-list` (`GroupedListSection.tsx`) numeric/unit cells wrap ("35 / min" on two lines); `settings-table` (`SettingsTableShell.tsx`) headers wrap ("Prep time") and names wrap; `calendar` (`CalendarShell.tsx`) week view is cropped at Thursday and `import-wizard` (`WizardStepper.tsx`) stepper crops "4 Commit", both with no scroll cue. `statement-with-filters` label squash is filed separately and is not redone here.

Fix once at a shared point (`src/components/archetypes/shared/`), then apply per archetype: a label/first-column min and max width (e.g. min ~8ch, max ~40%), `whitespace-nowrap` on numeric and unit cells, and a visible overflow cue (right-edge fade or sticky first column) for any horizontally scrolling table. Independent of the density and overline tickets.

## What to do

- [ ] Add one shared first-column width rule and one shared horizontal-overflow cue wrapper under `src/components/archetypes/shared/`; reuse the right-edge fade from [[print-statement-screen-table-clips-without-scroll-cue]] and the `STMT_GRID` label floor from [[statement-with-filters-phone-label-column-squashed]] if they have shipped, rather than building a second one.
- [ ] Apply the first-column min/max (~8ch min, ~40% max) to the `matrix-grid` sticky label column so at 390px at least three value columns show.
- [ ] Add `whitespace-nowrap` to numeric and unit cells in `grouped-list`, and to `settings-table` header cells and name cells (truncate with ellipsis instead of wrapping names).
- [ ] Put the shared overflow cue on the `calendar` week view and the `import-wizard` stepper (and any other horizontally scrolling table or strip the audit lists) so cropped content shows it can scroll.
- [ ] Add a `scripts/check-viewports.mjs` invariant: at the device triad a table's first column is never narrower than ~6ch, and a horizontally scrollable table shows its cue.
- [ ] Regenerate the phone baselines with `npm run screenshots:update` and review the PNG diff; bump `package.json` version and add a `CHANGELOG.md` entry.

## Acceptance

- At 390px `matrix-grid` shows at least three value columns beside its label column, and the label column measures between ~8ch and ~40% of the width.
- At 390px `grouped-list` numeric/unit cells ("35 / min") and `settings-table` headers ("Prep time") render on one line; no name cell wraps.
- `calendar` week view and `import-wizard` stepper show a visible scroll cue while content is clipped, and no cue once scrolled to the end or when content fits.
- `check:viewports` fails when any table's first column is narrower than ~6ch or a scrollable table lacks its cue, and passes after the fix.
- No other archetype with a table or horizontally scrolling strip at phone width keeps a first column under ~6ch or scrolls without a cue.
- The regenerated phone baselines no longer show the squashed, wrapped or silently cropped shapes above.

## Related

- [[statement-with-filters-phone-label-column-squashed]] — must ship first: it adds the first `check:viewports` label-width invariant and fixes `FigureTable.tsx`; this ticket extends that invariant instead of duplicating it
- [[print-statement-screen-table-clips-without-scroll-cue]] — must ship first: it builds the right-edge fade this ticket promotes to the shared overflow cue
- [[table-column-hide-below-tier]] — existing narrow-width column handling precedent
- [[matrix-grid-header-scrolls-away-horizontally]] — sticky first column precedent in `MatrixGridShell`
- [[phone-screenshot-baselines-flake]] — same phone pixel-baseline surface
