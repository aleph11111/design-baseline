---
area: tooling
opened: 2026-10-08
status: done
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-08T18:56:36Z
---

# Adherence lint flags page-switching tabs placed in the PageFrame toolbar band instead of the viewSwitch slot

## Context

A `PageFrame` page that switches what it shows (Plan / Checkliste, synchronisation / import) via `Tabs` / `TabsList` / `SegmentedControl` placed in the `toolbar` slot ends up inside the mobile filter sheet below `md` (the `data-filter-sheet` container in `src/components/layout/PageFrame.tsx`), where the tabs render clipped — seen in the 2026-10-08 fleet visual pass on hk-crm `/settings/synchronisation` and `/settings/import`. The slot grammar in `docs/PLACEMENT.md` already resolves this: `viewSwitch` (first inside the toolbar band, owned by `PageFrame`, stays visible above the filter-sheet row and scrolls sideways when it overflows) is "a control that switches **what** the page shows rather than scoping it", while `toolbar` holds the search/filters that scope the body. The adherence lint (`_adherence.json`, runner `scripts/lint-design.mjs`, ADR-0003) has no rule for the misplacement, and `docs/PLACEMENT.md` never names the page-navigation-tab case in its slot table or red list.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add a `pattern` rule to `_adherence.json` (ratchet `severity: "warn"`, per the `_adherence.NOTES.md` ledger) that flags `Tabs` / `TabsList` / `SegmentedControl` used inside a `PageFrame` `toolbar` — i.e. `toolbar={...}` (or a shell's toolbar slot) containing one of the three components — with a message pointing at the `viewSwitch` prop; record the rule in `_adherence.NOTES.md` alongside the other rules.
- [ ] Add positive/negative fixtures to `scripts/lint-design.test.mjs` covering a toolbar holding page-navigation tabs (warns) and the same tabs passed via `viewSwitch` (clean).
- [ ] Document the case in `docs/PLACEMENT.md` — the page-frame slot table (`toolbar` vs `viewSwitch`) and the red list: page-navigation tabs in `toolbar` are red, they belong in `viewSwitch`; bump the doc version and add a revision-log entry.
- [ ] Bump `package.json` by one patch and add the matching `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` is a `pretest` guard).

## Acceptance

- `node scripts/lint-design.mjs` reports a finding naming the `viewSwitch` alternative for a `PageFrame` with page-navigation `Tabs` in `toolbar`, and reports no finding when the same tabs are passed via `viewSwitch` — no other Tabs usage outside a toolbar is flagged.
- The new lint fixtures pass and the existing `scripts/lint-design.test.mjs` / `scripts/lint-design-core.test.mjs` suites stay green; `npx tsc --noEmit` is unchanged.
- `docs/PLACEMENT.md` names this case in both the slot table and the red list, and after the bump `npm test` runs `verify-package-version.mjs` green.

## Related

- [[pageframe-filter-sheet-stacks-nested-fields]]
- [[pageframe-mobile-filter-sheet]] — built the sheet and `viewSwitch`; its ship notes record the scoping-must-stay-reachable rule
- [[adherence-lint-swallowed-pageframe-slot-prop]] — the nearest lint-rule sibling for a `PageFrame` slot misplacement
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — the adherence lint as zero-dep scanner + ratchet
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [PageFrame source](/src/components/layout/PageFrame.tsx) — the `viewSwitch` prop and the `data-filter-sheet` container

## Decision

Operator (2026-10-09): flag any `Tabs` / `TabsList` / `SegmentedControl` inside a `PageFrame` `toolbar`, with an inline opt-out comment (`// adherence-ok: page-tabs-in-toolbar — <reason>`, reason required) for a tab group that genuinely scopes the body.
