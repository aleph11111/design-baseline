# 0017 — A compact density step for desktop surfaces; touch keeps 44pt

- **Status:** Accepted
- **Date:** 2026-11-19
- **Amends:** [ADR 0007](0007-fleet-house-look-fixed-vs-brand-roles.md) §2 (the 34px stat step now holds only under touch density; the compact step uses 24px). The 30px page-title display step stands.
- **Respects:** [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (the step is derived from the app density, never a per-call prop), [ADR 0015](0015-page-body-section-card-stack.md) (section card stack), [ADR 0016](0016-quiet-sentence-case-type-hierarchy.md) (the label rung this step resizes around).

## Context

The Refero visual audit (2026-11-18, item B) measured design-baseline at about 1.5x the vertical space of reference products: table rows ~53px vs ~36px, a 64px app header that repeated the page title, ~115px of sidebar before the first nav item (brand row plus a bordered switcher row), ~105px stat tiles vs ~55px, 38px ruled key-value rows vs 28px unruled, a tinted kanban tray with 12px card gaps, and heavy outlined Filter/View buttons in the toolbar band. Touch density already exists (`AppShell density`, `ControlDensityProvider`): touch below `md` by default, explicit `density` wins everywhere. Its 44pt rule is about controls, not surfaces.

## Decision

1. **One compact step, keyed to the app density, not the breakpoint.** Surfaces read `useCompactDensity()` (`ui/toolbar-band`): compact at every density but touch. Phones resolve to touch by default, so they keep the roomy step; `density="touch"` (a kiosk) keeps it at every width; `density="default"` is compact at every width. Keying to the density (not `md:` classes) keeps a consumer's `className` override on a cell or tile merging cleanly, and keeps one rule for both kiosk and phone.
2. **Controls are untouched.** The control ladder and its touch lift (STYLE.md "Control heights") stay as they are; no control target drops below 44pt under touch. A control inside a compact row keeps its own step and the row grows to fit.
3. **Compact targets.**
   - `Table`: 13px body; `TableHead` `h-9 px-3`; `TableCell` `px-3 py-2` (~37px row). Touch keeps `text-sm`, `h-12`, `p-4`.
   - `StatTile`: `px-4 py-2`, 24px value, ~60px tile without a hint. Touch keeps `px-5 py-4` and the 34px stat step.
   - `KeyValueList` / `KeyValueRow`: unruled, `py-1` (~28px rows). Touch keeps the hairline rules and `py-2.5`.
4. **Chrome, at every density** (it holds only controls that already size themselves):
   - `AppHeader` is `h-12` (48px) and no longer renders the page title; the page frame already renders it. `title` stays as an optional prop that names the header landmark (`aria-label`), so call sites keep compiling.
   - `AppSidebar` has one borderless `h-12` top row: the brand mark, then the `aboveNav` switcher (the visible app name becomes screen-reader text) or the app name when there is no switcher. The bordered switcher row is gone. Under `collapsible="icon"` only the brand mark shows.
   - Kanban lanes drop the sunken tray; cards stack 6px apart.
   - The toolbar band's Filter and View buttons are `ghost`, not `outline`.

## Consequences

- Every consumer's desktop screenshots change (tables, header, sidebar, stat tiles, detail key-value lists, boards, toolbar buttons). Phone screenshots change only for the header (48px) and the sidebar sheet's top row. Consumers re-baseline on the bump; no API breaks.
- A consumer whose `aboveNav` switcher was an outlined full-width button with its own margin should drop the margin and use a ghost button; it still renders, just inside the narrower top row.
- A consumer that needs the roomy surfaces on desktop sets `AppShell density="touch"`, which also lifts its controls to 44pt — there is no separate "roomy but small controls" mode until a consumer evidences one.
