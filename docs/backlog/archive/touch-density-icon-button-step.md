---
area: ui
opened: 2026-10-09
status: done
value: normal
gate:
  score: 0
  passed: []
  failed: []
  graded_at: "2026-10-09T00:00:00Z"
---

# Touch density leaves icon-size Buttons below 44pt

## Context

`AppShell density="touch"` (v0.9.0, `src/components/ui/toolbar-band.tsx` `ControlDensityProvider`) resolves an unset `Button` `size` to `lg`, but a Button with an explicit `size="icon"` (h-9 w-9) or `icon-sm` (h-8 w-8) keeps its size — dialog close buttons, row actions, sheet triggers. A kiosk app therefore still has sub-44pt icon targets. Only `PageFrame`'s view-options trigger was mapped to the new `icon-lg` step (`src/components/layout/PageFrame.tsx`). Found by the PR #526 review gate.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Map `icon` and `icon-sm` to `icon-lg` (`h-11 w-11`) in `Button` (`src/components/ui/button.tsx`) when the app density is `lg`, so every icon Button follows the density without per-call-site changes.
- [ ] Document the icon behaviour in `docs/STYLE.md` "App touch density" and add a CHANGELOG row (minor/patch per `docs/RULES.md`).

## Acceptance

- Inside `AppShell density="touch"`, a `Button` with `size="icon"` or `size="icon-sm"` renders `h-11 w-11`.
- Without the density setting, every icon Button renders unchanged, and no other icon call site resolves below 44pt under touch.

## Related

- [[app-touch-density-control-size]] — shipped (PR #526); origin of the density provider this extends
- [[button-inline-and-icon-sm-sizes]] — shipped; last `Button` size-step change
- [`docs/STYLE.md`](/docs/STYLE.md) — "Control heights"
