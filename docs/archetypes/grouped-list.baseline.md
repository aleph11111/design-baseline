---
slug: grouped-list
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/grouped-list.md
---

# Grouped list — baseline reference implementation

> The stack-specific binding of the [grouped-list contract](./grouped-list.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<GroupedListShell>` + `<GroupedListSection>` in `src/components/archetypes/grouped-list/`. The shell owns the outer container, the optional page-level toolbar slot, and the page-level empty state. Each `<GroupedListSection>` renders as a bounded `<SectionCard>` — a ruled title bar (group name + row count) over the group's table rendered flush inside the same card — so each group reads as one self-contained titled block, the same shape as a detail-overview `<DetailSection>`.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Route config
- Route-level auth guard → `<ProtectedRoute>`.
- Lazy-load boundary → `lazy()` + `<Suspense fallback={null}>`, same as A.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>` (baseline).
- Canonical vertical rhythm / no page inset → outer container `<div className="space-y-6">`; `AppShell`'s `<main>` supplies the inset.
- Wide vertical rhythm between sections → `<GroupedListShell>`'s own inner `<div className="space-y-8">`.
- Render-error boundary → `<ErrorBoundary>`.
- On-surface header bar → `<SurfaceHeader>`, mounted by `<GroupedListShell>` via its `kicker`/`title`/`headerActions` props.

### Layer 3 — Page header
- On-surface header bar → the shared `<SurfaceHeader>` (`src/components/layout/SurfaceHeader.tsx`), mounted at the top of `<GroupedListShell>`'s outer container.
- Canonical page-title type style → `text-lg font-semibold` (the current Plex Ledger title scale — supersedes the old `text-2xl font-semibold tracking-tight` `<PageHeader>` treatment).
- Header-fill contract → `--header-fill` / `HeaderFillContext` (`src/components/layout/headerFill.ts`): `solid` (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; `tint` is a quieter `bg-muted` step; `white` is hairline-border-only.
- Overline/kicker style → the shared `OVERLINE_CLASS`.
- Header action buttons → `<Button size="sm">`, default variant, leading `Plus` icon for the Add action.

### Layer 4 — Toolbar
- Search-input molecule → `<SearchInput>` (`ui/search-input`).
- One-of-N segmented control → `<SegmentedControl>` (`ui/segmented-control`), vs. a `<Select>` dropdown (forbidden).
- Result count style → `text-sm text-muted-foreground`, format `{n} results`.

### Layer 5 — Content wrapper
- Grouped-list shell → `<GroupedListShell>` from `src/components/archetypes/grouped-list/`.
- Bare toolbar row → `flex flex-wrap items-center gap-3`, no card chrome, same as feed-inbox; the ruled `border-b px-4 py-3` band only applies to toolbars *inside* a table card (per STYLE.md).
- Sections region rhythm → `<div className="space-y-8">`.
- Section primitive → `<GroupedListSection>`.
- Section-card surface → `<SectionCard>`; ruled overline title bar → the canonical `<SectionHeading>` signature; row-count badge → `<Badge>`.
- detail-overview parallel → `<DetailSection>`.
- Inner table, flush → `<ListWithDetailShell unstyled>`.

### Layer 6 — Table / grid
Delegated to A — see [`list-with-detail.baseline.md`](./list-with-detail.baseline.md) Layer 6 (`<Table>`, `text-primary hover:underline`, `<Badge>` variants).

### Layer 7 — Empty / loading / error states
- State-view primitive → `<StateView>` (`ui/state-view`), adapted via `<GroupedListShell isLoading>` / `isEmpty emptyMessage="…"` / `error onRetry={…}` props → `<StateView variant="loading | empty | error">`.
- Destructive load-error visual → destructive `<Alert>` (title, icon, message).
- Section-level fallback (discouraged path) → the inner `<ListWithDetailShell>`'s own empty state ("No items yet" card).

### Layer 9 — Type shapes
- Section primitive generic → `GroupedListSection<Row>`.
- Renderable `title` type → `title: React.ReactNode`.
- No shared grouped-shape helper type → no `Grouped<T>` helper in baseline; the shape is built inline per page.

### Layer 10 — Mutations & invalidation
- Row-actions overflow menu → `<RowActionsMenu>` (`archetypes/shared`).

### Layer 11 — Mobile variant
- Inner shell mobile behaviour → delegated to `<ListWithDetailShell>` (see A).
- Overlay-surface primitive → `<Sheet>`.

### Layer 12 — Permissions
- Route-level auth guard → `<ProtectedRoute>`.

## Acceptance gate (baseline tells)
- Section → `<GroupedListSection>`, each composing a `<SectionCard>`; inner table → `<ListWithDetailShell unstyled>`.
- Page-level toolbar slot → `<GroupedListShell>`'s `toolbar` prop.
