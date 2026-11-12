---
area: code-health
opened: 2026-11-04
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Extract PageFrame's toolbar band into one component that SettingsTableBody reuses

## Context

`src/components/layout/PageFrame.tsx` grew 170 -> 437 lines in a month (14 commits since 2026-10-04). It now holds four jobs: the frame itself (three render branches: hostTitled, nested, page), the desktop band (lines ~160-212), `MobileBand` (line 379) and `FilterSheet` (line 303) with `flattenFields`/`MAX_INLINE_FIELDS` (line 284, exported from PageFrame.tsx). The View-options `DropdownMenu` is written twice, once desktop and once mobile (SlidersHorizontal trigger + `DropdownMenuContent` min-w-52).

The ruled band chrome `border-b px-4 py-3` with `data-toolbar-band` is written three times: `PageFrame.tsx` lines 233 and 253, and `SurfaceFrame.tsx` line 61. `src/components/archetypes/settings-table/SettingsTableShell.tsx` lines 615-672 hand-roll a fourth copy for `SettingsTableBody`'s tab band (`data-slot="settings-table-band"`, line 658). Its own comment says the inner layout "mirrors the frame's band", and it re-types the trailing `ml-auto flex shrink-0 items-center gap-3` count cluster (PageFrame line 203 vs SettingsTableShell line 662).

The copy has already diverged in behaviour: the settings-table band uses flex-wrap and has no `MAX_INLINE_FIELDS` overflow, no `FilterSheet` and no `MobileBand`. So a `SettingsTableBody` in a `SettingsPageShell` tab on a phone wraps its toolbar fields instead of collapsing them into the filter sheet that every PageFrame page gets. Every band fix (focus-ring room, touch sizes, filter-count badge) has to be made twice. Filed by the 2026-11-04 code-health ritual.

## What to do

- [ ] Move the desktop band, `MobileBand`, `FilterSheet`, `flattenFields` and `MAX_INLINE_FIELDS` out of `PageFrame.tsx` into `src/components/layout/ToolbarBand.tsx` (internal, not barrel-exported, like `SurfaceFrame`), with the band chrome wrapper and a single `ViewOptionsMenu` used by both breakpoints.
- [ ] Have PageFrame's three branches and `SurfaceFrame` render `ToolbarBand` instead of re-typing the chrome.
- [ ] Replace `SettingsTableBody`'s hand-rolled band with `ToolbarBand`, passing its bleed class and its trailing actions (bulk + add) through a trailing slot.
- [ ] Keep `MAX_INLINE_FIELDS` importable from where tests import it (re-export from `PageFrame.tsx` if needed).
- [ ] If the settings-table tab band is meant to wrap and never collapse into a sheet, keep a `collapse={false}` path, but the chrome still has one owner.

## Acceptance

- `PageFrame.tsx` no longer defines `MobileBand`, `FilterSheet` or `flattenFields`, and is under ~250 lines.
- grep for `border-b px-4 py-3` in `src/components` (non-test) returns exactly one hit, and no other copy of the band chrome remains.
- A `SettingsTableBody` with a toolbar, rendered at phone width (`useIsMobile` true), shows the Filter-sheet button like a PageFrame page does.
- `npm test` passes; the `PageFrame.test.tsx` and `SettingsTableShell.test.tsx` band assertions pass unchanged, including `data-slot="settings-table-band"` and `data-toolbar-band`.
- `npm run screenshots` shows no unintended diffs.

## Related

- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [docs/PLACEMENT.md](/docs/PLACEMENT.md) — one owner per slot
- [src/components/layout/PageFrame.tsx](/src/components/layout/PageFrame.tsx)
- [src/components/layout/SurfaceFrame.tsx](/src/components/layout/SurfaceFrame.tsx)
- [src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx)
- [[pageframe-toolbar-overflow-collapse-rule]]
- [[pageframe-mobile-filter-sheet]]
- [[settings-table-body-flush-default-outside-tab]]
