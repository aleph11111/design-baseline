---
area: ui
opened: '2026-11-24'
status: ready
value: normal
model: opus
model_reason: "design is the deliverable: content-fit sizing mechanism for the shared Select primitive plus a band-width policy and a new check"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-24T00:00:00Z'
---

# Toolbar SelectTrigger has no content-fit width mode

## Context

`SelectTrigger` in `src/components/ui/select.tsx` has no content-fit sizing, so consumers guess fixed width classes per call site. (a) `selectTriggerVariants` base carries `w-full` (select.tsx:20) and the unsized labeled grid path (select.tsx:66, `grid-cols-[auto_minmax(max-content,1fr)_auto]`) never undoes it, so an unsized labeled trigger fills the whole toolbar band — controlling-app `cashflow-builder/page.tsx:121` (CF-Bericht select) stretches across the band. (b) The value column's `max-content` is only the SELECTED value (Radix `SelectValue` renders one item), so even without `w-full` the box would resize on selection change. (c) Consumers therefore pick fixed widths that the fixed-box path truncates: controlling-app Jahr select `w-44` (`LedgerControls.tsx:84`) shows `2026 ·…` for `2026 · A+B`, while Struktur `w-72` (`PnlGrid.tsx:421`) is far wider than its longest option `HGB §275 GKV`; Jahr widths vary `w-40`/`w-44`/`w-52` across pages. Consumer cleanup (dropping guessed widths) follows the baseline release, not this ticket.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make a labeled `SelectTrigger` in a toolbar band content-sized: no `w-full`, so it no longer fills the band.
- [ ] Size the value column to the WIDEST option, not the selected one: render every option label as invisible stacked content in the same grid cell as the value (the operator's suggested mechanism), fed by an options prop on `SelectTrigger` and populated automatically by `SelectField` from its `options`.
- [ ] Treat a fixed width class on a band select as an exception: add a lint-design / audit-signal check (`scripts/lint-design.mjs`, `docs/audit-signals.json`) flagging `w-*` on a labeled band `SelectTrigger` that does not opt into the fixed-box path deliberately.
- [ ] Extend `scripts/check-joined-label.mjs` so a toolbar select must not truncate its longest option at desk width, and add a gallery demo with a long-option select (living-demo convention).
- [ ] Bump the package version and document the content-fit mode where the joined-label / control-width contract lives (`docs/STYLE.md`).

## Acceptance

- A labeled toolbar select with no width class shows content width and no longer stretches across the band.
- The trigger width is unchanged after the selection changes between a short and the longest option.
- A select whose longest option is `2026 · A+B` renders it with no ellipsis at desk width, and the same holds for every labeled band select in the gallery.
- No other labeled band select in the gallery truncates its longest option; `check:joined-label` fails when one does.
- A fixed `w-*` class on a band select is flagged by lint-design, and the existing fixed-box path is unchanged for deliberate fixed widths.

## Related

- [[joined-label-shrinks-before-value]] — shipped the label-yields-before-value rule this builds on
- [[joined-label-floor-too-small]] — earlier joined-label sizing fix
- [[native-field-joined-overflow-non-sheet-narrow-host]] — open sibling in the same joined-label sizing area
- [[pageframe-toolbar-overflow-collapse-rule]] — band overflow rule
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — adherence lint zero-dep scanner
