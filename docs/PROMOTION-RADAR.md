# Promotion radar

Living list of patterns the fleet hand-rolls that the baseline should **own** (Axis
A) — the root-cause heal for recurring drift. Generated/curated from the fleet
molecule audit (the rubric now lives in `docs/STYLE.md` "The fleet audit rubric");
machine-readable source of truth is [`promotion-radar.json`](./promotion-radar.json),
which the dashboard hub renders.

**How it works:** a pattern trips onto the radar when it's hand-rolled in a **2nd**
project (rule-of-2). Each entry routes via the two axes — **own it** (promote / wrap
/ adopt-existing) and the always-mandatory **conform to the look** (Axis B). When a
candidate is promoted into the donor, the next adoption cycle absorbs it instead of
deferring it. Status flow: `watch → candidate → promoting → promoted` (or
`sanctioned` for the rare genuine one-off).

**Keeping this table in sync:** the JSON is authoritative — when it and this
prose table disagree, the JSON wins. The table is a curated projection of
`candidates[]`: update the matching row's status + `promotedAt` (and add any
new row) at each promotion close-out. This is the second divergence: the
`skeleton-list-loader` and `media-feed-adopt-feeditem` rows lingered as
`candidate` here after `promotion-radar.json` advanced past #73. The sync
step belongs to the close-out, not "someday".

## Candidates (rule-of-2 met → promote/wrap/adopt)

| Pattern | Axis A | Donor target | Projects | Status |
|---|---|---|---|---|
| Rich empty/error plane (title+description, action-less error) | promote | extend `StateView` (title + description props) | brickshop, controlling-app | **promoted 2026-06-15** |
| Skeleton list loader | promote | `ListSkeleton` (archetype Sk) + StateView `loadingSkeleton` override | hk-crm, brickshop, controlling-app | **promoted 2026-07-23** |
| Inline-cell editor | promote | `CellInput` / `CellSelect` (`ui/cell-input`) | brickshop, controlling-app, hk-crm | **promoted 2026-06-15** |
| Compact/clearable/mobile search | promote | extend `SearchInput` (`inputSize`, `clearable`, `count`, native passthrough) | controlling-app, brickshop | **promoted 2026-06-15** |
| Native color/file input | wrap | `ColorField` / `FileField` | controlling-app, brickshop | **promoted 2026-07-23** |
| Chronological media feed | adopt-existing | `FeedItem` (archetype H, no new donor artifact) | mistra, brickshop | **promoted 2026-07-24** |
| Labeled native field triad (label + bare control + no a11y wiring) | promote | `NativeField` (archetype I) | controlling-app, my-finance-app, mistra, dashboard, brickshop | **promoted 2026-07-23** |
| Raw `<label>` + control, no htmlFor/aria wiring | promote | `NativeField` (archetype I, label-side scan) | controlling-app, my-finance-app, dashboard, pmo, mistra, hk-crm | **promoted 2026-07-23** |
| Labeled multi-line text field re-composed per site | promote | `TextareaField` (archetype T) | dashboard, controlling-app, my-finance-app, brickshop, mistra, hk-crm, pmo | **promoted 2026-07-23** |
| Labeled enum field (`<label>` + `<select>`/`<Select>`, no a11y wiring) | promote | `SelectField` (archetype S) | mistra, my-finance-app, dashboard, brickshop, controlling-app | **promoted 2026-07-24** |
| Overline/eyebrow/kicker label re-typed inline | promote | `Overline` (archetype O, composes `OVERLINE_CLASS` + closed tone set) | mistra, hk-crm, my-finance-app, dashboard | **promoted 2026-07-24** |
| Single-choice mode/filter toggle hand-rolled as button row | adopt-existing | `SegmentedControl` (archetype Sg, Radix radio-group) | brickshop, hk-crm | **promoted 2026-07-24** |
| Initials avatar for a named entity (image fallback, tone) | promote | `EntityAvatar` (archetype E, `entityInitials()`) | brickshop, mistra | **promoted 2026-07-24** |
| Analytics dashboard (KPI stat-card row + chart widgets + period filters) | promote | archetype G (`analytics-dashboard`) | brickshop, my-finance, hk-crm, mistra | **promoted 2026-06-14** (gap-fold) |
| Import / ingestion wizard (upload → column-mapping → verify → commit) | promote | archetype W (`import-wizard`) | controlling-app, my-finance | **promoted 2026-06-14** (gap-fold) |
| Kanban board (sortable columns of draggable cards) | promote | archetype P (`kanban-board`) | pmo, hk-crm | **promoted 2026-06-14** (gap-fold) |
| Inbox / feed surface (conversation/activity feed + filter chips) | promote | archetype H (`feed-inbox`) | brickshop, hk-crm | **promoted 2026-06-14** (gap-fold) |

