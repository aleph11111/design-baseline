---
area: ui
opened: 2026-10-29
status: ready
value: normal
model: opus
model_reason: "design is the deliverable — lifting explicit sm steps changes the control contract every consumer inherits (dense-row heights)"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: "2026-10-29T12:00:00Z"
---

# Touch density does not lift controls with an explicit sm size

## Context

`AppShell` resolves to touch density below `md` since v0.17.0 ([[phone-tap-targets-touch-density-default]]), but only an **unset** `size` follows it. `src/components/ui/input.tsx:34` computes `SIZE[size ?? bandSize ?? "default"]`, so a consumer's `<Input size="sm">` (or `sm14`) stays `h-8` (32px) on a phone. `SelectTrigger` (`size ?? bandSize`, `select.tsx:60`), `SegmentedControl` (`segmented-control.tsx:66`), `ToggleField` (`toggle-field.tsx:47`) and `Button size="sm"` (`button.tsx:84`, `resolveButtonSize`) follow the same pattern. Found by `design-baseline/testing/invariants` `tapTargets` in controlling-app: `/workspace/annual-statements` at phone had 35 inputs at 47x32 (dense table inputs with `size="sm"`); the app worked around it with `size={useControlSize() ?? 'sm'}`. Every consumer page that passes `size="sm"` for density hits this.

Precedent: `resolveButtonSize` already lifts `icon` / `icon-sm` to `icon-lg` under app density so no icon square stays below 44pt ([[touch-density-icon-button-step]], `docs/STYLE.md` "App touch density"). Text-bearing `sm` steps are the unhandled sibling.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Under app density (`useAppDensity() === "lg"`, which persists into overlays), resolve an explicit `sm` / `sm14` to the `lg` step in `Input`, `SelectTrigger`, `SegmentedControl`, `ToggleField` and `Button` — in each primitive's size resolution, extending the `resolveButtonSize` precedent (`button.tsx:80-85`), not per call site. Decided: lift (matches the icon precedent and the controlling-app workaround) rather than treating `sm` as desktop-only; `sm14` keeps no separate text step under touch (it takes `lg`).
- [ ] Keep `default`/`lg`/`lg18` explicit sizes unchanged (`lg18` keeps its larger text), and keep every render byte-identical when density is not touch (desktop `md+`, `density="default"`).
- [ ] Update `docs/STYLE.md` "App touch density": the "explicit `size` wins" sentence gains `sm`/`sm14` as lifted alongside `icon`/`icon-sm`; name the opt-out for a box that must stay small (the centred `TOUCH_TARGET_CLASS` / `useTouchTarget()` hit area, as for `Checkbox`).
- [ ] Add tests per primitive (`h-11` for explicit `sm` under touch density, `h-8` without) and extend the `tapTargets` invariant coverage / gallery so a dense `size="sm"` table input is exercised at the phone device.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` row per `docs/RULES.md` (behavioural change to a shipped primitive).

## Acceptance

- Under touch density (phone width with no `density` set, or `density="touch"`), `Input size="sm"`, `Input size="sm14"`, `SelectTrigger size="sm"`, `SegmentedControl size="sm"`, `ToggleField size="sm"` and `Button size="sm"` render at `h-11`; no other explicit-`sm` control on the ladder stays below 44pt.
- At `md` and up, or with `density="default"`, the same controls render at `h-8` unchanged.
- The `tapTargets` invariant passes for a phone page whose table inputs pass `size="sm"` with no `useControlSize()` workaround.
- `docs/STYLE.md` "App touch density" documents that `sm`/`sm14` lift under touch and names the opt-out.

## Related

- [[phone-tap-targets-touch-density-default]] — made touch the phone default; this closes the explicit-size hole it left.
- [[touch-density-icon-button-step]] — the `icon`/`icon-sm` lift this extends.
- [[app-touch-density-control-size]] — original density mechanism ("an explicit `size` wins" was decided there).
- [[input-nativefield-size-prop]] — introduced the `Input` size ladder.
