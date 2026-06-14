---
key: K
slug: grouped-list
kind: page
version: 1.0
promoted_from: hk-crm
promoted_at: 2026-05-22
source_spec_version: 1.0
status: locked
---

# Archetype K — Grouped list

## Purpose

A **grouped list** page is the variant of Archetype A used when a flat table would obscure a taxonomy the user wants to browse together. Instead of one table, the page renders **one mini-shell per group**, each headed by the group's name, with an optional trailing "ungrouped" section for rows whose taxonomy reference is missing or unmatched. Use this archetype whenever splitting the rows into separate pages would fragment a coherent browsing flow but a single flat table would lose the taxonomy structure (catalogues by category, employees by department, articles by topic, …).

K **inherits A's table contract**. Layers 6–10 (table, empty states, data, types, mutations) are delegated to the inner `<ListWithDetailShell>` and follow A's rules unchanged. The layers below specify only what differs from A or what the outer grouping wrapper adds on top.

## Reference primitive

`<GroupedListShell>` + `<GroupedListSection>` in `src/components/archetypes/grouped-list/`. The shell owns the outer container, the optional page-level toolbar slot, and the page-level empty state. Each `<GroupedListSection>` renders as a bounded `<SectionCard>` — a ruled title bar (group name + row count) over the group's table rendered flush inside the same card — so each group reads as one self-contained titled block, the same shape as a detail-overview `<DetailSection>`.

---

## Layer 1 — Route config

**Required:**
- Path: single-segment route (e.g. `/items`, `/articles`, `/products`). No nesting except dedicated detail or new sub-routes.
- Wrap in the project's auth guard (e.g. `<ProtectedRoute>`). No role requirement unless RBAC is in scope for the page.
- Lazy-import the page component when the framework supports it.

**Forbidden:**
- Static imports of grouped-list pages.

---

## Layer 2 — Page shell

