---
area: test-gap
opened: 2026-07-19
status: ready
---

# RowActionsMenu's discriminated-union rendering has zero test references

## Context

`src/components/archetypes/shared/RowActionsMenu.tsx` exports `RowActionsMenu`, promoted specifically because it was "previously duplicated byte-for-byte as private components inside the list-with-detail and settings-table shells" — it is now the single owner of the per-row overflow menu shared across archetypes. A repo-wide search (`grep -rl "RowActionsMenu" src --include="*.test.*"`) finds zero test references, meaning the promoted primitive has less coverage than the duplicated code it replaced would have received individually.

The component has real branching logic via its `isSeparator`/`isHeading` type guards, which decide whether each `RowActionItem` renders as a `DropdownMenuSeparator`, a `DropdownMenuLabel` (heading), or an interactive `DropdownMenuItem` — plus the `destructive` styling and `disabled` state on action items. A regression in the type-guard ordering or the discriminated-union check would silently misrender menu entries across every consumer (list-with-detail, settings-table) simultaneously, which is exactly the fan-out risk the promotion was meant to control via single-ownership, not eliminate via untested single-ownership.

## What to do

- [ ] Add `src/components/archetypes/shared/RowActionsMenu.test.tsx` covering: a flat `RowAction<Row>[]` renders one `DropdownMenuItem` per entry, calling `onSelect(row)` when clicked.
- [ ] Test a `{ separator: true }` entry renders a `DropdownMenuSeparator` and a `{ label, heading: true }` entry renders a `DropdownMenuLabel`, not an interactive item.
- [ ] Test `destructive: true` applies the destructive className and `disabled: true` disables the item without preventing other items from working.
- [ ] Test a mixed list (actions + separator + heading) renders all three kinds in the given order.

## Acceptance

- `RowActionsMenu.test.tsx` exists and passes under `npm test`.
- A test fails if the `isSeparator`/`isHeading` type guards are reordered or broken such that an action is misrendered as a separator/heading or vice versa.

## Related

- `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`, `src/components/archetypes/settings-table/SettingsTableShell.tsx` — the two consumers this primitive was promoted from.
