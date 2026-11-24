---
area: ui
opened: 2026-11-24
status: ready
value: high
model: opus
model_reason: "design decision on where content-fit applies (band vs form) plus a width-cap mechanism on a shared primitive and a new phone-width check"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-24T00:00:00Z
---

# Content-fit SelectTrigger overflows its container on phones

## Context

The v0.66.0 content-fit mode ([[select-trigger-content-fit-width]], PR #868) in `src/components/ui/select.tsx` gives a labelled `SelectTrigger` without a width class `grid w-fit min-w-min grid-cols-[auto_minmax(max-content,1fr)_auto]` with every option stacked as an invisible `data-option-ghost` span, so the value column is floored at the widest option. There is no `max-w-full` cap, so a long option list makes the trigger wider than its parent and it overflows instead of truncating. Seen in controlling-app (branch `feat/toolbar-select-width-classes-content-fit`): `FigureSlidesEditor.tsx:54`'s form select dropped `w-[260px]` for `options=`, and on a 390px phone the "Zeile" select runs past the card's right edge (chevron clipped) and pushes the whole Deck-Kennzahlen card wider than the viewport (asset-detail and settings/deck-kennzahlen phone screenshots). The selected value also renders horizontally centered in its cell instead of start-aligned (the Radix trigger is a `button`, default `text-align: center`). `docs/STYLE.md` "Toolbar field labels" ("Content-fit select") promises "never the band's width" but says nothing about a container narrower than label + widest option, and forms are documented as stacked (label above control), so band-only scope of content-fit is undocumented.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In the content-fit branch of `SelectTrigger` (`select.tsx`), add `max-w-full` (and `min-w-0` so it can shrink as a flex item) and replace `min-w-min` / the `max-content` floor so the widest-option floor applies only up to the available width; past that the value truncates with an ellipsis (the existing `line-clamp-1` on the value span).
- [ ] Start-align the selected value in its grid cell (`text-start` on the trigger / `justify-self-start` on the value span) so a content-fit trigger reads left-aligned like the fixed-box path.
- [ ] Decide scope: content-fit applies only inside a `PageFrame` toolbar band (`label` set, joined path); a form select stays `w-full` stacked, per STYLE.md "Forms keep the stacked field". Make a form `SelectField`/`SelectTrigger` with `options=` outside a band ignore the ghosts and render `w-full`, and document this in `docs/STYLE.md` "Toolbar field labels" ("Content-fit select" bullet), including the narrow-container truncation rule.
- [ ] Add a check: extend `scripts/check-app-header-phone.mjs` (or `scripts/check-joined-label.mjs`) with a content-fit select with a long option list inside a 360px-wide container, asserting `document.documentElement.scrollWidth <= innerWidth` and the trigger's right edge `<=` its container's right edge; add the matching gallery demo (living-demo convention).
- [ ] Bump the package version and note the fix in the changelog the same way PR #868 did.

## Acceptance

- A content-fit select whose widest option is wider than its container renders no wider than the container and shows its value with an ellipsis instead of overflowing.
- In a 360px-wide container no content-fit select widens the page; `check:app-header-phone` (or `check:joined-label`) fails when one does.
- The selected value of a content-fit select renders start-aligned, not centered.
- A select in a form outside a toolbar band is `w-full` and unchanged by options ghosts; no other labelled select in the gallery overflows its container at 360px.
- Desk-width behavior is unchanged: a content-fit band select still shows its longest option with no ellipsis and keeps its width across selection changes.

## Related

- [[select-trigger-content-fit-width]] — shipped the content-fit mode this caps
- [[app-header-phone-overflow]] — the phone-width page-widening check this extends
- [[native-field-joined-overflow-non-sheet-narrow-host]] — same `minmax(max-content,1fr)` floor pattern on `NativeField`
- [STYLE.md Toolbar field labels](/docs/STYLE.md) — contract to update