## Watch (confirmed in a 2nd/3rd project on the next re-audit before promoting)

| Pattern | Axis A | Donor target | Projects | Status |
|---|---|---|---|---|
| Filter bar (pill row + "all", labeled filter caption) | promote | `PillBar` + `LabeledFilter` (from hk-crm) | hk-crm | watch |
| Colored/semantic icon circle | promote | `IconAvatar` `tone` prop | brickshop | watch |
| Non-row contextual/overflow menu (custom trigger) | watch | `ActionMenu` sibling of `RowActionsMenu` | controlling-app, brickshop | watch |
| Auth / error static card (sign-in / not-authorized shell) — gap-fold | watch | archetype; `AuthCard` owns the sign-in half | controlling-app, hk-crm, pmo | watch |

## Sanctioned (genuine one-offs — conform-only, no component)
- matrix/pivot `<table>` (sticky cols + group spans) — its inline cell control still routes to `CellSelect`.
- combobox / `CommandInput` search — different widget.
- test-fixture raw `<label>`/`<input>`.
- `<label>`-wraps-control (checkbox/radio row, file dropzone with hidden input) — already associated by DOM nesting.

## The feedback loop (both directions)

**Downstream (baseline → project):** on every baseline version bump, a
consumer diffs the baseline against its installed tag, migrates, and re-records.
"Are we up to date?" must always be answerable from the radar's `sync`
rows; if it isn't, that is itself a drift.

**Upstream (project → baseline):** when the same drift lands twice in one
project, it becomes a scar in that project's `RULES.md`. When the same scar
appears in a second project — Rule of 2, same as archetypes — it is promoted
into the baseline: into `PLACEMENT.md` / `STACK.md` / `CHOOSING-A-SURFACE.md`
as prose, and into `_adherence.json` (run by `scripts/lint-design.mjs`) as a
check where mechanically possible. This is the gate-2 feed documented in
[`docs/PACKAGE.md`](PACKAGE.md#the-enforcement-stack--four-gates-cheapest-first);
every consumer then inherits the fix.

## Sync (convergence, not promotion)

Each `sync` entry in `promotion-radar.json` carries an optional `since` (`YYYY-MM-DD`,
alongside `item`/`projects`/`action`) — the date the entry was raised, same intent as a
candidate's `promotedAt`. Stamp it when adding a sync entry; the dashboard falls back to
the overlay's `generated` date when it's absent.

- **`FormItem` gap (`space-y-2`→`space-y-1.5`)** persists in mistra / controlling-app / hk-crm — the campaign added new primitives but never synced *changed-existing* ones. Re-broadcast the donor's `form.tsx` via `/style-baseline`. (Future syncs must cover changed-existing primitives, not just new files.)
- **dead `bricklink*` Badge variants** in hk-crm — remove (donor dropped them; brickshop legitimately keeps its own).

## Next actions
1. No **candidate** rows remain — all resolved candidates in `promotion-radar.json` are `promoted`. The live queue is the three **watch** rows in the Watch section (promote once rule-of-2 re-trips).
2. Re-broadcast changed primitives (incl. `FormItem`) via a `/style-baseline` sync pass per project.
3. Re-run the fleet audit → candidates become adoptable (promoted) or are confirmed sanctioned; conformance count and drift trend toward zero. That re-audit is the proof the loop closed.
