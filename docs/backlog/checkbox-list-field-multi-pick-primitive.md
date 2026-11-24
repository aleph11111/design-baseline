---
area: ui
opened: '2026-11-24'
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-24T00:00:00Z
---

# CheckboxListField multi-pick primitive for dialogs and inline forms

## Context

Component gap: baseline ships `Checkbox` (`src/components/ui/checkbox.tsx`) and labelled single-value fields (`src/components/ui/toggle-field.tsx`, `src/components/ui/color-field.tsx`, `src/components/ui/file-field.tsx`) but no multi-pick field — a labelled list of options, each a checkbox row with an optional trailing badge, bound to a `value: string[]`. `raw-combobox` explicitly scopes multi-value selection out (`src/components/archetypes/raw-combobox/combobox-field.tsx:47`). Consumers therefore hand-roll a bordered checkbox list with an arbitrary height cap.

Evidence (controlling-app, consumer repo): `app/workspace/consolidation/page.tsx:296`, the "Mitglieder" list inside a `CrudDialogSheet`, uses `max-h-64 overflow-y-auto`. That nested scroll region cuts the list at 7 items while the sheet has ~500px of empty space below it — `CrudDialogBody` already owns scrolling (`src/components/archetypes/crud-dialog/CrudDialogBody.tsx:189`, a `ScrollArea`), so the inner cap is a second, worse scroll container. The existing `crud-custom-scroll` audit signal in `docs/audit-signals.json` matches only `max-h-[Nvh]`/`max-h-Nvh` forms, so a rem-step cap like `max-h-64` escapes it.

## What to do

- [ ] Add `CheckboxListField` in `src/components/ui/checkbox-list-field.tsx`, following the `ColorField`/`FileField` precedent (label/hint/error via the shared `fieldFrame`, plain controlled): props `label`, `options` (`{ value, label, badge? }`, optional trailing badge per row), `value: string[]`, `onChange(value: string[])`, built on the existing `Checkbox` so it keeps the touch hit area (STYLE.md "App touch density").
- [ ] Height: inside a `CrudDialogBody` (or any scrolling host) the list is uncapped and grows with the body — no own scroll region. Used inline on a page it may cap its height, opt-in via one prop (`?` exact prop name, e.g. `scroll`), with a single fixed cap owned by the component (per ADR-0004 appearance is fixed in the component, no per-call-site `max-h` class).
- [ ] Export it from the package surface alongside the other `ui` fields, add a vitest file (toggle one option adds/removes it from `value`; badge renders; uncapped by default), and add a gallery demo showing it in a `CrudDialogSheet` with more than 7 options and one inline capped use (living-demo convention for every documented variant).
- [ ] Add an audit signal for hand-rolled capped checkbox lists to `docs/audit-signals.json`: a `max-h-<n>`/`max-h-[<n>rem|px]` plus `overflow-y-auto` container wrapping `<Checkbox` (or `type="checkbox"`) within the same file, `tier: yellow`, `shouldBe` naming `CheckboxListField`, with a candidate-not-verdict note like the sibling signals. Also widen or cross-reference `crud-custom-scroll` so a rem-step cap inside a dialog is caught.
- [ ] Bump the package version per the repo's version-bump rule for shipped code, and record the new primitive in the changelog/migration rows.

## Acceptance

- `CheckboxListField` with 12 options inside `CrudDialogSheet` renders all 12 rows with no inner scrollbar, and scrolling happens only in `CrudDialogBody`.
- Ticking and unticking an option calls `onChange` with the updated `string[]`; an option with a `badge` shows it trailing in the row.
- Inline with the cap prop set, the list scrolls inside its fixed cap and the page does not widen.
- The new audit signal matches a `max-h-64 overflow-y-auto` div wrapping `<Checkbox` and does not match `CheckboxListField` usage.

## Related

- [[crud-dialog-body-two-column-container-query]] — same dialog body the list must grow inside
- [[ui-checkbox-indeterminate-state-icon]] — the same `Checkbox` primitive the field is built on
- [[native-field-joined-overflow-non-sheet-narrow-host]] — sibling field-in-host sizing gap
- [[archetype-gap-crud-dialog-wide-width-step]] — earlier crud-dialog gap filed from consumer evidence
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance fixed in the component
- [docs/audit-signals.json](/docs/audit-signals.json) — home of `crud-custom-scroll` and the new signal
