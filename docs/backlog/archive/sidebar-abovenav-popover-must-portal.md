---
area: layout
opened: 2026-09-29
status: done
value: normal
model: sonnet
model_reason: "one JSDoc paragraph plus a gallery demo switcher on existing primitives"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-29T08:25:00Z
---

# Sidebar aboveNav slot: document that switcher popovers must portal

## Context

`AppSidebar` in `src/components/layout/Sidebar.tsx` wraps `aboveNav` in `overflow-hidden` so that a wide node can't blow out a narrow rail. Its JSDoc calls a workspace/asset switcher "the canonical case", but never says that a switcher's list must render through a portal. controlling-app's `AssetSwitcher` used an in-flow `absolute` panel, which the slot clipped, so the dropdown never visibly opened. controlling-app PR #1169 fixed it by moving to `Popover` + `Command`. Any other consumer that follows the JSDoc literally hits the same trap.

## What to do

- [ ] Extend the `aboveNav` JSDoc: say that anything which pops out of the slot (a switcher list, a menu) must portal. Name `Popover` / `DropdownMenu` as the fit, and note that an in-flow `absolute` panel is clipped.
- [ ] Add a portaled switcher (`Popover` + `Command`) to the sidebar's `aboveNav` in the gallery demo, so the canonical case has a living demo (per the living-demos rule).

## Acceptance

- The `aboveNav` JSDoc names the portal requirement and the clip that forces it.
- In the gallery, the demo switcher's list opens fully visible over the nav, not clipped at the slot edge.
- `npx tsc --noEmit` and `npm test` pass unchanged.

## Related

- controlling-app PR [#1169](https://github.com/aleph11111/controlling-app/pull/1169) — the clipped AssetSwitcher this came from
- [[progress-stepper-aria-current]] — prior layout-primitive fix
