---
slug: settings-table
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/settings-table.md
---

# Settings table — baseline reference implementation

> The stack-specific binding of the [settings-table contract](./settings-table.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<SettingsTableShell>` in `src/components/archetypes/settings-table/`. Provides card chrome, toolbar slot, table with optional bulk-select column, row-actions dropdown, and inline loading / empty / error states. The edit dialog and "add new" dialog are consumer-owned (the primitive exposes callbacks); the J (`crud-dialog`) archetype supplies the composable dialog shell once promoted.

**v2.0 convergence close (2026-08-18).** The shell carries no `className` prop (it never shipped one) and no `headerFill` override — the surface header bar reads `HeaderFillContext`, set once at `<AppShell headerFill=…>`. `toolbar` / `bulkActions` / `headerActions` are `ReactNode` composition slots (content, not appearance). The `align` and the identifier monospace-style axes are **kept, keyed**: both are per-column data props whose value the contract's Layer 6 derives from the column's data, so the closed-and-kept precedent (`detail-overview` `layout` / `width`, `list-with-detail` `align`) applies and no `settings-table-*` error rule was added. `src/components/archetypes/settings-table/**` is in the `exclude` array of the generic `archetype-appearance-noun-prop`, `archetype-look-union-prop` and `archetype-appearance-slot` rules in `_adherence.json`, matching the closed-archetype pattern.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Route config
- Route-level auth guard → `<ProtectedRoute>`.
- Layout injection → `<AppShell>`, `<SettingsLayout>` (applied by the parent route).
- Lazy-import → `const Page = lazy(() => import('./pages/settings/Page'))` wrapped in `<Suspense fallback={null}>` at the route definition.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>` (mounted via the parent route's layout). Mounts `TooltipProvider`, `SidebarProvider`, `<Toaster>`, and `<Sonner>`.
- Vertical rhythm / no page inset → outer container `<div className="space-y-6">`. No `px-6 py-6` or `p-6`; the settings layout's `<main>` supplies all inset.
- Render-error boundary → `<ErrorBoundary>`.
- Breadcrumb trail → `<Breadcrumbs>`, rendered above `<SettingsTableShell>`'s on-surface header.

### Layer 3 — Page header
- On-surface header bar → the shared `<SurfaceHeader>` (`src/components/layout/SurfaceHeader.tsx`), mounted by `<SettingsTableShell>` at the top of its one bounded card.
- Canonical page-title type style → `text-lg font-semibold` (the current Plex Ledger title scale — supersedes the old `text-2xl font-semibold tracking-tight` `<PageHeader>` treatment).
- Header-fill contract → `HeaderFillContext` (`src/components/layout/headerFill.ts`): `solid` (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; `tint` is a quieter `bg-muted` step; `white` is hairline-border-only.
- Overline/kicker style → the shared `OVERLINE_CLASS`.
- Header action buttons → `<Button size="sm">`; `variant="outline"` for secondary actions, default variant for the primary action.

### Layer 4 — Toolbar
- Primary create action → `variant="default" size="sm"`, leading `Plus` icon.
- Result count style → `text-sm text-muted-foreground`.
- Search-input molecule → `<SearchInput>` (`ui/search-input` — `inputSize`/`clearable`/`count` props).
- Filter pill bar → `<SegmentedControl>` (`ui/segmented-control`), not `<Select>`.
- Async action button → the J (`crud-dialog`) archetype's `<AsyncButton>` or an equivalent wrapper.

### Layer 5 — Content wrapper
- Content shell → `<SettingsTableShell>` from `src/components/archetypes/settings-table/`, providing:
  - Bounded card → the canonical `<SurfaceFrame>` chrome (`overflow-hidden rounded-lg border bg-card` — flat, no shadow; owned by `SurfaceFrame`, never spelled by a shell)
  - Toolbar slot, rendered by the frame as the ruled `border-b px-4 py-3` band
  - Body with `overflow-x-auto`
  - Row-level `hover:bg-muted/50`
- Split-pane variation → `grid lg:grid-cols-2 gap-6`, left = table card, right = edit form card, both using the same chrome as `<SettingsTableShell>`.

### Layer 6 — Table / grid
- Base table primitive → shadcn/ui `<Table>` (`src/components/ui/table`).
- Column alignment → `align` on a `SettingsColumn`; `align="right"` for numerical / monetary / date / count columns, `align="center"` for status / category / token columns, `align="left"` (default) for anything else (the contract's Layer 6 keying rule — two engineers holding the same column config derive the same alignment).
- Monospace identifier style → `font-mono text-sm font-medium` for alphanumeric-code identifiers; omitted for human-readable name identifiers (the contract's Layer 6 keying rule).
- Clickable primary identifier cell → `text-primary hover:underline cursor-pointer`.
- Categorical status → a shared `<Badge>` variant.
- Binary toggle dot → `bg-primary` (on) / `bg-muted-foreground` (off); never a literal palette color at the call site.
- Row-actions overflow menu → `<RowActionsMenu>` (`archetypes/shared`), the single owner of the row-level `⋯` overflow trigger, shared byte-for-byte with list-with-detail.

### Layer 7 — Empty / loading / error states
- State-view primitive → `<StateView>` (`ui/state-view`), the single owner of the loading/empty/error planes across settings-table, list-with-detail, and grouped-list; variants `loading` / `empty` / `error`.
- Destructive load-error visual → `<StateView variant="error">` renders a destructive `<Alert>` (title, icon, message) with an optional "Try again" button when `onRetry` is given.
- Mutation-error surface → the app-wide toast (Sonner).

### Layer 9 — Type shapes
- Generic shell → `SettingsTableShell<Row>`.

### Layer 10 — Mutations & invalidation
- Row-actions overflow menu → `<RowActionsMenu>` (`archetypes/shared`).
- Confirm-dialog primitive → shadcn `<AlertDialog>` (or equivalent). Confirm button `variant="destructive"`.

### Layer 11 — Mobile variant
- Table body → stays a standard `<Table>`; the content wrapper's `overflow-x-auto` scrolls it on narrow viewports.
- Overlay surface → full-screen `<Sheet>`.
- Edit dialog composition → the J (`crud-dialog`) archetype's `<CrudDialogSheet>` family — `<CrudDialogSheet>` + `<CrudDialogHeader>`/`<CrudDialogBody>`/`<CrudDialogFooter>` + `useCrudDialogMode` — handling the desktop-width / mobile-full-viewport swap automatically.

### Layer 12 — Permissions
- Route-level auth guard → `<ProtectedRoute>`.

## Migration notes (baseline detail)
- Edit dialog composition → the J (`crud-dialog`) archetype's `<CrudDialogSheet>` + `<CrudDialogHeader>`/`<CrudDialogBody>`/`<CrudDialogFooter>` + `useCrudDialogMode`. Consumers wanting a plain modal may use shadcn `<Dialog>` instead.
- Empty-state copy → `emptyMessage` prop on `<SettingsTableShell>`.

## Acceptance gate (baseline tells)
- Shell → `<SettingsTableShell>`; a hand-rolled card wrapping the table fails "one shell owns the card + table + row-actions dropdown".
- Edit dialog → the J `crud-dialog` shell (`<CrudDialogSheet>` family), not a bespoke `<Dialog>`.
