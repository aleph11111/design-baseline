---
key: A
slug: list-with-detail
kind: page
version: 1.3
promoted_from: brickshop-manager
promoted_at: 2026-05-22
source_spec_version: 1.2
status: locked
---

# Archetype A — List-with-detail

## Purpose

A **list-with-detail** page shows a table of domain entities (items, users, orders, posts, records…) with row-level actions and — where a dedicated detail view exists — navigation to that view on click. Use this archetype whenever a page's primary job is to expose a filterable, searchable collection of rows that a user browses and acts upon individually. It is the most common page shape in a business application; any screen that is "a table with a toolbar" belongs here.

## Reference primitive

`<ListWithDetailShell>` in `src/components/archetypes/list-with-detail/`. Composes `<ListWithDetailToolbar>` (filters, search, page-level actions) and `<ListWithDetailEmptyState>` (empty / loading / error views). The detail panel or detail route is consumer-owned (slot prop or navigation callback).

---

## Layer 1 — Route config

**Required:**
- Path: single-segment route (e.g. `/items`, `/users`, `/posts`). No nesting except dedicated detail sub-routes (e.g. `/items/:id`).
- Wrap in the project's auth guard (e.g. `<ProtectedRoute>`). No role-requirement prop unless RBAC is explicitly in scope for this page.
- Lazy-import the page component: `const Page = lazy(() => import('./pages/Page'))`.
- Wrap in `<Suspense fallback={null}>` at the route definition.

**Forbidden:**
- Static imports of list-with-detail pages (causes bundle-size regression; defeats code-splitting).

---

## Layer 2 — Page shell

**Required:**
- The page renders inside `<AppShell>` from `src/components/layout/` — the baseline's top-level layout primitive. As of baseline v1.0, `<AppShell>` mounts `TooltipProvider`, `SidebarProvider`, `<Toaster>`, and `<Sonner>`, so those providers are always in the tree by the time a list-with-detail page renders. Consumers do not re-mount them at the page level.
- Outer container: `<div className="space-y-6">` — **no page inset**; `AppShell`'s `<main>` supplies it (adding `px-6 py-6` here double-insets). The `space-y-6` is internal rhythm only.
- `<ErrorBoundary>` wrapping page content at the page component level.
- The on-surface title bar — `<ListWithDetailShell>`'s `kicker`/`title`/`headerActions` props, rendered via the shared `<SurfaceHeader>` (see Layer 3). There is no separate `<PageHeader>` mounted above the shell.

**Allowed variation:**
- A page-level React context provider is optional. Introduce one only when the page's filter or selection state is consumed by more than one child component tree; do not add one for single-tree state.

