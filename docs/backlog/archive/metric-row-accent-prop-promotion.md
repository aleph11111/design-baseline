---
area: layout
opened: 2026-09-28
status: done
value: low
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T10:30:00Z
---

# Promote hk-crm's MetricRow accent prop into the donor MetricList

## Context

hk-crm keeps a local `src/components/layout/MetricList.tsx` instead of the package's because its `MetricRow` has an `accent?: boolean` prop. The prop tints the value `text-primary` (the brand) instead of `text-foreground`, and hk uses it for the ARR line on its opportunity detail page (two `<MetricRow … emphasis accent />` call sites). The donor's `src/components/layout/MetricList.tsx` hardcodes `text-foreground` on the value. It is the last hk-crm layout file that differs only because the consumer is ahead. `docs/PACKAGE.md`'s kept-file table says to promote this case ("consumer is ahead **and general**"), then have the consumer delete its copy once it re-points at the new tag.

## What to do

- [x] Add `accent?: boolean` to `MetricRowProps` in `src/components/layout/MetricList.tsx`, applying `text-primary` instead of `text-foreground` to the value when set. Keep the rest of the class string unchanged, matching hk-crm's shape.
- [x] Extend the MetricList tests with an `accent` case, and restore the doc-comment example's `emphasis accent` usage.
- [x] Record the promotion source (hk-crm) in `docs/promotion-radar.json` / `docs/PROMOTION-RADAR.md` per the fleet-synthesis precedent, bump the version and cut the tag.

## Acceptance

- `<MetricRow accent>` renders its value with `text-primary`, and a row without `accent` still renders `text-foreground` (unchanged).
- After the tag bump, hk-crm's `src/components/layout/MetricList.tsx` differs from the package copy only in import paths, so it can be deleted.

## Related

- [archive/test-gap-metric-list-no-tests.md](../archive/test-gap-metric-list-no-tests.md)
- [ADR-0007](../../adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — `--primary` is the one brand accent

## Decision

**Question:** `accent?: boolean` was deleted from `MetricRow` in #214 as per-call-site discretion no contract keyed (ADR-0004, RULES hard rule 10). Should it come back as asked?

**Answer (operator, 2026-09-28):** It comes back data-keyed, not as a free prop. `MetricRow` gains `keyFigure?: boolean`, and detail-overview v3.2 adds the keying rule "Key figure (derived)": at most one row, the metric the entity is valued by, reads the brand ("positive emphasis reads the brand"). `accent` stays deleted. The `_adherence.json` exclusion note cites the new rule; the MANIFEST entry goes to 3.6 and the package to v0.2.16. hk-crm renames `accent` → `keyFigure` on its ARR rows, then deletes its local copy.

