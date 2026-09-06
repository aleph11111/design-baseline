---
key: F
slug: statement-with-filters
kind: page
version: 1.1
promoted_from: controlling-app
promoted_at: 2026-08-19
source_spec_version: 1.0
status: locked
---

# Archetype F — statement-with-filters

A **statement-with-filters** page presents one **read-only financial statement
or comparison table** under a **heavy filter/selector toolbar** that re-scopes
the whole statement. The toolbar is the page's primary interaction — a set of
scoping selectors (scenario / period / view-or-structure / unit) that together
decide which computed statement the table shows. The governed table is a
**read-only document of figures** (a statement, a comparison, a variance): the
page's job is to *present* a computed statement, not to browse individual
rows, edit cells, or navigate to a detail view.

Promoted from controlling-app, where this shape recurs across five independent
`workspace/*` pages (overview, reconciliation, variance, cashflow-builder,
liquidity) — well past the rule-of-2 bar the `import-wizard` (`W`) promotion
cleared from the same repo. It fills the "financial-statement-with-filters /
read-only ledger report" donor gap recorded in that fleet's archetype page-map
("Donor-gap-to-promote-upstream" item 1).

**What makes it distinct** (why the four closest contracts all reject it):

- Not **R (report)** — R is a single *bounded* document with **no toolbar**;
  this shape's whole point is the toolbar re-scoping a wide statement.
- Not **M (matrix-grid)** — M requires a genuine two-domain-entity axis (rows
  *and* columns are entities); here the columns are fixed statement figures and
  the "second axis" is a set of filter selectors, not a second entity.
- Not **A (list-with-detail)** — A is a row-collection browser with per-row
  navigation/inline-edit; the clean members of this shape have neither.
- Not **G (analytics-dashboard)** — G requires a stat-tile row + a widget grid;
  this shape is one governed statement.

> **Reference implementation.** This file is the **stack-agnostic contract** —
> every rule names a *role*, not a primitive. The baseline-stack binding
> (concrete primitives + Tailwind-4 class strings) lives in
> [`statement-with-filters.baseline.md`](./statement-with-filters.baseline.md).
> A project on a different stack adopts this contract without needing that file.

## Structure

Two zones, in document order:

**1 — Toolbar band** (the page header's actions region, right-aligned)
- The canonical page header: `title` (+ optional `description`) and a
  right-aligned **actions** region.
- The **filter/selector toolbar** lives in the actions region — a horizontal
  composition of the statement's independent scoping selectors. It is the
  page's single interactive band; there is no second, hand-rolled selector row
  between the header and the statement.
- Each selector re-scopes the **whole** governed statement (the fetch depends
  on the full selector tuple), not a subset of its sections.

**2 — Governed statement** (the bounded report surface, full-bleed within the
page column)
- A **read-only** table of computed figures: fixed column headers, row
  grouping/indentation where useful, optional totals rows.
- Numeric figures render right-aligned in the **canonical monospace
  tabular figure style**; labels stay in the canonical sans text style.
- The statement component owns its own columns and cell rendering; the page
  owns the toolbar + the fetch. There is no rail, no row-action menu, no
  inline cell editing.

There is no search input (the selectors are *view-scoping*, not row-filtering —
that is A's contract), no per-row navigation, and no inline editing (the
read-only rule is the archetype's defining boundary).

---

## Layer 1 — Route config

**Required:**
- Single-segment resource route (e.g. `/workspace/variance`), asset-scoped,
  wrapped in the project's asset/workspace guard.
- The page module may be a client component (the donor ships no
  server-fetching convention); loading lives in the page, not a route-level
  `loading.tsx`.

**Forbidden:**
- A route param selecting the *statement type* (the type is a toolbar selector,
  not a URL segment — switching statements keeps the page/route stable).

## Layer 2 — Page shell

**Required:**
- The project's top-level app shell (its main region supplies the page inset;
  the page adds none).
- A render-error boundary wraps the page content; the toolbar and the
  statement load inside it.
- A thin page guard + inner-component split: the outer page narrows the
  selected asset, an inner component takes the asset id as a prop so the data
  logic never re-checks the guard.

**Forbidden:**
- Re-applying the workspace guard, the inset, or the error boundary at the
  inner-component level.

## Layer 3 — Page header

**Required:**
- Title via the project's canonical page-header primitive (one header, one
  `actions` region).
- The **filter/selector toolbar renders in the header's `actions` region** — a
  single right-aligned composition of the scoping selectors (plus, where
  present, a page-level action of the *allowed-variation* kind, e.g. a freeze).
- The header is purely the scoping band: it never interleaves document
  actions inside the statement.

**Forbidden:**
- A second selector row hand-rolled between the header and the statement.
- Native `alert()`/`prompt()` from a selector; errors surface through the
  app-wide toast.

## Layer 4 — Toolbar (the statement selectors)

The toolbar is the archetype's signature layer.

**Required:**
- One or more independent **scoping selectors**, each an independent
  controlled control (a labeled **select**, a **segmented toggle**, a custom
  report-selector, or a **decimal/figure toggle**) that feeds the data fetch.
- The selectors are *view-scoping*: together they decide **which** computed
  statement is shown (scenario / period / view-or-structure / unit). Changing
  any selector invalidates the current selector tuple and re-fetches.
- The **selector tuple** is the page's single source of "which statement am I
  showing": one small object, passed both to the controls (controlled) and to
  the fetch.

**Allowed variation:**
- The **set** of selectors is page-specific (a cashflow page may carry five;
  a variance page two). A toolbar may additionally carry a page-level
  **action** in the same band (a freeze / publish toggle) when the statement
  has one.
