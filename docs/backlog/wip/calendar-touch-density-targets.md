---
area: ui
opened: 2026-10-09
status: ready
value: low
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: "2026-10-09T12:15:00Z"
---

# Calendar nav and day buttons below 44pt under touch density

## Context

`src/components/ui/calendar.tsx` styles its nav buttons (`h-7 w-7`) and day buttons (`h-9 w-9`) with `buttonVariants` plus hard-coded size classes, so `AppShell density="touch"` never reaches them. After [[touch-density-icon-button-step]] every `Button` and `PaginationLink` icon square lifts to 44pt, but the calendar grid stays at 28–36pt. Found by the PR #530 review gate.

## What to do

- [ ] Decide whether touch density lifts the calendar: nav buttons to `h-11 w-11` via `useAppDensity` / `resolveButtonSize` (`src/components/ui/button.tsx`), and day cells to a 44pt step if the grid still fits a phone width.
- [ ] Add a calendar test under `ControlDensityProvider density="touch"` asserting the chosen sizes, and a no-density case asserting they are unchanged.

## Acceptance

- Inside `AppShell density="touch"`, the calendar nav buttons render `h-11 w-11`.
- Without the density setting, the calendar renders unchanged.

## Related

- [[touch-density-icon-button-step]] — origin; lifted `Button` and `PaginationLink` icon squares
- [[app-touch-density-control-size]] — shipped; origin of the density provider
