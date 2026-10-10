---
area: layout
opened: 2026-10-10
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-10T00:00:00Z
---

# Joined toolbar label floor leaves unreadable one-letter stubs

## Context

PR #531 ([[joined-label-shrinks-before-value]]) made the joined label yield before the control value, but the floor it yields to is `3rem` — `minmax(3rem,auto)` in `src/components/ui/select.tsx` (line ~65), `src/components/ui/segmented-control.tsx` (line ~76) and `src/components/ui/toggle-field.tsx` (line ~56), and `min-w-12` in `FIXED_BOX_LABEL_CLASS` (`src/components/ui/toolbar-band.tsx`). The label cell carries `px-3` (`JOINED_LABEL_CLASS`), so 3rem leaves only ~1.5rem of text: one or two letters. 2026-10-10 final visual check at 1440px: controlling-app variance shows `Periodent…`, `Peri…`, `V…`; dashboard `Ja…`; planung `S…`. The label is unreadable while the value is fully shown, so the band names nothing.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Replace the `3rem` floor with a text-aware floor at the shared points above: the label cell never narrower than its full text up to ~8rem (padding included), and never below ~4ch of text. Keep one shared constant instead of three literals.
- [ ] Once the floor is reached, the box grows (content-sized controls) or the value truncates (explicit-width boxes, `FIXED_BOX_LABEL_CLASS`) — the label no longer gives way. When the band cannot fit, the existing 4-field cap and filter-sheet collapse (`MAX_INLINE_FIELDS` in `src/components/layout/PageFrame.tsx`) and `overflow-x-auto` scroll take over.
- [ ] Add a gallery demo / extend `scripts/check-joined-label.mjs` with short and long German labels (e.g. `Status`, `Periodenvergleich`, `Inhabergeführt`) at 1440px and 1024px, asserting the label shows ≥4 characters of text.
- [ ] Update `docs/STYLE.md` "Toolbar field labels" (the "Joined-label width rule" bullet still says "down to a ~3rem floor").
- [ ] Bump version in `package.json` (0.10.2 → next) and add a CHANGELOG entry.

## Acceptance

- At 1440px and 1024px a joined label never renders fewer than 4 characters of its text (or the whole label if shorter); no `V…`-style stub.
- A long German label truncates only at its ~8rem cap, never below, in every labelled control: select, segmented control, toggle field and native field.
- No other joined-label call site keeps a `3rem` / `min-w-12` floor; every similar site routes through the shared constant.
- The explicit-width box still does not shrink: when the label is at its floor the value truncates instead of the label.
- The mobile filter sheet's 130px label column is unchanged, and `npx tsc --noEmit` and `npm test` stay green.

## Related

- [[joined-label-shrinks-before-value]] — shipped the label-first shrink this ticket floors.
- [[pageframe-toolbar-overflow-collapse-rule]] — the 4-field cap and sheet collapse that take over when the band cannot fit.
- [[native-field-joined-label-sheet-column]] — same joined-label column, sheet side.
- [[pageframe-filter-sheet-long-label-truncation]] — long German labels in the sheet.
- [docs/STYLE.md "Toolbar field labels"](/docs/STYLE.md) — the width rule to update.
- [src/components/ui/toolbar-band.tsx](/src/components/ui/toolbar-band.tsx) — `JOINED_LABEL_CLASS`, `FIXED_BOX_LABEL_CLASS`.
