# Fleet fit & drift audit — 2026-06-13

Read-only sweep per `docs/FLEET-AUDIT.md`. 6 frontend projects scanned (one agent
each) → synthesized + triaged. Raw per-route data: `2026-06-13-fleet-fit-drift.json`.

## Headline — it's under-adoption, not divergence

Only **2 of 6** projects (hk-crm, mistra) wire in baseline archetype primitives;
the other **4 hand-roll every page** despite strong structural matches. So the
fleet's problem is **adoption, not unification** — which means the right move is
incremental adoption + a few variant axes, **not** a big-bang baseline rewrite.

The single biggest lever is **brickshop-manager**: ~48–73 routes running a mature
*parallel* internal archetype program (`StandardTableShell`, `CrudDialogSheet`,
`HubTabs`, `PageHeader`) at high structural fidelity to the baseline — but zero
baseline adoption.

## Adoption (adopted / hand-rolled / gaps)

| Project | Adopted | Hand-rolled | Gaps | Note |
|---|---:|---:|---:|---|
| hk-crm | 27 | 1 | 4 | baseline **producer** + exemplar |
| mistra | 7 | 8 | 2 | adopts where the primitive is installed |
| brickshop-manager | 0 | 48 | 9 | mature parallel program; biggest lever |
| controlling-app | 0 | 21 | 9 | matrix/ledger family, custom keys |
| my-finance-app | 0 | 8 | 7 | raw tables/modals, no RHF |
| pmo | 0 | 5 | 1 | has a pending adoption-plan.md |

## Per-archetype coverage

| Key | Adopted in | Hand-rolled in | Absent |
|---|---|---|---|
| A list-with-detail | hk-crm, mistra | brickshop, controlling, my-finance, pmo | — |
| B form-page | hk-crm, mistra | brickshop | controlling, my-finance, pmo |
| C detail-overview | hk-crm | brickshop, mistra, controlling, my-finance | pmo |
| D2 settings-table | hk-crm, mistra | brickshop | controlling, my-finance, pmo |
| J crud-dialog | hk-crm, mistra | brickshop, controlling, my-finance, pmo | — |
| K grouped-list | hk-crm | controlling, my-finance | brickshop, mistra, pmo |
| M matrix-grid | hk-crm | controlling, pmo, brickshop | mistra, my-finance |
| F2 tabbed-settings | hk-crm | brickshop, mistra, controlling | my-finance, pmo |

## Candidate new archetypes (★ = cleared rule-of-2)

- ★ **Analytics dashboard** — KPI stat-card row + chart widgets + period filters. Recurs in brickshop, my-finance, hk-crm /reports, mistra admin (**4 projects** — strongest).
- ★ **Import / ingestion wizard** — upload → column-mapping → verify → commit. controlling, my-finance.
- ★ **Kanban board** — dnd-kit sortable columns of draggable cards. pmo, hk-crm.
- ★ **Inbox / feed surface** — conversation/activity feed + filter chips. brickshop, hk-crm.
- ★ **Auth / error static card** — centered sign-in / not-authorized shell. controlling, hk-crm, pmo.
- (hold — single-project) two-pane reconciliation workbench (my-finance), report builder (controlling), gantt/timeline (pmo), media-capture flow (mistra), editable financial entry matrix (controlling).

## Variant axes to add BEFORE forcing adoption (yellow — essential variation)

- **A** — `presentation: table | card-grid | action-row` and `detail-target: route | dialog | none` (card grids in pmo/controlling, action-row mobile lists in brickshop).
- **C** — `editability: read-only | inline-edit | action-dialogs` (opportunities/reconciliations do in-place edit).
- **M** — `read-only | editable-cell` and `ledger | tile | comparison` (controlling's ledger/entry/variance grids are broader than hk-crm's interactive M).
- **Tabbed detail** — document F2-shell-wrapping-a-C-body as an explicit allowed composition (brickshop, hk-crm company detail).

## Prioritized actions

1. **Reconcile brickshop-manager** — map its parallel primitives to the baseline (`StandardTableShell`→A, `CrudDialogSheet`→J, `HubTabs`→F2, settings tables→D2, detail views→C). Largest hand-rolled surface, already conformant.
2. **Add the variant axes above first** — converts most "yellow" divergence into conformant variants so projects *can* adopt without losing domain fit.
3. **mistra** — install + adopt C and F2 (shapes already match: RecordingDetailPage, AdminDashboardPage, HealthPage, ModelsPage).
4. **controlling-app** — adopt M/F2/K/C *after* the M variant axes land.
5. **my-finance-app** — adopt A/C/K/B (introduce RHF via B).
6. **pmo** — execute its adoption-plan: A into the task lists, J into TaskDetailDialog.
7. **Promote `analytics dashboard`** (rule-of-2 cleared, 4 projects).
8. **Promote `import wizard`** (controlling, my-finance).
9. **Hold** two-pane reconciliation workbench at candidate review (single project).
10. **Decide kanban** — promote or formally exclude (pmo, hk-crm).

## Method note

This was a heuristic structural classification (one agent per repo, sampling
representative pages). Treat fit scores as directional; confirm individual
yellow-vs-red calls before acting. Re-run via the `fleet-fit-drift-audit`
workflow as projects evolve.
