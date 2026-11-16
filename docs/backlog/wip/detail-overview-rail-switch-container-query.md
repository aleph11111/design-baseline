---
area: archetypes
opened: 2026-11-07
status: ready
value: high
model: sonnet
model_reason: "scoped class change keyed to an existing container-query pattern (AppShell, FeedShell); cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T00:00:00Z
---

# DetailOverviewShell rail switches on viewport, not content width

## Context

`DetailOverviewShell` (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx:195`) switches to the side rail with `lg:grid lg:grid-cols-[300px_minmax(0,1fr)]`, and the rail/main chrome around it keys on the same viewport `lg` (`max-lg:flex`, `max-lg:contents`, `lg:sticky`, `lg:border-r`, `lg:border-t-0` at lines 154-195). `lg` is a viewport breakpoint, but inside `AppShell` the real column is the viewport minus the 256px sidebar and padding. Repro (brickshop-manager `/orders/:id`, 1133x739): the container is ~781px, the 300px rail leaves 481px for the main column, KPI tiles clip the euro sign, and the line-items table pushes Quantity / Unit Price / Total / Actions off-screen. The same viewport-vs-content mismatch exists in other primitives (`StatTileRow.tsx` `sm:grid-cols-*`, `KeyValueRow.tsx` `md:flex-row`, `CardGridBody.tsx`, `DashboardGrid.tsx`, `StructureBuilderShell.tsx`, `SettingsTableShell.tsx`, `SectionNav.tsx`). `AppShell.tsx` (`@container/db-desk`) and `FeedShell.tsx` already ship container queries, so the pattern exists.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Make the `DetailOverviewShell` root a `@container` and swap every rail-related viewport `lg:` / `max-lg:` variant (lines 154-195) for the matching `@<size>:` / `@max-<size>:` variants, so the rail only appears when the shell's own width fits rail + a usable main column. Class change only, no new prop (ADR-0004).
- [ ] Audit the other viewport `sm:`/`md:`/`lg:` layout switches listed in Context, convert those that really mean content width in the same PR when the change is a pure class swap, and file a follow-up ticket per primitive that needs more.
- [ ] Add a `DetailOverviewShell.test.tsx` case pinning the container-query classes, plus a gallery demo case rendered in a ~780px container; confirm in real Chrome at the device triad (`npm run check:viewports`) that KPI tiles are not clipped and the table is not pushed off-screen.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` fails `npm test` on a bump without one).

## Acceptance

- In a ~780px content column the shell shows the stacked (non-rail) layout, KPI tiles show their full values including the currency sign, and line-items columns are reachable without horizontal overflow of `main`.
- In a wide column (desk27) the shell renders the 300px rail unchanged.
- No other rail-related viewport `lg:` / `max-lg:` variant remains in `DetailOverviewShell.tsx`, and every audited primitive that keys layout on viewport width instead of its container is converted or has a filed follow-up.

## Related

- [[heading-row-actions-squeeze-title-container-query]] — same viewport-vs-content-width defect in `HeadingRow`, same container-query fix; separate file
- [[detail-overview-rail-narrow-references-order]] — prior rail work on the same breakpoint
- [[detail-overview-rail-sticky-ineffective]] — rail `lg:sticky` chrome touched here
- [[appshell-db-desk-width-steps-browser-check]] — precedent for the `@container/db-desk` pattern and its real-browser check
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — fixed in the component, no appearance prop
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — shell/frame placement
