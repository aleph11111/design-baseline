---
slug: matrix-grid
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/matrix-grid.md
---

# Matrix grid — baseline reference implementation

> The stack-specific binding of the [matrix-grid contract](./matrix-grid.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<MatrixGridShell>` in `src/components/archetypes/matrix-grid/`. A purely structural shell: sticky two-row header (optional column-group band + per-column header), sticky first column for the row label, body cells rendered through a consumer-provided render-prop. The side-Sheet editor itself is **consumer-owned** — render it as a sibling of the shell and drive it from the shell's `onCellClick` callback.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Route config
- Route-level auth guard → `<ProtectedRoute>`.
- Lazy-load boundary → `const Page = lazy(() => import('./pages/Page'))` wrapped in `<Suspense fallback={null}>` at the route definition.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>` from `src/components/layout/`. As of baseline v1.0, `<AppShell>` mounts `TooltipProvider`, `SidebarProvider`, `<Toaster>`, and `<Sonner>`, so those providers are always in the tree by the time a matrix-grid page renders. Consumers do not re-mount them at the page level.
- Tooltip provider not re-mounted → `<MatrixGridShell>` renders `<Tooltip>` directly rather than mounting its own `TooltipProvider`; the provider is `<AppShell>`'s job.
- Canonical vertical rhythm / no page inset → outer container `<div className="space-y-4">`. `AppShell`'s `<main>` supplies the inset.
- Render-error boundary → `<ErrorBoundary>`.
- On-surface header bar → `<SurfaceHeader>` (see Layer 3), mounted by `<MatrixGridShell>` via its `kicker`/`title`/`headerActions` props; there is no separate `<PageHeader>` above the shell.
- State-provider → a page-level React context provider (rarely needed; a `useState` overlay-open flag suffices for typical consumers).

### Layer 3 — Page header
- On-surface header bar → the shared `<SurfaceHeader>` (`@/components/layout/SurfaceHeader`), mounted by `<MatrixGridShell>` via its `kicker`/`title`/`headerActions` props.
- Canonical page-title type style → `title` renders as `text-lg font-semibold`.

### Layer 4 — Toolbar
- Toolbar slot → the shell's `toolbar` prop, rendered as a ruled band: `border-b px-4 py-3`; inner layout `<div className="flex items-end gap-4">`.
- Date-input control → `<Input type="date">` bound to `as_of`.
- "Today" button (secondary style, small) → `<Button variant="outline" size="sm">`.
- Dropdown select (forbidden for status filter) → shadcn `<Select>`.
- Global action buttons (small) → `<Button size="sm">`.

### Layer 5 — Content wrapper
- Matrix-grid shell → `<MatrixGridShell>` from `src/components/archetypes/matrix-grid/`, providing:
  - Outer wrapper: `rounded-lg border bg-card overflow-x-auto`
  - Table chrome: `<table className="text-sm border-collapse">`
  - Sticky first column: `sticky left-0 z-10 bg-card` on the row-label `<th>`/`<td>`
  - Optional column-group band as a second `<tr>` in `<thead>` above the per-column header
  - Standard borders: `border-b border-border` between rows; `border-r border-border` between columns
  - Row-level `hover:bg-muted/50`
- Shrinkable-width flex container → `min-w-0`.

### Layer 6 — Table / grid
- Editable-cell control → `<CellInput>` / `<CellSelect>` (`ui/cell-input`).
- Canonical tabular-numeral style (ledger) → `tabular-nums`.
- Status-badge → `<Badge>`.
- Tooltip affordance → `<Tooltip>`.
- Clickable-cell interaction treatment → `cursor-pointer select-none`.
- Canonical micro-badge style → `text-[10px] opacity-70`.

### Layer 7 — Empty / loading / error states
- Empty message node → `emptyState={<p className="…">{noColumnsMessage}</p>}`.
- Route-level loading view → `loading.tsx` (Next.js) or a skeleton above the shell.
- Render-error boundary + per-route error view → `<ErrorBoundary>` (Layer 2) + `error.tsx`.

### Layer 9 — Type shapes
- Generic shell notation → `MatrixGridShell<Cell>`.

### Layer 10 — Mutations & invalidation
- Overlay state holder → `useState`.
- Project-owned form component examples → `<ServiceAssignmentForm>`, `<GradeEntryForm>`.

### Layer 11 — Mobile variant
- Horizontal scroll on overflow → `overflow-x-auto`.
- Touch-friendly clickable-cell treatment → `cursor-pointer select-none touch-manipulation`.
- Overlay surface on mobile → `<Sheet side="right" className="w-full sm:max-w-md">` — same pattern as other archetypes.

## Donor mapping (informational)

For reference, the donor implementation that motivated this archetype (an MSP CRM's customers × services assignment matrix) maps to the baseline primitive as follows:

| Donor prop on local `MatrixGrid` | Baseline `<MatrixGridShell>` |
|---|---|
| `matrix.columns: { group, service, key }[]` | `columns: MatrixColumn[]` (rename `service` → `label`) |
| `matrix.rows: { companyId, companyName, cells }[]` | `rows: MatrixRow<Cell>[]` (rename `companyId` → `id`, `companyName` → `label`) |
| `assignmentLookup: Record<\`${companyId}::${serviceName}\`, string[]>` | Project extension — kept as a separate lookup map alongside the shell |
| `onCellClick: (assignmentIds, cellKey) => void` | `onCellClick: (ctx) => void` — consumer reads `ctx.row.id`/`ctx.column.key` to look up assignmentIds in the lookup map |
| `cellStyle: (key, cell) => { className, tooltip }` | `cellStyle: (ctx) => { className?, tooltip? }` |

The donor uses one shell for two pages (a single-state "Bestand" view and a multi-state "Potenzial" view). Both are valid consumers under this archetype; the variant comes from the consumer's `cellStyle` and `renderCell`, not from the shell.

## Acceptance gate (baseline tells)
- Matrix shell → `<MatrixGridShell columns={…} rows={…}>`; hand-assembled nested flex `<div>`s fail "one matrix shell owns the row-header column + scrollable cell grid".
- Sticky headers → the shell's built-in `sticky left-0 z-10 bg-card` (column) and sticky `<thead>` (row-group band), not duplicated static headers.
- Cell primitive → a single `renderCell`/`cellStyle` contract per cell, not bespoke per-cell JSX.
- Legend/scale tokens → a shared color-map file (e.g. variance/ledger tone tokens), never a literal Tailwind color class at the call site.
