# Fleet audit — molecule adoption (2026-06-14)

Read-only audit of the fleet's **content-molecule** drift against the design-baseline
donor, plus the adoption campaign launched from it. Companion to the 2026-06-13
fit-&-drift audit (which worked at the *archetype* level); this one works at the
*molecule* level — the recurring sub-page patterns each project hand-rolls.

**Operating model (validated this round):** the donor is **source of truth +
auditor**; each project **heals itself** via its own session and its own
`/feat`//ship, scoped to **open PRs (human merges)**. The donor ships primitives +
the molecule rules (`STYLE.md` "Shared content molecules") + this audit; it does not
edit projects. See memory `fleet-adoption-projects-self-heal`.

## Molecules in scope (owner ← rubric)
`Table` (record lists) · field stack `Label`+`Input`/`Select`/`Textarea` / RHF
`FormField` · `SegmentedControl` · `SearchInput` · `RowActionsMenu` (now
separator/heading/disabled-capable) · `StateView` (loading/empty/error) ·
`IconAvatar` · `Badge` · `OVERLINE_CLASS`. Full rubric in `docs/FLEET-AUDIT.md`.

## The fleet spectrum (least → most consolidated)
1. **controlling-app** — NO shared shells; every page hand-rolls loading/error/empty + forms. Most drift; biggest StateView surface.
2. **brickshop** — own shells (StandardTableShell, etc.), drift at the molecule level inside/around them.
3. **mistra** — already archetype-adopted (uses the donor archetype shells); drift lives *inside* the shells + a few non-archetype pages.
4. **hk-crm** — most-consolidated; archetype shells + 7 local analogs already absorb most of the rubric. Mostly reconciliation.

Each project's playbook is tuned to its position: controlling-app sweeps pages,
mistra fixes shells (one fix dedupes many callers), hk-crm upgrades-in-place + a
Badge sweep.

## Per-project summary

| Project | Stack | Molecule primitives | Own shells | Headline drift | Status |
|---|---|---|---|---|---|
| brickshop-manager | Vite + RR | slice 1 merged (PR #464); rest in progress | yes | StateView ~83 / 50 files; label 68; overline 28; search 27; input/select 19; div-rows 18; row-menus 17; circles 7 | 2 sessions running (ws:196 clusters, ws:197 separator menus) |
| controlling-app | Next App Router (pnpm) | none | **none** | StateView ~25+ pages (all fair game); raw form controls 18+ files; segmented 8; search 5; overline 4 | session running (ws:198) |
| mistra | Vite + RR | none | yes (donor archetypes) | StateView ~14 (inside shells + pages); RowActionsMenu/OverflowMenu; search 4; overline 5; **selects ADR-0051-deferred** | session running (ws:199) |
| hk-crm | Next 16 App Router | none (has analogs) | yes (mature) | Badge ~4 pills (Badge ~unadopted); raw label/input small (login + 2 dialogs); StateView ~24 empties / 16 files; **0 select/textarea, 0 inline row-menus, 0 segmented, 0 icon-circles** | session running (ws:201) |
| my-finance-app | Next 16 | **no shadcn/ui** | — | n/a | **OUT of scope** (no ui/, no Radix/CVA) |

## Per-project detail

### brickshop-manager
Slice 1 (master-data: 6 primitives + FormItem `space-y-1.5` + SearchInput/RowActionsMenu
across 6 tables) shipped & merged (PR #464). Remaining clusters being swept by ws:196
(StateView ~83 split into area PRs; then label/overline/search/input/div-rows/circles).
ws:197 syncs the upgraded RowActionsMenu + adopts the separator menus (Packaging,
ShippingMethods) left inline in slice 1. Guardrails: keep `bricklink*` Badge variants
(never `--force`); states owned by `StandardTableShell` are off-limits.

### controlling-app (frontend/)
No shared shells → the entire `src/app/**` page set hand-rolls states; the copy-pasted
red `<div role="alert" border-red-200>` error block and bare `<p>Loading…</p>` recur on
~25+ pages. 18+ files with raw form controls (hot: `workspace/variance` 5 selects). 8
segmented toggles, 5 search boxes, 4 overlines. Exceptions: `<input type="color">`,
inline-cell edit inputs, `NoDataPlaceholder` overlay, `WorkspaceGuard`. Pre-existing bug
to file (not in scope): `PageHeader` drops `title`/`description`/`icon`.

### mistra (frontend/)
Opposite shape — well-adopted; drift inside the shells. Highest-leverage slice: make
`ListWithDetailEmptyState` + `SettingsTableShell` delegate to `<StateView>` (dedupes all
callers); subsume local `OverflowMenu` into `RowActionsMenu`. ~14 StateView sites, 4
search, 5 overline. **ADR-0051 defers `<select>`→shadcn Select — do not sweep selects.**
Keep local `Breadcrumbs`/`PageHeader`/`BottomNav`.

### hk-crm (src/)
Most-consolidated. Already exports a `RowActionsMenu` (`ui/table-row-actions.tsx`)
identical to the donor's pre-separator version → **upgrade in place**. Local analogs kept
as genuine divergences: `pill-bar` (filter pills), `labeled-control` (filter caption),
`list-skeleton` (route `loading.tsx`), `route-error` (`error.tsx` boundary). Real drift:
Badge (~4 pills, Badge almost unadopted → Slice 1), raw label/input (login page + 2
opportunities dialogs + checkboxes), StateView (~24 inline empties / 16 files, with a
`text-slate-500` vs `text-muted-foreground` split). **Zero** select/textarea, inline
row-menus, segmented toggles, icon-circles. No standalone `lint` script — `next build` is
the lint gate. Don't introduce SegmentedControl/IconAvatar (no use case).

### my-finance-app
No shadcn/ui at all (no `components/ui/`, no Radix/CVA; 4 components + Tailwind v4 raw).
Molecule adoption does not apply. Adopting the baseline wholesale is a separate, larger
decision — out of scope for this campaign.

## Donor-side changes this round
- Promoted 6 shared molecule primitives + the molecule rules (earlier 2026-06-14 consolidation).
- `RowActionsMenu` upgraded to a `RowActionItem` union (action | separator | heading) + `disabled`; backward-compatible; gallery demo added (`25f723e`).

## Status & next
- **5 self-heal sessions running:** brickshop ws:196/197, controlling-app ws:198, mistra ws:199, hk-crm ws:201. Each opens PRs for human review; none auto-merge (free-plan repos + intentional human gate).
- Playbooks (ephemeral): `/tmp/{brickshop-molecule-adoption,brickshop-rowactions-sync,controlling-app-molecule-adoption,mistra-molecule-adoption,hk-crm-molecule-adoption}.md`. The durable standard is the donor docs + this audit.
- **Recurring use:** re-run this audit periodically; molecule drift should shrink as PRs land, and the within-page scan (`FLEET-AUDIT.md`) catches any newly hand-rolled molecule. Diff against this file as the baseline.
