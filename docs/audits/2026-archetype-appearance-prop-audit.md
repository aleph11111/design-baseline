# Archetype appearance-prop audit (2026-08-17)

First run of the `archetype-*` appearance-prop rules in `_adherence.json` (roadmap Phase 1, [archetype-convergence.md](../backlog/archetype-convergence.md)) — a line scan, not the full audit. The decompose loop files against this list; its length is the known work, not a prediction.

The scanner `include`-filters these rules to `src/components/archetypes/`, so no hit names a file under `src/components/ui/` (the shadcn leaf layer, where `variant` / `size` props are correct). Severity is `warn` throughout — allowed during rollout; each archetype flips to `error` as its class drains.

`detail-overview` is the proof archetype this roadmap phase closes ([archetype-convergence-detail-overview-close-api](../backlog/archetype-convergence-detail-overview-close-api.md)); the rest drain during the Phase-1 audit in MANIFEST order.

## Flagged prop count by archetype

| Archetype | Flagged props |
|---|---|
| `list-with-detail` | 4 |
| `form-page` | 2 |
| `detail-overview` | 8 |
| `settings-table` | 2 |
| `crud-dialog` | 2 |
| `grouped-list` | 1 |
| `matrix-grid` | 2 |
| `tabbed-settings` | 1 |
| `analytics-dashboard` | 1 |
| `import-wizard` | 1 |
| `feed-inbox` | 1 |
| `kanban-board` | 1 |
| `report` | 2 |
| `calendar` | 2 |
| `overline-typed` | 1 |
| `entity-circle` | 1 |

## The flagged archetype-prop pairs (MANIFEST order)

One line per distinct flagged prop declaration. `rules` are the matched `archetype-*` rule ids. Line numbers are from this snapshot and drift as the API closes — re-run `node scripts/lint-design.mjs --json` and filter `rule: /^archetype-/` for the current state.

