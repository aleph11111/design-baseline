---
key: D2
slug: settings-table
kind: page
version: 1.2
promoted_from: brickshop-manager
promoted_at: 2026-05-22
source_spec_version: 1.0
status: locked
---

# Archetype D2 — Settings table

## Purpose

A **settings table** page shows a list of configuration entities (categories, suppliers, payment methods, shipping rules, numbering series, …) as a table, where clicking a row opens an **edit dialog**. Use this archetype whenever a page's job is to let users manage a flat list of configuration records through CRUD operations. It is the canonical shape for every `/settings/<group>/<entity>` page in a business application.

D2 is a sibling of A (list-with-detail) — it inherits the same outer shell, toolbar, and data-fetching contracts. The key divergence is the **click contract**: D2 opens an edit dialog on row click rather than navigating to a detail route or opening a right-rail panel.

## Reference primitive

`<SettingsTableShell>` in `src/components/archetypes/settings-table/`. Provides card chrome, toolbar slot, table with optional bulk-select column, row-actions dropdown, and inline loading / empty / error states. The edit dialog and "add new" dialog are consumer-owned (the primitive exposes callbacks); the J (`crud-dialog`) archetype supplies the composable dialog shell once promoted.

---

## Layer 1 — Route config

**Required:**
- Path: `/settings/<group>/<entity-plural>` nested under the project's settings parent route (e.g. `/settings/master-data/customers`, `/settings/order-processing/shipping-methods`).
- The parent route handles auth wrapping (e.g. `<ProtectedRoute>`) and layout injection (`<AppShell>`, `<SettingsLayout>`). Do not re-apply these wrappers at the child route.
- Lazy-import the page component: `const Page = lazy(() => import('./pages/settings/Page'))`.
- Wrap in `<Suspense fallback={null}>` at the route definition.

**Forbidden:**
- Static (non-lazy) imports of D2 pages (bundle-size regression).
- Applying `<ProtectedRoute>` or layout wrappers redundantly at the child route level.

---

## Layer 2 — Page shell

