---
slug: list-with-detail
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/list-with-detail.md
---

# List with detail — baseline reference implementation

> The stack-specific binding of the [list-with-detail contract](./list-with-detail.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<ListWithDetailShell>` in `src/components/archetypes/list-with-detail/`. Composes `<ListWithDetailToolbar>` (filters, search, page-level actions) and `<ListWithDetailEmptyState>` (empty / loading / error views). The detail panel or detail route is consumer-owned (slot prop or navigation callback).

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Route config
- Route-level auth guard → `<ProtectedRoute>`.
- Lazy-load boundary → `const Page = lazy(() => import('./pages/Page'))` wrapped in `<Suspense fallback={null}>` at the route definition.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>` from `src/components/layout/`. As of baseline v1.0, `<AppShell>` mounts `TooltipProvider`, `SidebarProvider`, `<Toaster>`, and `<Sonner>`, so those providers are always in the tree by the time a list-with-detail page renders. Consumers do not re-mount them at the page level.
- Vertical rhythm / no page inset → outer container `<div className="space-y-6">`. `AppShell`'s `<main>` supplies the inset (adding `px-6 py-6` here double-insets); the `space-y-6` is internal rhythm only.
- Render-error boundary → `<ErrorBoundary>`.
- On-surface header bar → `<SurfaceHeader>` (see Layer 3), mounted by the shell via its `kicker`/`title`/`headerActions` props; there is no separate `<PageHeader>` above the shell.

### Layer 3 — Page header
- On-surface header bar → the shared `<SurfaceHeader>` (`src/components/layout/SurfaceHeader.tsx`), mounted by `<ListWithDetailShell>` at the top of its one bounded card.
- Canonical page-title type style → `<SurfaceHeader>` renders `title` as `text-lg font-semibold` (the current Plex Ledger title scale — supersedes the old `text-2xl font-semibold tracking-tight` `<PageHeader>` treatment). Embed any ID/number figure with `font-mono` at the call site.
- Header-fill contract → `HeaderFillContext` (`src/components/layout/headerFill.ts`): `solid` (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; `tint` is a quieter `bg-muted` step; `white` is hairline-border-only. Status `<Badge>`s passed into `headerActions` are never inverted, even on `solid`.
- Overline/kicker style → the shared `OVERLINE_CLASS`.
- Header action buttons → `<Button size="sm">`; `variant="outline"` for secondary actions, default variant for the primary creation action.

### Layer 4 — Toolbar
- Search-input molecule → `<SearchInput>` (`ui/search-input` — `inputSize`/`clearable`/`count` props).
- Result count style → `text-sm text-muted-foreground`.
- One-of-N segmented control → `<SegmentedControl>` (`ui/segmented-control`). Default status-filter control.
- Status filter as a select (conditional — large enum or multi-dimension toolbar, see spec Layer 4) → `<Select>` (`ui/select`).
- Global action buttons → `size="sm"`, leading icon; variant `default` for the single primary creation action, `outline` for secondary.

### Layer 5 — Content wrapper
- Content shell → `<ListWithDetailShell>` from `src/components/archetypes/list-with-detail/`, providing:
  - Bounded card → the canonical `<SurfaceFrame>` chrome (`overflow-hidden rounded-lg border bg-card` — flat, no shadow; owned by `SurfaceFrame`, never spelled by a shell)
  - Toolbar slot, rendered by the frame as the ruled `border-b px-4 py-3` band
  - Body with `overflow-x-auto`
  - Loading, empty, and error slots (handled by `<ListWithDetailEmptyState>`)
  - Row-level `hover:bg-muted/50`

### Layer 6 — Table / grid
- Base table primitive → shadcn/ui `<Table>` (`src/components/ui/table`).
- Monospace identifier style → `font-mono text-sm font-medium` via `identifierMono: true`; **off by default** — set it only for alphanumeric-code / slug identifiers, omit it for human-readable name identifiers (the sandbox demo passes explicit `identifierMono: false` for its name ledger).
- Clickable primary identifier cell → `text-primary hover:underline` (plus `font-mono text-sm font-medium` when `identifierMono`), `cursor-pointer` + `focus-ring`, keyboard-operable (`role="button"` + `tabIndex=0`, Enter/Space fire the row-select handler) — rendered `text-primary` at rest. The recipe is shared with settings-table through `archetypes/shared` (`TableColumn` / `identifierCell`), so the two archetypes' identifier cells render the same mono scale (`text-sm`) and honour the same `identifierMono` default.
- Multi-line supporting line → `text-xs text-muted-foreground`.
- Presentation variant → `<ListWithDetailShell presentation="table | card-grid | action-row">` (keyed by the row's data shape — see the contract's decision table in Layer 6).
- Column alignment → `align` on a `ListColumn`; `align="right"` for numerical / monetary / date / count columns, `align="center"` for status / category / token columns, `align="left"` (default) for anything else.
- Categorical status → a shared `<Badge>` variant (color map in a shared file).
- Binary toggle dot → `bg-primary` (on) / `bg-muted-foreground` (off); never a literal palette color (`bg-green-500`) at the call site — semantic raw-color mappings live only inside owning primitives (`badge.tsx`, calendar tones).

### Layer 7 — Empty / loading / error states
- State-view primitive → `<StateView>` (`ui/state-view`), the single owner of the loading/empty/error planes across list-with-detail, settings-table, and grouped-list; adapted here by `<ListWithDetailEmptyState mode="loading | empty | error">`.
- Destructive load-error visual → `<StateView variant="error">` renders a destructive `<Alert>` (title, icon, message) with an optional `variant="outline" size="sm"` "Try again" button when `onRetry` is given.
- Empty-state icon → optional decoration, `h-12 w-12`, centered above the empty text.

### Layer 8 — Data fetching
- Flush-surface composition → the shell's own chrome is unconditional for a standalone page. A composing archetype that owns an already-bounded surface (e.g. `<SectionCard flush>` in a grouped-list group) wraps the inner `<ListWithDetailShell>` in `ListChromeContext.Provider value={true}` (the internal chrome-suppression context mirroring detail-overview's `UnifiedSurfaceContext`). The page never passes a flush flag.

### Layer 9 — Type shapes
- Generic shell → `ListWithDetailShell<Row extends object>`.
- Shared types directory → `src/types/` (page-local aggregate types live next to the page instead).

### Layer 10 — Mutations & invalidation
- Row-actions overflow menu → `<RowActionsMenu>` (`archetypes/shared`), the single owner of the row-level `⋯` overflow trigger, shared byte-for-byte with settings-table.

### Layer 11 — Mobile variant
- Table body → stays a standard `<Table>`; the content wrapper's `overflow-x-auto` scrolls it on narrow viewports.
- Viewport-breakpoint hook → internal `useIsMobile`.
- Mobile detail overlay → `<Sheet>` (full-screen overlay) on mobile — the `detail` prop renders as a right rail on desktop, always a `<Sheet>` on mobile. There is no page-facing axis to opt into the desktop overlay.
- Overlay dismissal → `onDetailClose?: () => void` on `<ListWithDetailShell>`, fired from the Sheet's `onOpenChange` (Esc / backdrop / close button) when `detail` renders as a Sheet (mobile). `<SheetContent>` also gained `showCloseButton?: boolean` (default `true`) for consumers that ship their own close affordance.
- Header fill → the Sheet's header bar is the shared `<SurfaceHeaderBar>` (canonical `px-5 py-4`, the `hfc.bar` fill) following `HeaderFillContext` (`src/components/layout/headerFill.ts`), 3 modes (solid / tint / white); the `SheetTitle` renders inside its left block so the bar's `[&_h1,h2]` inversion reaches it. The actions row clears the Sheet's built-in close button (a structural `pr-8` on the bar's actions row).

### Layer 12 — Permissions
- Route-level auth guard → `<ProtectedRoute>`.

## Acceptance gate (baseline tells)
- Shell → `<ListWithDetailShell presentation=…>`; a hand-rolled grid of `<Card>`s fails "one shell owns the list chrome".
- Identifier click target → `text-primary hover:underline`.
- Toolbar search → the shared `<SearchInput>` molecule, not a raw `<input>`.
