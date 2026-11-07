---
area: ui
opened: 2026-11-07
status: ready
value: normal
model: sonnet
model_reason: "pattern-following: reuse the existing useTouchLift hook in three primitives, cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: "2026-11-07T12:00:00Z"
---

# Touch density lifts explicit sm in SegmentedControl, ToggleField and Button

## Context

v0.29.2 ([[touch-density-lifts-explicit-sm-sizes]]) lifted an explicit `sm` / `sm14` / `default` to `lg` under app touch density for `Input`, `SelectTrigger` and `SearchInput` through `useTouchLift` (`src/components/ui/toolbar-band.tsx:106`). Three owners from that ticket's list were not converted and still render `h-8` on a phone: `SegmentedControl` (`src/components/ui/segmented-control.tsx:66`, `sizeProp ?? bandSize ?? "default"`), `ToggleField` (`src/components/ui/toggle-field.tsx:47`, `sizeProp ?? bandSize ?? "default"`) and `Button size="sm"` (`resolveButtonSize` in `src/components/ui/button.tsx:79`, which only lifts `icon` / `icon-sm`). `docs/STYLE.md` "App touch density" already claims `SegmentedControl` and `ToggleField` follow the density, but only for an unset `size`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] `SegmentedControl` and `ToggleField`: wrap the explicit `size` in `useTouchLift` (`useTouchLift(sizeProp) ?? bandSize ?? "default"`), the same shape as `select.tsx:55` and `input.tsx:29`; `lg` stays as is.
- [ ] `Button`: in `resolveButtonSize` lift an explicit `sm` to `lg` when density is set, beside the existing `icon` / `icon-sm` lift, so `PaginationLink` and other direct `buttonVariants` callers follow too.
- [ ] Update `docs/STYLE.md` "App touch density": add `SegmentedControl` (`size`), `ToggleField` (`size`) and `Button` `sm` to the list of explicit steps that lift to `lg`; the opt-out for a box that must stay small is unchanged (`TOUCH_TARGET_CLASS` / `useTouchTarget()`).
- [ ] Tests: `h-11` for explicit `size="sm"` under touch density and `h-8` without, for each of the three (extend `control-density.test.tsx` and `button.test.tsx`).
- [ ] Bump `package.json` version (0.29.2 to 0.29.3) and add the `CHANGELOG.md` row per `docs/RULES.md`.

## Acceptance

- Under touch density (phone width with no `density` set, or `density="touch"`), `SegmentedControl size="sm"`, `ToggleField size="sm"` and `Button size="sm"` render at `h-11`; no other explicit-`sm` control on the ladder stays below 44pt.
- At `md` and up, or with `density="default"`, the same controls render at `h-8` unchanged.
- `Button size="lg"` and `SegmentedControl size="lg"` are unchanged under touch density.
- `docs/STYLE.md` "App touch density" lists all three as lifted.

## Related

- [[touch-density-lifts-explicit-sm-sizes]] — shipped the `useTouchLift` lift for `Input`, `SelectTrigger`, `SearchInput`; this finishes its remaining primitives.
- [[touch-density-icon-button-step]] — the `icon` / `icon-sm` lift in `resolveButtonSize`.
- [[phone-tap-targets-touch-density-default]] — made touch the phone default.
- [[button-inline-and-icon-sm-sizes]] — Button size ladder.
