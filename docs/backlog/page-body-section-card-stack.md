---
area: archetypes
kind: roadmap
opened: '2026-11-11'
status: active
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
scope:
  - page-body-section-card-*
stories:
  - section-cards-on-canvas
  - section-card-stack-choice-lives-in-shell
tickets:
  - page-body-section-card-stack-adr-0015
  - page-body-section-card-stack-primitive
  - page-body-section-card-stack-transaction-document
phases:
  - name: p1
    title: >-
      Rule and primitive — ADR-0015, bordered raised-surface chrome, PageFrame stack mode, call-site
      lint
    tickets:
      - page-body-section-card-stack-adr-0015
      - page-body-section-card-stack-primitive
    spec_anchor: '### Phase 1 — Rule and primitive'
  - name: p2
    title: transaction-document slice — one card per section, one column bound
    tickets:
      - page-body-section-card-stack-transaction-document
    open: true
    spec_anchor: '### Phase 2 — transaction-document slice'
  - name: p3
    title: Weak-separation slices — analytics-dashboard, kanban-board
    tickets: []
    open: true
    spec_anchor: '### Phase 3 — Weak-separation slices'
  - name: p4
    title: Remaining kind:page archetypes — stack slice or recorded keep-frame decision
    tickets: []
    open: true
    spec_anchor: '### Phase 4 — Remaining archetypes'
  - name: p5
    title: Consumer migration tickets
    tickets: []
    open: true
    spec_anchor: '### Phase 5 — Consumer migration'
---

# Page body as a stack of raised section cards (supersedes ADR-0008 §3 and ADR-0007 §3)

## Context

Every baseline page renders as one pale `SurfaceFrame` card (`src/components/layout/SurfaceFrame.tsx`, composed by `src/components/layout/PageFrame.tsx`) with hairline-divided strips. `SectionCard` (`src/components/layout/SectionCard.tsx`) drops its fill when nested, via `RaisedSurfaceContext` (`src/components/layout/surface.ts`). The operator calls the result flat and boring. The operator mockup (https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw, `project/V2.dc.html`, "Order detail V2") uses separate white bordered rounded cards per section on a grey canvas, with gaps between them and a toned callout.

Two accepted ADRs forbid this today:

- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) §3: "the frame is the page's only raised surface; inner groupings render as sections inside it, never as cards". The ADR itself names the risk: dashboard widgets and kanban lanes inside one frame may separate too weakly.
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) §3: tone-only separation, no border on a raised surface on the canvas, no card-in-card.

Decision (operator): write a new ADR that supersedes ADR-0008 §3 and ADR-0007 §3 only. ADR-0008 §1 (one `PageHeader` title), §2 (slot-owned placement) and §4 stay. The new rule: a page body may be a stack of raised section cards on the canvas (gap, hairline border, fixed radius). Which archetypes do so is keyed **per archetype inside the shell**, never per call site (per [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md)). The toolbar band stays on the first card. Where the new rule touches ADR-0007 §1 (content column, 1180px with the two wide-desk steps), reconsider the transaction-document local column bound against `AppShell`'s column; the Td shell's bounded column is the case that prompted it.

This is a fleet-wide visual change: every page shell, all screenshot baselines (`tests/screenshots/`), the viewport checks, and every consumer. Hence a roadmap with one slice per archetype. `transaction-document` is the first consumer; its open ticket [[transaction-document-mockup-fidelity]] already asks for one card per section.

## What to do

- [ ] Write the new ADR (next number in `docs/adr/INDEX.md`): supersede ADR-0008 §3 and ADR-0007 §3, keep ADR-0008 §1, §2, §4; define the section-card stack (gap, hairline border, fixed radius, toolbar band on the first card); state that the choice is per archetype in the shell, never per call site; update both superseded ADRs' status lines and the index.
- [ ] Add the shell primitive in `src/components/layout/` (`SurfaceFrame.tsx` / `SectionCard.tsx` / `surface.ts`) so an archetype shell opts in once and `RaisedSurfaceContext` nesting rules follow the new ADR, with component tests.
- [ ] Decompose into one slice ticket per `kind: page` archetype (list-with-detail, form-page, detail-overview, settings-table, grouped-list, matrix-grid, tabbed-settings, analytics-dashboard, import-wizard, feed-inbox, kanban-board, report, statement-with-filters, calendar, settings-sections, print-statement, structure-builder, transaction-document), each deciding stack-or-single-frame for that archetype, updating its contract, demo, tests, screenshot baselines and MANIFEST version.
- [ ] Order the slices: `transaction-document` first (the mockup consumer), then the archetypes ADR-0008 flagged as separating too weakly (analytics-dashboard widgets, kanban-board lanes).
- [ ] Reconsider the `transaction-document` local column bound against `AppShell`'s 1180px column and its wide-desk steps (ADR-0007 §1) as part of the `transaction-document` slice, ending in one bound, not two.
- [ ] Update `docs/STYLE.md`, `docs/PLACEMENT.md` and `docs/audit-signals.json` where they restate the one-raised-surface rule, and file one consumer migration ticket per consumer through the dashboard capture API.

## Acceptance

- The new ADR is Accepted, ADR-0008 §3 and ADR-0007 §3 are marked superseded by it, and ADR-0008 §1, §2 and §4 are unchanged.
- No page call site chooses stack versus single frame; the choice exists only inside each archetype shell, and the adherence lint fails a per-call-site opt-in.
- After the transaction-document slice ships, the demo shows one bordered rounded card per section on the canvas with a gap between cards, and the toolbar band sits on the first card.
- Every `kind: page` archetype has a slice ticket or an explicit recorded decision to keep the single frame; none is left unaccounted.
- Screenshot baselines and `check:viewports` pass at the device triad (desk27, laptop14, phone) for every archetype that changed.

## Related

- [[transaction-document-mockup-fidelity]] — first consumer; its "one card per section" gap and the column-bound question depend on this roadmap's primitive and ADR. It carries no `depends_on` because a roadmap is never dispatchable; sequence it after the primitive slice.
- [[transaction-document-ledger-row-lock-add-remove]] — shipped neighbour on the same shell
- [[archetype-convergence]] — prior fleet-wide archetype roadmap, same slice-per-archetype shape
- [[house-look-adr]] — the ADR-0007 work this partly supersedes
- [[code-health-toolbar-band-extract-from-pageframe]] — touches the same `PageFrame` toolbar band
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance is fixed in the component, never per call site
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — fleet house look
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — transaction-document archetype
