---
area: docs-drift
opened: '2026-08-27'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-27T15:06:30.923Z'
---

# STYLE.md stack table understates the shipped UI primitive count

## Context

`docs/STYLE.md` line 9, in the stack summary table, reads:

> `| UI primitives | shadcn/ui (Radix + Tailwind), 34 components          |`

This number disagrees with two other sources of truth inside the very same file. The "Component inventory (`src/components/ui/`)" section further down enumerates a "Standard shadcn/ui set" of 32 named components (`accordion` through `tooltip`), then a "Plus" list of 9 more molecules (`confirmation-dialog`, `error-boundary`, `segmented-control`, `search-input`, `state-view`, `icon-avatar`, `cell-input`, `color-field`, `file-field`) — 41 total by the doc's own enumeration. The filesystem confirms the higher number: `ls src/components/ui/*.tsx | grep -v '\.test\.' | wc -l` returns `41`. So "34" matches neither the doc's own itemized list (41) nor the actual primitive count on disk (41) — it's a stale figure from an earlier ship that was never updated when new primitives (`color-field`, `file-field`, etc.) landed.

An operator skimming just the stack table (without reading down to the itemized inventory) would undercount what the donor ships by 7 primitives.

## What to do

- [ ] Update the stack table's `34 components` to `41` to match the itemized inventory and `ls src/components/ui/*.tsx`, or reword it to defer to the inventory section so it can't drift again (e.g. "see Component inventory below for the current count").

## Acceptance

- `docs/STYLE.md` line 9 no longer states a primitive count that disagrees with its own "Component inventory" enumeration or with `ls src/components/ui/*.tsx | grep -v '\.test\.' | wc -l`.

## Related

- [docs/STYLE.md](../STYLE.md) — the "Component inventory" section this ticket brings the stack-table line in line with.
- [docs-drift-readme-stale-component-archetype-counts.md](archive/docs-drift-readme-stale-component-archetype-counts.md) — the prior, already-resolved instance of the same "fixed count drifts as primitives ship" failure mode in `README.md`.
