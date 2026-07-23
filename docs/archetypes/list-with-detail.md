---
key: A
slug: list-with-detail
kind: page
version: 1.4
promoted_from: brickshop-manager
promoted_at: 2026-05-22
source_spec_version: 1.2
status: locked
---

# Archetype A — List-with-detail

## Purpose

A **list-with-detail** page shows a table of domain entities (items, users, orders, posts, records…) with row-level actions and — where a dedicated detail view exists — navigation to that view on click. Use this archetype whenever a page's primary job is to expose a filterable, searchable collection of rows that a user browses and acts upon individually. It is the most common page shape in a business application; any screen that is "a table with a toolbar" belongs here.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (concrete
> primitives + Tailwind-4 class strings) lives in
> [`list-with-detail.baseline.md`](./list-with-detail.baseline.md). A project on a
> different stack adopts this contract without needing that file.

---

## Layer 1 — Route config

**Required:**
- Path: single-segment route (e.g. `/items`, `/users`, `/posts`). No nesting except dedicated detail sub-routes (e.g. `/items/:id`).
- Wrap in the project's route-level auth guard. No role-requirement unless RBAC is explicitly in scope for this page.
- Code-split the page behind the framework's lazy-load boundary (lazy import + a suspense fallback that renders nothing).

**Forbidden:**
- Static (non-lazy) imports of list-with-detail pages (causes bundle-size regression; defeats code-splitting).

---

## Layer 2 — Page shell

**Required:**
- The page renders inside the project's **top-level app shell** — the outer layout frame that mounts the global providers (tooltip, sidebar, toast surfaces), the nav/sidebar, and the main content region. Those providers are always in the tree by the time a list-with-detail page renders; the page does not re-mount them.
- Outer container uses the **canonical vertical rhythm** for internal section spacing only — **no page inset**; the app shell's main region supplies the inset (re-insetting here double-insets).
- A **render-error boundary** wrapping page content at the page-component level.
- The on-surface title bar — the shell's `kicker`/`title`/`headerActions` props, rendered via the shared **on-surface header bar** (see Layer 3). There is no separate floating page header mounted above the shell.

**Allowed variation:**
- A page-level state-provider is optional. Introduce one only when the page's filter or selection state is consumed by more than one child component tree; do not add one for single-tree state.

