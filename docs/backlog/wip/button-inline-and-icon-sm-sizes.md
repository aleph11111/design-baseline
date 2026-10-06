---
area: ui
opened: 2026-10-06
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
  graded_at: 2026-10-06T22:56:15Z
value: normal
model: sonnet
model_reason: pattern-following — two new cva size entries mirroring the existing ladder, plus the doc/gallery/test/version updates the v0.5.0 ladder tickets already established
---

# Add inline and icon-sm sizes to Button on the control-height ladder

## Context

`src/components/ui/button.tsx` sits on the v0.5.0 control-height ladder (STYLE.md "Control heights"), which after 8404892 pins `default h-9 px-4`, `sm h-8`, `lg h-11`, `icon h-9 w-9` (the 36px square) and is shared with `SelectTrigger`, `Input`, `SearchInput` and `SegmentedControl`. Two legitimate content cases have no step today: content-sized buttons (table-row name links rendered as `Button variant=link`, multi-line list/card buttons in dialogs) need `h-auto`, which the rule forbids as a `className` override; and dense table-row icon buttons have no sub-36px step, so they grow to the 36px `icon` square. Evidence: brickshop-manager PR #1508 (v0.5.0 upgrade review) carries 25 such legitimate buttons. This is a step the v0.5.0 ladder left off the base primitive — the same kind of gap `input-nativefield-size-prop` documented for the `Input` owner.

## What to do

- [ ] Add an `inline` `size` to `buttonVariants` (in `src/components/ui/button.tsx`) — a content-sized button with no fixed height and no horizontal padding (no `h-*`, no `px-*`) for text-link and multi-line content buttons.
- [ ] Add an `icon-sm` `size` to `buttonVariants` — a square `h-8 w-8`, the `sm` step for icon buttons in dense table rows, so they no longer default to the 36px `icon` square.
- [ ] Add both steps to the STYLE.md "Control heights" owners line for `Button` (currently: "`icon` is the square `h-9`"), noting `icon-sm` is the dense-row `sm` step and `inline` is a content case that never appears in a toolbar band (a band is one step by construction).
- [ ] Add the PACKAGE.md migration note: a `className h-auto` on a `Button` becomes `size="inline"` (a dense-row icon override becomes `size="icon-sm"`); update the existing "all controls" v0.5.0 migration row that currently lists the `h-auto text-[10px]` override as the thing to delete.
- [ ] Extend the gallery demo to render both new sizes.
- [ ] Extend `src/components/ui/button.test.tsx` to assert the two new size class sets.
- [ ] Bump the package version (next version above `0.6.4`) so the shipped code carries a version change.

## Acceptance

- `buttonVariants({ size: "icon-sm" })` returns classes containing `h-8 w-8` and no `h-9`/`w-9`; `buttonVariants({ size: "inline" })` returns no `h-*` height class and no horizontal `px-*` class.
- `docs/STYLE.md` "Control heights" names both the `inline` and `icon-sm` steps and records that `inline` never appears in a toolbar band.
- A content-sized table-row link button and a dense icon button from the brickshop-manager PR #1508 set render at their intended sizes using `size`, with no `className h-auto` override still required on those buttons.
- The `package.json` version is higher than `0.6.4`.

## Related

- [[input-nativefield-size-prop]] — the closest sibling: same v0.5.0 ladder gap, documented for the `Input` owner (archived); the precedent for "pick the step, don't override with a `className`."
- [[brickshop-manager-package-install-cutover]] — the consumer whose upgrade review surfaced the 25 content/dense-icon buttons that motivate the two new steps.
- [STYLE.md — Control heights](/docs/STYLE.md) — the owners list and the "never override a height with a `className`" rule this ticket amends.
- [PACKAGE.md — migration table](/docs/PACKAGE.md) — the "all controls" v0.5.0 migration row updated for the new sizes.
