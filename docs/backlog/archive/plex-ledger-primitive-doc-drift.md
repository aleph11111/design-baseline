---
area: docs
opened: 2026-07-04
status: ready
model: sonnet
model_reason: reconcile stale JSDoc/STYLE.md prose with shipped code in one pass, grep-verifiable
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Reconcile layout-primitive JSDoc and STYLE.md with the shipped Plex Ledger house style

## Context

Severity: **low-medium** (docs correctness / DX). The "Plex Ledger" house-style pass (commits `d3af553`, `e5a646f`) changed several primitives' rendered treatment but left their JSDoc/STYLE.md prose describing the old one, so the documented contract now contradicts the code an adopter reads. Confirmed drifts: (1) figures — `StatTile` value JSDoc says "text-2xl font-semibold tabular-nums" and its contract block says "value (2xl semibold tabular)", but the JSX renders `font-mono` (`src/components/layout/StatTile.tsx:13,37,52`); `MetricList`'s IDIOM NOTE says "do NOT force a mono face" while `MetricRow` hardcodes `font-mono` (`MetricList.tsx:24,80`). (2) overline — `SectionHeading.tsx:12` and `StatTile.tsx:8` and `docs/STYLE.md:170` cite a stale size/tracking, while the source `OVERLINE_CLASS` (`overline.ts:11`) renders `text-[10.5px] … tracking-[0.09em]` (matching STYLE.md:97). (3) SectionCard — JSDoc (`SectionCard.tsx:42`) and `detail-overview.baseline.md:24` call `tone="default"` "a card surface with shadow", but the render (SectionCard.tsx:113-119) is flat (border, no shadow) per STYLE.md's surface contract. (4) `DetailOverviewHeader` JSDoc (`DetailOverviewHeader.tsx:9,15`) documents "text-2xl … tracking-tight" / "text-sm", but its wrapped `PageHeader` now renders text-lg/text-xs (`PageHeader.tsx:114,122`).

## What to do

- [ ] Do red/green verification (grep as the test): assert failing — the docs cite `text-2xl`/`tabular-nums`-without-mono/`with shadow`/stale overline size; fix; then assert the JSDoc/STYLE strings match the code (or point at the single source rather than re-typing it).
- [ ] Update `StatTile` value JSDoc + contract block and delete/repair `MetricList`'s "do NOT force a mono face" note so figure-font docs match the `font-mono` render (StatTile.tsx:13,37; MetricList.tsx:24) — or, better, stop restating and reference the primitive.
- [ ] Update `SectionHeading.tsx:12`, `StatTile.tsx:8`, `docs/STYLE.md:170` to the real overline (`text-[10.5px] … tracking-[0.09em]`) or replace the literal with "renders `OVERLINE_CLASS`".
- [ ] Correct `SectionCard.tsx:42` JSDoc and `detail-overview.baseline.md:24` to describe the flat hairline default tone.
- [ ] Update `DetailOverviewHeader` title/subtitle JSDoc to text-lg/text-xs, or point it at `PageHeader` as the single source so it cannot drift again.

## Acceptance

- The JSDoc/STYLE.md descriptions for figures (mono), overline size/tracking, SectionCard default tone (flat), and DetailOverviewHeader type scale match the rendered code (verified by grep + reading the JSX).
- No layout primitive documents a treatment its code no longer renders.
- Meets the quality bar: clean, readable, accurate docs; no new TypeScript errors, lint warnings, or test failures.

## Related

- [archetype-specs-board-form-sync.md](archive/archetype-specs-board-form-sync.md) — the Plex Ledger sync that caused this drift
- docs/STYLE.md — the house-style source of truth
- src/components/layout/overline.ts — the single overline source these docs should cite