**Forbidden:**
- Inline `<h1>` or hand-rolled header markup (use the shell's `kicker`/`title`/`headerActions` props).
- Missing render-error boundary.

---

## Layer 3 — Page header

The page header does not float above the shell as a separate page-header primitive. The list-with-detail shell mounts the shared **on-surface header bar** at the top of its one bounded card — the title bar sits ON the surface, driven entirely by shell props.

**Required (via shell props):**
- **`title`** — always present when the on-surface header renders, in the project's **canonical page-title type style**. Embed any ID/number figure in the title using the **monospace identifier style** at the call site.
- The bar follows the **header-fill contract** (three modes): brand-filled (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; a quieter muted-tint step; and a hairline-border-only mode. Status badges passed into `headerActions` are never inverted, even on the brand-filled mode.

**Allowed variation:**
- **`kicker`** — optional overline above the title (the entity class, e.g. "Podcasts", "Records"), in the **canonical overline/kicker style**. Use in place of the old subtitle when the title alone doesn't convey scope.
- **`headerActions`** — optional right-aligned small buttons: a secondary-style button for secondary actions (e.g. "Import"), the default/primary style for the primary creation action (e.g. "New show"). At most one primary action.
- **`headerFill`** — a single shell instance may override the project's house header-fill mode.

**Forbidden:**
- Inline `<h1>` or hand-rolled header markup — always the shell's `kicker`/`title`/`headerActions` props.
- A hand-rolled header bar reproducing the on-surface header's layout instead of using the shell's props.

---

## Layer 4 — Toolbar

**Required:**
- Toolbar renders as the shell's `toolbar` slot, not above or below the shell.
- **Search input** — present on every page, via the shared **search-input molecule** (which owns the left-aligned search icon and the clear/count affordances); never hand-rolled. Placeholder text describes what is searched (e.g. "Search by name or ID…").
- **Result count** — in the **canonical muted small-text style**, right-aligned near the action buttons, format: `{n} results`.

**Allowed variation:**
- **Status filter** — optional. Default to the shared **one-of-N segmented control** (a pill row). A **dropdown select is permitted** when *either* of these holds, because a pill row stops being the better control:
  - the status enum exposes **more than 3 selectable values** — beyond three mutually-exclusive chips the pill row crowds the toolbar and scans worse than a labelled dropdown; or
  - the toolbar already carries **2 or more other filter dimensions** (owner, category, source, step…) — a lone pill row beside several selects fragments the control band, so a select keeps the row visually coherent.

  When neither holds — a small status enum that is the toolbar's primary filter axis — use the segmented control. Rationale: the pill row's advantage is legibility for a *small, primary* set of states; a large enum or a multi-dimension toolbar inverts that, and both cases were proven by real consumers (rule-of-2).
- **Quick-filter chips** — a richer compound-filter pattern (e.g. "Needs attention", "Unassigned", "Overdue") is allowed when a page has compound filter dimensions that exceed a single status axis. Each chip may display a count badge.
- **Global action buttons** (Add, Create, Import, Export) — canonical placement is the shell's `headerActions` (the on-surface header bar, Layer 3; they invert on a brand-filled header). Small, leading icon; the default/primary style for the single primary creation action, the secondary style otherwise. A legacy toolbar placement is still tolerated on existing pages, but new pages put write actions in the header — the toolbar owns data controls (search / filters / count), not writes.
- **Refresh button** — allowed as an icon button when the page has long-running async work that warrants manual refresh.

**Forbidden:**
- Status filters rendered as dropdown selects *when the segmented control applies* — i.e. a small status enum (≤3 values) that is the toolbar's primary filter axis. (A select is allowed for a large enum or a multi-dimension toolbar — see Allowed variation above.)
- Hand-rolled search inputs — always compose via the shared search-input molecule (which owns the left-aligned icon).
- Toolbar rendered outside the shell.
- Action buttons placed anywhere other than the toolbar or the shell's `headerActions` — never inline above or below the shell.

---

## Layer 5 — Content wrapper

**Required:**
- The **list-with-detail shell** — the single primitive that owns this archetype's chrome. The shell provides:
  - The **canonical card chrome** (hairline border, subtle shadow, rounded corners, clipped overflow)
  - A toolbar slot with a bottom-border separator
  - A body with horizontal scroll on overflow
  - Loading, empty, and error slots (the shared state-view)
  - Row-level hover highlight

**Forbidden:**
- Hand-rolled card wrappers. One shell, one style.
- Page-level `max-width` on the list table. Full-width. List tables scale to available width so the column set adapts to the user's viewport; capping width at a fixed breakpoint loses horizontal space the table could use.

---

## Layer 6 — Table / grid

**Required:**
- The project's **base table primitive**.
- **Number formatting** — monetary values routed through a consumer-provided formatter (e.g. `formatCurrency(value)`). No raw currency symbols or `.toFixed(2)` in table cells.
- **Date formatting** — every date cell renders through a consumer-provided formatter (e.g. `formatDate(value)` or `formatDateTime(value)` when the time component is meaningful). No raw ISO strings in the UI. The primitive does not format; the consumer passes a formatter or pre-formatted string.
- **Identifier columns** (record #, internal ID, reference code, etc.) — in the **monospace identifier style**.
- **Primary identifier cell** is clickable, in the **monospace identifier style** rendered in the **brand/primary color with a hover underline** so it reads as interactive before hover. If a dedicated detail route exists, clicking navigates to it; if no detail route exists, clicking opens an edit modal or side panel.

**Allowed variation:**
- **Presentation variant** — `presentation="table | card-grid | action-row"` (default `table`). Same `rows`/`columns`/row-interaction; only the rendering differs. `card-grid` renders each row as a card (identifier as title, other columns as label/value pairs) in a responsive grid — for browse-y, summary-led lists. `action-row` renders full-width stacked rows (identifier + up to two secondary fields + chevron) — the mobile / pick-an-item shape. This is the archetype's variant axis (see `docs/CHOOSING-A-SURFACE.md`): a card grid is **not** drift from "the table archetype" — it's a conformant variant. Sortable headers are table-only; in the other presentations drive sort from the toolbar. **`detail-target`** (route vs dialog vs none) is a consumer choice expressed via `onRowSelect` (navigate, open a dialog, or omit), not a separate prop.
- **Multi-line cells** — a primary line plus a muted extra-small supporting line is allowed when information density genuinely helps (e.g. an ID row that also shows a short reference). Use sparingly.
- **Sortable headers** — optional. Sort is a consumer-owned feature. To opt in, declare `sortable?: boolean` and an optional `sortFn` per column in the `columns` config. The primitive renders a sort affordance (arrow icon + click handler) in the header cell when `sortable: true`. Sort state — which column and direction — is owned by the consumer via `sortBy?: string`, `sortDirection?: "asc" | "desc"`, and `onSortChange?: (sortBy: string, sortDirection: "asc" | "desc") => void`. The primitive does NOT sort the `rows` array; the consumer pre-sorts before passing.
- **Status indicators:**
  - **Categorical status** (draft / active / archived / paid / …) — use a shared **status-badge** variant. Color map lives in a shared file, not duplicated per page.
  - **Binary toggle** (enabled/disabled, monitored/paused, …) — a **brand-primary dot** (on) / **muted dot** (off) plus label text. Token-pure — never a literal palette color at the call site; semantic raw-color mappings live only inside the owning primitives (status-badge, calendar tones).
- **Identifier without the monospace style** — when the identifier is a human-readable name rather than a numeric or alphanumeric code (e.g. a search name, a tag label), the monospace style may be intentionally omitted. The **brand/primary color + hover underline** requirement still applies for all identifier cells, including human-readable name identifiers.

**Forbidden:**
- Inline status color maps duplicated per page. Categorical statuses go through a shared variant component.
- Raw number formatting (`$${v}`, `v.toFixed(2)`).
- Raw ISO date strings in table cells. Always route through a formatter.
- Clickable identifier cells not rendered in the brand/primary color (dark-at-rest identifiers fail the "looks interactive" test).
- Omitting the brand/primary color + hover underline from any identifier cell, including human-readable name identifiers.

---

## Layer 7 — Empty / loading / error states

**Required:**
- **Loading** — handled by the shell's loading slot, a thin adapter over the shared **state-view primitive** (loading variant) — the single owner of the loading/empty/error visual planes across list-with-detail, settings-table, and grouped-list. Text loader is the default; a **skeleton** (the `skeleton-loader` archetype) may be passed through the loading slot's skeleton override when this page's row shape is known ahead of the fetch. Never a full-page spinner.
- **Empty state** — handled by the shell's empty slot (state-view, empty variant). Text is query-dependent:
  - Search or filter active: `"No {things} match your search."`
  - No items at all: `"No {things} yet. {CTA hint if applicable}"`
- **Error state (required)** — handled by the shell's error slot (state-view, error variant). When the list query fails, pass `error` to the empty-state slot; the state-view owns the canonical load-error visual (a **destructive alert** with title, icon, message). When `onRetry` is also provided, the state-view renders a "Try again" button; when omitted, it renders without the button (error message only). The `isEmpty` condition **must** be gated with `&& !isError` so a failed query never renders as "empty".
- **Mutation errors** — surface through the app-wide toast. Render-crash errors are caught by the page's render-error boundary (Layer 2).

**Allowed variation:**
- **Empty-state icon** — optional decoration (e.g. a domain-relevant icon, centered above the empty text).
- **`filtered-empty` mode** — an optional fourth mode for the empty slot when a consumer wants distinct copy for "search produced no results" vs "table is genuinely empty". Identical visual treatment; only the message differs.

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects consumer-provided props. No assumptions about fetch library, server protocol, or backend.

**Required props the consumer must provide:**
- `rows: Row[]` — the current page's or filtered view's rows.
- `isLoading: boolean` — true while the initial fetch is in flight.
- `error: unknown | null` — any fetch error; `null` when healthy.
- `onRetry?: () => void` — called by the error panel's "Try again" button.
- `unstyled?: boolean` — drop the shell's own card chrome (border, shadow, rounding) so the table renders flush inside a surface the caller already provides. Used by grouped-list, which wraps each group's table in a flush section-card. Defaults to `false` (standalone list pages keep the card).

**Contract for the consumer's query hook:**
- Use a dedicated query hook; avoid manual `useState` + `useEffect` + imperative refetch combinations.
- Apply a freshness window of at least 30 seconds for list queries (React Query: `staleTime`; SWR: `dedupingInterval`; RTK Query: `keepUnusedDataFor`). Override only when the page has real-time requirements, and document why.
- When server-side filtering is used, include the active filter state in the consumer's chosen cache key so different filter combos do not share a cache entry. Example key shape: `[resource, 'list', filters?]`.
- After any mutation affecting the collection, signal the data layer to re-fetch the list (React Query: `invalidateQueries`; SWR: `mutate(key)`; RTK Query: tag invalidation).

---

## Layer 9 — Type shapes (contract)

**Required:**
- The list-with-detail shell is generic in its row type: `Shell<Row extends object>`.
- Consumers pass a discriminated row type. The primitive does not assume any domain fields beyond what the column configuration references.
- Row types should derive from or be generated by the project's authoritative source (e.g. auto-generated database types, OpenAPI response types). Hand-written row types that duplicate a schema drift.
- Joined or aggregate types (e.g. a row that joins a parent entity for display) are built by extending the base row type: `type ItemWithCategory = Item & { category: Category }`.
- Aggregate or grouped types specific to one page live next to that page or component, not in the project's shared types directory.

**Forbidden:**
- Hand-written row types that duplicate a machine-generated schema (they drift silently).

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are out of the primitive's scope. The consumer's row-click handler or row-action menu owns all write operations.

**Required primitive surface:**
- `onRowSelect(row: Row): void` — called when a row's primary identifier cell is clicked. Consumer decides whether to navigate, open a panel, or open a modal.
- `rowActions?: RowAction<Row>[]` — optional array of per-row action descriptors, rendered via the shared **row-actions overflow menu** — the single owner of the row-level `⋯` overflow trigger, shared byte-for-byte with settings-table. Each `RowAction` carries a `label`, optional `icon`, an `onSelect(row: Row): void` callback, and an optional `destructive?: boolean` flag.

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
- **Table body** — stays the base table primitive on all viewport widths. The primitive's content wrapper provides horizontal scroll so the table scrolls on narrow viewports rather than overflowing. Consumers do not add their own scroll wrapper.
- **Detail panel slot** — the primitive uses an internal **viewport-breakpoint hook** to swap the presentation of whatever element the consumer passes as the `detail` prop. On desktop, `detail` renders as a right rail alongside the list. On mobile, the same `detail` element renders inside a full-screen **overlay surface** (sheet). Consumers pass one `detail` element; the primitive handles the swap automatically.
- **Header fill** — when `detailTitle` is provided, the overlay's header bar follows the same **header-fill contract** as the master surface header (three modes — brand-filled / muted tint / hairline); pass `headerFill` on the shell to override it per instance.

**Extension points (not shipped in baseline; consumer may add):**
- **Card-collapse for the table body** — replacing the table with a stacked card layout on narrow viewports. Would be consumer-owned; the primitive does not provide this.
- **Swipe-to-action gestures** — swipe-to-reveal row actions on touch devices.
- **Bottom-nav layout** — a dedicated mobile-first navigation shell for apps where bottom tabs are the primary nav pattern.

---

## Layer 12 — Permissions

Permissions are out of the primitive's scope. The consumer controls who can reach the page.

**Required:**
- Route-level auth guard with no role requirement for standard list pages. If a page is role-gated, apply the role requirement at the route, not inside the page component.
- No feature flags or read-only mode baked into the primitive.
- Row-level action visibility is driven by entity state (e.g. "Mark as complete" hidden when already complete), not by user role, unless RBAC is explicitly in scope for this page.

**Extension point:**
- Role-based UI gating — when a project needs it, add a `permissions?: PagePermissions` prop to the consumer's page wrapper. Do not add it to the primitive.

---

## Forbidden patterns

The following patterns are never permitted in a list-with-detail page, regardless of the domain:

1. **Inline edit.** Editing a row's fields in-place within the table cell. Use the detail panel, a modal, or a dedicated edit route instead.
2. **Row drag-reorder.** Drag-to-reorder is not part of this archetype's contract. If a consumer genuinely needs ordering, opt in via an explicit `allowRowReorder` prop and a documented extension — it does not ship by default.
3. **Embedded settings tables.** A settings-table (archetype D2) inside a list-with-detail conflicts with the list semantics. Use a separate page or a modal.
4. **Hand-rolled card wrappers.** Always use the list-with-detail shell. Do not copy-paste the card chrome.
5. **Action buttons in a floating page header.** All write actions live on the shell (header actions or, on legacy pages, the toolbar).
6. **Status dropdowns as the default.** Prefer the segmented control (pill row) for a small status enum (≤3 values) that is the page's primary filter axis. A dropdown select is permitted only for a large status enum (>3 values) or a toolbar with 2+ other filter dimensions (see Layer 4, Allowed variation).
7. **Raw ISO date or number strings in cells.** Always route through consumer-provided formatters.
8. **Static (non-lazy) page imports.** Always lazy-import list-with-detail pages.
9. **Missing render-error boundary.** Every list-with-detail page must have one at the page-component level.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior as described below. Extensions that do not alter the layer rules do not constitute drift.

**Allowed project extensions:**
- **Project-specific cell renderers.** A consumer may provide custom column render functions (e.g. an image thumbnail cell, a compound status badge) without modifying the primitive. Pass them as part of the column configuration prop.
- **Project-specific row-action types.** Extend `RowAction` with additional `variant` values or payload fields that make sense for the domain (e.g. a "Run now" action that carries an async handler). The primitive's `rowActions` surface accepts any `RowAction<Row>[]`.
- **Server-side pagination.** The primitive accepts an optional `pagination` prop (`{ page, pageSize, totalCount, onPageChange }`). Consumers wire it to their paginated query hook.
- **Column sorting.** Declare `sortable: true` on the relevant columns in the column config. Pass `sortBy`, `sortDirection`, and `onSortChange` props; pre-sort the `rows` array before passing. The primitive renders the sort affordance in the header cell.
- **Project-specific empty-state copy.** Pass `emptyMessage` and `filteredEmptyMessage` props to the empty slot to override the default generic text.

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
      *Wrapper tell:* a legacy button row sitting above the shell.
- [ ] **One shell owns the list chrome.** The table/card-grid/action-row renders
      via the list-with-detail shell (`presentation=…`) — a card grid is a conformant
      variant, **not** an excuse for a hand-rolled grid of cards.
- [ ] **Identifier cell is the click target** (brand/primary color + hover underline),
      driving `onRowSelect`; row interaction isn't a stray per-row button column.
- [ ] **Detail surface uses the `detail` slot** (auto overlay-swaps on mobile) — not a
      parallel hand-built right panel.
- [ ] **[spine] S1–S6.**

**SHOULD** (yellow, not red)

- [ ] Toolbar search is the shared search-input molecule, not a raw input.
- [ ] Sort lives on table headers (table variant) or the toolbar (other variants).

---
