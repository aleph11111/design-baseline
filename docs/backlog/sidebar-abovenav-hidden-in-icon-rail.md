---
area: layout
opened: 2026-11-19
status: needs-enrichment
value: normal
model: opus
model_reason: "design choice on the icon-rail header layout (ADR-0017 contract) plus a consumer-facing slot contract"
gate:
  score: 4
  passed: [title, context, what-to-do, related]
  failed:
    - acceptance: "no testable assertion yet"
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-11-19T00:00:00Z
---

# AppSidebar aboveNav switcher disappears under collapsible icon

## Context

Since v0.59.0 (ADR-0017, PR #838) `AppSidebar` in `src/components/layout/Sidebar.tsx` wraps the `aboveNav` slot in a `group-data-[collapsible=icon]:hidden` div (line ~168), and its JSDoc states "under `collapsible="icon"` the slot is hidden and only the brand mark stays". A consumer tenant/workspace switcher that renders its own icon-mode variant therefore vanishes from the collapsed rail: only the brand mark shows, and the user loses the switch-tenant control while collapsed. Repro: `<AppSidebar collapsible="icon" aboveNav={<Switcher/>} />` in the collapsed state. The header is one `h-12 flex-row` row (`SidebarHeader`), so a visible slot has to share ~one icon of width with the brand mark.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Let the `aboveNav` slot render under `collapsible="icon"`: drop the `group-data-[collapsible=icon]:hidden` on its wrapper and, in icon mode, stack the header (`flex-col`, auto height) so brand mark and switcher each get one icon-sized cell; the switcher owns its compact variant (it can key off `group-data-[collapsible=icon]`).
- [ ] Update the `aboveNav` JSDoc (the "hidden and only the brand mark stays" sentence) and the ADR-0017 text that records the hiding, to state the new contract: slot stays visible in icon mode, must render a compact variant, and must still portal its popover.
- [ ] Extend the gallery sidebar demo's switcher with a compact icon-mode variant, so the case has a living demo.

## Acceptance

- `AppSidebar collapsible="icon" aboveNav={<Switcher/>}` collapsed shows the switcher control beside or below the brand mark, and it opens its popover.
- No other slot or wrapper in `AppSidebar` hides consumer-provided content under `collapsible="icon"` without the JSDoc naming it.
- Expanded rail layout is unchanged after the change, and the app name stays screen-reader text.

## Related

- [[sidebar-abovenav-popover-must-portal]]
- [[compact-density-step-md-up]]
- [ADR-0017](/docs/adr/0017-compact-density-step.md) — A compact density step for desktop surfaces

## Open question

Alternative to the asserted approach: keep the slot hidden in icon mode and instead give the brand mark itself a switcher affordance (brand tile becomes the switcher trigger when `aboveNav` is set). Cheaper for the rail, but the switcher then needs a second API (a compact trigger prop) and the brand tile doubles as navigation chrome. Asserted default: render the slot and let the switcher own its compact variant. Confirm before `/feat`.
