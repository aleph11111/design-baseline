---
key: K
slug: grouped-list
kind: page
version: 1.2
promoted_from: hk-crm
promoted_at: 2026-05-22
source_spec_version: 1.6
status: locked
---

# Archetype K — Grouped list

## Purpose

A **grouped list** page is the variant of Archetype A used when a flat table would obscure a taxonomy the user wants to browse together. Instead of one table, the page renders **one mini-shell per group**, each headed by the group's name, with an optional trailing "ungrouped" section for rows whose taxonomy reference is missing or unmatched. Use this archetype whenever splitting the rows into separate pages would fragment a coherent browsing flow but a single flat table would lose the taxonomy structure (catalogues by category, employees by department, articles by topic, …).

K **inherits A's table contract**. Layers 6–10 (table, empty states, data, types, mutations) are delegated to the inner **list-with-detail shell** and follow A's rules unchanged. The layers below specify only what differs from A or what the outer grouping wrapper adds on top.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (concrete
> primitives + Tailwind-4 class strings) lives in
> [`grouped-list.baseline.md`](./grouped-list.baseline.md). A project on a different
> stack adopts this contract without needing that file.

---

## Layer 1 — Route config

**Required:**
- Path: single-segment route (e.g. `/items`, `/articles`, `/products`). No nesting except dedicated detail or new sub-routes.
- Wrap in the project's **route-level auth guard**. No role requirement unless RBAC is in scope for the page.
- Lazy-load the page component behind the framework's **lazy-load boundary** when the framework supports it.

**Forbidden:**
- Static imports of grouped-list pages.

---

## Layer 2 — Page shell

