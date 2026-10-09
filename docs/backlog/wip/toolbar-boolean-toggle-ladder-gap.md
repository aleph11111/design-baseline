---
area: ui
opened: 2026-10-08
status: needs-enrichment
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "toggle-box vs. joined-Switch shape left to the operator; auto-resolved to the on-ladder toggle box (Recommended)"
  graded_at: 2026-10-08T00:00:00Z
---

# Toolbar boolean filter has no control-height ladder step

## Context

The control-height ladder in [`docs/STYLE.md`](/docs/STYLE.md) "Control heights" has no owner for a **boolean filter** (`on`/`off`) in a `PageFrame` toolbar band. The only shipped boolean control is the shadcn `src/components/ui/switch.tsx`, a fixed `h-6 w-11` (24px) pill with **no `size` step** — so in a `default`-step (36px) band it renders 24px next to 36px `Select`s and `Button`s, the exact "a second control height in the same band is drift" case the ladder rule closes (STYLE.md "Control heights", "one band, one step"). Seen in the 2026-10-08 fleet visual pass: hk-sales-agent Trefferliste ("außerhalb Filter zeigen"), brickshop `/sourcing` (Quick Wins / Under target / Show inactive). It is the same gap-class as the size-step threading already shipped for `Input` (`size`), `SegmentedControl` (`size`) and `SearchInput` (`inputSize`), and it belongs beside the joined-label device those controls use inside a band (`ToolbarBandContext`, `src/components/ui/toolbar-band.tsx`; ADR-0008 §1).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `src/components/ui/`, add an **on-ladder boolean toolbar control** — a pressed-state toggle box (Radix Toggle) that takes the band step (`sm` h-8 / `default` h-9 / `lg` h-11) and reads as one box of the band height, with the joined-label device inside a `PageFrame` band (`ToolbarBandContext`) like `SelectField`/`NativeField` — so a boolean filter stops rendering as the bare 24px `Switch`. (per STYLE.md "Control heights" one-step-per-band; matches the `Button` `icon`/`icon-sm` square steps and the `size`-step threading of `Input`/`SegmentedControl`/`SelectTrigger`)
- [ ] In `docs/STYLE.md`, add the boolean-toolbar-toggle to the "Control heights" owners list and a "boolean filter in a toolbar" line under "Toolbar field labels" recording which control to use (the on-ladder toggle, never the bare `Switch`) — today both sections list no owner for a boolean filter. (per the v0.5.0 ladder-and-labels doc change)
- [ ] Add a gallery demo showing a boolean toolbar toggle at each band step beside `sm`/`default`/`lg` controls, per the living-demos convention. (matches the v0.6.0 mobile-filter-sheet demo)
- [ ] Bump `package.json` version and add a `CHANGELOG.md` row (next minor after v0.6.6). (the donor bumps on every shipped-code PR; v0.6.6)

## Acceptance

- After the change, a boolean filter in any `PageFrame` toolbar band renders at the band's step height (`sm` h-8 / `default` h-9 / `lg` h-11), **not** 24px — the entire class of toolbar boolean toggles lines up with its band, with no other bare `Switch` at `h-6` in a band.
- `docs/STYLE.md` "Control heights" owners list names the boolean-toolbar-toggle, and "Toolbar field labels" states which control to use for boolean filters in a toolbar band.
- The toggle reads as a box of the band height and takes the joined label inside a `PageFrame` band (`ToolbarBandContext` true), falling back to stacked/standalone outside the band.
- `package.json` version is bumped above v0.6.6 and a matching `CHANGELOG.md` row exists.

## Related

- [[pageframe-filter-sheet-stacks-nested-fields]] — open, same 2026-10-08 fleet visual pass; the sheet is where these toggles also land
- [[pageframe-mobile-filter-sheet]] — the shipped filter sheet + the joined-label column the joined-label device builds on
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement (joined-label placement, §1)
- [`docs/STYLE.md`](/docs/STYLE.md) — "Control heights" + "Toolbar field labels"; the ladder + joined-label contract this ticket extends

## Open question

Which boolean-control shape to ship and mandate in STYLE.md — (Recommended) a **pressed-state toggle box** on the ladder (a Radix `Toggle`, one box of the band height, joined label optional, reads as `Button`'s square `icon` step), or a **joined `Switch` pill** (a `SwitchField` that fuses into the band like `SelectField`/`NativeField`). The auto-resolved default is the on-ladder toggle box: STYLE.md's "one band, one step / pick the step instead" rule excludes a fixed 24px `Switch` from a band, and the `size`-step + square-step pattern already covers the toggle-box shape. The shape is the one variable; What to do and Acceptance hold either way — the operator can flip it at `/feat`.