- A headline-number row (stat tiles) directly above the statement is allowed
  when it is driven by the same selector tuple.

**Forbidden:**
- A selector that re-scopes only part of the body while other sections stay
  static (the fetch must depend on the full tuple).
- Row-filtering controls masquerading as scoping selectors (a search input /
  row filter is A's layer-4 contract, not this archetype).

## Layer 5 — Content wrapper

**Required:**
- The governed statement renders directly in the page body, inside a single
  flat bounded card where a bordered surface is wanted.
- The page owns nothing between the toolbar and the statement — no inner
  chrome, no nested card, no wrapper with its own padding.

**Forbidden:**
- A hand-rolled wrapper card that duplicates the shell's inset or border.

## Layer 6 — Table / grid (the governed surface)

**Required:**
- **Read-only.** The statement presents computed figures; no inline `<input>`
  / `<select>` / `<textarea>` for editing a figure in a cell.
- Numeric cells right-aligned in the **canonical monospace figure style**
  (mono + tabular); header labels in the canonical table-column-header
  overline style; row labels in the canonical sans text style.
- The statement component owns column headers, grouping/indentation, totals
  rows, and horizontal scrolling of the table body.

**Indent keying rule.** A row's indent step is **the row's own depth in the
statement's `group → children` data**, capped at 2 — derived, not inherited
(ADR-0004): it follows from where the row sits in the computed statement's tree,
never from the call site's taste. The mapping is exhaustive:

- **`0`** — a **top-level row**: a row with no parent group (a flat statement's
  every row, and a tree statement's outermost group and its sibling rows).
- **`1`** — a **child of a top-level group**: the first nested tier.
- **`2`** — a **grandchild or deeper**: the terminal step. A statement nested
  deeper than three tiers does not keep indenting — depth ≥ 2 renders at `2`, so
  the label column stays readable and the step set stays closed.

**Allowed variation:**
- A tree of statement rows (group → children) is permitted where the statement
  type is hierarchical (a cashflow statement); the table stays read-only. Its
  rows take their indent from the indent keying rule above, not per row.

**Forbidden:**
- Inline cell editing of any figure.
- A second selector row rendered inside the statement component (selectors
  belong to the page header).
- Multiple statements on one route; each statement view is its own page.

## Layer 7 — Empty / loading / error states

**Required:**
- **Loading** — the canonical text-only loader (or the `Sk skeleton-loader`
  when the row shape is known ahead of the fetch — a statement's column shape
  is known, so a skeleton is the sanctioned alternative).
- **Error** — the shell-level destructive alert treatment (the statement is a
  full-width data surface); `isEmpty` is gated so a failed fetch never renders
  as "empty".
- **Empty** — a computed statement that legitimately has no rows is a distinct,
  intentional empty state with the canonical empty-state styling.

**Forbidden:**
- Silently swallowing a failed statement fetch.

## Layer 8 — Data fetching (contract)

**Required:**
- Reads via the project's central data client, keyed on the asset id **plus
  the full selector tuple** from the toolbar.
- The response is the pre-computed statement shape (rows / columns of figures);
  the page holds no statement math — the server computes it (the donor ships
  no compute; this is a project data-layer contract).
- The fetch is re-issued exactly when the selector tuple changes.

**Forbidden:**
- Fetching with only a subset of the active selectors (stale re-scoping).
- Client-side re-derivation of statement line totals.

## Layer 9 — Type shapes (contract)

**Required:**
- A typed statement response per statement (columns + rows of figures); the
  page state holds that concrete type, not `any`.
- The **selector tuple** is a named object (`{ scenario, period, view, unit, …
  }`) — one type shared by the toolbar controls and the fetch call.

**Forbidden:**
- `any` on the statement response or the tuple.

## Layer 10 — Mutations & invalidation (contract)

**Required:**
- The statement rows mutate nothing. The only permitted mutation is the
  *allowed-variation* toolbar **action** (e.g. a freeze toggle), which
  invalidates the page's own statement refetch, not the table rows.

**Forbidden:**
- Per-row create/edit/delete inside the governed table (that is A/K).

## Layer 11 — Mobile variant

**Required:**
- The selector toolbar wraps (controls reflow; no horizontal scroll of the
  control band on a narrow viewport).
- The governed statement scrolls horizontally within its own wrapper.

**Forbidden:**
- Hiding selectors on a narrow viewport (the scoping must remain available).

## Layer 12 — Permissions

**Required:**
- Same as the sibling workspace pages: role/asset gating via the project's
  asset guard and tenant context; no page-specific role requirement unless the
  statement is genuinely restricted.

---

## Acceptance gate

> A statement-with-filters page is **conformant** when every REQUIRED box
> passes; it is a 🔴 wrapper adoption when it fails any.

- [ ] **One scoping band.** All selectors render in the page header's `actions`
      region — a single right-aligned composition, never a hand-rolled selector
      row between the header and the statement.
- [ ] **Full-tuple re-scoping.** Every selector re-scopes the **whole**
      governed statement; the fetch depends on the full selector tuple.
- [ ] **Read-only statement.** No inline editing of any figure in the table.
- [ ] **Canonical figure style.** Numbers right-aligned, mono + tabular; column
      headers in the canonical overline style; labels sans.
- [ ] **One statement per route.** A single governed statement renders; no
      second statement stacked on the same route.
- [ ] **Canonical states.** Loading / error / empty use the canonical Layer 7
      treatments (a skeleton is allowed — the shape is known).
- [ ] **Single source of the tuple.** The selector tuple is one named object
      shared by the controls (controlled) and the fetch.
