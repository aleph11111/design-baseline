---
key: D2
slug: settings-table
kind: page
version: 1.3
promoted_from: brickshop-manager
promoted_at: 2026-05-22
source_spec_version: 1.4
status: locked
---

# Archetype D2 — Settings table

## Purpose

A **settings table** page shows a list of configuration entities (categories, suppliers, payment methods, shipping rules, numbering series, …) as a table, where clicking a row opens an **edit dialog**. Use this archetype whenever a page's job is to let users manage a flat list of configuration records through CRUD operations. It is the canonical shape for every `/settings/<group>/<entity>` page in a business application.

D2 is a sibling of A (list-with-detail) — it inherits the same outer shell, toolbar, and data-fetching contracts. The key divergence is the **click contract**: D2 opens an edit dialog on row click rather than navigating to a detail route or opening a right-rail panel.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (concrete
> primitives + Tailwind-4 class strings) lives in
> [`settings-table.baseline.md`](./settings-table.baseline.md). A project on a
> different stack adopts this contract without needing that file.

---

## Layer 1 — Route config

**Required:**
- Path: `/settings/<group>/<entity-plural>` nested under the project's settings parent route (e.g. `/settings/master-data/customers`, `/settings/order-processing/shipping-methods`).
- The parent route handles the route-level auth guard and layout injection (the project's top-level app shell and the settings-section layout). Do not re-apply these wrappers at the child route.
- Code-split the page behind the framework's lazy-load boundary (lazy import + a suspense fallback that renders nothing).

**Forbidden:**
- Static (non-lazy) imports of D2 pages (bundle-size regression).
- Applying the auth guard or layout wrappers redundantly at the child route level.

---

## Layer 2 — Page shell

**Required:**
- The page renders inside the project's **top-level app shell** — the outer layout frame that mounts the global providers (tooltip, sidebar, toast surfaces), the nav/sidebar, and the main content region, via the parent route's layout. Those providers are always in the tree by the time a settings-table page renders; the page does not re-mount them.
- Outer container uses the **canonical vertical rhythm** to space the title block from the table card — **no page inset**; the settings layout's main region supplies all inset.
- A **render-error boundary** wrapping page content at the page-component level.
- A **breadcrumb trail** rendered at the top of the page shell, above the settings-table shell's on-surface header (see Layer 3) — there is no separate floating page header.

**Allowed variation:**
- A page-level state-provider is optional. Introduce one only when filter or selection state is consumed by more than one child component tree; do not add one for single-tree state.

**Forbidden:**
- Outer page-inset — double-insets inside the settings layout.
- Page-level card wrapping the table content (chrome lives in the content wrapper — Layer 5).
- Missing render-error boundary.

---

## Layer 3 — Page header

The page header no longer floats above the shell as a separate page-header primitive. The settings-table shell mounts the shared **on-surface header bar** at the top of its one bounded card — the title bar sits ON the surface, driven entirely by shell props.

**Required (via shell props):**
- **`title`** — always present when the on-surface header renders, in the project's **canonical page-title type style**.
- The bar follows the **header-fill contract**: brand-filled (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; a quieter muted-tint step; and a hairline-border-only mode.

**Allowed variation:**
- **`kicker`** — optional overline above the title (e.g. "Settings", "Catalog"), in the **canonical overline/kicker style**.
- **`headerActions`** — optional right-aligned small buttons (e.g. "Import", "Add {entity}"): a secondary-style button for secondary actions, the default/primary style for the primary action. At most one primary action.
- **`headerFill`** — a single shell instance may override the project's house header-fill mode.
- **Sync / refresh action** — some D2 pages back their data from an external system and expose a "Sync" action. When present, place it in the toolbar (Layer 4) as an async action button.

**Forbidden:**
- Inline `<h1>` or custom header markup — always the shell's `kicker`/`title`/`headerActions` props.

---

## Layer 4 — Toolbar

**Required:**
- Toolbar renders as the shell's `toolbar` slot, not above or below the shell.
- **Primary create action** — single button (small), the default/primary style, leading "add" icon. Label: "Add {entity}". Opens the add dialog. Canonical home: the shell's `headerActions` (the on-surface header bar, Layer 3 — it inverts on a brand-filled header). The legacy `onAddNew` toolbar button remains supported on existing pages, but new pages put the create action in the header — the toolbar owns data controls, not writes.
- **Result count** — in the **canonical muted small-text style**, right-aligned, format: `{n} results` or `{n} {entity-plural}`.

**Allowed variation:**
- **Search input** — the shared **search-input molecule**; never hand-rolled. Required when the dataset is not intrinsically small (threshold: more than ~10 rows). Omit for pages where search adds no value (e.g. a fixed list of ≤10 numbering series).
- **Filter pill bar** — for categorical filters (e.g. status), via the shared **one-of-N segmented control** — a pill row — not a dropdown select.
- **Binary filter switches** — for toggle-style filters (e.g. "Show archived").
- **Async action button** — for long-running operations like Sync / Enrich. Show an inline spinner during the run. The J archetype's async-button primitive or an equivalent wrapper is recommended.
- **Bulk actions** — when rows are selected, a bulk-action affordance (e.g. "Delete selected") appears in the toolbar. Renders only while `selectedIds.length > 0`.

**Forbidden:**
- Status filters rendered as dropdown selects (use the segmented control).
- Hand-rolled search inputs — always compose via the shared search-input molecule.
- Toolbars rendered outside the shell.
- Action buttons placed anywhere other than the toolbar or the shell's `headerActions`.

---

## Layer 5 — Content wrapper

**Required:**
- The **settings-table shell** — the single primitive that owns this archetype's chrome. The shell provides:
  - The **canonical card chrome** (hairline border, subtle shadow, rounded corners, clipped overflow)
  - A toolbar slot with a bottom-border separator
  - A body with horizontal scroll on overflow
  - Loading, empty, and error states rendered inline
  - Optional bulk-select checkbox column
  - Row-level hover highlight

**Allowed variation — split-pane editing:**
- When users edit rows in rapid succession and a dialog's open/close cycle creates friction, a two-column layout with left = table card and right = edit form card is permitted. Both cards use the same **canonical card chrome** as the settings-table shell. Document the reason inline. This is an uncommon variation; use only when the UX case is clear.

**Forbidden:**
- Hand-rolled card wrappers. Always use the settings-table shell (or the split-pane variation above).
- Nested card chrome — one card boundary per visible surface.
- Page-level `max-width`. Full-width.

---

## Layer 6 — Table / grid

**Required:**
- The project's **base table primitive**.
- **Number formatting** — monetary values routed through a consumer-provided formatter. No raw currency symbols or `.toFixed(2)` in cells.
- **Date formatting** — every date cell renders through a consumer-provided formatter (e.g. `formatDate(value)`). No raw ISO strings in the UI.
- **Identifier columns** — in the **monospace identifier style** for alphanumeric codes or slugs; omit the monospace style for human-readable name identifiers.
- **Primary identifier cell** — rendered in the **brand/primary color with a hover underline**, with a pointer cursor. Clicking it calls `onRowEdit(row)` — the consumer opens the edit dialog. This is D2's core click contract: **row click → edit dialog, never a detail route or a detail panel**.

**Allowed variation:**
- **Sortable headers** — optional. Sort state is consumer-owned; pass pre-sorted `rows`.
- **Status indicators:**
  - Categorical status — use a shared **status-badge** variant.
  - Binary toggle (active / archived) — a **brand-primary dot** (on) / **muted dot** (off) + label text. Token-pure — never a literal palette color at the call site.
- **Per-row dropdown menu** — optional for secondary actions (Delete, Duplicate, Deactivate), via the shared **row-actions overflow menu** — the single owner of the row-level `⋯` overflow trigger, shared byte-for-byte with list-with-detail. Do **not** include "Edit" in the menu — identifier-cell click is the only edit trigger.
- **Row checkbox column** — when `bulkSelectable` is true, a leading checkbox column appears. Selecting all rows checks a header checkbox.
- **Identifier without the monospace style** — when the identifier is a human-readable name (e.g. a category name, a tag label), the monospace style may be omitted. The **brand/primary color + hover underline** still applies.

**Forbidden:**
- Explicit "Edit" icon column — identifier-cell click is the only edit trigger.
- Navigating to a detail route on identifier-cell click (that is Archetype A's behavior).
- Opening a right-rail detail panel on click (also Archetype A's behavior).
- Inline editing of cells (clicking a cell to edit in place).
- Inline status color maps duplicated per page — categorical statuses go through a shared variant.
- Raw number formatting in cells.
- Raw ISO date strings in cells.
- Clickable identifier cells not rendered in the brand/primary color.

---

## Layer 7 — Empty / loading / error states

**Required:**
- **Loading** — provided by the shell via the shared **state-view primitive** (loading variant) — the single owner of the loading/empty/error visual planes across settings-table, list-with-detail, and grouped-list. Text loader is the default; a **skeleton** (the `skeleton-loader` archetype) may be passed through the loading plane's skeleton override when this table's column shape is known ahead of the fetch. Never a full-page spinner.
- **Empty state** — state-view (empty variant), inline, query-dependent copy:
  - Filter / search active: `"No {things} match {query}."`
  - No items at all: `"No {things} yet."` + a primary CTA button ("Add {entity}") calling `onAddNew`. The CTA is the entry point to the first record.
- **Error state (required)** — when `error` is non-null, state-view (error variant) renders the canonical load-error visual (a **destructive alert** with title, icon, message) and — when `onRetry` is provided — a "Try again" button. The `isEmpty` condition must be gated with `&& !error` so a failed query does not render as "empty".
- **Mutation errors** — surface through the app-wide toast. Render crashes are caught by the page's render-error boundary (Layer 2).

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
- The settings-table shell is generic in its row type: `Shell<Row extends object>`.
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
- `rowActions?: SettingsRowAction<Row>[]` — optional per-row secondary actions. Each carries a label, `onSelect` callback, and optional `destructive` flag. Rendered via the shared **row-actions overflow menu**. Do not include "Edit" here.
- Optional bulk surface: `onBulkSelectChange?(selectedIds: string[]) => void` + `bulkActions?: React.ReactNode` (rendered in the toolbar while rows are selected).
- Optional: `onBulkDelete?(rows: Row[]) => void` for convenience when bulk delete is the only bulk action.

**Consumer contracts:**
- All mutations use the project's async state library. No manual imperative refetch.
- **Delete confirmation** — every destructive action opens the shared **confirm-dialog** primitive. Standard copy: Title "Delete {entity}?", Description "This action cannot be undone.", Confirm button styled as destructive. Never use `window.confirm`.
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
- **Table body** — stays the base table primitive on all viewports. The content wrapper provides horizontal scroll on overflow so the table scrolls on narrow viewports.
- **Edit dialog** — opens as a full-screen **overlay surface** on mobile (same adaptive pattern as Archetype A's detail panel). D2's edit dialog composes the J (`crud-dialog`) archetype's dialog-shell family — the header/body/footer sub-primitives plus a mode hook — which handles the desktop-width / mobile-full-viewport swap automatically.

**Extension points (not in baseline v1.0 — consumer may add):**
- Card-collapse layout — replacing the table with stacked row cards on narrow viewports.
- Swipe-to-action gestures on touch devices.

---

## Layer 12 — Permissions

Permissions are out of the primitive's scope. The consumer controls who reaches the page.

**Required:**
- The project's route-level auth guard with no role requirement unless RBAC is explicitly in scope.
- No feature flags or read-only mode baked into the primitive.
- Row-level action visibility is driven by entity state (e.g. "Deactivate" hidden when already inactive), not by user role, unless RBAC is explicitly in scope.

**Extension point:**
- Role-based UI gating — when a project needs it, add a `permissions?: PagePermissions` prop to the consumer's page wrapper. Do not add it to the primitive.

---

## Forbidden patterns

The following patterns are never permitted in a settings-table page, regardless of the domain:

1. **Inline edit.** Editing a row's fields in-place within a table cell. Always open a dialog.
2. **Detail panel slot.** D2 has no right-rail detail panel (that is Archetype A's behavior). Clicking a row opens an edit dialog.
3. **Detail route navigation on click.** D2's click contract is dialog — never navigate to a detail route.
4. **Deeply nested rows.** Settings tables are flat. No tree or hierarchy in the table.
5. **Explicit "Edit" icon column.** Identifier-cell click is the only edit trigger.
6. **Hand-rolled card wrappers.** Always use the settings-table shell.
7. **Action buttons in a floating page header.** All write actions live in the toolbar.
8. **Status dropdowns.** Use pill bars or toggle switches (see Layer 4 Allowed variations).
9. **`window.confirm` for delete.** Use the confirm-dialog primitive.
10. **Static (non-lazy) page imports.** Always lazy-import D2 pages.
11. **Missing render-error boundary.** Every settings-table page must have one at the page-component level.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior without constituting drift.

**Allowed project extensions:**
- **Project-specific cell renderers.** Pass custom column render functions (image thumbnail, compound badge, color swatch) via the column configuration prop. The primitive renders them in the cell; it does not inspect their output.
- **Project-specific row actions.** Extend `SettingsRowAction` with domain-specific labels (e.g. "Make default", "Archive", "Duplicate"). Any non-Edit action is valid in the per-row dropdown.
- **Edit dialog composition.** Use the J (`crud-dialog`) archetype's dialog-shell family (header/body/footer sub-primitives plus a mode hook) for the edit surface. Consumers that intentionally want a plain **overlay-surface** primitive (modal) may use it instead.
- **Project-specific empty-state copy.** Pass `emptyMessage` prop to the settings-table shell.
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
- [ ] **One settings-table shell** owns the card + table + row-actions dropdown; no
      hand-rolled card. (Split-pane table+form variant allowed only with an inline-documented reason.)
- [ ] **[spine] S1–S6.**

**SHOULD** (yellow, not red)

- [ ] Bulk-select column only when bulk actions exist; otherwise omitted.
- [ ] Edit dialog is the J `crud-dialog` shell, not a bespoke modal.

---
