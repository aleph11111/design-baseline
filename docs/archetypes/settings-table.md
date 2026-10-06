---
key: D2
slug: settings-table
kind: page
version: 3.2
promoted_from: brickshop-manager
promoted_at: 2026-05-22
source_spec_version: 1.4
status: locked
---

# Archetype D2 — Settings table

> **v3.2 (2026-10-05) — frameless body export (`SettingsTableBody`) with a
> flush control band.** Additive. `SettingsTableShell` is split into a
> frameless table body (`SettingsTableBody`) and the page-frame wrapper
> `SettingsTableShell`, mirroring the `ListWithDetailBody` / `ListWithDetailShell`
> pair. The body owns the table, its selection planes, loading / empty / error
> planes, the bulk-select checkbox column, the row-actions menu, and the
> identifier-cell click-to-edit gate — no page header, no second raised
> surface — and, when it has scoping, write, or count controls (`toolbar`,
> `onAddNew` (create), `bulkActions` / `onBulkDelete`, or a `rowLabel` count
> noun), a **flush control band**: a single `border-b` band above the table
> (toolbar left; the count caption and the create + bulk-write actions right).
> A `SettingsPageShell` tab has no page header to hold those controls, so the
> band is the tab-level home for them. As the direct content of a tab the body
> defaults `flush` to `true` — keyed to the body's placement, not a look: it
> makes the body's band and its table edges sit at the container's edge,
> negating the tab panel's horizontal inset, so the band's ruled line runs the
> full surface width exactly as on a standalone page while the tab panel keeps
> its pad for every other body. `SettingsTableShell` wraps the body in
> `PageFrame` and routes the same props to the frame's `toolbar` / `count`
> slots and header `actions` instead, and fixes both frame-side switches
> (`band={false}` — only the frame owns the page's single band; `flush={false}`
> — the frame's surface never pads its body, so there is no inset to bleed
> from and the table edges stay unpadded), so a standalone page keeps exactly
> one band at the frame's edges. Use `SettingsTableBody` for tab content inside
> a `SettingsPageShell` (F2 archetype): the tab trigger label owns the heading,
> and the body renders no second nested heading that would repeat it. The
> `count` caption and the bulk actions are one shared derivation
> (`computeBulkSelection` / `resolveBulkActions`), so the body's band and the
> shell's frame slots can never disagree. `band` and `flush` are excluded from
> the shell props (the shell fixes both from the frame's side).
>
> **v3.1 (2026-10-05) — split-pane variant on the one page frame.**
> Re-shapes the split-pane variation for ADR-0008 §3: the edit form is the
> page frame's right pane, hairline-divided from the table — never a second
> raised surface (the pre-ADR-0008 two-card layout is retired). The row
> click contract drives the pane's selection; below `md` the pane is out
> of the frame and the click-contract edit dialog is the mobile editing
> surface (Layer 11). The shell carries the variant as a structural slot;
> no breaking change.
>
> **v3.0 (2026-10-03) — one page frame (ADR-0008).** Breaking. `title` is
> required and renders once, as the page title; `kicker` / `headerActions` and
> the on-surface header are gone. Slots: `actions` (the create action — the
> shell renders `onAddNew` first — plus the page's other whole-page and write
> verbs, and bulk actions while rows are selected), `toolbar` (search,
> filters), the result count (or "{n} selected"). No toolbar Add button. The
> `SettingsRowAction` alias is removed — use `RowAction`; `hideBelowMd` is
> removed — use `hideBelow: "md"`.
>
> **v2.7 (2026-09-30) — row-actions trigger name.** `labels.rowActions`
> overrides the accessible name of each row's `⋯` trigger (Layer 10). Additive;
> no breaking change.
>
> **v2.6 (2026-09-30) — overridable built-in copy.** The new `labels` prop
> overrides every string the shell renders on its own — loading, error title,
> retry, the empty-state and add-new CTA labels, and the bulk-select
> checkboxes, captions, and delete button (Layers 4, 7, and 10). English
> defaults stay; a non-English consumer overrides per call site. Additive; no
> breaking change.
>
> **v2.5 — second responsive tier.** The change the contract first labelled
> "v2.2" below. The contract's own numbering ran behind the deliverable version
> from the mistra promotion on (the entries at the bottom keep their original
> labels).
>
> **v2.4 — mistra promotion.** The change the contract first labelled "v2.1"
> below (role-keyed `hideBelowMd`, `rowLabel`-rendered result count, row-derived
> row-action `label` / `disabled`).
>
> **v2.3 — internal only.** The shared column descriptor and identifier-cell
> recipe extracted under `archetypes/shared` (shared with list-with-detail);
> no prop or behavior change, so it needs no Layer edit.
>
> **v2.2 (2026-09-28) — second responsive tier.** `hideBelow` generalizes
> `hideBelowMd` to two tiers, keyed by column role (Layer 6). Record provenance
> takes `2xl` so the identifier doesn't wrap on a 1440px desktop; other context
> keeps `md`. `hideBelowMd` stays as the alias for `md`. Additive; no breaking
> change.
>
> **v2.1 (2026-09-24) — promoted from mistra's fork.** New keyed column rule:
> `hideBelowMd` (the narrow-viewport column subset) is keyed to the column's
> role — see Layer 6. The Layer 4 result count is now shell-rendered from
> `rowLabel` (the entity-plural noun, or a count → noun function). Row-actions
> entries may derive `label` / `disabled` from the row. Additive; no breaking
> change.
>
> **v2.0 (2026-08-18) — the shell API closes (archetype-convergence Phase 1).**
> Per-shell appearance choice is no longer a per-page decision. The shell carries
> no `className` prop (it never shipped one — confirmed by reading the type), and
> the per-shell `headerFill` override described in the v1.x header section is
> gone — the header's treatment is a closed project context set once at the
> top-level app shell (`<AppShell headerFill=…>` is the only entry point; the
> surface header bar reads that context). Kept and now keyed: the `align` axis on
> each column (`"left" | "right" | "center"`) is keyed to the column's value kind
> (a decision table — see Layer 6), and the identifier column's monospace
> treatment is keyed to the identifier's character style, now stated as a rule in
> Layer 6 rather than offered as an optional variation. `toolbar` / `bulkActions`
> / `headerActions` remain `ReactNode` composition slots — they compose the
> contract's documented toolbar and header primitives, so they vary only content,
> never the shell's look (spec D5; RULES.md hard rule 12). Deliberate spec-rule
> change; see Layer 6 (table / grid) for the two keying rules.

## Purpose

A **settings table** page shows a list of configuration entities (categories, suppliers, payment methods, shipping rules, numbering series, …) as a table, where clicking a row opens an **edit dialog**. Use this archetype whenever a page's job is to let users manage a flat list of configuration records through CRUD operations. It is the canonical shape for every `/settings/<group>/<entity>` page in a business application.

D2 is a sibling of A (list-with-detail) — it inherits the same outer shell, toolbar, and data-fetching contracts. The key divergence is the **click contract**: D2 opens an edit dialog on row click rather than navigating to a detail route or opening a right-rail panel.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/settings-table`; the prop surface is the API and the sandbox demo (`src/examples/settings-table-demo.tsx`) is the gallery reference.

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
- **No page inset** — the settings layout's main region supplies all inset.
- A **render-error boundary** wrapping page content at the page-component level.
- A **breadcrumb trail**, where the page has one, rides the `subtitle` slot under the page title (Layer 3) — never a row of its own above the shell.

**Allowed variation:**
- A page-level state-provider is optional. Introduce one only when filter or selection state is consumed by more than one child component tree; do not add one for single-tree state.

**Forbidden:**
- Outer page-inset — double-insets inside the settings layout.
- Page-level card wrapping the table content (chrome lives in the content wrapper — Layer 5).
- Missing render-error boundary.

---

## Layer 3 — Page header

**Required:**
- **`title`** — the page title, passed once to the shell. There is no second title on the table surface and no other header markup.

**Allowed variation:**
- **`subtitle`** / **`badges`** — compact metadata and read-only status next to the title.
- **`actions`** — verbs on the whole page: the one primary action plus at most two secondary ones (e.g. "Import", "Sync" as an async action button). The create action comes from `onAddNew` (label `addNewLabel`, default "Add new"), which the shell renders first; don't also pass an Add button.

**Forbidden:**
- A hand-rolled page title or header — always the shell's props.

---

## Layer 4 — Toolbar and count

**Required:**
- **Result count** — `rowLabel` (the entity-plural noun, or a function of the count for singular/plural nouns) makes the shell render `{n} {entity-plural}`, `n` being the length of the (filtered) `rows`. While bulk selection is active, "{n} selected" replaces it.

**Allowed variation** (all in the `toolbar` slot — it holds controls that **scope** the rows, never writes):
- **Search input** — the shared **search-input molecule**; never hand-rolled. Required when the dataset is not intrinsically small (threshold: more than ~10 rows). Omit for pages where search adds no value (e.g. a fixed list of ≤10 numbering series).
- **Filter pill bar** — for categorical filters (e.g. status), via the shared **one-of-N segmented control** — a pill row — not a dropdown select.
- **Binary filter switches** — for toggle-style filters (e.g. "Show archived").
- **Bulk actions** — `bulkActions` / `onBulkDelete` are write actions on the selection: they join the page `actions` only while a visible row is selected.

**Forbidden:**
- Status filters rendered as dropdown selects (use the segmented control).
- Hand-rolled search inputs — always compose via the shared search-input molecule.
- Create or write actions in the `toolbar`.

---

## Layer 5 — Content wrapper

**Required:**
- The **settings-table shell** — the single primitive that owns this archetype's page frame. The shell provides:
  - The page's one surface, with the toolbar band above the table
  - A body with horizontal scroll on overflow
  - Loading, empty, and error states rendered inline
  - Optional bulk-select checkbox column
  - Row-level hover highlight

**Frameless body (`SettingsTableBody`) — tab content:**
- A frameless export of the table body without the page frame: the table, its
  bulk-select checkbox column, the row-actions menu, the identifier-cell
  click-to-edit gate, and the loading / empty / error planes — no page header,
  no second raised surface. Use this form for tab content inside a
  `SettingsPageShell` (F2 archetype) or any other page frame that already
  owns the heading: the tab trigger label is the only heading, and there is
  no second nested heading repeating it.
- Because a `SettingsPageShell` tab has no page header to hold the controls a
  standalone page routes to its `PageFrame` slots, the body owns a **flush
  control band** — a single `border-b` band above the table (chrome the same
  as the page frame's ruled band). It appears only while the body has
  scoping, write, or count controls, and holds:
  - `toolbar` (search, filters) on the **left**;
  - on the **right**, the `count` caption, the bulk-write actions
    (`bulkActions` / `onBulkDelete`), and the create action (`onAddNew`) — the
    tab-level home for them. The count caption reads "{n} selected" while a
    visible row is selected and a bulk action exists, otherwise "{n} {rowLabel}".
  - The `count` caption and the bulk actions derive from the same shared helper
    (`computeBulkSelection` / `resolveBulkActions`) the page form routes to the
    frame's `count` / `actions` slots, so the two cannot disagree.
- **Edge-to-edge (frameless placement only).** The `SettingsPageShell` tab
  panel pads its bodies (`p-5`); a body is edge-to-edge only for a
  tab-placement case — so the body renders its chrome at the container's edge
  and the panel keeps its pad for every other body. The `flush` prop is the
  placement decision: `true` (default — the body IS the direct content of a
  tab) negates the tab panel's horizontal inset, so the band's ruled line and
  the table's edges sit at the surface edge exactly where a standalone D2
  page's do; `false` where the body sits inside a frame that owns the page's
  edges without horizontal padding (a `PageFrame` surface never pads its
  body — there is no inset to bleed from and the bleed would be a pure no-op
  with different semantics inside a different outer inset). Two engineers
  holding the same placement derive the same value; it is the one existing
  horizontal inset the body can sit in, not a look axis.
- `SettingsTableShell` passes `band={false}` and `flush={false}` and routes
  `toolbar` / the `count` noun to the frame's `toolbar` / `count` slots and
  the write actions to the frame's `actions`, so a standalone page keeps
  exactly one band at the frame's edges. It still forwards `onAddNew` so the
  body's empty state offers the same CTA the header action does. Mirrors the
  `ListWithDetailBody` / `ListWithDetailShell` split.
  - The split-pane variation below also applies to the frameless body.

**Allowed variation — split-pane editing:**
- When users edit rows in rapid succession and a dialog's open/close cycle creates friction, the table and the edit form share the shell's one page frame: the edit form is the frame's right pane, divided from the table by the frame's hairline — never a second raised surface (ADR-0008 §3). The row click contract (Layer 6) drives the selection the pane edits. On viewports below the `md` breakpoint the pane is out of the frame and the click-contract edit dialog (Layer 11) is the editing surface. This is an uncommon variation; use only when the UX case is clear.

**Forbidden:**
- Hand-rolled card wrappers. Always use the settings-table shell — the split-pane variation above is the shell's `editPane` slot, never a second surface beside it.
- Nested card chrome — one card boundary per visible surface.
- Page-level `max-width`. Full-width.

---

## Layer 6 — Table / grid

**Required:**
- The project's **base table primitive**.
- **Number formatting** — monetary values routed through a consumer-provided formatter. No raw currency symbols or `.toFixed(2)` in cells.
- **Date formatting** — every date cell renders through a consumer-provided formatter (e.g. `formatDate(value)`). No raw ISO strings in the UI.
- **Identifier columns** — in the **monospace identifier style** when the identifier is an alphanumeric code or slug; the monospace style is **omitted** when the identifier is a human-readable name. The keying is mechanical — two engineers holding the same column config derive the same treatment from the identifier's character style.
- **Column alignment** — `align="left | right | center"` on a column. **Choose by the column's value kind** (what the column's `cell` renders):

  | Column value kind | Alignment |
  |---|---|
  | **Numerical / monetary / date / count figure** | **`align="right"`** — tabular figures align on units. |
  | **Status / category / toggle / identifier / categorical badge** (short token) | **`align="center"`**. |
  | **Everything else** (names, descriptions, free text) | **`align="left"`** (default). |

  Two engineers holding the same `columns` config derive the same alignment. It is a per-column *data* prop (it describes the value the column holds), not a choice of the shell's own appearance.
- **Responsive column subset** — `hideBelow` on a column hides it below a breakpoint, `md` or `2xl` (table presentation only). **Choose by the column's role** (what the row's reader needs to pick a row at that width):

  | Column role | `hideBelow` |
  |---|---|
  | **Identifier** | never — the shell ignores the tier on the identifier column; it carries the click contract. |
  | **Row-state token** (status / priority / stage — what the reader triages by) | never. |
  | **The one figure the list is ranked or scanned by** (due date, amount, score — at most one per table) | never. |
  | **Record provenance** — when and how the record came to be (created / updated / recorded timestamps, the pipeline or model that produced it) | **`2xl`**: it drops out below 1536px so the identifier keeps its width on a 1440px desktop. |
  | **Other context** — relational (company, project, owner), descriptive (comment, topics, email), or measures (size, duration) | **`md`**. |

  Two engineers holding the same `columns` config derive the same subset. Like `align`, it is a per-column *data* prop (it describes the column's role), not a choice of the shell's own appearance.
- **Primary identifier cell** — rendered in the **brand/primary color with a hover underline**, with a pointer cursor. Clicking it calls `onRowEdit(row)` — the consumer opens the edit dialog. This is D2's core click contract: **row click → edit dialog, never a detail route or a detail panel**.

**Allowed variation:**
- **Sortable headers** — optional. Sort state is consumer-owned; pass pre-sorted `rows`.
- **Status indicators:**
  - Categorical status — use a shared **status-badge** variant.
  - Binary toggle (active / archived) — a **brand-primary dot** (on) / **muted dot** (off) + label text. Token-pure — never a literal palette color at the call site.
- **Per-row dropdown menu** — optional for secondary actions (Delete, Duplicate, Deactivate), via the shared **row-actions overflow menu** — the single owner of the row-level `⋯` overflow trigger, shared byte-for-byte with list-with-detail. Do **not** include "Edit" in the menu — identifier-cell click is the only edit trigger.
- **Row checkbox column** — when `bulkSelectable` is true, a leading checkbox column appears. Selecting all rows checks a header checkbox.

**Forbidden:**
- Explicit "Edit" icon column — identifier-cell click is the only edit trigger.
- Navigating to a detail route on identifier-cell click (that is Archetype A's behavior).
- Opening a detail overlay on click (Archetype A's behavior).
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
  - No items at all: `"No {things} yet."` + a primary CTA button ("Add {entity}") calling `onAddNew`. The CTA is the entry point to the first record. A consumer whose rows are empty because of a filter passes `isFiltered` so the CTA is withheld.
- **Error state (required)** — when `error` is non-null, state-view (error variant) renders the canonical load-error visual (a **destructive alert** with title, icon, message) and — when `onRetry` is provided — a "Try again" button. The `isEmpty` condition must be gated with `&& !error` so a failed query does not render as "empty".
- **Mutation errors** — surface through the app-wide toast. Render crashes are caught by the page's render-error boundary (Layer 2).

**Allowed variation:**
- **Empty-state icon** — optional decoration centered above the empty text.
- **`labels`** — overrides for the shell's own copy: `loading`, `errorTitle`, `retry` (the planes above), plus the add-new and empty-state CTA (`addNewLabel`), the bulk-select checkboxes (`selectAll`, `selectRow`), the bulk-mode caption (`selectedCount`) and delete button (`deleteSelected`), and each row's `⋯` trigger name (`rowActions`) — English defaults stay; a non-English consumer overrides per call site.

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects consumer-provided props. No assumptions about the fetch library, server protocol, or backend.

**Required props the consumer must provide:**
- `rows: Row[]` — the current filtered view's rows.
- `columns: SettingsColumn<Row>[]` — the column descriptors (Layer 6); mark exactly one column `isIdentifier`.
- `getRowId: (row: Row) => string` — the stable, unique identity of a row; keys rendering and row selection.
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
- `onAddNew?: () => void` — called when the "Add new" page action or the empty-state CTA is clicked.
- `rowActions?: RowAction<Row>[] | ((row: Row) => RowAction<Row>[])` — optional per-row secondary actions. Each carries a label, `onSelect` callback, and optional `destructive` flag. Rendered via the shared **row-actions overflow menu**. Do not include "Edit" here.
- Optional bulk surface: `onBulkSelectChange?(selectedIds: string[]) => void` + `bulkActions?: React.ReactNode` (page actions while rows are selected).
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
- **Table body** — stays the base table primitive on all viewports. The content wrapper provides horizontal scroll on overflow so the table scrolls on narrow viewports. Context columns drop out below `md` per the Layer 6 narrow-viewport column subset rule.
- **Edit dialog** — opens as a full-screen **overlay surface** on mobile (the same overlay surface Archetype A's detail opens in). D2's edit dialog composes the J (`crud-dialog`) archetype's dialog-shell family — the header/body/footer sub-primitives plus a mode hook — which handles the desktop-width / mobile-full-viewport swap automatically.
- **Split-pane variant** — the edit-form pane is part of the frame from `md` up and out of it below; on mobile the edit dialog above is the editing surface. Both bind to the same consumer selection state, so the pane (desktop) and the dialog (mobile) always edit the same row.

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
2. **Detail panel slot.** D2 has no detail overlay (that is Archetype A's behavior). Clicking a row opens an edit dialog.
3. **Detail route navigation on click.** D2's click contract is dialog — never navigate to a detail route.
4. **Deeply nested rows.** Settings tables are flat. No tree or hierarchy in the table.
5. **Explicit "Edit" icon column.** Identifier-cell click is the only edit trigger.
6. **Hand-rolled card wrappers.** Always use the settings-table shell.
7. **Write actions in the toolbar.** Create and write actions are page `actions`; the toolbar only scopes.
8. **Status dropdowns.** Use pill bars or toggle switches (see Layer 4 Allowed variations).
9. **`window.confirm` for delete.** Use the confirm-dialog primitive.
10. **Static (non-lazy) page imports.** Always lazy-import D2 pages.
11. **Missing render-error boundary.** Every settings-table page must have one at the page-component level.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior without constituting drift.

**Allowed project extensions:**
- **Project-specific cell renderers.** Pass custom column render functions (image thumbnail, compound badge, color swatch) via the column configuration prop. The primitive renders them in the cell; it does not inspect their output.
- **Project-specific row actions.** Extend `RowAction` with domain-specific labels (e.g. "Make default", "Archive", "Duplicate"). Any non-Edit action is valid in the per-row dropdown.
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

- [ ] **Row click opens an edit dialog** (the D2 click contract) — **no** detail
      overlay (that's archetype A). *Wrapper tell:* a detail panel bolted on.
      (Split-pane variant: the click selects the row the frame's edit pane
      edits — Layer 5.)
- [ ] **Create + write actions are page `actions`** (create via `onAddNew`);
      filters and search are the `toolbar`; no second home for either.
- [ ] **One settings-table shell** owns the page frame + table + row-actions dropdown; no
      hand-rolled card. (Split-pane variant: the edit form is the frame's
      right pane, hairline-divided — the page's only raised surface, never a
      second card. ADR-0008 §3.)
- [ ] **[spine] S1–S6.**

**SHOULD** (yellow, not red)

- [ ] Bulk-select column only when bulk actions exist; otherwise omitted.
- [ ] Edit dialog is the J `crud-dialog` shell, not a bespoke modal.

---
