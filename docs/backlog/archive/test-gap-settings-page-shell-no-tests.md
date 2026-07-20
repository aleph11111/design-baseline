---
area: test-gap
opened: 2026-07-19
status: done
---

# SettingsPageShell's board-form branch and ErrorBoundary wrap have no test coverage

## Context

`src/components/archetypes/tabbed-settings/SettingsPageShell.tsx` (109 lines) changed in 4 commits over the last 90 days and has no test file. It is documented as shared chrome reused by three archetypes (tabbed-settings F2, settings-form D1, settings-table D2), so a regression here has a wide blast radius.

Untested logic:
- `boardForm = kicker !== undefined || headerActions !== undefined` gates between rendering a `SurfaceHeaderSlot` inside a bounded card versus the classic `SettingsPageHeader` + unwrapped children.
- The whole tree is wrapped in `<ErrorBoundary>` — there's no test confirming a thrown child error is actually caught here rather than propagating.
- `breadcrumbs` renders above either branch.

## What to do

- [ ] Add `src/components/archetypes/tabbed-settings/SettingsPageShell.test.tsx` covering: no `kicker`/`headerActions` renders `SettingsPageHeader` + children directly (classic layout).
- [ ] Test that passing `kicker` or `headerActions` switches to the board-form layout: `SurfaceHeaderSlot` renders in a bounded card, `SettingsPageHeader` is suppressed.
- [ ] Test `breadcrumbs` renders above the header in both layouts.
- [ ] Test that a child throwing is caught by the `ErrorBoundary` wrapper rather than crashing the test render.

## Acceptance

- `SettingsPageShell.test.tsx` exists and passes under `npm test`.
- A test fails if the `boardForm` branch condition changes or the `ErrorBoundary` wrap is removed.

## Related

- [[test-gap-form-page-shell-no-tests]] — same board-form/classic branching shape in a sibling archetype.
