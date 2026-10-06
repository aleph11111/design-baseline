---
area: layout
opened: 2026-10-06
status: ready
value: normal
model: opus
model_reason: "contract change across every archetype's Layer 11 mobile variant plus a new PageFrame behaviour — design is part of the deliverable"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-06T15:20:00Z
---

# PageFrame toolbar collapses scoping filters into a mobile filter sheet

## Context

On a phone (iPhone 16 Plus, ~430pt wide, ~398pt after the 16px gutter) a filter-heavy `PageFrame` toolbar wraps one control per row, so on e.g. controlling-app's Variance page (six selects) the statement table starts below the first screen. Today's contract forces exactly that: `docs/archetypes/statement-with-filters.md` "Layer 11 — Mobile variant" requires the selector toolbar to wrap and forbids "hiding selectors on a narrow viewport". Reviewed with the operator on 2026-10-06 against mockups (https://claude.ai/artifact/3P39Ru1A2P4AxpTdi9dYVs, iPhone section, variant B): below `md`, the toolbar's scoping filters move into a bottom `Sheet` (`src/components/ui/sheet.tsx`, already used by `BottomNav` for its overflow drawer). Inside the sheet each filter renders as the same **joined-label row** the desktop toolbar uses — label cell fused to the control's left edge — so desktop and phone draw a filter the same way and only the container changes. View switches (a `SegmentedControl` that changes what the page shows, e.g. Liquidität's Plan/Checkliste/…) stay outside the sheet. Builds on the joined-label `label` prop and the unified control height ladder (sm h-8 / default h-9 / lg h-10, planned donor v0.4.0), which is being implemented separately and is not yet filed as a ticket.

## What to do

- [ ] In `src/components/layout/PageFrame.tsx`, below `md` (via `useIsMobile()` from `src/hooks/use-mobile.ts`, matching `components/ui/sidebar.tsx`'s mobile-sheet fallback), render the `toolbar` band as one row: a `Filter` button carrying the count of set filters, a one-line truncated summary of the active filter values, and the `viewOptions` menu as an icon button.
- [ ] Tapping `Filter` opens a bottom `Sheet` holding the toolbar's scoping filters, one joined-label row per field at the `lg` size (44pt high, 16px text so iOS does not zoom), with a fixed ~130pt label column so labels line up and keep their desktop wording (no mobile-only abbreviations), plus a reset action and a `Fertig` close button.
- [ ] Give `PageFrame` a way to keep view switches outside the sheet (e.g. a separate slot or a per-control marker) — a `SegmentedControl` that switches the page's view stays visible above the summary row and scrolls sideways when it overflows.
- [ ] The joined label cell is part of the control: tapping it opens/focuses the control, and the label is the control's accessible name.
- [ ] Reword every archetype contract's "Layer 11 — Mobile variant" that requires a wrapping toolbar or forbids hiding selectors (starting with `docs/archetypes/statement-with-filters.md`) to "scoping must remain reachable — on a narrow viewport via the filter sheet"; record the rule in `docs/PLACEMENT.md` / `docs/STYLE.md` and add a gallery demo per the living-demos convention.

## Acceptance

- At 430px width, a `PageFrame` with six toolbar filters renders the toolbar as one row and the page body starts on the first screen; the sheet, when opened, lists all six filters as joined-label rows.
- At `md` and wider, the toolbar renders unchanged (one row of joined-label controls) — no other breakpoint behaviour changes.
- Every archetype contract's Layer 11 no longer forbids collapsing selectors into the sheet, and no other contract still requires the narrow-viewport toolbar to wrap.
- A `PageFrame` test asserts the filter count, that the sheet contains every toolbar filter, and that a view-switch control stays outside the sheet.

## Related

- [[archetype-rollout-form-page-sticky-footer-misaligned-on-mobile]] — earlier mobile layout fix in a shell
- [[test-gap-use-is-mobile-zero-tests]] — the `useIsMobile` hook this relies on
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement (the `toolbar` / `viewOptions` slots)
- [statement-with-filters contract](/docs/archetypes/statement-with-filters.md) — Layer 11 to reword