**Required:**
- The page renders inside `<AppShell>` (baseline). The shell mounts providers; consumers do not re-mount them at the page level.
- Outer container: `<div className="space-y-6">` — **no page inset** (`AppShell`'s `<main>` supplies it), same as A. The `space-y-6` separates the page header band from the grouped content region; `<GroupedListShell>` supplies its own inner `space-y-8` between sections.
- `<ErrorBoundary>` wrapping page content at the page component level.
- The baseline `<PageHeader>` layout primitive (`@/components/layout`) for the title bar.

**Allowed variation:**
- Page-level React context provider — optional. Use only when filter or selection state is consumed by more than one child component tree.

**Forbidden:**
- Inline `<h1>` or custom header markup (use `<PageHeader>`).
- Missing `<ErrorBoundary>`.

---

## Layer 3 — Page header

The page header is **purely informational** — title, optional subtitle, optional icon. Action buttons live in the toolbar (Layer 4) so every interactive control sits in one functional band, not detached at the top of the page.

**Required (via `<PageHeader>`):**
- Title — always present. Rendered as `text-2xl font-semibold tracking-tight` (the canonical baseline title treatment).

**Allowed variation:**
- Subtitle — optional. Use when the title alone is insufficient to convey scope.
- Icon — optional, decorative; `h-6 w-6`.

**Forbidden:**
- Inline `<h1>` or custom header markup.
- Action buttons in the header or its `actions` slot. Page-level actions belong in the toolbar (Layer 4).

---

## Layer 4 — Toolbar

The toolbar renders as a prop of `<GroupedListShell>` (the `toolbar` slot), above the sections region. It is **page-level**, not per-section.

**Required when the toolbar is present:**
- Toolbar renders inside `<GroupedListShell>`'s `toolbar` slot, not above or below the shell.

**Allowed variation:**
- **Page-level add action** — right-aligned `<Button size="sm" variant="default">` with a leading `Plus` icon. At most one primary creation action per page.
- **Cross-section search** — search input (`max-w-sm flex-1`, left-aligned icon, `pl-9`) for filtering rows across every section by a shared substring. The primitive does not implement the filter; the consumer pre-filters each section's `rows` and `ungrouped` arrays before passing them to `<GroupedListShell>`. The search input is purely a controlled-value slot in the toolbar.
- **Status / category pill bar** — for filtering rows across sections by a shared categorical dimension. Pill chips, not a `<Select>` dropdown.
- **Result count** — `text-sm text-muted-foreground`, format: `{n} results`.

**Allowed shape — header-only (no toolbar):**
- A grouped-list page **may omit the toolbar entirely** when it has no cross-section search, no filters, and the only page-level action would be Add. In that case the Add action moves to `<PageHeader>`'s `actions` slot (this is the **one** exception to Layer 3's "no actions in header" rule — explicitly permitted for grouped-list when no toolbar is rendered, so the Add action isn't orphaned). Document the choice inline.

**Forbidden:**
- Per-section toolbars. A toolbar in one section but not others creates visual noise. Page-level toolbar only.
- Status filters rendered as `<Select>` dropdowns (use pill bar).
- Search inputs without the left-aligned icon.

---

## Layer 5 — Content wrapper

**Required:**
- `<GroupedListShell>` from `src/components/archetypes/grouped-list/`. The shell provides:
  - Optional toolbar slot rendered as a single card bar `rounded-lg border bg-card px-4 py-3 shadow-sm` (when `toolbar` is provided).
  - Sections region: `<div className="space-y-8">` — vertical rhythm between sections wide enough that each section reads as its own block.
  - Page-level empty state (rendered when `isEmpty` is true and not loading or erroring).
- One `<GroupedListSection>` per group, plus an optional trailing section for ungrouped rows. Sections are passed as children of `<GroupedListShell>`.

**Required per `<GroupedListSection>`:**
- Each group renders as a **bounded `<SectionCard>`**: the group title sits in a ruled overline title bar (the canonical `<SectionHeading>` signature) with a row-count `<Badge>` on the right, and the group's table renders **flush inside the same card**. The heading is bound to its content as one block — the same titled-section shape as detail-overview's `<DetailSection>`, not a heading floating above a detached card. `<GroupedListSection>` composes this automatically; consumers pass `title` + rows.
- Inner table — composes the baseline `<ListWithDetailShell unstyled>` (the `unstyled` flag drops the shell's own card chrome so it renders flush within the section card).

**Allowed variation:**
- **Section description** — an optional `description` line under the title in the bar. Use when the group title benefits from a one-line clarifier.
- **Hide the count** — set `hideCount` to drop the default row-count badge.
- **Custom title bar** — `renderHeader({ title, description, rowCount })` replaces the bar's default content (overline + count) with a dense header (sync indicator, status chip). It renders inside the same ruled bar.

**Forbidden:**
- Hand-rolled section markup. Always go through `<GroupedListShell>` + `<GroupedListSection>`.
- A section heading floating as plain text above a detached table card — the group is one bounded `<SectionCard>`.
- Section chrome styled per page. The `<SectionCard>` titled-section shape is uniform across archetypes.
- Page-level `max-width` on the grouped content region. Full-width.
- Wrapping `<GroupedListShell>` in an additional card (nested chrome).

---

## Layer 6 — Table / grid

**Delegated to the inner `<ListWithDetailShell>`.** Layer 6 of Archetype A applies unchanged within each section: shadcn `<Table>`, identifier-cell `text-primary hover:underline`, consumer-provided number and date formatters, shared `<Badge>` variants for categorical status, identifier-cell click for row selection.

**Grouped-list-specific clarification:**
- All sections on a single page **share one column configuration**. Different columns per section is out of scope for K — that's a separate archetype.
- Sortable columns sort **within a section**, not across sections. The consumer pre-sorts each section's rows; sort state is per-section if needed (rare).

---

## Layer 7 — Empty / loading / error states

The grouped-list page has **two empty/loading planes**: page-level (the whole page has nothing to show) and section-level (delegated to A's empty state per section, but in practice unused — see below).

**Page-level — required:**
- **Loading** — handled by `<GroupedListShell isLoading>`. Text-only "Loading…" centered with `p-8`. No skeleton screens.
- **Empty state** — handled by `<GroupedListShell isEmpty emptyMessage="…">`. Rendered when there are zero sections **and** zero ungrouped rows. Text-only, centered, query-dependent copy:
  - Search or filter active: `"No {things} match your search."`
  - No items at all: `"No {things} yet. {CTA hint if applicable}"`
- **Error state** — handled by `<GroupedListShell error={err} onRetry={…}>`. Renders the canonical load-error treatment (destructive `<Alert>` with `<AlertTitle>Something went wrong</AlertTitle>`, AlertTriangle icon, `error.message` or generic fallback, `p-4` wrapper — see README "Layer 7 — canonical state treatments") with an optional `w-fit` "Try again" button when `onRetry` is provided. The `isEmpty` condition must be gated with `&& !error`.

**Section-level — discouraged:**
- A section should never be rendered with zero rows. The consumer is expected to drop empty groups before building the `sections` array. If a section does render empty, its inner `<ListWithDetailShell>` will show A's empty state — visually a card with "No items yet" inside — which is correct but wasteful. Pre-filter on the data layer.

**Mutation errors** surface through the app-wide toast. Render-crash errors are caught by the page's `<ErrorBoundary>` (Layer 2).

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects the consumer to deliver an already-partitioned shape:

```ts
type GroupedListData<Group, Row> = {
  sections: Array<{
    id: string;             // stable section key
    group: Group;           // the taxonomy entity (or just { title: string })
    rows: Row[];
  }>;
  ungrouped?: Row[];        // optional trailing bucket
};
```

**Required props the consumer must provide:**
- `isLoading: boolean` — true while the initial fetch is in flight.
- `error: unknown | null` — any fetch error; `null` when healthy.
- `onRetry?: () => void` — called by the error panel's "Try again" button.
- `isEmpty: boolean` — true when the page has nothing to show (consumer-computed: `sections.length === 0 && (ungrouped?.length ?? 0) === 0`).

**Contract for the consumer's query hook:**
- Partition rows by group **upstream** of the primitive — either on the server (preferred for SSR / Server Component pages) or in a wrapping client component. Do not partition inside the primitive.
- Preserve the taxonomy's display order. The primitive renders sections in the order they are passed; the consumer chooses that order.
- Drop empty groups before building `sections`. The primitive does not filter.
- Apply a freshness window of at least 30 seconds for grouped-list queries (same as A).
- After any mutation affecting a row, re-fetch the page-level query (one fetch hydrates all sections; do not re-fetch per section).

---

## Layer 9 — Type shapes (contract)

**Required:**
- `<GroupedListSection>` is generic in `Row`: `GroupedListSection<Row>`. Multiple sections on a page share the same `Row` type.
- The "group" entity type is the consumer's concern; the primitive only uses `title: React.ReactNode` from each section (plus the optional `description` and `renderHeader`).
- Row types should derive from or be generated by the project's authoritative source.
- The grouped shape (`{ sections, ungrouped }`) is built inline in the consumer page component — there is no shared `Grouped<T>` helper in baseline.

**Forbidden:**
- Hand-written row types that duplicate a machine-generated schema.

---

## Layer 10 — Mutations & invalidation (contract)

**Delegated to the inner `<ListWithDetailShell>` per section.** A's Layer 10 applies unchanged: `onRowSelect` for primary identifier click, `rowActions` for per-row dropdown actions, consumer-owned mutations and invalidation.

**Grouped-list-specific:**
- Mutations may move a row between groups (e.g. recategorising a service). The consumer invalidates the page-level query key on success; the next render places the row in the correct section.
- Cross-section bulk operations (e.g. "Archive selected from any section") are out of scope for v1.0.

---

## Layer 11 — Mobile variant

**Required:**
- No dedicated `/mobile/...` route. The same route serves all viewports.
- Sections stack vertically on all viewports (the only layout — there is no side-by-side variant).
- Each section's inner `<ListWithDetailShell>` inherits A's mobile behaviour: table scrolls horizontally, detail-slot swap to `<Sheet>` if a `detail` element is passed (rare for grouped-list — detail navigation typically goes to a dedicated route).

**Extension points (not shipped in baseline v1.0 — consumer may add):**
- Sticky section headers on mobile — fixing the current section's `<h2>` to the top of the viewport while the user scrolls.
- Collapsible sections — toggle to hide a group's rows on tap.

---

## Layer 12 — Permissions

Permissions are out of the primitive's scope. The consumer controls who reaches the page.

**Required:**
- Route-level auth guard (e.g. `<ProtectedRoute>`) with no role requirement for standard grouped-list pages.
- No feature flags or read-only mode baked into the primitive.
- Row-level action visibility is driven by entity state, not by user role, unless RBAC is explicitly in scope.

**Extension point:**
- Role-based UI gating — add a `permissions?` prop to the consumer's page wrapper, not to the baseline primitive.

---

## Forbidden patterns

1. **Tree / nested groups.** Single level of grouping only. Sub-grouping is a separate archetype.
2. **Per-section toolbars.** Page-level toolbar only.
3. **Different column sets per section.** Heterogeneous columns belong in a separate archetype.
4. **Side-by-side sections on desktop.** Sections stack vertically on every viewport.
5. **Detail panel inside a section.** Grouped sections render the inner `<ListWithDetailShell>` with no `detail` slot. If a detail surface is needed, use a dedicated detail route.
6. **Partitioning inside the primitive.** Consumers partition upstream; the primitive only renders.
7. **Re-fetching per section.** One page-level query hydrates every section.
8. **Hand-rolled section markup.** Always compose via `<GroupedListShell>` + `<GroupedListSection>`.
9. **Raw ISO date or number strings in cells.** Delegated to A — always route through consumer-provided formatters.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behaviour without constituting drift.

**Allowed project extensions:**
- **Custom section header rendering** — `renderHeader?: (section) => React.ReactNode` on `<GroupedListSection>` overrides the default `<h2>`. Useful when a section header needs a row-count badge, a status indicator, or a sync action.
- **Collapsible sections** — wrap each section in a project-owned disclosure component. The primitive accepts arbitrary children; collapse is consumer-owned.
- **Cross-section search** — implement the filter in a wrapping client component; pass already-filtered `sections` and `ungrouped` to `<GroupedListShell>`. Wire the search input into the `toolbar` slot.
- **Sticky section headers on mobile** — consumer adds the sticky positioning via the `renderHeader` prop or by wrapping `<GroupedListSection>` in a sticky container.
- **Project-specific empty-state copy** — pass `emptyMessage` to `<GroupedListShell>`.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks (e.g. `useServices()` joined with `useServiceGroups()`).
- Domain-specific row types derived from the project's DB or API schema.
- The grouped-data partition logic (server-side filter loop, ungrouped fallback handling).
- Section ordering policy (alphabetical vs. taxonomy-defined vs. user-pinned).
- Business rules governing which row actions appear for a given entity state.
- Cross-resource invalidation topology.
