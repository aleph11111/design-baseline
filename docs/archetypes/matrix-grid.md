---
key: M
slug: matrix-grid
kind: page
version: 1.0
promoted_from: hk-crm
promoted_at: 2026-05-22
source_spec_version: 1.0
status: locked
---

# Archetype M — Matrix-grid

## Purpose

A **matrix-grid** page renders a two-dimensional grid where each row maps to one domain entity (e.g. a customer, a student, a team), each column maps to another (e.g. a service, a subject, a project), and every cell is the *intersection* of the two — meaningful in its own right and individually interactive. Clicking a cell opens a side-Sheet editor scoped to that intersection: a row-action does not make sense here, because the unit of work is the cell, not the row.

Use this archetype when:

- The page's primary job is to expose a **rows × columns** relationship rather than a list of items.
- Cells carry semantic state (filled / empty, value, status variant) and a user clicks to **edit or create** the intersection record.
- Columns naturally cluster into **groups** that share a parent label (an optional banded header row above the per-column header).
- The viewport is too narrow to show every column at once — horizontal scroll with sticky row labels is the right trade-off versus column collapse.

If the page is a single-axis list of rows (no meaningful columns beyond display fields), use archetype A (list-with-detail). If the page is a single-axis settings catalogue with inline edit, use archetype D2 (settings-table).

## Reference primitive

`<MatrixGridShell>` in `src/components/archetypes/matrix-grid/`. A purely structural shell: sticky two-row header (optional column-group band + per-column header), sticky first column for the row label, body cells rendered through a consumer-provided render-prop. The side-Sheet editor itself is **consumer-owned** — render it as a sibling of the shell and drive it from the shell's `onCellClick` callback.

---

## Layer 1 — Route config

**Required:**
- Path: domain-scoped route under a single segment (e.g. `/matrix/<view>`, `/grids/<view>`, `/gradebook/<class>`). One matrix view per route — do not multiplex two matrices on one page.
- Wrap in the project's auth guard (e.g. `<ProtectedRoute>`). No role-requirement prop unless RBAC is explicitly in scope for this page.
- Lazy-import the page component: `const Page = lazy(() => import('./pages/Page'))`.
- Wrap in `<Suspense fallback={null}>` at the route definition.
- **`as_of` (or equivalent point-in-time) query param is allowed and is the canonical way to express "what does this grid look like on date X".** Bookmarkable URLs are the right serialization for temporal views; in-memory state alone is not sufficient.

**Forbidden:**
- Static imports of matrix-grid pages.
- Two matrix views on one route (use sibling routes).

---

## Layer 2 — Page shell