**Forbidden:**
- Inline `<h1>` or custom header markup (use the shell's `kicker`/`title`/`headerActions` props).
- Missing `<ErrorBoundary>`.

---

## Layer 3 — Page header

The page header no longer floats above the shell as a separate `<PageHeader>`. `<ListWithDetailShell>` mounts the shared `<SurfaceHeader>` (`src/components/layout/SurfaceHeader.tsx`) at the top of its one bounded card — the title bar sits ON the surface, driven entirely by shell props.

**Required (via shell props):**
- **`title`** — always present when the on-surface header renders. `<SurfaceHeader>` renders it `text-lg font-semibold` (the current Plex Ledger title scale — supersedes the old `text-2xl font-semibold tracking-tight` `<PageHeader>` treatment). Embed any ID/number figure in the title with `font-mono` at the call site.
- The bar follows the `--header-fill` contract (`HeaderFillContext`, `src/components/layout/headerFill.ts`): `solid` (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; `tint` is a quieter `bg-muted` step; `white` is hairline-border-only. Status `<Badge>`s passed into `headerActions` are never inverted, even on `solid`.

**Allowed variation:**
- **`kicker`** — optional overline above the title (the entity class, e.g. "Podcasts", "Records"), rendered via the shared `OVERLINE_CLASS`. Use in place of the old subtitle when the title alone doesn't convey scope.
- **`headerActions`** — optional right-aligned `<Button size="sm">`s: `variant="outline"` for secondary actions (e.g. "Import"), default variant for the primary creation action (e.g. "New show"). At most one primary action.
- **`headerFill`** — a single shell instance may override the project's house `headerFill` context.

**Forbidden:**
- Inline `<h1>` or custom header markup — always the shell's `kicker`/`title`/`headerActions` props.
- A hand-rolled header bar reproducing `<SurfaceHeader>`'s layout instead of using the shell's props.

---

## Layer 4 — Toolbar

**Required:**
- Toolbar renders as a prop of `<ListWithDetailShell>` (the `toolbar` slot), not above or below the shell.
- **Search input** — present on every page, via the shared `<SearchInput>` molecule (`ui/search-input` — `inputSize`/`clearable`/`count` props); never hand-rolled. Placeholder text describes what is searched (e.g. "Search by name or ID…").
- **Result count** — `text-sm text-muted-foreground`, right-aligned near the action buttons, format: `{n} results`.

**Allowed variation:**
- **Status filter** — optional. If present, use the shared `<SegmentedControl>` (`ui/segmented-control`) — a one-of-N pill row — **not** a Select dropdown.
- **Quick-filter chips** — a richer compound-filter pattern (e.g. "Needs attention", "Unassigned", "Overdue") is allowed when a page has compound filter dimensions that exceed a single status axis. Each chip may display a count badge.
- **Global action buttons** (Add, Create, Import, Export) — canonical placement is the shell's `headerActions` (the on-surface header bar, Layer 3; they invert on a solid header fill). `size="sm"`, leading icon; variant `default` for the single primary creation action, `outline` for secondary. A legacy toolbar placement is still tolerated on existing pages, but new pages put write actions in the header — the toolbar owns data controls (search / filters / count), not writes.
- **Refresh button** — allowed as an icon button when the page has long-running async work that warrants manual refresh.

**Forbidden:**
- Status filters rendered as Select dropdowns (migrate to `<SegmentedControl>`).
- Hand-rolled search inputs — always compose via the shared `<SearchInput>` molecule (which owns the left-aligned icon).
- Toolbar rendered outside `<ListWithDetailShell>`.
- Action buttons placed anywhere other than the toolbar or the shell's `headerActions` — never inline above or below the shell.

---

## Layer 5 — Content wrapper

**Required:**
- `<ListWithDetailShell>` from `src/components/archetypes/list-with-detail/`. The shell provides:
  - Card chrome: `rounded-lg border bg-card shadow-sm overflow-hidden`
  - Toolbar slot with `border-b px-4 py-3` separator
  - Body with `overflow-x-auto`
  - Loading, empty, and error slots (handled by `<ListWithDetailEmptyState>`)
  - Row-level `hover:bg-muted/50`

**Forbidden:**
- Hand-rolled card wrappers. One shell, one style.
- Page-level `max-width` on the list table. Full-width. List tables scale to available width so the column set adapts to the user's viewport; capping width at a fixed breakpoint loses horizontal space the table could use.

---

## Layer 6 — Table / grid

**Required:**
- shadcn/ui `<Table>` primitive (`src/components/ui/table`).
- **Number formatting** — monetary values routed through a consumer-provided formatter (e.g. `formatCurrency(value)`). No raw currency symbols or `.toFixed(2)` in table cells.
- **Date formatting** — every date cell renders through a consumer-provided formatter (e.g. `formatDate(value)` or `formatDateTime(value)` when the time component is meaningful). No raw ISO strings in the UI. The primitive does not format; the consumer passes a formatter or pre-formatted string.
- **Identifier columns** (record #, internal ID, reference code, etc.) — `font-mono text-sm font-medium`.
- **Primary identifier cell** is clickable. Class string: `font-mono text-sm font-medium text-primary hover:underline`. Rendered in `text-primary` at rest so it reads as interactive before hover. If a dedicated detail route exists, clicking navigates to it; if no detail route exists, clicking opens an edit modal or side panel.

**Allowed variation:**
- **Presentation variant** — `<ListWithDetailShell presentation="table | card-grid | action-row">` (default `table`). Same `rows`/`columns`/row-interaction; only the rendering differs. `card-grid` renders each row as a card (identifier as title, other columns as label/value pairs) in a responsive grid — for browse-y, summary-led lists. `action-row` renders full-width stacked rows (identifier + up to two secondary fields + chevron) — the mobile / pick-an-item shape. This is the archetype's variant axis (see `docs/CHOOSING-A-SURFACE.md`): a card grid is **not** drift from "the table archetype" — it's a conformant variant. Sortable headers are table-only; in the other presentations drive sort from the toolbar. **`detail-target`** (route vs dialog vs none) is a consumer choice expressed via `onRowSelect` (navigate, open a dialog, or omit), not a separate prop.
- **Multi-line cells** — a primary line plus a `text-xs text-muted-foreground` supporting line is allowed when information density genuinely helps (e.g. an ID row that also shows a short reference). Use sparingly.
- **Sortable headers** — optional. Sort is a consumer-owned feature. To opt in, declare `sortable?: boolean` and an optional `sortFn` per column in the `columns` config. The primitive renders a sort affordance (arrow icon + click handler) in the header cell when `sortable: true`. Sort state — which column and direction — is owned by the consumer via `sortBy?: string`, `sortDirection?: "asc" | "desc"`, and `onSortChange?: (sortBy: string, sortDirection: "asc" | "desc") => void`. The primitive does NOT sort the `rows` array; the consumer pre-sorts before passing.
- **Status indicators:**
  - **Categorical status** (draft / active / archived / paid / …) — use a shared `<Badge>` variant. Color map lives in a shared file, not duplicated per page.
  - **Binary toggle** (enabled/disabled, monitored/paused, …) — colored dot (`bg-primary` on / `bg-muted-foreground` off) plus label text. Token-pure — never a literal palette color (`bg-green-500`) at the call site; semantic raw-color mappings live only inside owning primitives (`badge.tsx`, calendar tones).
- **Identifier without `font-mono`** — when the identifier is a human-readable name rather than a numeric or alphanumeric code (e.g. a search name, a tag label), `font-mono` may be intentionally omitted. The `text-primary hover:underline` requirement still applies for all identifier cells, including human-readable name identifiers.

**Forbidden:**
- Inline status color maps duplicated per page. Categorical statuses go through a shared variant component.
- Raw number formatting (`$${v}`, `v.toFixed(2)`).
- Raw ISO date strings in table cells. Always route through a formatter.
- Clickable identifier cells without `text-primary` (dark-at-rest identifiers fail the "looks interactive" test).
- Omitting `text-primary hover:underline` from any identifier cell, including human-readable name identifiers.

---

## Layer 7 — Empty / loading / error states

**Required:**
- **Loading** — handled by `<ListWithDetailEmptyState mode="loading">`, a thin adapter over the shared `<StateView variant="loading">` (`ui/state-view`) — the single owner of the loading/empty/error visual planes across list-with-detail, settings-table, and grouped-list. No skeleton screens.
- **Empty state** — handled by `<ListWithDetailEmptyState mode="empty">` (`<StateView variant="empty">`). Text is query-dependent:
  - Search or filter active: `"No {things} match your search."`
  - No items at all: `"No {things} yet. {CTA hint if applicable}"`
- **Error state (required)** — handled by `<ListWithDetailEmptyState mode="error">` (`<StateView variant="error">`). When the list query fails, pass `error` to the empty-state component; `<StateView>` owns the canonical load-error visual (destructive `<Alert>`, title, icon, message). When `onRetry` is also provided, `<StateView>` renders a "Try again" button; when omitted, it renders without the button (error message only). The `isEmpty` condition **must** be gated with `&& !isError` so a failed query never renders as "empty".
- **Mutation errors** — surface through the app-wide toast. Render-crash errors are caught by the page's `<ErrorBoundary>` (Layer 2).

**Allowed variation:**
- **Empty-state icon** — optional decoration (e.g. a domain-relevant icon, `h-12 w-12`, centered above the empty text).
- **`filtered-empty` mode** — an optional fourth mode for `<ListWithDetailEmptyState>` when a consumer wants distinct copy for "search produced no results" vs "table is genuinely empty". Identical visual treatment; only the message differs.

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects consumer-provided props. No assumptions about fetch library, server protocol, or backend.

**Required props the consumer must provide:**
- `rows: Row[]` — the current page's or filtered view's rows.
- `isLoading: boolean` — true while the initial fetch is in flight.
- `error: unknown | null` — any fetch error; `null` when healthy.
- `onRetry?: () => void` — called by the error panel's "Try again" button.
- `unstyled?: boolean` — drop the shell's own card chrome (border, shadow, rounding) so the table renders flush inside a surface the caller already provides. Used by grouped-list, which wraps each group's table in a `<SectionCard flush>`. Defaults to `false` (standalone list pages keep the card).

**Contract for the consumer's query hook:**
- Use a dedicated query hook; avoid manual `useState` + `useEffect` + imperative refetch combinations.
- Apply a freshness window of at least 30 seconds for list queries (React Query: `staleTime`; SWR: `dedupingInterval`; RTK Query: `keepUnusedDataFor`). Override only when the page has real-time requirements, and document why.
- When server-side filtering is used, include the active filter state in the consumer's chosen cache key so different filter combos do not share a cache entry. Example key shape: `[resource, 'list', filters?]`.
- After any mutation affecting the collection, signal the data layer to re-fetch the list (React Query: `invalidateQueries`; SWR: `mutate(key)`; RTK Query: tag invalidation).

---

## Layer 9 — Type shapes (contract)

**Required:**
- `<ListWithDetailShell>` is generic in its row type: `ListWithDetailShell<Row extends object>`.
- Consumers pass a discriminated row type. The primitive does not assume any domain fields beyond what the column configuration references.
- Row types should derive from or be generated by the project's authoritative source (e.g. auto-generated database types, OpenAPI response types). Hand-written row types that duplicate a schema drift.
- Joined or aggregate types (e.g. a row that joins a parent entity for display) are built by extending the base row type: `type ItemWithCategory = Item & { category: Category }`.
- Aggregate or grouped types specific to one page live next to that page or component, not in the shared `src/types/` directory.

**Forbidden:**
- Hand-written row types that duplicate a machine-generated schema (they drift silently).

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are out of the primitive's scope. The consumer's row-click handler or row-action menu owns all write operations.

**Required primitive surface:**
- `onRowSelect(row: Row): void` — called when a row's primary identifier cell is clicked. Consumer decides whether to navigate, open a panel, or open a modal.
- `rowActions?: RowAction<Row>[]` — optional array of per-row action descriptors, rendered via the shared `<RowActionsMenu>` (`archetypes/shared`) — the single owner of the row-level `⋯` overflow trigger, shared byte-for-byte with settings-table. Each `RowAction` carries a `label`, optional `icon`, an `onSelect(row: Row): void` callback, and an optional `destructive?: boolean` flag.

**Consumer contracts:**
- All mutations use the project's async state library (React Query, SWR, RTK Query, or equivalent). No manual imperative refetch via refs on the list component.
- On success, invalidate the list cache key for the affected resource. If a detail view is open, also invalidate the detail key.
- Cross-resource invalidation — when a mutation's effect spans multiple resources, invalidate every affected resource's list key. Document the cross-resource dependency in a comment adjacent to the mutation hook.

**Allowed variation:**
- Optimistic updates — defer unless a specific UX warrants them and the consumer documents why.

**Forbidden:**
- Imperative refetch from a parent component via ref.

---

## Layer 11 — Mobile variant

**Required:**
- No dedicated `/mobile/...` route for list-with-detail pages. The same route serves all viewports.
- **Table body** — stays a standard `<Table>` on all viewport widths. The primitive's content wrapper provides `overflow-x-auto` so the table scrolls horizontally on narrow viewports rather than overflowing. Consumers do not add their own `overflow-x-auto` wrapper.
- **Detail panel slot** — the primitive uses an internal `useIsMobile` hook to swap the presentation of whatever element the consumer passes as the `detail` prop. On desktop, `detail` renders as a right rail alongside the list. On mobile, the same `detail` element renders inside a `<Sheet>` (full-screen overlay). Consumers pass one `detail` element; the primitive handles the swap automatically.
- **Header fill** — when `detailTitle` is provided, the Sheet's header bar follows the same `--header-fill` contract as the master surface header (`HeaderFillContext`, 3 modes — solid / tint / white — `src/components/layout/headerFill.ts`); pass `headerFill` on the shell to override it per instance.

**Extension points (not shipped in baseline v1.0 — consumer may add):**
- **Card-collapse for the table body** — replacing `<Table>` with a stacked card layout on narrow viewports. Would be consumer-owned; the primitive does not provide this.
- **Swipe-to-action gestures** — swipe-to-reveal row actions on touch devices.
- **Bottom-nav layout** — a dedicated mobile-first navigation shell for apps where bottom tabs are the primary nav pattern.

---

## Layer 12 — Permissions

Permissions are out of the primitive's scope. The consumer controls who can reach the page.

**Required:**
- Route-level auth guard (e.g. `<ProtectedRoute>`) with no role requirement for standard list pages. If a page is role-gated, apply the role requirement at the route, not inside the page component.
- No feature flags or read-only mode baked into the primitive.
- Row-level action visibility is driven by entity state (e.g. "Mark as complete" hidden when already complete), not by user role, unless RBAC is explicitly in scope for this page.

**Extension point:**
- Role-based UI gating — when a project needs it, add a `permissions?: PagePermissions` prop to the consumer's page wrapper. Do not add it to the baseline primitive.

---

## Forbidden patterns

The following patterns are never permitted in a list-with-detail page, regardless of the domain:

1. **Inline edit.** Editing a row's fields in-place within the table cell. Use the detail panel, a modal, or a dedicated edit route instead.
2. **Row drag-reorder.** Drag-to-reorder is not part of this archetype's contract. If a consumer genuinely needs ordering, opt in via an explicit `allowRowReorder` prop and a documented extension — it does not ship by default.
3. **Embedded settings tables.** A settings-table (archetype D2) inside a list-with-detail conflicts with the list semantics. Use a separate page or a modal.
4. **Hand-rolled card wrappers.** Always use `<ListWithDetailShell>`. Do not copy-paste the card classes.
5. **Action buttons in `<PageHeader>`.** All write actions live in the toolbar.
6. **Status dropdowns.** Use pill bars or quick-filter chips (see Allowed variations 1–2).
7. **Raw ISO date or number strings in cells.** Always route through consumer-provided formatters.
8. **Static (non-lazy) page imports.** Always lazy-import list-with-detail pages.
9. **Missing `<ErrorBoundary>`.** Every list-with-detail page must have one at the page-component level.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior as described below. Extensions that do not alter the layer rules do not constitute drift.

**Allowed project extensions:**
- **Project-specific cell renderers.** A consumer may provide custom column render functions (e.g. an image thumbnail cell, a compound status badge) without modifying the primitive. Pass them as part of the column configuration prop.
- **Project-specific row-action types.** Extend `RowAction` with additional `variant` values or payload fields that make sense for the domain (e.g. a "Run now" action that carries an async handler). The primitive's `rowActions` surface accepts any `RowAction<Row>[]`.
- **Server-side pagination.** The primitive accepts an optional `pagination` prop (`{ page, pageSize, totalCount, onPageChange }`). Consumers wire it to their paginated query hook.
- **Column sorting.** Declare `sortable: true` on the relevant columns in the column config. Pass `sortBy`, `sortDirection`, and `onSortChange` props; pre-sort the `rows` array before passing. The primitive renders the sort affordance in the header cell.
- **Project-specific empty-state copy.** Pass `emptyMessage` and `filteredEmptyMessage` props to `<ListWithDetailEmptyState>` to override the default generic text.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks (e.g. `useItems()`, `usePosts()`).
- Domain-specific row types derived from the project's DB or API schema.
- Project-local status color maps and badge variants.
- Business rules governing which row actions appear for a given entity state.
- Cross-resource invalidation topology (which keys to invalidate on which mutations).

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

- [ ] **Write actions live on the shell** — in `headerActions` (canonical, board
      form) or, on legacy pages, the `toolbar` slot — never inline above/below
      the shell or in a floating page header.
      *Wrapper tell:* a legacy button row sitting above `<ListWithDetailShell>`.
- [ ] **One shell owns the list chrome.** The table/card-grid/action-row renders
      via `<ListWithDetailShell presentation=…>` — a card grid is a conformant
      variant, **not** an excuse for a hand-rolled grid of `<Card>`s.
- [ ] **Identifier cell is the click target** (`text-primary hover:underline`),
      driving `onRowSelect`; row interaction isn't a stray per-row button column.
- [ ] **Detail surface uses the `detail` slot** (auto Sheet-swaps on mobile) — not a
      parallel hand-built right panel.
- [ ] **[spine] S1–S6.**

**SHOULD** (yellow, not red)

- [ ] Toolbar search is the shared `<SearchInput>` molecule, not a raw input.
- [ ] Sort lives on table headers (table variant) or the toolbar (other variants).

---
