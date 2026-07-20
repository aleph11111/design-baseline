---
area: refactor
opened: 2026-07-11
status: done
model: sonnet
model_reason: extract a copy-pasted 4-line boolean derivation into one shared helper across three shells; established StateView precedent, clear acceptance, no design decisions
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-11T00:00:00Z
---

# Extract the duplicated loading/error/empty/content state-resolution derivation into one shared helper

## Context

Severity: **medium** (DRY). Three list-shaped archetype shells independently compute the same loading → error → empty → content precedence from `isLoading` / `error` / emptiness, byte-for-byte:

- `SettingsTableShell.tsx:187-190` — `showLoading` / `showError` / `showTable` / `showEmpty`.
- `ListWithDetailShell.tsx:180-184` — `showLoading` / `showError` / `showFilteredEmpty` / `showTable`.
- `GroupedListShell.tsx:59-62` — `showLoading` / `showError` / `showEmpty` / `showSections`.

Each repeats the exact guard chain: `showLoading = isLoading === true`, then `showError = !showLoading && error != null`, then the content/empty flags gated on `!showLoading && !showError`. The precedence rule (loading wins over error wins over empty wins over content) is a single design decision copy-pasted into three files; if it ever changes — e.g. show a stale-data banner during background refetch, or surface error over cached rows — it must be edited in three places and the shells will silently diverge. All three already delegate the *rendering* to the shared `<StateView>` primitive (`src/components/ui/state-view.tsx`); only the *state selection* logic is duplicated.

## What to do

- [ ] Add a small pure helper (e.g. `resolveListState({ isLoading, error, isEmpty })` returning a discriminated `"loading" | "error" | "empty" | "content"` phase, or a `useListState` hook) under `src/components/archetypes/shared/` (the existing home for cross-archetype primitives) or `src/hooks/`.
- [ ] Refactor `SettingsTableShell`, `ListWithDetailShell`, and `GroupedListShell` to derive their render branch from the helper instead of hand-rolling the `show*` boolean chain; preserve each shell's extra distinctions (list-with-detail's `filtered-empty` sub-mode) as a thin wrapper over the shared phase.
- [ ] Keep it strictly behavior-preserving — no change to which plane renders for any given `(isLoading, error, rows)` combination; no consumer-facing prop change.
- [ ] Add a red/green unit test for the helper covering the precedence (loading over error over empty over content) and the empty-vs-content boundary.

## Acceptance

- `grep -rn "const showLoading" src/components/archetypes` returns no shell that re-derives the full guard chain inline; each reads the shared helper.
- The helper has a unit test asserting loading wins over error, error wins over empty, and empty renders when not loading/erroring with zero rows.
- Given identical `(isLoading, error, rows)` inputs, each refactored shell renders the same plane it did before (demos in `src/examples/` unchanged).
- `npx tsc --noEmit` and `npm test` pass; meets the SOLID/DRY/KISS quality bar with no new lint/type/test failures.

## Related

- [list-with-detail-shell-presentation-split.md](archive/list-with-detail-shell-presentation-split.md) — sibling extraction of an inlined concern out of the same shell.
- [settings-table-selected-set-perf.md](archive/settings-table-selected-set-perf.md) — recent work on `SettingsTableShell`.
- `src/components/ui/state-view.tsx` — the shared render primitive these shells already delegate to; this ticket does the same for the state *selection*.