**Required:**
- The page renders inside `<AppShell>` from `src/components/layout/`. As of baseline v1.0, `<AppShell>` mounts `TooltipProvider`, `SidebarProvider`, `<Toaster>`, and `<Sonner>`, so those providers are always in the tree by the time a matrix-grid page renders. Consumers do not re-mount them at the page level. **`<MatrixGridShell>` itself does not re-mount `TooltipProvider`.**
- Outer container: `<div className="space-y-4">` — **no page inset** (`AppShell`'s `<main>` supplies it). The matrix and its toolbar live in one vertical stack.
- `<ErrorBoundary>` wrapping page content at the page component level.
- The baseline `<PageHeader>` layout primitive (`@/components/layout`) for the title bar (when the page has one — see Layer 3).

**Allowed variation:**
- A page-level React context provider is optional and rarely needed (the matrix shell is mostly stateless plus a sheet flag — useState in the page suffices for typical consumers).

**Forbidden:**
- Inline `<h1>` or custom header markup (use `<PageHeader>`).
- Missing `<ErrorBoundary>`.
- Re-mounting `TooltipProvider` inside the shell (the shell renders `<Tooltip>` directly; the provider is the `<AppShell>`'s job).

---

## Layer 3 — Page header

The page header is **purely informational** — title, optional subtitle, optional icon. **Action buttons live in the toolbar (Layer 4).** A matrix page often omits the header entirely when the matrix view is itself a tab/segment within a parent page; that is permitted.

**Required (when present, via `<PageHeader>`):**
- **Title** — always present when the header is rendered. Rendered as `text-2xl font-semibold tracking-tight` (the canonical baseline title treatment).

**Allowed variation:**
- **Subtitle** — describes the axes (e.g. "Customers × Services, as of {asOf}").
- **Icon** — optional, decorative. If used, size `h-6 w-6`.
- **Header omitted** — permitted when the matrix is a tab inside a larger surface.

**Forbidden:**
- Inline `<h1>`.
- Action buttons in the header.

---

## Layer 4 — Toolbar

The matrix toolbar is different from a list-with-detail toolbar: search and filter make less sense (rows are usually pre-scoped by the route) while **temporal / view selection** controls dominate.

**Required:**
- Toolbar renders as a sibling **above** `<MatrixGridShell>`, not as a slot of the shell. Layout: `<div className="flex items-end gap-4">`.
- **Point-in-time control** when the matrix has temporal semantics. Pattern: a `<Input type="date">` bound to the URL's `as_of` query param, plus a "Today" button (`variant="outline" size="sm"`) that resets to today's ISO date.

**Allowed variation:**
- **Filter chips** — optional. If a matrix can be sliced by an additional dimension (e.g. "only customers in region X"), use a pill bar, **not** a Select dropdown. Same rule as Layer 4 in archetype A.
- **Result count** — small text muted, e.g. "{n} rows · {m} columns".
- **Global action buttons** — bulk operations only (e.g. "Export CSV"). Per-cell actions belong inside the side-Sheet editor, not in the toolbar. Right-aligned, `size="sm"`.
- **Quick-filter chips** — for the secondary axis (e.g. "Show empty rows only"). Each chip may carry a count badge.

**Forbidden:**
- Per-cell actions in the toolbar (they belong in the side-Sheet that opens on cell click).
- Status filter rendered as a Select dropdown.
- Toolbar rendered as a slot of the shell. Matrix shell is grid-only; toolbar is a sibling.

---

## Layer 5 — Content wrapper

**Required:**
- `<MatrixGridShell>` from `src/components/archetypes/matrix-grid/`. The shell provides:
  - Outer wrapper: `rounded-lg border bg-card overflow-x-auto`
  - Table chrome: `<table className="text-sm border-collapse">`
  - Sticky first column: `sticky left-0 z-10 bg-card` on the row-label `<th>`/`<td>`
  - Optional column-group band as a second `<tr>` in `<thead>` above the per-column header (only rendered when at least one column has a non-empty `group`)
  - Standard borders (`border-b border-border` between rows; `border-r border-border` between columns)
  - Row-level `hover:bg-muted/50` applied to both the sticky row-label cell and each body cell
- The shell handles horizontal scroll itself (`overflow-x-auto`). Consumers do not add another scroll container around it.

**Allowed variation:**
- A page-level `min-w-0` flex container around the shell is allowed when the page composes the matrix with a fixed-width sibling (e.g. a permanent filter rail).

**Forbidden:**
- Hand-rolled `<table>` markup outside the shell.
- Extra `overflow-x-auto` wrappers (the shell already provides one).
- Page-level `max-width` on the matrix shell. Full-width is intentional; matrices benefit from every pixel.

---

## Layer 6 — Table / grid

This is the core layer. The matrix shell is generic over a single type parameter, `Cell`, representing the per-intersection data shape the consumer owns.

**Required props on `<MatrixGridShell>`:**
- `columns: MatrixColumn[]` — `{ key, label, group? }`. Adjacent columns sharing the same `group` are rendered under a merged header band (row 1 of `<thead>`); the per-column header (row 2) shows `label`. When no column has a `group`, row 1 is omitted.
- `rows: MatrixRow<Cell>[]` — `{ id, label, cells: Record<string, Cell> }`. The `cells` map is keyed by `column.key`.
- `getRowId?: (row) => string` — defaults to `row.id`. Consumers override only when the row type uses a different identifier field.
- `rowHeaderLabel?: React.ReactNode` — heading for the sticky first column (e.g. "Customer", "Student"). Defaults to empty.

**Cell contract:**
- `isFilled?: (cell: Cell | undefined) => boolean` — defines whether a cell is "filled" (data present) or "empty" (blank). Default: `cell !== undefined && cell !== null`.
- `renderCell?: (ctx: MatrixCellContext<Cell>) => React.ReactNode` — renders content inside filled cells. `ctx` carries `{ row, column, cell, isFilled }`. Empty cells render no content by default (their background may still come from `cellStyle`).
- `cellStyle?: (ctx) => { className?: string; tooltip?: string }` — returns per-cell className and optional tooltip text. Used by both filled and empty cells. When `tooltip` is provided, the cell is wrapped in a `<Tooltip>` (the shell's responsibility).

**Click contract:**
- `onCellClick?: (ctx: MatrixCellContext<Cell>) => void` — fires when a cell is clicked. Consumers route this into their side-Sheet open/close state. The shell adds `cursor-pointer select-none` to cells when `onCellClick` is present.

**Number / date formatting:**
- The shell does **not** format cell content. The consumer's `renderCell` is responsible for invoking project-level formatters (currency, date) on numbers and ISO strings.

**Allowed variation:**
- **Cell variant axis** (composition via `renderCell` / `cellStyle` — not props; see `docs/CHOOSING-A-SURFACE.md`). The same shell covers several matrix flavors, all conformant; pick what the domain needs. The audit found controlling-app's ledger/entry/variance grids span all of these:
  - **read-only vs editable-cell** — read-only renders values; editable returns an `<input>` from `renderCell` (the shell stays the same; a read-only matrix simply omits `onCellClick`).
  - **ledger** — right-aligned `tabular-nums` numerics (route through a formatter).
  - **tile** — a badge/tile per cell (e.g. status chip, count).
  - **comparison / variance** — `cellStyle` returns variance colors (over/under) per cell.
  Define the variant on the consumer's `Cell` shape; keep color maps in a shared file (see Forbidden).
- **Sticky vertical header (row 1)** — when the column-group band is present, both header rows stick to the top during vertical scroll. (The page generally scrolls the surrounding viewport; the matrix itself stretches and uses horizontal scroll only. Vertical-sticky inside the shell is reserved for very long row sets.)
- **Cell-count badge** — render an `assignmentCount`-style badge inside `renderCell` (`text-[10px] opacity-70`). Project-specific.
- **Multi-state cell variants** — cells may carry a status variant (e.g. neutral / warn / accent). The variant lives in the consumer's `Cell` shape; the shell renders whatever className `cellStyle` returns.

**Forbidden:**
- Per-cell `onClick` handlers attached outside the shell's `onCellClick` callback (route everything through the contract).
- Inline color maps duplicated across consumers — categorical cell variants live in a shared file, same rule as archetype A's status badges.
- Raw ISO date or number strings in cells — always route through a formatter inside `renderCell`.

---

## Layer 7 — Empty / loading / error states

A matrix has three kinds of emptiness, and the contract is **page-level**, not shell-level. The shell is dumb about WHY a matrix is empty; the consumer decides which message to show before passing rows/columns to the shell.

**Required (consumer responsibility):**
- **No columns** — show `<p className="text-muted-foreground">{noColumnsMessage}</p>` instead of mounting the shell. Example copy: "No services configured yet."
- **No rows but columns present** — same pattern. Example copy: "No customers match this view." (or query-aware: "No customers have active services as of {asOf}.")
- **Both axes present, all cells empty** — render the shell. Empty cells are intentional; the matrix is showing a real "zero state" per intersection.

**Loading:**
- The matrix shell does **not** ship a loading state. Page-level data fetching renders a `loading.tsx` (Next.js) or skeleton above the shell. The shell mounts only when data is in hand.

**Error:**
- Error handling lives at the page component level (`<ErrorBoundary>` in Layer 2 + per-route `error.tsx`). The shell does not have an error mode.

**Mutation errors:**
- Surface through the app-wide toast. Mutation logic lives in the side-Sheet form, not in the shell.

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
- After any cell-edit mutation, invalidate the matrix query plus any per-cell detail queries the side-Sheet opened.

---

## Layer 9 — Type shapes (contract)

**Required:**
- `<MatrixGridShell>` is generic in `Cell`: `MatrixGridShell<Cell>`.
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
- Consumers define their own `Cell` shape carrying whatever payload the side-Sheet needs (record IDs to load, a value, a status variant). Recommended: include enough scalar fields in `Cell` to render the cell **without** a second lookup, but reference foreign IDs (not full joined objects) for anything the side-Sheet will fetch on open.

**Forbidden:**
- Hand-written row/column types that duplicate a machine-generated schema (they drift silently).
- A separate `lookup` map keyed by `${rowId}::${columnKey}` is **allowed as a project extension** (see Migration notes) when the cell-payload is a list of record IDs that the consumer doesn't want to denormalize into `Cell`. The shell itself does not consume such a map.

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are the side-Sheet's job, not the shell's. The shell only emits `onCellClick`; the consumer's click handler owns sheet state and form lifecycle.

**Required consumer surface:**
- A `useState` (or equivalent) holds the sheet's discriminated state: at minimum `{ kind: 'closed' }` and `{ kind: 'edit'; … }`. Matrices that allow multiple records per cell add `{ kind: 'picker'; … }`. Matrices that allow create-from-empty add `{ kind: 'create'; … }`.
- The sheet renders a project-owned form component (e.g. `<ServiceAssignmentForm>`, `<GradeEntryForm>`). The form's `onSuccess` callback closes the sheet and triggers a router refresh (Next.js) or query invalidation (TanStack Query / SWR).

**Consumer contracts:**
- All mutations use the project's async state library. No manual imperative refetch via refs.
- After mutation: invalidate the matrix list query. If the side-Sheet itself loaded a per-record detail, invalidate that too.
- Optimistic updates: defer unless the cell-edit UX visibly suffers without them, and document why.

**Allowed variation:**
- **Multi-record cells** — when a single intersection can host multiple records (e.g. stacked assignments with different validity windows), the consumer's cell payload carries a list of record IDs. The shell still emits one `onCellClick`; the consumer chooses to open a picker sheet (`{ kind: 'picker' }`) on `length > 1` and the edit sheet directly on `length === 1`.
- **Create-from-empty** — clicking an empty cell may open a sheet that creates the intersection. The consumer derives the necessary IDs from `ctx.row.id` and `ctx.column.key`.

**Forbidden:**
- Side-Sheet rendered inside the shell. The sheet is always a sibling so the shell stays stateless about its sheet.
- Imperative refetch of the matrix from a parent component via ref.

---

## Layer 11 — Mobile variant

Matrices are inherently dense and wide. Mobile is a constrained surface.

**Required:**
- No dedicated `/mobile/...` route.
- The matrix shell's outer wrapper provides `overflow-x-auto`. Mobile users scroll horizontally over the sticky first column.
- Tappable cells get `cursor-pointer select-none touch-manipulation` (the shell adds these when `onCellClick` is provided).
- The side-Sheet renders as a full-width drawer on mobile (`<Sheet side="right" className="w-full sm:max-w-md">` — same pattern as other archetypes).

**Extension points (not shipped in baseline v1.0 — consumer may add):**
- **Column-collapse-to-pivot** — replacing the matrix with a stacked list (one card per row, columns as nested rows) on narrow viewports. Consumer-owned.
- **Header-row freeze on vertical scroll** — when row count exceeds the viewport height. Sticky `<thead>` plus the existing sticky-left column. Consumer-owned (baseline only sticks the first column).

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

1. **Inline cell edit.** Editing a cell's fields in-place within the table cell. The unit of work is the cell; editing happens in the side-Sheet that opens on click.
2. **Row-action menus.** Three-dots-per-row dropdowns. A matrix page edits intersections, not rows.
3. **Multiple matrices on one route.** Each matrix view is its own page. Tabs/segments are allowed (each tab points at its own matrix view, route segment, or query param).
4. **Side-Sheet rendered inside the shell.** Always a sibling.
5. **Hand-rolled `<table>` outside `<MatrixGridShell>`.**
6. **Action buttons in `<PageHeader>`.** Bulk actions belong in the toolbar; per-cell actions belong in the side-Sheet.
7. **Status filter rendered as a Select dropdown.** Use pill bars.
8. **Inline cell color maps** duplicated per consumer. Cell variants live in a shared file.
9. **Raw ISO date or number strings in cells.** Always route through a formatter inside `renderCell`.
10. **Static (non-lazy) page imports.** Always lazy-import matrix-grid pages.
11. **Missing `<ErrorBoundary>`.**

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitive to its own data layer and may extend it with project-specific behavior as described below.

**Allowed project extensions:**
- **External cell-payload lookup map.** When a cell carries a list of foreign record IDs and the consumer prefers not to denormalize them into `Cell`, the consumer may maintain a separate `Record<string, string[]>` keyed by `${rowId}::${columnKey}` and look up inside `renderCell` / `onCellClick`. The shell does not know about this map.
- **Multi-state cell variants.** Project-owned `Cell` shape carries a `variant` discriminator; `cellStyle` returns the className for each variant.
- **Create-from-empty flow.** Consumer's `onCellClick` opens a "create" sheet when `ctx.isFilled === false`. Multi-step flows (e.g. choose-vendor → fill-form) are encoded in the sheet's discriminated state.
- **Picker sheet for multi-record cells.** Consumer's `onCellClick` opens a picker when the cell carries more than one record, falling through to the edit sheet on single-record cells.
- **Project-specific cell renderers.** Consumers control the entire `renderCell` body — count badges, status dots, multi-line content. The shell does not constrain.
- **Custom `getRowId`.** When the row identifier field is not `id`, override via the `getRowId` prop.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks (e.g. `useAssignmentsMatrix()`, `useGradebook()`).
- Domain-specific cell payload shapes derived from the project's DB or API schema.
- Project-local cell color maps and variant definitions.
- Side-Sheet form components and their submit logic.
- Business rules governing cell edit/create permissions and multi-record semantics.
- Server-side pivot SQL or query implementations.

---

## Donor mapping (informational)

For reference, the donor implementation that motivated this archetype (an MSP CRM's customers × services assignment matrix) maps to the contract as follows:

| Donor prop on local `MatrixGrid` | Baseline `<MatrixGridShell>` |
|---|---|
| `matrix.columns: { group, service, key }[]` | `columns: MatrixColumn[]` (rename `service` → `label`) |
| `matrix.rows: { companyId, companyName, cells }[]` | `rows: MatrixRow<Cell>[]` (rename `companyId` → `id`, `companyName` → `label`) |
| `assignmentLookup: Record<\`${companyId}::${serviceName}\`, string[]>` | Project extension — kept as a separate lookup map alongside the shell |
| `onCellClick: (assignmentIds, cellKey) => void` | `onCellClick: (ctx) => void` — consumer reads `ctx.row.id`/`ctx.column.key` to look up assignmentIds in the lookup map |
| `cellStyle: (key, cell) => { className, tooltip }` | `cellStyle: (ctx) => { className?, tooltip? }` |

The donor uses one shell for two pages (a single-state "Bestand" view and a multi-state "Potenzial" view). Both are valid consumers under this archetype; the variant comes from the consumer's `cellStyle` and `renderCell`, not from the shell.