**Required:**
- The page renders inside the project's **top-level app shell**. The shell mounts providers; consumers do not re-mount them at the page level.
- Outer container uses **the canonical vertical rhythm** for internal section spacing only — **no page inset** (the app shell's `<main>` region supplies it), same as A. This rhythm separates the page header band from the grouped content region; the grouped-list shell supplies its own inner **wide vertical rhythm** between sections.
- **A render-error boundary** wrapping page content at the page component level.
- The on-surface title bar — the grouped-list shell's `kicker`/`title`/`headerActions` props, rendered via the shared **on-surface header bar** (see Layer 3). There is no separate floating page header mounted above the shell.

**Allowed variation:**
- Page-level React context provider — optional. Use only when filter or selection state is consumed by more than one child component tree.

**Forbidden:**
- Inline `<h1>` or custom header markup (use the shell's `kicker`/`title`/`headerActions` props).
- Missing render-error boundary.

---

## Layer 3 — Page header

The page header no longer floats above the shell as a separate floating page-header primitive. The grouped-list shell mounts the shared **on-surface header bar** at the top of its outer container, above the toolbar and the sections region — the title bar sits ON the surface, driven entirely by shell props.

**Required (via shell props):**
- **`title`** — always present when the on-surface header renders, in the project's **canonical page-title type style** (supersedes the old floating page-header treatment).
- The bar follows **the header-fill contract** (three modes): brand-filled (default) fills the bar with the brand accent and inverts the title/kicker/action buttons to white; a quieter muted-tint step; and a hairline-border-only mode.

**Allowed variation:**
- **`kicker`** — optional overline above the title (e.g. "Catalog", "Library"), in the **canonical overline/kicker style**.
- **`headerActions`** — optional right-aligned small buttons, most commonly the page's single Add action (default/primary style, leading icon). `headerActions` renders whether or not a `toolbar` is also present (Layer 4) — the two slots are independent, so the Add action is never orphaned by omitting the toolbar (see Layer 4 "no toolbar").
- **`headerFill`** — a single shell instance may override the project's house header-fill mode.

**Forbidden:**
- Inline `<h1>` or custom header markup — always the shell's `kicker`/`title`/`headerActions` props.

---

## Layer 4 — Toolbar

The toolbar renders as a prop of the grouped-list shell (the `toolbar` slot), above the sections region. It is **page-level**, not per-section.

**Required when the toolbar is present:**
- Toolbar renders inside the shell's `toolbar` slot, not above or below the shell.

**Allowed variation:**
- **Cross-section search** — the shared **search-input molecule** for filtering rows across every section by a shared substring. The primitive does not implement the filter; the consumer pre-filters each section's `rows` and `ungrouped` arrays before passing them to the grouped-list shell. The search input is purely a controlled-value slot in the toolbar.
- **Status / category pill bar** — for filtering rows across sections by a shared categorical dimension, via the shared **one-of-N segmented control** — a pill row — not a dropdown select.
- **Result count** — in the **canonical muted small-text style**, format: `{n} results`.

**Allowed shape — no toolbar:**
- A grouped-list page **may omit the toolbar entirely** when it has no cross-section search and no filters. The page's Add action still renders — it lives in the shell's `headerActions` (Layer 3), which is independent of `toolbar`, so dropping the toolbar never orphans the Add action. This is the ordinary shape now, not a special-cased exception: `headerActions` is where the primary page-level action lives regardless of whether a toolbar is rendered.

**Forbidden:**
- Per-section toolbars. A toolbar in one section but not others creates visual noise. Page-level toolbar only.
- Status filters rendered as dropdown selects (use the segmented control).
- Hand-rolled search inputs — always compose via the shared search-input molecule.

---

## Layer 5 — Content wrapper

**Required:**
- **The grouped-list shell** — the archetype's content-shell primitive. The shell provides:
  - Optional toolbar slot rendered as a bare row with no card chrome, same as feed-inbox (standalone page toolbars are bare rows per STYLE.md; only toolbars *inside* a table card get the ruled toolbar band).
  - Sections region: the **wide vertical rhythm** between sections — wide enough that each section reads as its own block.
  - Page-level empty state (rendered when `isEmpty` is true and not loading or erroring).
- One section per group, plus an optional trailing section for ungrouped rows. Sections are passed as children of the grouped-list shell.

**Required per section:**
- Each group renders as a **bounded section-card**: the group title sits in a ruled overline title bar (the canonical section-heading signature) with a row-count badge on the right, and the group's table renders **flush inside the same card**. The heading is bound to its content as one block — the same titled-section shape as detail-overview's detail-section, not a heading floating above a detached card. The section composes this automatically; consumers pass `title` + rows.
- Inner table — composes **the list-with-detail shell** with `unstyled` set (the flag drops the shell's own card chrome so it renders flush within the section card).

**Allowed variation:**
- **Section description** — an optional `description` line under the title in the bar. Use when the group title benefits from a one-line clarifier.
- **Hide the count** — set `hideCount` to drop the default row-count badge.
- **Custom title bar** — `renderHeader({ title, description, rowCount })` replaces the bar's default content (overline + count) with a dense header (sync indicator, status chip). It renders inside the same ruled bar.

**Forbidden:**
- Hand-rolled section markup. Always go through the grouped-list shell and its section primitive.
- A section heading floating as plain text above a detached table card — the group is one bounded section-card.
- Section chrome styled per page. The section-card titled-section shape is uniform across archetypes.
- Page-level `max-width` on the grouped content region. Full-width.
- Wrapping the grouped-list shell in an additional card (nested chrome).

---

## Layer 6 — Table / grid

**Delegated to the inner list-with-detail shell.** Layer 6 of Archetype A applies unchanged within each section: the project's base table primitive, identifier cells rendered in the **brand/primary color with a hover underline**, consumer-provided number and date formatters, shared status-badge variants for categorical status, identifier-cell click for row selection.

**Grouped-list-specific clarification:**
- All sections on a single page **share one column configuration**. Different columns per section is out of scope for K — that's a separate archetype.
- Sortable columns sort **within a section**, not across sections. The consumer pre-sorts each section's rows; sort state is per-section if needed (rare).

---

## Layer 7 — Empty / loading / error states

The grouped-list page has **two empty/loading planes**: page-level (the whole page has nothing to show) and section-level (delegated to A's empty state per section, but in practice unused — see below).

**Page-level — required:**
- **Loading** — handled by the shell's `isLoading` prop, via the shared **state-view primitive** (loading variant) — the single owner of the loading/empty/error visual planes across grouped-list, list-with-detail, and settings-table. Text loader is the default; a **skeleton** (the `skeleton-loader` archetype) may be passed through the loading plane's skeleton override when this page's row shape is known ahead of the fetch. Never a full-page spinner.
- **Empty state** — handled by the shell's `isEmpty`/`emptyMessage` props (state-view, empty variant). Rendered when there are zero sections **and** zero ungrouped rows. Query-dependent copy:
  - Search or filter active: `"No {things} match your search."`
  - No items at all: `"No {things} yet. {CTA hint if applicable}"`
- **Error state** — handled by the shell's `error`/`onRetry` props (state-view, error variant), which owns the canonical load-error visual (**destructive alert**, title, icon, message) with a "Try again" button when `onRetry` is provided. The `isEmpty` condition must be gated with `&& !error`.

**Section-level — discouraged:**
- A section should never be rendered with zero rows. The consumer is expected to drop empty groups before building the `sections` array. If a section does render empty, its inner **list-with-detail shell** will show A's empty state — visually a card with "No items yet" inside — which is correct but wasteful. Pre-filter on the data layer.

**Mutation errors** surface through the app-wide toast. Render-crash errors are caught by the page's render-error boundary (Layer 2).

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
- **The section primitive** is generic in `Row`: `Section<Row>`. Multiple sections on a page share the same `Row` type.
- The "group" entity type is the consumer's concern; the primitive only uses a renderable `title` from each section (plus the optional `description` and `renderHeader`).
- Row types should derive from or be generated by the project's authoritative source.
- The grouped shape (`{ sections, ungrouped }`) is built inline in the consumer page component — there is no shared generic helper type for it.

**Forbidden:**
- Hand-written row types that duplicate a machine-generated schema.

---

## Layer 10 — Mutations & invalidation (contract)

**Delegated to the inner list-with-detail shell per section.** A's Layer 10 applies unchanged: `onRowSelect` for primary identifier click, `rowActions` for per-row dropdown actions (rendered via the shared **row-actions overflow menu**), consumer-owned mutations and invalidation.

**Grouped-list-specific:**
- Mutations may move a row between groups (e.g. recategorising a service). The consumer invalidates the page-level query key on success; the next render places the row in the correct section.
- Cross-section bulk operations (e.g. "Archive selected from any section") are out of scope for v1.0.

---

## Layer 11 — Mobile variant

**Required:**
- No dedicated `/mobile/...` route. The same route serves all viewports.
- Sections stack vertically on all viewports (the only layout — there is no side-by-side variant).
- Each section's inner **list-with-detail shell** inherits A's mobile behaviour: table scrolls horizontally, detail-slot swap to the **overlay-surface** primitive if a `detail` element is passed (rare for grouped-list — detail navigation typically goes to a dedicated route).

**Extension points (not shipped in baseline v1.0 — consumer may add):**
- Sticky section headers on mobile — fixing the current section's `<h2>` to the top of the viewport while the user scrolls.
- Collapsible sections — toggle to hide a group's rows on tap.

---

## Layer 12 — Permissions

Permissions are out of the primitive's scope. The consumer controls who reaches the page.

**Required:**
- **Route-level auth guard** with no role requirement for standard grouped-list pages.
- No feature flags or read-only mode baked into the primitive.
- Row-level action visibility is driven by entity state, not by user role, unless RBAC is explicitly in scope.

**Extension point:**
- Role-based UI gating — add a `permissions?` prop to the consumer's page wrapper, not to the primitive.

---

## Forbidden patterns

1. **Tree / nested groups.** Single level of grouping only. Sub-grouping is a separate archetype.
2. **Per-section toolbars.** Page-level toolbar only.
3. **Different column sets per section.** Heterogeneous columns belong in a separate archetype.
4. **Side-by-side sections on desktop.** Sections stack vertically on every viewport.
5. **Detail panel inside a section.** Grouped sections render the inner **list-with-detail shell** with no `detail` slot. If a detail surface is needed, use a dedicated detail route.
6. **Partitioning inside the primitive.** Consumers partition upstream; the primitive only renders.
7. **Re-fetching per section.** One page-level query hydrates every section.
8. **Hand-rolled section markup.** Always compose via the grouped-list shell and its section primitive.
9. **Raw ISO date or number strings in cells.** Delegated to A — always route through consumer-provided formatters.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behaviour without constituting drift.

**Allowed project extensions:**
- **Custom section header rendering** — a `renderHeader` callback on the section primitive, returning a renderable node in place of the default `<h2>`. Useful when a section header needs a row-count badge, a status indicator, or a sync action.
- **Collapsible sections** — wrap each section in a project-owned disclosure component. The primitive accepts arbitrary children; collapse is consumer-owned.
- **Cross-section search** — implement the filter in a wrapping client component; pass already-filtered `sections` and `ungrouped` to the grouped-list shell. Wire the search input into the `toolbar` slot.
- **Sticky section headers on mobile** — consumer adds the sticky positioning via the `renderHeader` prop or by wrapping each section in a sticky container.
- **Project-specific empty-state copy** — pass `emptyMessage` to the grouped-list shell.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks (e.g. `useServices()` joined with `useServiceGroups()`).
- Domain-specific row types derived from the project's DB or API schema.
- The grouped-data partition logic (server-side filter loop, ungrouped fallback handling).
- Section ordering policy (alphabetical vs. taxonomy-defined vs. user-pinned).
- Business rules governing which row actions appear for a given entity state.
- Cross-resource invalidation topology.

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

- [ ] **One section per group**, each a bounded section-card (ruled title +
      count) with the inner table (the list-with-detail shell, flush) rendered inside
      it — **no** nested card chrome, no hand-rolled section markup.
- [ ] **Page-level toolbar only** (the shell's `toolbar` slot), not per-section
      toolbars. The Add action lives in the shell's `headerActions` (Layer 3) regardless
      of whether a toolbar is rendered — never a hand-placed button above the shell.
- [ ] **No empty sections rendered** — groups pre-filtered on the data layer.
- [ ] **No detail panel inside a section** — detail goes to a route.
- [ ] **[spine] S1–S6** (inherits A's table contract unchanged).