**Required:**
- The page renders inside `<AppShell>` (via the parent route's layout). `<AppShell>` mounts providers (`TooltipProvider`, `SidebarProvider`, `<Toaster>`, `<Sonner>`); consumers do not re-mount them at the page level.
- Outer container: `<div className="space-y-6">` — spaces the title block from the table card. No `px-6 py-6` or equivalent outer padding; the settings layout's `<main>` supplies all inset.
- `<ErrorBoundary>` wrapping page content at the page component level.
- `<Breadcrumbs>` rendered at the top of the page shell, above `<SettingsTableShell>`'s on-surface header (see Layer 3) — there is no separate `<PageHeader>`.

**Allowed variation:**
- A page-level React context provider is optional. Introduce one only when filter or selection state is consumed by more than one child component tree; do not add one for single-tree state.

**Forbidden:**
- Outer padding classes (`px-6 py-6`, `p-6`, etc.) — double-insets inside the settings layout.
- Page-level `<Card>` wrapping the table content (chrome lives in the content wrapper — Layer 5).
- Missing `<ErrorBoundary>`.

---

## Layer 3 — Page header

The page header no longer floats above the shell as a separate `<PageHeader>`. `<SettingsTableShell>` mounts the shared `<SurfaceHeader>` (`src/components/layout/SurfaceHeader.tsx`) at the top of its one bounded card — the title bar sits ON the surface, driven entirely by shell props.

**Required (via shell props):**
- **`title`** — always present when the on-surface header renders. `<SurfaceHeader>` renders it `text-lg font-semibold` (the current Plex Ledger title scale — supersedes the old `text-2xl font-semibold tracking-tight` `<PageHeader>` treatment).
- The bar follows the `--header-fill` contract (`HeaderFillContext`, `src/components/layout/headerFill.ts`): `solid` (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; `tint` is a quieter `bg-muted` step; `white` is hairline-border-only.

**Allowed variation:**
- **`kicker`** — optional overline above the title (e.g. "Settings", "Catalog"), rendered via the shared `OVERLINE_CLASS`.
- **`headerActions`** — optional right-aligned `<Button size="sm">`s (e.g. "Import", "Add {entity}"): `variant="outline"` for secondary actions, default variant for the primary action. At most one primary action.
- **`headerFill`** — a single shell instance may override the project's house `headerFill` context.
- **Sync / refresh action** — some D2 pages back their data from an external system and expose a "Sync" action. When present, place it in the toolbar (Layer 4) as an async action button.

**Forbidden:**
- Inline `<h1>` or custom header markup — always the shell's `kicker`/`title`/`headerActions` props.

---

## Layer 4 — Toolbar

**Required:**
- Toolbar renders as the `toolbar` prop of `<SettingsTableShell>`, not above or below the shell.
- **Primary create action** — single button, `variant="default" size="sm"`, leading `Plus` icon. Label: "Add {entity}". Opens the add dialog. Canonical home: the shell's `headerActions` (the on-surface header bar, Layer 3 — it inverts on a solid header fill). The legacy `onAddNew` toolbar button remains supported on existing pages, but new pages put the create action in the header — the toolbar owns data controls, not writes.
- **Result count** — `text-sm text-muted-foreground`, right-aligned, format: `{n} results` or `{n} {entity-plural}`.

**Allowed variation:**
- **Search input** — the shared `<SearchInput>` molecule (`ui/search-input` — `inputSize`/`clearable`/`count` props); never hand-rolled. Required when the dataset is not intrinsically small (threshold: more than ~10 rows). Omit for pages where search adds no value (e.g. a fixed list of ≤10 numbering series).
- **Filter pill bar** — for categorical filters (e.g. status), via the shared `<SegmentedControl>` (`ui/segmented-control`) — a one-of-N pill row — not a `<Select>` dropdown.
- **Binary filter switches** — for toggle-style filters (e.g. "Show archived").
- **Async action button** — for long-running operations like Sync / Enrich. Show an inline spinner during the run. The J archetype's `<AsyncButton>` or an equivalent wrapper is recommended.
- **Bulk actions** — when rows are selected, a bulk-action affordance (e.g. "Delete selected") appears in the toolbar. Renders only while `selectedIds.length > 0`.

**Forbidden:**
- Status filters rendered as `<Select>` dropdowns (use `<SegmentedControl>`).
- Hand-rolled search inputs — always compose via the shared `<SearchInput>` molecule.
- Toolbars rendered outside `<SettingsTableShell>`.
- Action buttons placed anywhere other than the toolbar or the shell's `headerActions`.

---

## Layer 5 — Content wrapper

**Required:**
- `<SettingsTableShell>` from `src/components/archetypes/settings-table/`. The shell provides:
  - Card chrome: `rounded-lg border bg-card shadow-sm overflow-hidden`
  - Toolbar slot with `border-b px-4 py-3` separator
  - Body with `overflow-x-auto`
  - Loading, empty, and error states rendered inline
  - Optional bulk-select checkbox column
  - Row-level `hover:bg-muted/50`

**Allowed variation — split-pane editing:**
- When users edit rows in rapid succession and a dialog's open/close cycle creates friction, a `grid lg:grid-cols-2 gap-6` layout with left = table card and right = edit form card is permitted. Both cards use the same chrome as `<SettingsTableShell>`. Document the reason inline. This is an uncommon variation; use only when the UX case is clear.

**Forbidden:**
- Hand-rolled card wrappers. Always use `<SettingsTableShell>` (or the split-pane variation above).
- Nested `<Card>` chrome — one card boundary per visible surface.
- Page-level `max-width`. Full-width.

---

## Layer 6 — Table / grid

**Required:**
- shadcn/ui `<Table>` primitive (`src/components/ui/table`).
- **Number formatting** — monetary values routed through a consumer-provided formatter. No raw currency symbols or `.toFixed(2)` in cells.
- **Date formatting** — every date cell renders through a consumer-provided formatter (e.g. `formatDate(value)`). No raw ISO strings in the UI.
- **Identifier columns** — `font-mono text-sm font-medium` for alphanumeric codes or slugs; omit `font-mono` for human-readable name identifiers.
- **Primary identifier cell** — `text-primary hover:underline cursor-pointer`. Clicking it calls `onRowEdit(row)` — the consumer opens the edit dialog. This is D2's core click contract: **row click → edit dialog, never a detail route or a detail panel**.

**Allowed variation:**
- **Sortable headers** — optional. Sort state is consumer-owned; pass pre-sorted `rows`.
- **Status indicators:**
  - Categorical status — use a shared `<Badge>` variant.
  - Binary toggle (active / archived) — colored dot (`bg-green-500` / `bg-muted-foreground`) + label text.
- **Per-row dropdown menu** — optional for secondary actions (Delete, Duplicate, Deactivate), via the shared `<RowActionsMenu>` (`archetypes/shared`) — the single owner of the row-level `⋯` overflow trigger, shared byte-for-byte with list-with-detail. Do **not** include "Edit" in the menu — identifier-cell click is the only edit trigger.
- **Row checkbox column** — when `bulkSelectable` is true, a leading checkbox column appears. Selecting all rows checks a header checkbox.
- **Identifier without `font-mono`** — when the identifier is a human-readable name (e.g. a category name, a tag label), `font-mono` may be omitted. `text-primary hover:underline` still applies.

**Forbidden:**
- Explicit "Edit" icon column — identifier-cell click is the only edit trigger.
- Navigating to a detail route on identifier-cell click (that is Archetype A's behavior).
- Opening a right-rail detail panel on click (also Archetype A's behavior).
- Inline editing of cells (clicking a cell to edit in place).
- Inline status color maps duplicated per page — categorical statuses go through a shared variant.
- Raw number formatting in cells.
- Raw ISO date strings in cells.
- Clickable identifier cells without `text-primary`.

---

## Layer 7 — Empty / loading / error states

**Required:**
- **Loading** — provided by `<SettingsTableShell>` via the shared `<StateView variant="loading">` (`ui/state-view`) — the single owner of the loading/empty/error visual planes across settings-table, list-with-detail, and grouped-list. No skeleton screens.
- **Empty state** — `<StateView variant="empty">`, inline, query-dependent copy:
  - Filter / search active: `"No {things} match {query}."`
  - No items at all: `"No {things} yet."` + a primary CTA button ("Add {entity}") calling `onAddNew`. The CTA is the entry point to the first record.
- **Error state (required)** — when `error` is non-null, `<StateView variant="error">` renders the canonical load-error visual (destructive `<Alert>`, title, icon, message) and — when `onRetry` is provided — a "Try again" button. The `isEmpty` condition must be gated with `&& !error` so a failed query does not render as "empty".
- **Mutation errors** — surface through the app-wide toast (Sonner). Render crashes are caught by the page's `<ErrorBoundary>` (Layer 2).

**Allowed variation:**
- **Empty-state icon** — optional decoration centered above the empty text.

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects consumer-provided props. No assumptions about the fetch library, server protocol, or backend.

**Required props the consumer must provide:**
- `rows: Row[]` — the current filtered view's rows.
- `isLoading: boolean` — true while the initial fetch is in flight.
- `error: unknown | null` — any fetch error; `null` when healthy.
- `onRetry?: () => void` — called by the error panel's "Try again" button.

**Contract for the consumer's query hook:**
- Use a dedicated query hook; avoid manual `useState` + `useEffect` + imperative refetch.
- Apply a freshness window of at least 60 seconds for settings list queries (settings entities change less frequently than transactional entities). Override only when the page has real-time requirements; document why.
- When server-side filtering is used, include the active filter state in the cache key: `[resource, 'list', filters?]`.
- After any mutation, invalidate the list key. When the mutation affects related resources, invalidate every affected key.

---

## Layer 9 — Type shapes (contract)

**Required:**
- `<SettingsTableShell>` is generic in `Row`: `SettingsTableShell<Row>`.
- Consumers pass a discriminated row type. The primitive does not assume any domain fields beyond what the column configuration references.
- Row types should derive from or be generated by the project's authoritative source (e.g. auto-generated database types, OpenAPI response types). Hand-written types that duplicate a machine-generated schema drift silently.
- Joined or aggregate types (e.g. a row that joins a parent entity for display) are built by extending the base row type: `type MethodWithCarrier = ShippingMethod & { carrier: Carrier | null }`.

**Forbidden:**
- Hand-written row types that duplicate a machine-generated schema.

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are out of the primitive's scope. Callbacks surface the intent; the consumer owns all write operations.

**Required primitive surface:**
- `onRowEdit?: (row: Row) => void` — called when the identifier cell is clicked. Consumer opens the edit dialog.
- `onAddNew?: () => void` — called when the "Add new" button (toolbar) or the empty-state CTA is clicked.
- `rowActions?: SettingsRowAction<Row>[]` — optional per-row secondary actions. Each carries a label, `onSelect` callback, and optional `destructive` flag. Rendered via the shared `<RowActionsMenu>` (`archetypes/shared`). Do not include "Edit" here.
- Optional bulk surface: `onBulkSelectChange?(selectedIds: string[]) => void` + `bulkActions?: React.ReactNode` (rendered in the toolbar while rows are selected).
- Optional: `onBulkDelete?(rows: Row[]) => void` for convenience when bulk delete is the only bulk action.

**Consumer contracts:**
- All mutations use the project's async state library. No manual imperative refetch.
- **Delete confirmation** — every destructive action opens a confirmation dialog (shadcn `<AlertDialog>` or equivalent). Standard copy: Title "Delete {entity}?", Description "This action cannot be undone.", Confirm button variant `destructive`. Never use `window.confirm`.
- On success, invalidate the list cache key. Cross-resource: invalidate every affected key.

**Allowed variation:**
- Optimistic updates — defer unless a specific UX warrants them; document why.

**Forbidden:**
- Inline edit (always open a dialog — this distinguishes D2 from A).
- `window.confirm` for delete confirmation.
- Imperative refetch from a parent component via ref.

---

## Layer 11 — Mobile variant

**Required:**
- No dedicated `/mobile/...` route. The same route serves all viewports.
- **Table body** — stays a standard `<Table>` on all viewports. The primitive's content wrapper provides `overflow-x-auto` so the table scrolls horizontally on narrow viewports.
- **Edit dialog** — opens as a full-screen `<Sheet>` on mobile (same adaptive pattern as A's detail panel). D2's edit dialog composes the J (`crud-dialog`) archetype's `<CrudDialogSheet>` family — `<CrudDialogSheet>` + `<CrudDialogHeader>`/`<CrudDialogBody>`/`<CrudDialogFooter>` + `useCrudDialogMode` — which handles the desktop-width / mobile-full-viewport swap automatically.

**Extension points (not in baseline v1.0 — consumer may add):**
- Card-collapse layout — replacing `<Table>` with stacked row cards on narrow viewports.
- Swipe-to-action gestures on touch devices.

---

## Layer 12 — Permissions

Permissions are out of the primitive's scope. The consumer controls who reaches the page.

**Required:**
- Route-level auth guard (e.g. `<ProtectedRoute>`) with no role requirement unless RBAC is explicitly in scope.
- No feature flags or read-only mode baked into the primitive.
- Row-level action visibility is driven by entity state (e.g. "Deactivate" hidden when already inactive), not by user role, unless RBAC is explicitly in scope.

**Extension point:**
- Role-based UI gating — when a project needs it, add a `permissions?: PagePermissions` prop to the consumer's page wrapper. Do not add it to the baseline primitive.

---

## Forbidden patterns

The following patterns are never permitted in a settings-table page, regardless of the domain:

1. **Inline edit.** Editing a row's fields in-place within a table cell. Always open a dialog.
2. **Detail panel slot.** D2 has no right-rail detail panel (that is Archetype A's behavior). Clicking a row opens an edit dialog.
3. **Detail route navigation on click.** D2's click contract is dialog — never navigate to a detail route.
4. **Deeply nested rows.** Settings tables are flat. No tree or hierarchy in the table.
5. **Explicit "Edit" icon column.** Identifier-cell click is the only edit trigger.
6. **Hand-rolled card wrappers.** Always use `<SettingsTableShell>`.
7. **Action buttons in `<PageHeader>`.** All write actions live in the toolbar.
8. **Status dropdowns.** Use pill bars or toggle switches (see Layer 4 Allowed variations).
9. **`window.confirm` for delete.** Use a confirmation dialog (`<AlertDialog>`).
10. **Static (non-lazy) page imports.** Always lazy-import D2 pages.
11. **Missing `<ErrorBoundary>`.** Every settings-table page must have one at the page-component level.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior without constituting drift.

**Allowed project extensions:**
- **Project-specific cell renderers.** Pass custom column render functions (image thumbnail, compound badge, color swatch) via the column configuration prop. The primitive renders them in the cell; it does not inspect their output.
- **Project-specific row actions.** Extend `SettingsRowAction` with domain-specific labels (e.g. "Make default", "Archive", "Duplicate"). Any non-Edit action is valid in the per-row dropdown.
- **Edit dialog composition.** Use the J (`crud-dialog`) archetype's `<CrudDialogSheet>` + `<CrudDialogHeader>`/`<CrudDialogBody>`/`<CrudDialogFooter>` + `useCrudDialogMode` for the edit surface. Consumers that intentionally want a plain shadcn `<Dialog>` may use it instead.
- **Project-specific empty-state copy.** Pass `emptyMessage` prop to `<SettingsTableShell>`.
- **Server-side pagination.** The primitive accepts an optional `pagination` prop; wire it to the paginated query hook.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks, row types, and status color maps.
- Business rules governing which row actions appear for a given entity state.
- Cross-resource invalidation topology.
- Edit dialog form logic (fields, validation, submit handler).

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page adopting this
> archetype is scored against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)).
> A page that composes this archetype's shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · aligned figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

**REQUIRED**

- [ ] **Row click opens an edit dialog** (the D2 click contract) — **no** right-rail
      detail panel (that's archetype A). *Wrapper tell:* a detail panel bolted on.
- [ ] **Write actions live on the shell** — in `headerActions` (canonical, board
      form) or, on legacy pages, the `toolbar` slot — never floating above the shell.
- [ ] **One `<SettingsTableShell>`** owns the card + table + row-actions dropdown; no
      hand-rolled card. (Split-pane table+form variant allowed only with an inline-documented reason.)
- [ ] **[spine] S1–S6.**

**SHOULD** (yellow, not red)

- [ ] Bulk-select column only when bulk actions exist; otherwise omitted.
- [ ] Edit dialog is the J `crud-dialog` shell, not a bespoke modal.

---
