---
area: archetypes
opened: '2026-11-12'
status: ready
value: high
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
depends_on: [page-body-section-card-stack-adr-0015, code-health-toolbar-band-extract-from-pageframe]
model: opus
model_reason: "fleet-wide chrome change plus a new PageFrame mode and context; touches every baseline and the shared band"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# Add the bordered raised-surface chrome and PageFrame stack body mode

## Context

Phase 1, step 2 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "## The primitive". Today, `src/components/layout/SurfaceFrame.tsx` and `SectionCard.tsx` render a borderless `bg-surface-raised` card, and a nested one drops only its fill, via `RaisedSurfaceContext` in `src/components/layout/surface.ts`. `PageFrame` always mounts one `SurfaceFrame`. Under ADR-0015, every canvas-raised surface gets a hairline border, a nested one drops both border and fill, and an archetype shell can opt its body into a stack of cards. No archetype switches to stack in this ticket; that starts with the transaction-document slice.

## What to do

- [ ] Add `border` to un-nested `SurfaceFrame`, `SectionCard` (default and muted tone) and `StatTileRow`. A nested surface drops border and fill. Update the `surface.ts` doc comment to cite ADR-0015.
- [ ] Add `body?: "frame" | "stack"` (default `"frame"`) to `PageFrame`, and add `body` to the `Omit` in `PageShellFrameProps` so no shell forwards it. `"stack"` renders `PageHeader`, then a `flex flex-col gap-4 md:gap-5` container on the canvas (no `SurfaceFrame`, `RaisedSurfaceContext` false). It is ignored when the `PageFrame` is nested.
- [ ] Add `ToolbarLeadContext`. In stack mode `PageFrame` wraps only the first child (`React.Children.toArray`) with the band built by the shared `ToolbarBand` from [[code-health-toolbar-band-extract-from-pageframe]]. `SectionCard` and `SurfaceFrame` render that band as their first ruled band, above a title bar.
- [ ] Add the adherence rule `pageframe-body-call-site` (severity `error`) to `_adherence.json`. It flags a `body=` attribute on `<PageFrame` outside `src/components/archetypes/**` and `src/components/layout/**`, and its message says the body shape belongs to the archetype shell (ADR-0015).
- [ ] Write vitest tests:
  - an un-nested surface has a border, a nested one has neither border nor fill;
  - stack mode renders a gap container with no frame;
  - the band renders in the first child only;
  - the mobile filter sheet opens in stack mode;
  - the lint rule fires on a fixture call site and is silent in a shell.
- [ ] Regenerate the screenshot baselines (`npm run screenshots:update`, then review the PNG diffs: only the hairline border should appear), run `npm run check:viewports`, and bump the package minor version.

## Acceptance

- Every un-nested raised surface renders `border`, and a raised surface nested in another renders no border and no fill.
- `<PageFrame body="stack">` renders the page header followed by a gap container, with the toolbar band inside the first child only.
- `node scripts/lint-design.mjs` exits 1 on a fixture page that passes `body=` to `PageFrame`, and exits 0 on the donor tree.
- `npm test`, `npx tsc --noEmit`, `npm run screenshots` and `npm run check:viewports` pass at the device triad (desk27, laptop14, phone).
- No archetype shell passes `body="stack"` yet, so every page keeps its single-frame shape, now bordered.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p1)
- [[page-body-section-card-stack-adr-0015]] — must ship first: it accepts the rule this code implements and supersedes ADR-0007 §3, which the border would otherwise contradict
- [[code-health-toolbar-band-extract-from-pageframe]] — must ship first: it moves the toolbar band out of `PageFrame.tsx` into `ToolbarBand`, the same band code this ticket routes onto the first stack card
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame (§3 superseded)
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance is fixed in the component, never per call site
