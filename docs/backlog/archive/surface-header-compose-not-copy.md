---
area: layout
opened: 2026-07-04
status: done
model: sonnet
model_reason: DRY refactor to compose the canonical primitive, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Have report/calendar shells compose SurfaceHeader instead of re-declaring its bar

## Context

Severity: **medium** (architecture / DRY). `SurfaceHeader` (`src/components/layout/SurfaceHeader.tsx:33`) is documented as the single canonical surface header — "every framed archetype shell mounts this at the top of its one bounded card so the whole fleet shares one header treatment." That claim is false in code: `ReportShell` (`src/components/archetypes/report/ReportShell.tsx:92`) and `CalendarShell` (`src/components/archetypes/calendar/CalendarShell.tsx:130`) hand-roll the identical kicker+title+actions bar rather than composing `<SurfaceHeader>`, and `DetailOverviewShell` (`DetailOverviewShell.tsx:145`) carries its own variant. Because the "canonical" header is copied in three places, any change to the header treatment (spacing, header-fill contract, action inversion) must be made 3–4×, and they will drift — exactly the fleet-consistency the primitive exists to guarantee.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) asserting ReportShell and CalendarShell render through `SurfaceHeader` (e.g. a shared header data-attr / role is present) rather than a bespoke bar; then make it pass.
- [ ] Have `ReportShell` (ReportShell.tsx:92) and `CalendarShell` (CalendarShell.tsx:130) compose `<SurfaceHeader kicker title actions />` instead of re-declaring the bar.
- [ ] If detail-overview / crud-dialog need custom internals, extract the shared bar chrome (padding + header-fill wrapper) into `SurfaceHeader` so all shells share one implementation (DRY, single source).

## Acceptance

- ReportShell and CalendarShell render their header through `SurfaceHeader`; grepping the shells shows no hand-rolled kicker+title+actions bar duplicating `SurfaceHeader`.
- A change to `SurfaceHeader`'s treatment is reflected by every framed shell without per-shell edits.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [shell-header-actions-prop-naming.md](shell-header-actions-prop-naming.md) — related on-surface header prop inconsistency
- [header-fill-anchor-button-invert.md](archive/header-fill-anchor-button-invert.md) — header-fill contract the shared bar must honor
- docs/STYLE.md — the canonical surface-header contract
