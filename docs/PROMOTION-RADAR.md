# Promotion radar

Living list of patterns the fleet hand-rolls that the baseline should **own** (Axis
A) — the root-cause heal for recurring drift. Generated/curated from the fleet
molecule audit (`docs/FLEET-AUDIT.md`); machine-readable source of truth is
[`promotion-radar.json`](./promotion-radar.json), which the dashboard hub renders.

**How it works:** a pattern trips onto the radar when it's hand-rolled in a **2nd**
project (rule-of-2). Each entry routes via the two axes — **own it** (promote / wrap
/ adopt-existing) and the always-mandatory **conform to the look** (Axis B). When a
candidate is promoted into the donor, the next adoption cycle absorbs it instead of
deferring it. Status flow: `watch → candidate → promoting → promoted` (or
`sanctioned` for the rare genuine one-off).

## Candidates (rule-of-2 met → promote/wrap/adopt)

| Pattern | Axis A | Donor target | Projects | Status |
|---|---|---|---|---|
| Rich empty/error plane (title+description, action-less error) | promote | extend `StateView` | brickshop, controlling-app | candidate |
| Skeleton list loader | promote | `ListSkeleton` (from hk-crm) + Skeleton loading variant | hk-crm, brickshop, controlling-app | candidate |
| Inline-cell editor | promote | `CellInput` / `CellSelect` (`ui/cell-input`) | brickshop, controlling-app, hk-crm | **promoted 2026-06-15** |
| Compact/clearable/mobile search | promote | extend `SearchInput` (`inputSize`, `clearable`, `count`, native passthrough) | controlling-app, brickshop | **promoted 2026-06-15** |
| Native color/file input | wrap | `ColorField` / `FileField` | controlling-app, brickshop | candidate |
| Chronological media feed | adopt-existing | `FeedItem` (archetype H, already shipped) | mistra, brickshop | candidate |

## Watch (1 project so far — confirm a 2nd before promoting)

| Pattern | Axis A | Donor target | Projects | Status |
|---|---|---|---|---|
| Filter bar (pill row + "all", labeled filter caption) | promote | `PillBar` + `LabeledFilter` (from hk-crm) | hk-crm | watch |
| Colored/semantic icon circle | promote | `IconAvatar` `tone` prop | brickshop | watch |
| Non-row contextual/overflow menu (custom trigger) | watch | `ActionMenu` sibling of `RowActionsMenu` | controlling-app, brickshop | watch |

## Sanctioned (genuine one-offs — conform-only, no component)
- matrix/pivot `<table>` (sticky cols + group spans) — its inline cell control still routes to `CellSelect`.
- combobox / `CommandInput` search — different widget.
- test-fixture raw `<label>`/`<input>`.

## Sync (convergence, not promotion)
- **`FormItem` gap (`space-y-2`→`space-y-1.5`)** persists in mistra / controlling-app / hk-crm — the campaign added new primitives but never synced *changed-existing* ones. Re-broadcast the donor's `form.tsx` via `/style-baseline`. (Future syncs must cover changed-existing primitives, not just new files.)
- **dead `bricklink*` Badge variants** in hk-crm — remove (donor dropped them; brickshop legitimately keeps its own).

## Next actions
1. Promote the six **candidate** rows into the donor (each: primitive/variant + gallery demo + MANIFEST/version touch).
2. Re-broadcast changed primitives (incl. `FormItem`) via a `/style-baseline` sync pass per project.
3. Re-run the fleet audit → candidates become adoptable (promoted) or are confirmed sanctioned; conformance count and drift trend toward zero. That re-audit is the proof the loop closed.
