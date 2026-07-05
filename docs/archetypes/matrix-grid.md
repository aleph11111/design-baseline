---
key: M
slug: matrix-grid
kind: page
version: 1.2
promoted_from: hk-crm
promoted_at: 2026-05-22
source_spec_version: 1.0
status: locked
---

# Archetype M — Matrix-grid

## Purpose

A **matrix-grid** page renders a two-dimensional grid where each row maps to one domain entity (e.g. a customer, a student, a team), each column maps to another (e.g. a service, a subject, a project), and every cell is the *intersection* of the two — meaningful in its own right and individually interactive. Clicking a cell opens a side overlay editor scoped to that intersection: a row-action does not make sense here, because the unit of work is the cell, not the row.

Use this archetype when:

- The page's primary job is to expose a **rows × columns** relationship rather than a list of items.
- Cells carry semantic state (filled / empty, value, status variant) and a user clicks to **edit or create** the intersection record.
- Columns naturally cluster into **groups** that share a parent label (an optional banded header row above the per-column header).
- The viewport is too narrow to show every column at once — horizontal scroll with sticky row labels is the right trade-off versus column collapse.

If the page is a single-axis list of rows (no meaningful columns beyond display fields), use archetype A (list-with-detail). If the page is a single-axis settings catalogue with inline edit, use archetype D2 (settings-table).

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (concrete
> primitives + Tailwind-4 class strings) lives in
> [`matrix-grid.baseline.md`](./matrix-grid.baseline.md). A project on a different
> stack adopts this contract without needing that file.

---

## Layer 1 — Route config

**Required:**
- Path: domain-scoped route under a single segment (e.g. `/matrix/<view>`, `/grids/<view>`, `/gradebook/<class>`). One matrix view per route — do not multiplex two matrices on one page.
- Wrap in the project's **route-level auth guard**. No role-requirement prop unless RBAC is explicitly in scope for this page.
- Code-split the page behind the framework's **lazy-load boundary** (lazy import + a suspense fallback that renders nothing).
- **`as_of` (or equivalent point-in-time) query param is allowed and is the canonical way to express "what does this grid look like on date X".** Bookmarkable URLs are the right serialization for temporal views; in-memory state alone is not sufficient.

**Forbidden:**
- Static imports of matrix-grid pages.
- Two matrix views on one route (use sibling routes).

---

## Layer 2 — Page shell

