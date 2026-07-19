---
area: test-gap
opened: 2026-07-19
status: ready
---

# FormPageShell's board-form/classic branch has no test coverage

## Context

`src/components/archetypes/form-page/FormPageShell.tsx` (111 lines) changed in 5 commits over the last 90 days and has no corresponding test file. The only test in this archetype directory, `FormPageActions.test.tsx`, covers a sibling component (the footer), not the shell itself.

`FormPageShell` branches on `title !== undefined` to pick between two structurally different outputs: the "board form" layout (a bounded card wrapping a `SurfaceHeaderSlot` + padded body) versus the "classic" free-floating column layout with no header slot at all. It also resolves `width` through `WIDTH_MAP`. This is the outermost container for every form-page (B) archetype instance, so a broken branch silently changes layout for every consumer.

## What to do

- [ ] Add `src/components/archetypes/form-page/FormPageShell.test.tsx` covering: no `title` prop renders the classic layout (no `SurfaceHeaderSlot`, just `children` in a `space-y-5` wrapper).
- [ ] Test that passing `title` switches to the board-form layout: renders `SurfaceHeaderSlot` with `kicker`/`title`/`headerActions`/`headerFill` forwarded, and wraps `children` in the padded card body.
- [ ] Test `width` prop selects the correct `WIDTH_MAP` class in both layouts.

## Acceptance

- `FormPageShell.test.tsx` exists and passes under `npm test`.
- A test fails if the `title !== undefined` branch is removed or the `SurfaceHeaderSlot` props are no longer forwarded correctly.

## Related

- `src/components/archetypes/form-page/FormPageActions.test.tsx` — tests the sibling footer component, not this shell.
- `src/components/archetypes/tabbed-settings/SettingsPageShell.tsx` — same board-form/classic branching pattern, also untested (see [[test-gap-settings-page-shell-no-tests]]).
