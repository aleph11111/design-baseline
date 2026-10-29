---
area: ui
opened: '2026-10-29'
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
  graded_at: '2026-10-29T08:29:30.717Z'
value: normal
model: opus
model_reason: >-
  design is the deliverable — density default policy (auto below md vs consumer opt-in) changes the
  shell contract every consumer inherits
depends_on:
  - device-triad-check-viewports
---

---
area: ui
opened: 2026-10-29
status: ready
value: normal
model: opus
model_reason: "design is the deliverable — density default policy (auto below md vs consumer opt-in) changes the shell contract every consumer inherits"
depends_on: [device-triad-check-viewports]
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-29T08:35:00Z
---

# Phone tap targets stay under 44px because touch density is an opt-in

## Context

On the phone device (390x844, `src/testing/devices.mjs`) every `kind: page` gallery demo has tap targets under 44px, as measured by `npm run check:viewports` (`scripts/check-viewports.mjs`, tap-target invariant). Both the script and the device export ship with [[device-triad-check-viewports]], which currently downgrades the invariant to a named `KNOWN_GAPS` warning pointing at this ticket. Cause: `docs/STYLE.md` "App touch density" makes 44pt controls an app opt-in (`AppShell density="touch"`, `ControlDensityProvider` in `src/components/ui/toolbar-band.tsx`); below `md` the default step stays `h-9` (36px), except inside the `PageFrame` filter sheet. Offenders on every page: `SidebarTrigger` 28x28 (className-sized in `src/components/layout/Header.tsx`, so density never reaches it), `ThemeToggle` 36x36, `PageHeader` actions and the band's Filter/View buttons 36px, `Input` 36px (settings-sections), table row `Checkbox` 16x16 (`src/components/ui/checkbox.tsx`, settings-table), `TabsTrigger` 28px (tabbed-settings), and the gallery-only demo variant `SegmentedControl`s at 30px.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make `AppShell` resolve density to `touch` automatically below `md` (via `useIsMobile`) when no `density` prop is passed; an explicit `density` prop still wins — `density="default"` is the opt-out that keeps 36px controls on phones, `density="touch"` stays touch everywhere — and desktop renders stay byte-identical. Phone is a deliverable device (operator triad 2026-10-29), so the default must not depend on each consumer remembering the prop. (Decided by team-lead 2026-10-29, flagged to the operator: phones default to touch, desktop unchanged, explicit opt-out kept.)
- [ ] Lift `SidebarTrigger` (`src/components/ui/sidebar.tsx`, sized in `Header.tsx`) and `ThemeToggle` to a 44px hit area under touch density, at the shared primitive rather than per call site.
- [ ] Lift the row `Checkbox` to a 44px hit area on phone without growing the 16px visual box (padded/pseudo-element target), so table rows do not get taller.
- [ ] Confirm `PageHeader` actions, the band's Filter/View buttons, `Input`, `TabsTrigger` and the demo `SegmentedControl`s reach 44px through the density path; fix any owner that does not (gallery-only demo variants set `size` explicitly — remove it there).
- [ ] Delete the `KNOWN_GAPS` `tapTargets` entry in `scripts/check-viewports.mjs` so `check:viewports` fails on any phone target under 44px.
- [ ] Update `docs/STYLE.md` "App touch density" (default below `md`, explicit `density` wins), bump the package version and add the `CHANGELOG.md` row per `docs/RULES.md`, stating the consumer-visible change: controls on phones grow from 36px to 44px on upgrade with no code change (consumers controlling-app and brickshop-manager adopt next); `density="default"` opts back out. Add the same note to `docs/PACKAGE.md`.

## Acceptance

- After the change `npm run check:viewports` shows no phone tap-target warning and exits 0, with the `KNOWN_GAPS` `tapTargets` entry deleted.
- No other phone tap target on any `kind: page` gallery demo measures under 44px in height or width.
- `AppShell` with no `density` prop renders `lg`-step controls at 390px width and its previous steps at laptop and desk widths; an explicit `density` prop still wins at both (`density="default"` renders the 36px step at 390px).
- `CHANGELOG.md` and `docs/PACKAGE.md` name the phone size change as consumer-visible and show the `density="default"` opt-out.
- The row `Checkbox` keeps its 16px visual box while its hit area measures 44px on phone.

## Related

- [[device-triad-check-viewports]] — must ship first: it creates `scripts/check-viewports.mjs` and the `KNOWN_GAPS` `tapTargets` entry this ticket deletes
- [[app-touch-density-control-size]] — shipped; origin of `AppShell density="touch"`
- [[touch-density-icon-button-step]] — shipped; lifted icon `Button`s under touch
- [[calendar-touch-density-targets]] — shipped; same class on the calendar
- [`docs/STYLE.md`](/docs/STYLE.md) — "App touch density"