**Required:**
- The page renders inside the project's **top-level app shell** — the outer layout frame that mounts global providers (tooltip, sidebar, toast surfaces), the nav/sidebar, and the main content region. Those providers are always in the tree by the time a matrix-grid page renders. Consumers do not re-mount them at the page level. **The matrix-grid shell itself does not re-mount the tooltip provider.**
- Outer container uses the **canonical vertical rhythm** for internal spacing only — **no page inset** (the app shell's main region supplies it). It holds the bounded matrix surface (which now carries its own header + toolbar, see Layers 4/5) plus any sibling side overlays/dialogs.
- A **render-error boundary** wrapping page content at the page component level.
- **The on-surface title bar** (when the page has one — see Layer 3) — the shell's `kicker`/`title`/`headerActions` props, rendered via the shared **on-surface header bar**. There is no separate floating page header mounted above the shell.

**Allowed variation:**
- A page-level state-provider is optional and rarely needed (the shell is mostly stateless plus an overlay-open flag — local component state suffices for typical consumers).

**Forbidden:**
- Inline `<h1>` or hand-rolled header markup (use the shell's `kicker`/`title`/`headerActions` props).
- Missing render-error boundary.
- Re-mounting the tooltip provider inside the shell (the shell renders tooltips directly; the provider is the top-level app shell's job).

---

## Layer 3 — Page header

The page header is **purely informational** — title, optional subtitle, optional icon. **Action buttons live in the toolbar (Layer 4).** A matrix page often omits the header entirely when the matrix view is itself a tab/segment within a parent page; that is permitted.

**Required (when present):**
- **Title on the surface.** Pass `kicker` / `title` / `headerActions` to the matrix-grid shell; the shell renders the shared **on-surface header bar** at the top of its bounded card — a `kicker` overline (e.g. "Gradebook") over the `title`, in the project's **canonical page-title type style**, the same on-surface header every framed archetype shell mounts, sitting directly above the `toolbar` band (Layer 4) when both are present. There is no separate floating page-header treatment above the shell.

**Allowed variation:**
- **Header omitted** — permitted when the matrix is a tab inside a larger surface, or the view has no title need (pass neither `kicker` nor `title`).
- **Subtitle / icon** — the on-surface header bar carries `kicker` + `title` + `headerActions` only; there is no dedicated subtitle or icon slot. Fold axis context into the `kicker` or `title` text (e.g. `kicker="Customers × Services"`, or a `title` reading "…, as of {asOf}") rather than hand-rolling a second line.

**Forbidden:**
- Inline `<h1>` or a hand-rolled title bar bypassing the matrix-grid shell's `kicker`/`title` props.
- Per-cell actions surfaced in `headerActions` or the header bar generally — those belong in the side overlay that opens on cell click (Layer 6's click contract).

---

## Layer 4 — Toolbar

The matrix toolbar is different from a list-with-detail toolbar: search and filter make less sense (rows are usually pre-scoped by the route) while **temporal / view selection** controls dominate.

**Required:**
- Toolbar renders **on the surface**, via the shell's `toolbar` slot — a ruled band directly under the on-surface header bar. *(Pre-board-form the toolbar was a sibling above the shell; House Style B moved the title/actions onto the surface, so a floating toolbar now reads as orphaned from its header — pass it to the slot instead.)*
- **Point-in-time control** when the matrix has temporal semantics. Pattern: a **date-input control** bound to the URL's `as_of` query param, plus a "Today" button (secondary style, small) that resets to today's ISO date. Because it lives in the on-surface `toolbar` band, it stays visible alongside the header even when the current date yields no rows (see Layer 7's `emptyState`).

**Allowed variation:**
- **Filter chips** — optional. If a matrix can be sliced by an additional dimension (e.g. "only customers in region X"), use a pill bar, **not** a dropdown select. Same rule as Layer 4 in archetype A.
- **Result count** — in the **canonical muted small-text style**, e.g. "{n} rows · {m} columns".
- **Global action buttons** — bulk operations only (e.g. "Export CSV"), small, and their canonical home is the shell's `headerActions` (the on-surface header, Layer 3), not the toolbar band — the toolbar owns view/scope controls (period select, filter chips). Per-cell actions belong inside the side overlay editor.
- **Quick-filter chips** — for the secondary axis (e.g. "Show empty rows only"). Each chip may carry a count badge.

**Forbidden:**
- Per-cell actions in the toolbar (they belong in the side overlay that opens on cell click).
- Status filter rendered as a dropdown select.
- Toolbar floating as a sibling above the bounded surface, orphaned from the on-surface header. Pass it to the shell's `toolbar` slot instead.

---

## Layer 5 — Content wrapper

**Required:**
- The **matrix-grid shell** — the single primitive that owns this archetype's chrome. The shell provides:
  - The **canonical card chrome** (hairline border, rounded corners), with horizontal scroll instead of clipped overflow (the grid scrolls, it doesn't clip)
  - Table chrome via the project's **base table primitive**
  - A sticky first column for the row label
  - An optional column-group band above the per-column header (only rendered when at least one column has a non-empty `group`)
  - Standard row/column dividers
  - Row-level hover highlight applied to both the sticky row-label cell and each body cell
- The shell handles horizontal scroll itself. Consumers do not add another scroll container around it.

**Allowed variation:**
- A page-level flex container that lets the shell shrink and scroll rather than enforce its intrinsic width is allowed when the page composes the matrix with a fixed-width sibling (e.g. a permanent filter rail).

**Forbidden:**
- Hand-rolled `<table>` markup outside the shell.
- Extra horizontal-scroll wrappers (the shell already provides one).
- Page-level `max-width` on the matrix shell. Full-width is intentional; matrices benefit from every pixel.

---

## Layer 6 — Table / grid

This is the core layer. The matrix shell is generic over a single type parameter, `Cell`, representing the per-intersection data shape the consumer owns.

**Required props on the matrix-grid shell:**
- `columns: MatrixColumn[]` — `{ key, label, group? }`. Adjacent columns sharing the same `group` are rendered under a merged header band (row 1 of the header); the per-column header (row 2) shows `label`. When no column has a `group`, row 1 is omitted.
- `rows: MatrixRow<Cell>[]` — `{ id, label, cells: Record<string, Cell> }`. The `cells` map is keyed by `column.key`.
- `getRowId?: (row) => string` — defaults to `row.id`. Consumers override only when the row type uses a different identifier field.
- `rowHeaderLabel?: React.ReactNode` — heading for the sticky first column (e.g. "Customer", "Student"). Defaults to empty.

**Cell contract:**
- `isFilled?: (cell: Cell | undefined) => boolean` — defines whether a cell is "filled" (data present) or "empty" (blank). Default: `cell !== undefined && cell !== null`.
- `renderCell?: (ctx: MatrixCellContext<Cell>) => React.ReactNode` — renders content inside filled cells. `ctx` carries `{ row, column, cell, isFilled }`. Empty cells render no content by default (their background may still come from `cellStyle`).
- `cellStyle?: (ctx) => { className?: string; tooltip?: string }` — returns per-cell className and optional tooltip text. Used by both filled and empty cells. When `tooltip` is provided, the cell is wrapped in a **tooltip affordance** (the shell's responsibility).

**Click contract:**
- `onCellClick?: (ctx: MatrixCellContext<Cell>) => void` — fires when a cell is clicked. Consumers route this into their side overlay open/close state. The shell applies the **clickable-cell interaction treatment** (pointer cursor, no text selection) to cells when `onCellClick` is present.

**Number / date formatting:**
- The shell does **not** format cell content. The consumer's `renderCell` is responsible for invoking project-level formatters (currency, date) on numbers and ISO strings.

**Allowed variation:**
- **Cell variant axis** (composition via `renderCell` / `cellStyle` — not props; see `docs/CHOOSING-A-SURFACE.md`). The same shell covers several matrix flavors, all conformant; pick what the domain needs. The audit found controlling-app's ledger/entry/variance grids span all of these:
  - **read-only vs editable-cell** — read-only renders values; editable returns the shared **editable-cell control** (input or select variant) from `renderCell` — the shared owner of any editable control sitting flush in a cell, not a bare native `<input>`/`<select>` (the shell stays the same; a read-only matrix simply omits `onCellClick`).
  - **ledger** — numerics rendered right-aligned in the **canonical tabular-numeral style** (route through a formatter).
  - **tile** — a **status-badge** or tile per cell (e.g. status chip, count).
  - **comparison / variance** — `cellStyle` returns variance colors (over/under) per cell.
  Define the variant on the consumer's `Cell` shape; keep color maps in a shared file (see Forbidden).
- **Sticky vertical header (row 1)** — when the column-group band is present, both header rows stick to the top during vertical scroll. (The page generally scrolls the surrounding viewport; the matrix itself stretches and uses horizontal scroll only. Vertical-sticky inside the shell is reserved for very long row sets.)
- **Cell-count badge** — render an `assignmentCount`-style badge inside `renderCell`, in the **canonical micro-badge style** (extra-small, muted). Project-specific.
- **Multi-state cell variants** — cells may carry a status variant (e.g. neutral / warn / accent). The variant lives in the consumer's `Cell` shape; the shell renders whatever className `cellStyle` returns.

**Forbidden:**
- Per-cell `onClick` handlers attached outside the shell's `onCellClick` callback (route everything through the contract).
- Inline color maps duplicated across consumers — categorical cell variants live in a shared file, same rule as archetype A's status badges.
- Raw ISO date or number strings in cells — always route through a formatter inside `renderCell`.

---

## Layer 7 — Empty / loading / error states

A matrix has three kinds of emptiness, and the *message* is the consumer's call — the shell is dumb about WHY a matrix is empty. But the **chrome stays mounted**: the consumer passes its message to the shell's `emptyState` slot rather than rendering it instead of the shell, so the on-surface header and `toolbar` (the as-of control especially) remain visible — the user can change the date to escape the empty result.

**Required (consumer responsibility):**
- **No columns** — mount the shell and pass an `emptyState` node with the message. Example copy: "No services configured yet."
- **No rows but columns present** — same pattern. Example copy: "No customers match this view." (or query-aware: "No customers have active services as of {asOf}.")
- **Both axes present, all cells empty** — render the grid (omit `emptyState`). Empty cells are intentional; the matrix is showing a real "zero state" per intersection.

**Loading:**
- The shell does **not** ship a loading state. Page-level data fetching renders a route-level loading view or skeleton above the shell. The shell mounts only when data is in hand.

**Error:**
- Error handling lives at the page component level (the **render-error boundary** from Layer 2 + a per-route error view). The shell does not have an error mode.

**Mutation errors:**
- Surface through the app-wide toast. Mutation logic lives in the side overlay form, not in the shell.

---

## Layer 8 — Data fetching (contract)

The shell does not fetch. The consumer assembles a `Matrix`-shaped payload server-side or in a query hook and passes it in.

**Required props the consumer must provide:**
- `columns: MatrixColumn[]`
- `rows: MatrixRow<Cell>[]`

**Contract for the consumer's data layer:**
- Build the pivot **server-side** when possible. A matrix is N×M cells; transferring the raw normalized records and pivoting in the browser scales worse than pivoting in the database / API.
- Apply a freshness window of at least 30 seconds for the matrix query when using a client-side query library. Override only when the page has real-time requirements.
- When the matrix is parameterized by a point-in-time (e.g. `as_of`), include that param in the cache key so different snapshots don't share an entry.
- After any cell-edit mutation, invalidate the matrix query plus any per-cell detail queries the side overlay opened.

---

## Layer 9 — Type shapes (contract)

**Required:**
- The matrix-grid shell is generic in `Cell`: `Shell<Cell>`.
- The public types are:
  ```ts
  export type MatrixColumn = { key: string; label: string; group?: string };
  export type MatrixRow<Cell> = { id: string; label: string; cells: Record<string, Cell> };
  export type MatrixCellContext<Cell> = {
    row: MatrixRow<Cell>;
    column: MatrixColumn;
    cell: Cell | undefined;
    isFilled: boolean;
  };
  ```
- Consumers define their own `Cell` shape carrying whatever payload the side overlay needs (record IDs to load, a value, a status variant). Recommended: include enough scalar fields in `Cell` to render the cell **without** a second lookup, but reference foreign IDs (not full joined objects) for anything the side overlay will fetch on open.

**Forbidden:**
- Hand-written row/column types that duplicate a machine-generated schema (they drift silently).
- A separate `lookup` map keyed by `${rowId}::${columnKey}` is **allowed as a project extension** (see Migration notes) when the cell-payload is a list of record IDs that the consumer doesn't want to denormalize into `Cell`. The shell itself does not consume such a map.

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are the side overlay's job, not the shell's. The shell only emits `onCellClick`; the consumer's click handler owns overlay state and form lifecycle.

**Required consumer surface:**
- A state holder (or equivalent) holds the overlay's discriminated state: at minimum `{ kind: 'closed' }` and `{ kind: 'edit'; … }`. Matrices that allow multiple records per cell add `{ kind: 'picker'; … }`. Matrices that allow create-from-empty add `{ kind: 'create'; … }`.
- The overlay renders a project-owned form component (e.g. a service-assignment form, a grade-entry form). The form's `onSuccess` callback closes the overlay and triggers a router refresh (Next.js) or query invalidation (TanStack Query / SWR).

**Consumer contracts:**
- All mutations use the project's async state library. No manual imperative refetch via refs.
- After mutation: invalidate the matrix list query. If the side overlay itself loaded a per-record detail, invalidate that too.
- Optimistic updates: defer unless the cell-edit UX visibly suffers without them, and document why.

**Allowed variation:**
- **Multi-record cells** — when a single intersection can host multiple records (e.g. stacked assignments with different validity windows), the consumer's cell payload carries a list of record IDs. The shell still emits one `onCellClick`; the consumer chooses to open a picker overlay (`{ kind: 'picker' }`) on `length > 1` and the edit overlay directly on `length === 1`.
- **Create-from-empty** — clicking an empty cell may open an overlay that creates the intersection. The consumer derives the necessary IDs from `ctx.row.id` and `ctx.column.key`.

**Forbidden:**
- Side overlay rendered inside the shell. The overlay is always a sibling so the shell stays stateless about its overlay.
- Imperative refetch of the matrix from a parent component via ref.

---

## Layer 11 — Mobile variant

Matrices are inherently dense and wide. Mobile is a constrained surface.

**Required:**
- No dedicated `/mobile/...` route.
- The shell's outer wrapper provides horizontal scroll on overflow. Mobile users scroll horizontally over the sticky first column.
- Tappable cells gain the **touch-friendly clickable-cell treatment** (pointer cursor, no text selection, touch-optimized) — the shell adds this when `onCellClick` is provided.
- The side overlay renders as a full-width **overlay surface** on mobile — same pattern as other archetypes.

**Extension points (not shipped by default — consumer may add):**
- **Column-collapse-to-pivot** — replacing the matrix with a stacked list (one card per row, columns as nested rows) on narrow viewports. Consumer-owned.
- **Header-row freeze on vertical scroll** — when row count exceeds the viewport height. Sticky header plus the existing sticky-left column. Consumer-owned (the shell only sticks the first column).

---

## Layer 12 — Permissions

Permissions are out of the shell's scope.

**Required:**
- Route-level auth guard with no role requirement for standard matrix pages. Role-gated matrices apply the requirement at the route, not inside the shell.
- Per-cell visibility (showing or hiding a cell based on role) is driven by **omitting the cell from `row.cells`** before passing to the shell — the shell renders only what it's given.
- No feature flags or read-only mode baked into the shell. A read-only matrix is a consumer that simply does not pass `onCellClick`.

**Extension point:**
- Role-based cell-edit visibility — the consumer's `onCellClick` short-circuits when the user lacks edit permission for the cell. The shell does not need to know.

---

## Forbidden patterns

The following patterns are never permitted in a matrix-grid page, regardless of the domain:

1. **Inline cell edit.** Editing a cell's fields in-place within the table cell. The unit of work is the cell; editing happens in the side overlay that opens on click.
2. **Row-action menus.** Three-dots-per-row dropdowns. A matrix page edits intersections, not rows.
3. **Multiple matrices on one route.** Each matrix view is its own page. Tabs/segments are allowed (each tab points at its own matrix view, route segment, or query param).
4. **Side overlay rendered inside the shell.** Always a sibling.
5. **Hand-rolled `<table>` outside the matrix-grid shell.**
6. **Action buttons floating above the surface.** Bulk actions belong in the shell's `headerActions`; per-cell actions belong in the side overlay.
7. **Status filter rendered as a dropdown select.** Use pill bars.
8. **Inline cell color maps** duplicated per consumer. Cell variants live in a shared file.
9. **Raw ISO date or number strings in cells.** Always route through a formatter inside `renderCell`.
10. **Static (non-lazy) page imports.** Always lazy-import matrix-grid pages.
11. **Missing render-error boundary.**

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitive to its own data layer and may extend it with project-specific behavior as described below.

**Allowed project extensions:**
- **External cell-payload lookup map.** When a cell carries a list of foreign record IDs and the consumer prefers not to denormalize them into `Cell`, the consumer may maintain a separate `Record<string, string[]>` keyed by `${rowId}::${columnKey}` and look up inside `renderCell` / `onCellClick`. The shell does not know about this map.
- **Multi-state cell variants.** Project-owned `Cell` shape carries a `variant` discriminator; `cellStyle` returns the className for each variant.
- **Create-from-empty flow.** Consumer's `onCellClick` opens a "create" overlay when `ctx.isFilled === false`. Multi-step flows (e.g. choose-vendor → fill-form) are encoded in the overlay's discriminated state.
- **Picker overlay for multi-record cells.** Consumer's `onCellClick` opens a picker when the cell carries more than one record, falling through to the edit overlay on single-record cells.
- **Project-specific cell renderers.** Consumers control the entire `renderCell` body — count badges, status dots, multi-line content. The shell does not constrain.
- **Custom `getRowId`.** When the row identifier field is not `id`, override via the `getRowId` prop.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks (e.g. `useAssignmentsMatrix()`, `useGradebook()`).
- Domain-specific cell payload shapes derived from the project's DB or API schema.
- Project-local cell color maps and variant definitions.
- Side overlay form components and their submit logic.
- Business rules governing cell edit/create permissions and multi-record semantics.
- Server-side pivot SQL or query implementations.

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

- [ ] **One matrix shell** owns the row-header column + scrollable cell grid; axes
      aren't hand-assembled from nested flex `<div>`s.
- [ ] **Sticky row/column headers** via the shell, not duplicated static headers.
- [ ] **Cells are a single primitive** (value/intensity/state) — no per-cell bespoke
      markup variants; empty cells use the canonical empty treatment, not blank gaps.
- [ ] **Legend/scale uses tokens** (sequential/semantic), no literal color ramps.
- [ ] **[spine] S1, S2, S4, S5, S6** (S5: all cell figures mono/tabular).

**SHOULD** (yellow, not red)

- [ ] Dense mode keeps ≥ the minimum hit target for interactive cells.