| Archetype | File:line | Prop declaration | Rules |
|---|---|---|---|
| `list-with-detail` | [`list-with-detail/ListWithDetailShell.tsx`](../../src/components/archetypes/list-with-detail/ListWithDetailShell.tsx)#L44 | `align?: "left" | "right" | "center";` | look-union-prop |
| `list-with-detail` | [`list-with-detail/ListWithDetailShell.tsx`](../../src/components/archetypes/list-with-detail/ListWithDetailShell.tsx)#L71 | `detailPresentation?: "rail" | "drawer";` | look-union-prop |
| `list-with-detail` | [`list-with-detail/ListWithDetailShell.tsx`](../../src/components/archetypes/list-with-detail/ListWithDetailShell.tsx)#L106 | `presentation?: "table" | "card-grid" | "action-row";` | look-union-prop |
| `list-with-detail` | [`list-with-detail/ListWithDetailShell.tsx`](../../src/components/archetypes/list-with-detail/ListWithDetailShell.tsx)#L114 | `className?: string;` | shell-class-name |
| `form-page` | [`form-page/FormPageShell.tsx`](../../src/components/archetypes/form-page/FormPageShell.tsx)#L29 | `width?: "sm" | "md" | "lg" | "xl";` | look-union-prop |
| `form-page` | [`form-page/FormPageShell.tsx`](../../src/components/archetypes/form-page/FormPageShell.tsx)#L31 | `className?: string;` | shell-class-name |
| `detail-overview` | [`detail-overview/DetailOverviewShell.tsx`](../../src/components/archetypes/detail-overview/DetailOverviewShell.tsx)#L30 | `header?: React.ReactNode;` | appearance-slot |
| `detail-overview` | [`detail-overview/DetailOverviewShell.tsx`](../../src/components/archetypes/detail-overview/DetailOverviewShell.tsx)#L32 | `stats?: React.ReactNode;` | appearance-slot |
| `detail-overview` | [`detail-overview/DetailOverviewShell.tsx`](../../src/components/archetypes/detail-overview/DetailOverviewShell.tsx)#L35 | `rhythm?: "compact" | "default";` | appearance-noun-prop + look-union-prop |
| `detail-overview` | [`detail-overview/DetailOverviewShell.tsx`](../../src/components/archetypes/detail-overview/DetailOverviewShell.tsx)#L36 | `width?: "none" | "md" | "lg" | "xl";` | look-union-prop |
| `detail-overview` | [`detail-overview/DetailOverviewShell.tsx`](../../src/components/archetypes/detail-overview/DetailOverviewShell.tsx)#L37 | `layout?: "vertical" | "rail";` | look-union-prop |
| `detail-overview` | [`detail-overview/DetailOverviewShell.tsx`](../../src/components/archetypes/detail-overview/DetailOverviewShell.tsx)#L52 | `surface?: "separated" | "unified";` | appearance-noun-prop + look-union-prop |
| `detail-overview` | [`detail-overview/DetailOverviewShell.tsx`](../../src/components/archetypes/detail-overview/DetailOverviewShell.tsx)#L59 | `className?: string;` | shell-class-name |
| `detail-overview` | [`detail-overview/DetailSection.tsx`](../../src/components/archetypes/detail-overview/DetailSection.tsx)#L36 | `tone?: "default" | "muted";` | appearance-noun-prop + look-union-prop |
| `settings-table` | [`settings-table/SettingsTableShell.tsx`](../../src/components/archetypes/settings-table/SettingsTableShell.tsx)#L37 | `align?: "left" | "right" | "center";` | look-union-prop |
| `settings-table` | [`settings-table/SettingsTableShell.tsx`](../../src/components/archetypes/settings-table/SettingsTableShell.tsx)#L101 | `className?: string;` | shell-class-name |
| `crud-dialog` | [`crud-dialog/CrudDialogBody.tsx`](../../src/components/archetypes/crud-dialog/CrudDialogBody.tsx)#L27 | `layout?: "flat" | "two-column";` | look-union-prop |
| `crud-dialog` | [`crud-dialog/CrudDialogSheet.tsx`](../../src/components/archetypes/crud-dialog/CrudDialogSheet.tsx)#L27 | `width?: "sm" | "md" | "lg";` | look-union-prop |
| `grouped-list` | [`grouped-list/GroupedListShell.tsx`](../../src/components/archetypes/grouped-list/GroupedListShell.tsx)#L26 | `className?: string;` | shell-class-name |
| `matrix-grid` | [`matrix-grid/MatrixGridShell.tsx`](../../src/components/archetypes/matrix-grid/MatrixGridShell.tsx)#L62 | `className?: string;` | shell-class-name |
| `matrix-grid` | [`matrix-grid/MatrixGridShell.tsx`](../../src/components/archetypes/matrix-grid/MatrixGridShell.tsx)#L83 | `className?: string;` | shell-class-name |
| `tabbed-settings` | [`tabbed-settings/SettingsPageShell.tsx`](../../src/components/archetypes/tabbed-settings/SettingsPageShell.tsx)#L45 | `className?: string;` | shell-class-name |
| `analytics-dashboard` | [`analytics-dashboard/DashboardShell.tsx`](../../src/components/archetypes/analytics-dashboard/DashboardShell.tsx)#L18 | `className?: string;` | shell-class-name |
| `import-wizard` | [`import-wizard/WizardShell.tsx`](../../src/components/archetypes/import-wizard/WizardShell.tsx)#L31 | `className?: string;` | shell-class-name |
| `feed-inbox` | [`feed-inbox/FeedShell.tsx`](../../src/components/archetypes/feed-inbox/FeedShell.tsx)#L24 | `className?: string;` | shell-class-name |
| `kanban-board` | [`kanban-board/BoardShell.tsx`](../../src/components/archetypes/kanban-board/BoardShell.tsx)#L19 | `className?: string;` | shell-class-name |
| `report` | [`report/ReportShell.tsx`](../../src/components/archetypes/report/ReportShell.tsx)#L27 | `width?: "sm" | "md" | "lg";` | look-union-prop |
| `report` | [`report/ReportShell.tsx`](../../src/components/archetypes/report/ReportShell.tsx)#L28 | `className?: string;` | shell-class-name |
| `calendar` | [`calendar/CalendarShell.tsx`](../../src/components/archetypes/calendar/CalendarShell.tsx)#L30 | `tone?: CalendarEventTone;` | appearance-noun-prop |
| `calendar` | [`calendar/CalendarShell.tsx`](../../src/components/archetypes/calendar/CalendarShell.tsx)#L56 | `className?: string;` | shell-class-name |
| `overline-typed` | [`overline-typed/overline.tsx`](../../src/components/archetypes/overline-typed/overline.tsx)#L43 | `tone?: OverlineTone;` | appearance-noun-prop |
| `entity-circle` | [`entity-circle/EntityAvatar.tsx`](../../src/components/archetypes/entity-circle/EntityAvatar.tsx)#L16 | `tone?: EntityAvatarTone;` | appearance-noun-prop |

## Rules in this scan

| Rule id | Pattern (abridged) | Scope |
|---|---|---|
| `archetype-appearance-noun-prop` | prop name in the appearance-noun list (`surface`, `variant`, `tone`, `density`, `appearance`, `rhythm`, `fill`, `framed`, `bordered`, `compact`, `padded`) | `src/components/archetypes/**` |
| `archetype-look-union-prop` | prop typed as an inline string-literal union | `src/components/archetypes/**` |
| `archetype-shell-class-name` | `className` declared on a `*Shell` | `src/components/archetypes/**/*Shell.tsx` |
| `archetype-appearance-slot` | appearance-bearing `ReactNode` slot (`header`, `stats`) | `src/components/archetypes/**` |

An *inherited-default* check (a prop whose default the contract does not state — the `width` contradiction) is deliberately **not** in this scan: it requires reading the contract prose against the code and is not expressible as a line pattern. It stays a review step in the contract-close work.
