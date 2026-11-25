---
area: tooling
opened: 2026-11-20
status: ready
value: normal
model: sonnet
model_reason: "new check script following the check-detail-sheet.mjs pattern; cause and assertions established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-20T00:00:00Z
---

# Browser check for crud-dialog Two-pane demo at the device triad

## Context

No automated check covers the crud-dialog demo bodies at the device triad (desk27 / laptop14 / phone). `src/examples/crud-dialog-demo.tsx` has a "two-pane" `DialogBodyLayout` (line 82; inputs left, computed preview right, container query) that derives `CrudDialogSheet` width `"xl"` (54rem, `WIDTH_MAP` in `src/components/archetypes/crud-dialog/CrudDialogSheet.tsx`). The no-truncation guarantee for that body (shipped in v0.63.0, [[archetype-gap-crud-dialog-wide-width-step]]) was verified only by an ad hoc Chrome script that was not committed (see that ticket's Resolution: 864px sheet at desk27 and laptop14, preview pane 396px, stacked on phone). `check:viewports` covers `kind: page` archetypes only and `scripts/check-detail-sheet.mjs` covers only list-with-detail, so a regression of the `xl` step or the two-pane container query would pass CI. `jsdom` has no layout, so `CrudDialogSheet.test.tsx` can only pin class hooks.

## What to do

- [ ] Add `scripts/check-crud-dialog-demo.mjs` and an `npm run check:crud-dialog-demo` entry, modelled on `scripts/check-detail-sheet.mjs` (`serveDir` / `launchChrome` from `scripts/lib/serve-gallery.mjs`, a CASES table, non-zero exit on any failure) and reading the device triad from the `design-baseline/testing/devices` export, not a copy (per [[device-triad-check-viewports]]).
- [ ] For each device, open the gallery's crud-dialog demo, switch to the Two-pane layout, open the sheet and assert: desktop sheet width is 864px (54rem) at desk27 and laptop14, full-viewport (390px) on phone; the input pane and preview pane sit side by side at desk27 / laptop14 and stacked on phone; no element inside the preview pane (year tiles, breakdown rows) is truncated (`scrollWidth <= clientWidth` for every text element) or extends past the pane's box.
- [ ] Decide the build: reuse the production `gallery-dist` from `npm run gallery:build` (as `check:viewports` does, so it can join the `check` job in `.github/workflows/check.yml` and reuse its build) unless the assertions need the dev-only build the way `check:detail-sheet` does; document the choice in the script header.
- [ ] Document the script under Commands in `CLAUDE.md` and in the enforcement stack in `docs/PACKAGE.md`; no package version bump needed (tooling only).

## Acceptance

- `npm run check:crud-dialog-demo` exits 0 on the donor and prints one PASS line per device (desk27, laptop14, phone).
- Reverting `WIDTH_MAP.xl` to `lg` (40rem) makes the script exit non-zero at desk27 and laptop14 with the measured sheet width in the failure line.
- Forcing the preview pane narrower than its content makes the script exit non-zero and names the truncated element.
- On phone the sheet measures the full viewport width and the two panes are stacked (the preview pane's top is below the input pane's bottom).

## Related

- [[archetype-gap-crud-dialog-wide-width-step]] — shipped the `xl` step whose verification was ad hoc
- [[device-triad-check-viewports]] — device triad export and the page-archetype check this complements
- [[list-with-detail-sheet-sizes-to-content]] — the `check-detail-sheet.mjs` precedent for a sheet-width browser check
- [[crud-dialog-body-two-column-container-query]] — open change to the same dialog body layout; the check should survive it
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — precedent for a real-browser overlay-width check
