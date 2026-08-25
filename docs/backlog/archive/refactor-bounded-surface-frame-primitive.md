---
area: refactor
opened: '2026-08-25'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-25T10:49:11.716Z'
model: opus
model_reason: >-
  extracting the frame every archetype shell draws touches twelve versioned reference primitives at
  once and needs judgment on which of the observed chrome divergences are correct and which are
  accidents
---

# Extract a bounded-surface frame primitive the archetype shells compose instead of copying

## Context

Severity: **medium-high** (DRY / missing abstraction). "One bounded surface" is the load-bearing structural idea of the archetype layer — `docs/PLACEMENT.md` states that each recurring slot resolves to a *single owning primitive* — yet the frame itself has no owning primitive. Twelve shells hand-write the class string:

- `rounded-lg border bg-card overflow-hidden` — `SettingsTableShell.tsx:327`, `ListWithDetailShell.tsx:273`, `FormPageShell.tsx:84`, `SettingsPageShell.tsx:79`, `WizardShell.tsx:89`, `BoardShell.tsx:39`, `DashboardShell.tsx:41`, `FeedShell.tsx:46`
- `overflow-hidden rounded-lg border bg-card` — `CalendarShell.tsx:109`, `ReportShell.tsx:63`, `StatementWithFiltersShell.tsx:65`
- `overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm` — `DetailOverviewShell.tsx:210`
- `overflow-x-auto rounded-lg border bg-card` — `MatrixGridShell.tsx:131`

The last two are the drift the copy already produced. `DetailOverviewShell` alone carries `shadow-sm` — the only `shadow-sm` in `src/components/archetypes/` — while `ReportShell.tsx:48` and `StatementWithFiltersShell.tsx:52` state in their own JSDoc that house style B is a "flat bounded card (`rounded-lg border bg-card`, no shadow)". `MatrixGridShell` swapped `overflow-hidden` for `overflow-x-auto`, so its frame clips differently from every sibling. Nobody reading one shell can tell which of the four spellings is canonical.

The same shells then repeat the frame's *ruled toolbar band* — `<div className="border-b px-4 py-3">{toolbar}</div>` — four times verbatim (`SettingsTableShell.tsx:193`, `ListWithDetailShell.tsx:280`, `BoardShell.tsx:45`, `MatrixGridShell.tsx:138`), which is the second slot of the same frame.

`src/components/ui/card.tsx:12` already declares exactly `rounded-lg border bg-card text-card-foreground shadow-sm` and is imported by nothing under `src/components/` (only `src/examples/form-page-demo.tsx:56`); `src/components/layout/SectionCard.tsx` already models the right shape one level down — a bounded surface with a `chrome` toggle, a `tone` axis, a ruled title bar, and a `flush` body. The frame primitive is the missing peer of `SectionCard` at the shell level, and the `SurfaceHeaderSlot` extraction already proved this exact set of shells accepts a shared slot.

## What to do

- [ ] Add a `SurfaceFrame` primitive to `src/components/layout/` owning the bounded-card chrome (border, rounding, `bg-card`, overflow behaviour) plus the `SurfaceHeaderSlot` it already renders and the ruled `border-b px-4 py-3` toolbar band as a `toolbar` slot.
- [ ] Decide the one canonical spelling and record it: resolve `shadow-sm` (`DetailOverviewShell.tsx:210`) against the "flat, no shadow" statement in `ReportShell.tsx:48` / `StatementWithFiltersShell.tsx:52`, and make `MatrixGridShell`'s horizontal scroll a documented structural mode of the frame rather than a different frame.
- [ ] Refactor all twelve shells to render their frame through `SurfaceFrame`, keeping `ListWithDetailShell`'s `ListChromeContext` chrome-suppression path working — it becomes the frame's chromeless mode instead of a per-shell `cn(!chromeless && …)`.
- [ ] Delete the four hand-copied toolbar-band divs; each shell passes its `toolbar` node to the frame.
- [ ] Add a test asserting a representative shell renders the frame markup and that a chromeless composition (grouped-list's section card) drops the outer card while keeping the body.
- [ ] Bump the `version` of every affected archetype in `docs/archetypes/MANIFEST.json` so consumers pick the change up via `/promote-archetype --update`.
- [ ] ? Decide whether the unused `src/components/ui/card.tsx` becomes the frame's internal base or stays a pure shadcn leaf.

## Acceptance

- `grep -rn "rounded-lg border bg-card" src/components/archetypes` no longer shows a shell declaring its own frame; the class string appears once, in the frame primitive.
- `grep -rn "border-b px-4 py-3" src/components/archetypes` returns no hits — the toolbar band lives only in the frame.
- After the change, altering the frame's border radius or overflow behaviour is one edit and every archetype demo in `src/examples/` reflects it.
- `MatrixGridShell` and `DetailOverviewShell` no longer differ from their siblings by accident: each renders the canonical frame, and any remaining difference is a named, documented mode.
- `npx tsc --noEmit` and `npm test` pass; `node scripts/lint-design.mjs` reports no new hits.

## Related

- [refactor-shell-surface-header-slot-duplication.md](../archive/refactor-shell-surface-header-slot-duplication.md) — the same eleven-shell prop/render duplication, already extracted into `SurfaceHeaderSlot`; this ticket is the frame that slot sits in.
- [archetype-convergence.md](../archetype-convergence.md) — Phase 1's "close the archetype API" work; a shell that no longer spells its own chrome cannot drift from its siblings.
- [docs/adr/0004-appearance-locality-derived-vs-inherited.md](../../adr/0004-appearance-locality-derived-vs-inherited.md) — appearance is global or fixed in the component; four spellings of one frame is neither.
- [src/components/layout/SectionCard.tsx](../../src/components/layout/SectionCard.tsx) — the section-level bounded surface whose `chrome` / `tone` / `flush` shape the frame should mirror.
