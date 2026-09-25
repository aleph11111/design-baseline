---
key: C
slug: detail-overview
kind: page
version: 3.1
promoted_from: hk-crm
promoted_at: 2026-05-23
source_spec_version: 1.6
status: locked
---

# Archetype C — Detail Overview

> **v3.1 (2026-09-25) — promoted from mistra's fork.** The standalone header
> may carry a back link through the shared page-header back-link adapter
> (Layer 6 header). A bounded section may be collapsible — a behaviour, not a
> look: the title bar becomes the disclosure toggle (Layer 6c). Additive; no
> breaking change.
>
> **v3.0 (2026-08-17) — the shell API closes (archetype-convergence Phase 1,
> proof case).** The container model is **unified only**: the `surface` prop is
> deleted and the shell renders one bounded outer frame unconditionally ("the
> hybrid" is now *the* model, not a mode), and the per-page `headerFill`
> override is gone — the header-fill axis is a closed project context, set
> once at the top-level app shell, read by the shell. `rhythm` is deleted
> (its "choose a compact measure for short pages" set no threshold the two
> readers could agree on) and `className` is deleted (it reconstituted the
> deleted surface modes and is invisible to the lint). The appearance-bearing
> `header` and `stats` slots are replaced by **typed data**: Mode B's
> on-surface title is now the `title` / `subtitle` / `badges` / `actions`
> props, rendered by the shell through the canonical fixed-scale nested-page
> heading (Mode B's section-level heading is now a **required** role, not a
> "may"); the aggregate strip is `stats` data the shell renders as the
> stat-tile row, deriving its column count from the data's length instead of a
> hand-matched column prop. Kept: `layout` (keyed to entity density), `width`
> (keyed to wide tables; its default is corrected to the record-page default
> — the contract always stated that, the code shipped the exception column),
> and the composed `summary` / `content` / `references` slots. The "Surface
> variant" section is deleted; the acceptance gate's outer-frame box now
> scores the unconditional frame. Deliberate breaking change; the lint
> ratchet for this class is engaged in the same pass (see
> `_adherence.NOTES.md`).
>
> **v2.5 (2026-07-03) — board-form / house-style sync.** Corrected the Mode A
> header description to match the canonical page-header treatment's actual
> title scale (the current compact style, not the previous larger tracked
> scale — the primitive was narrowed in a prior pass but this spec wasn't
> updated). The `surface="unified"` framed header now documents the
> header-fill contract it already renders through (default: brand-filled).
> The S5 acceptance-gate box now requires the canonical tabular-figure style
> for figures, matching the baseline's house-style mono-figure adoption
> (STYLE.md, 2026-06-21 Plex Ledger amendment) rather than "aligned, mono not
> required". No API change.
>
> **v2.4 (2026-06-22) — header status badges.** The detail-overview header
> (and the canonical page-header treatment it wraps) gain a `badges` slot —
> read-only status badges inline next to the title. This is the archetype's
> **one home for status** (the acceptance gate's status-once rule): an
> entity's status dimensions live here, not duplicated in the rail or a
> content band. Additive, backward-compatible. See Layer 3.
>
> **v2.3 (2026-06-21) — the unified-surface variant (hybrid).** The shell
> gains a `surface` prop (`"separated"` default | `"unified"`), orthogonal to
> `layout`. `"unified"` wraps the record in **one bounded outer frame**: the
> **rail** renders chromeless + hairline-divided + tinted (its detail
> sections drop card chrome via a rail-scoped chrome-suppression mechanism;
> the card/section-card surface gains a chrome-suppression mode), while the
> **main** keeps its carded sections inside the frame. The cohesion comes
> from the frame, not from stripping every card — making everything
> chromeless was an over-application a measured reference corrected. The
> cohesive pairing for dense record pages is `layout="rail" surface="unified"`.
> Additive, backward-compatible (default unchanged). Two new shared layout
> primitives ship alongside for the rail's vocabulary: a lifecycle/pipeline
> stepper (for ordered stages) and a compact metric-list primitive (the
> "figures at a glance" readout). The acceptance gate gains a "One bounded
> surface, not a card scatter" REQUIRED box, and S5 is restated as *aligned*
> (tabular) rather than *mono* figures. See "Surface variant" below.
>
> **v2.1 (2026-06-21) — the Command Rail variant.** The shell gains a second
> sanctioned layout, `layout="rail"` (default still `"vertical"`): a sticky
> left identity rail (`summary` + `references`) beside a scrolling main
> column (`stats` + `content`) on wide viewports, collapsing to the exact
> canonical vertical order on narrow viewports. This reverts v2.0's blanket
> prohibition on horizontal layouts — but *only* through this shell-owned
> variant; ad-hoc sidebars and hand-rolled columns stay forbidden. The slot
> model, story order, taxonomy, data contract, and graded surfaces are all
> unchanged; the rail only changes how the same ordered slots are placed in
> 2D on wide viewports. Additive, backward-compatible (no API removed,
> default unchanged). See "Layout variants — vertical & Command Rail" below.
>
> **v2.0 (2026-06-12) — fixed-blueprint upgrade.** The shell now owns the
> page layout via named slots in a canonical order (header → summary → stats
> → content → references: master data, then aggregates, then transactional
> data); free-form children were removed, and every zone below the header is
> a bounded detail-section surface — no naked sections. Order and anchoring
> were settled in a rendered design review (2026-06-12), not from spec text
> alone. Compliant pages in different applications now share one recognizable
> layout, and layout iterations are a single-file change to the shell / the
> detail-section primitive that propagates by a package tag bump.
> Breaking primitive API change (v1.x pages must move their sections into
> slots). A second rendered review settled the **ledger design**: ruled
> master-data rows (the key-value list primitive replaces the k/v grid),
> overline section title bars as the cross-app signature, ONE unified stat
> strip with internal dividers, and graded surface weights (shadowed data
> sections, flat strip, muted references). See the layout blueprint
> documented in the baseline reference implementation.

## Purpose

A **detail-overview** page shows everything a user needs to understand a single
already-resolved entity: stat tiles, key/value summaries, embedded read-only
tables, reference panels, and small in-context control widgets. The entity is
resolved from a route param (`/:resource/:id` or a nested `/:resource/:id/...`
sub-route); the page does not list, filter, or paginate — those belong to
archetype A (list-with-detail).

Use this archetype whenever a route's primary job is to display **one** record
in depth. Examples: an entity overview, a deal/opportunity detail, a sub-section
under a record's tab nav.

Do **not** use this archetype for:

- **Edit forms** — use archetype B (form-page); the page is built around a
  form primitive wrapping controlled fields.
- **Lists of any kind** — use A (list-with-detail).
- **Modal-shaped detail** — use J (crud-dialog) when the detail lives in an
  overlay surface (sheet/modal) rather than at a dedicated route.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/detail-overview`; the prop surface is the API and the sandbox demo (`src/examples/detail-overview-demo.tsx`) is the gallery reference.

## Canonical slot order

Every detail-overview page presents its slots in this fixed order — this is
what makes the archetype *recognizable across applications*: the eye finds the
same information in the same place everywhere. The order tells the entity's
story: **master data** (what this is), then **aggregates** (how it's doing),
then **transactional data** (what happened), then references.

| # | Slot | Required content | Omit when |
|---|------|------------------|-----------|
| 1 | `header` | the detail-overview header — Mode A: the standalone header above the shell (title + right-aligned actions); Mode B: the shell's own nested-page header (the `title` data prop + `subtitle`/`badges`/`actions` — see Layer 3) | Mode A — standalone |
| 2 | `summary` | master data: a detail section (typically titled "Details", flush) wrapping a key-value list of ruled rows, including categorical chip attributes | the page is purely metric/tabular |
| 3 | `stats` | aggregates: the stat-tile strip of 2–4 cells, rendered by the shell from the `stats` data (one cell per item) | the entity has no headline metrics |
| 4 | `content` | transactional data: embedded read-only lists/tables and read-write islands, each in its own detail section | nothing beyond the summary exists |
| 5 | `references` | a detail section of cross-entity links, related records, external resources | no references exist |

**Everything below the header is bounded.** Each slot's content renders inside
a detail-section surface (stat tiles carry their own card-style tile
boundary). Naked content floating between bounded neighbours is the archetype's
defining anti-pattern — it is what makes a page stop reading as structured.

**Omit, never reorder.** A page that wants its references above its stat tiles
is not a compliant detail-overview — either the content is mis-classified
(those "references" are really slot-4 content) or the page needs a different
archetype. The slot API makes reordering structurally unavailable rather than
merely forbidden.

---

## Layout variants — vertical & Command Rail

The archetype has **two sanctioned layouts**. Both render the *same* named
slots in the *same* canonical story order (master data → aggregates →
transactional → references); they differ only in how the slots are placed in 2D
on wide viewports. Choose with the `layout` prop on the detail-overview shell.

### When to use which

| Entity profile | Layout |
|---|---|
| Dense + transactional + financial — **orders, deals/opportunities, invoices** | **`layout="rail"`** |
| Light / early-stage — **leads, inquiries, simple contacts** | **`layout="vertical"`** (default). Rail is *allowed* but mostly empty — prefer vertical. |
| Any entity below the wide-viewport breakpoint | Rail **auto-collapses to vertical** (see "Responsive contract") |

Rule of thumb: if the page has ≥ 2 headline metrics **and** a long
transactional body, use the rail. Otherwise stay vertical.

### Rail slot placement (wide viewports)

The header spans full width as a top bar. The remaining slots split across two
columns; **reading order is preserved** — rail top→bottom, then main
top→bottom, tells the same story.

```
┌───────────────────────────────────────────────────────────┐
│  header  (back · breadcrumb · status badges · actions)      │  full width
├───────────────┬───────────────────────────────────────────┤
│  RAIL (aside) │  MAIN (scrolls)                             │
│  ~300px,sticky│   stats        (stat-tile row — aggregates) │
│  summary      │   content[0…n] (transactional islands)      │
│   (master     │                                             │
│    data +     │                                             │
│    compact    │                                             │
│    metrics)   │                                             │
│  references   │                                             │
└───────────────┴───────────────────────────────────────────┘
```

| Slot | Rail placement |
|---|---|
| `header` | Mode B only: the frame's full-width top bar — the nested-page header (`title` + `badges` + `actions` data). In Mode A the page's standalone header sits above the frame and is not part of it. |
| `summary` | **Aside** — master-data key-value list + an optional compact metric readout (see note). Sticky on wide viewports. |
| `stats` | **Main**, top — the stat-tile row. *May be omitted* when its 2–4 metrics are surfaced as the rail's compact readout instead (recommended for the rail variant, to avoid duplication). |
| `content` | **Main** — the transactional sections in declaration order |
| `references` | **Aside**, bottom (documents, linked records, external links) |

**Compact metric readout (rail).** In the rail variant the `summary` slot may
lead with a condensed, ruled metric list (label left, tabular value right, a
"show more" disclosure for secondary figures) instead of the full stat-tile
row — the "financials at a glance" affordance. It is still `summary`-slot
master data, still ruled rows, **no new primitive**. Because `summary` is
rendered once and placed into both the sticky aside (desktop) and the
canonical vertical flow (mobile), keep it presentation-only — stateful edit
islands belong in `content`, not in `summary` or `references`.

### Responsive contract (the compliance keystone)

On narrow viewports, `layout="rail"` **collapses to the canonical vertical
order**: `header → summary → stats → content → references`. The rail is
purely a wide-viewport reflow of the same ordered slots; it never introduces a
second scroll region, and it degrades to the vertical layout exactly. This is
what keeps the rail variant *the same archetype* rather than a fork.

- The aside uses sticky positioning near the top of the viewport on wide
  viewports, its own `~300px` column; full-width, stacked above main, on
  narrow viewports.
- **No nested scroll containers** — the page scrolls; the rail uses sticky
  positioning, not independent scrolling. The rail must never become a
  second scroll surface; that rule preserves the single-surface mental model
  and mobile parity.
- Stat strip / metric readout keep their single-column-to-multi-column
  responsive ramp.

### Container model — one frame

The shell renders the record in **one bounded outer frame** holding header +
rail + main — there is no second container model to choose between. The
cohesion comes from the *frame*, not from stripping every card:

- the **rail** (aside) renders *chromeless* — flush, hairline-divided,
  lightly tinted. Its detail sections drop their card chrome (keeping
  padding so the hairline floats in whitespace) via a chrome-suppression
  mechanism scoped to the rail subtree only (an internal shell detail, not
  part of the API).
- the **main** column keeps its **carded** detail sections / stat-tile row,
  flattened to sit as panels inside the frame — the suppression does not
  apply there.

Stripping chrome from the main column too is the over-application a measured
reference corrected. The frame applies under both layouts; the canonical
pairing for dense record pages is **`layout="rail"`**.

**Header fill.** The frame's header bar renders per the shared **header-fill
contract** — three modes, brand-filled (default) / muted tint /
hairline-border-only — set once per project via the top-level app shell's
header-fill setting. It is a closed context: there is no per-page or
per-shell override. Mode A's standalone header (above the frame) is the bare
canonical page-header treatment with no fill.

The acceptance gate's **"One outer frame, not a card scatter"** REQUIRED box
scores this: a page is a wrapper adoption if it is loose cards on the bare
page background with no frame, *or* if the rail is carded instead of flush.

### API

The detail-overview shell's props — a closed surface. Every prop is either
typed data or carries a contract decision rule that determines its value from
the entity:

- `title={…}` — Mode B: the on-surface nested-page header (see Layer 3).
  Omit under Mode A.
- `subtitle={…}` — Mode B: secondary line under the nested title.
- `badges={…}` — Mode B: read-only status badges inline next to the nested
  title (the page's one home for status).
- `actions={…}` — Mode B: right-aligned actions row inside the frame header.
- `layout` — `"vertical"` (default) | `"rail"` — keyed to entity density
  (dense/transactional → rail; light → vertical).
- `width` — `"md"` (default) | `"none"` | `"lg"` | `"xl"` — keyed to table
  width (see Layer 2). Ignored under `layout="rail"`.
- `summary={…}` — → rail (master data + optional compact metrics)
- `stats` — typed aggregate data — → main top; the shell renders the
  stat-tile strip from it, with the column count following the data's length.
  Omit when the metrics are surfaced in `summary` instead (recommended for
  the rail variant).
- `content={…}` — → main (transactional data)
- `references={…}` — → rail foot / page end

Appearance is never picked per call site: the header-fill axis is the
top-level app shell's closed context, and everything else is fixed in the
primitives. Layout iterations are a single-file change to the shell that
propagates baseline-wide by a package tag bump.

---

## Layer 1 — Route config

**Required:**
- Path: `/:resource/:id` (entity-scoped, single dynamic segment for the entity)
  or a nested sub-segment under such a route (`/:resource/:id/:section`).
- The page component is an async server component (Next.js App Router or
  framework-equivalent) that reads `params` and resolves the entity at the top.
- Entity-not-found path calls the framework's `notFound()` equivalent. Throwing
  any other error surfaces via the route's `error.tsx` boundary (consumer-owned).

**Forbidden:**
- Client-component entry points. A detail-overview page is server-rendered;
  client islands live inside individual sections (Layer 6e).
- Catching unexpected errors and rendering a generic fallback inline — let the
  framework's error boundary handle them.

---

## Layer 2 — Page shell

**Required:**
- Outer container: a single detail-overview shell (or an equivalent element
  matching its contract: one bounded frame, the canonical section stack
  inside it — no other layout treatment).
- The stack's vertical spacing is fixed in the shell. There is no
  per-page rhythm prop: a "compact measure for short pages" axis had no
  threshold two readers could agree on, and page length is a property of the
  data, not a look.

**Allowed variation:**
- `width="md"` (a contained column width) is the record-page default — the
  shell's own default — because ruled rows and the stat strip read best in a
  contained column. Use `width="none"` only when the page carries wide
  embedded tables that need the full content column.
- `layout="rail"` (default `"vertical"`) renders the slots in the two-column
  Command Rail placement (see "Layout variants" below) on wide viewports and
  collapses to the canonical vertical order on narrow viewports. `width` is
  ignored when `layout="rail"` (the rail variant manages its own widths).

**Forbidden:**
- Horizontal layouts are permitted **only** through the sanctioned
  `layout="rail"` variant of the detail-overview shell (Amendment v2.1).
  Ad-hoc sidebars, hand-rolled side-by-side columns, or any second scroll
  container remain forbidden — the rail is a shell-owned layout, not a
  per-page flex/grid. If a page needs a sidebar that the rail does not
  provide, it is mis-classified — consider a list-with-detail layout or a
  custom shape.
- Direct `<main>` / `<section>` semantics at the shell level — those belong to
  the app layout above the page.

---

## Layer 3 — Page header

The header has **two modes**, both first-class:

### Mode A — standalone

The page renders its own header because no parent layout owns it (typical for
top-level entity routes like `/opportunities/[id]`).

**Required:**
- The detail-overview header renders title (in the project's canonical
  page-title type style) and an optional right-aligned actions row. It is a
  thin wrapper over the project's canonical page-header treatment, narrowed
  to the detail-overview contract (no icon) — the title scale is the
  canonical page-header treatment's single source of truth, not restated
  here.
- Back link (optional): only on an entity route with no breadcrumb or
  section nav of its own, through the canonical page-header treatment's
  back-link adapter (href + label, router link injected by the consumer) —
  never a bespoke leading control beside the title.
- Title text reflects the entity name; optional subtitle reads in the
  canonical muted small-text style and may include a link back to the parent
  entity (e.g. an order's owning customer).

**Allowed variation:**
- Actions row: zero or more buttons. Each is either an inline navigation link
  (e.g. "Edit" routing to a form-page) or a button whose visibility depends
  on entity state (e.g. "Convert" only when `status === 'PENDING'`).
- **Status badges (`badges` slot).** An entity's status dimensions (order:
  paid / shipped; deal: stage / forecast) render as read-only status badges
  inline next to the title, via the detail-overview header's `badges` prop
  (a `badges` slot on the canonical page-header treatment). This is the
  archetype's **one home for status** — the acceptance gate fails a page that
  also repeats status in the rail or a content band. Badges are read-only;
  interactive controls go in `actions`.

### Mode B — nested

The page omits the standalone header because a parent route layout already
renders the entity title (h1) and any tab nav (typical for tabbed sub-routes
like `/:resource/[id]/:section`).

**Required:**
- The page renders **no** `<h1>` or top-level page title.
- The page renders its sub-area title (e.g. "Devices", "History", "Members")
  through the shell's on-surface header: the `title` prop, with the shell
  rendering it as the canonical **nested-page heading** — an `<h2>` at the
  single fixed nested scale (the rung of the heading scale between the
  standalone page title and the section overline label, whose scale and weight
  are fixed in the primitive and cannot be re-picked per call site). The
  `subtitle` / `badges` / `actions` props fill the secondary line, the
  status badges (the page's one home for status), and the right-aligned
  actions row respectively. A free-standing heading at an ad-hoc scale —
  the "may introduce a section-level heading with whatever scale reads
  right" freedom — is the drift this mode existed to close; the heading is
  the role's fixed shape now.
- The actions row, when present, sits right-aligned inside the frame header,
  visually distinct from the title.

**Forbidden (both modes):**
- Action buttons mixed into the title line (use a separate actions row).
- Crumbs rendered by the page component itself — breadcrumbs belong to the app
  shell or the parent layout, not to the detail-overview page.

---

## Layer 4 — Toolbar

**Not applicable.** A detail-overview page has no filter, search, or pill bar
toolbar. The entity is already resolved by the route. If a page needs a
toolbar, it is the wrong archetype.

---

## Layer 5 — Content wrapper

**Required:**
- Sections are passed to the shell via its **named slots** (`summary`, `stats`,
  `content`, `references`) — see "Canonical slot order" — and the frame's
  header, when present, is the shell's own nested-page header (`title` +
  `subtitle`/`badges`/`actions` data — Layer 3; Mode A's standalone header
  renders **above** the shell, outside the slot system). The shell renders
  them in canonical order; the page does not control ordering.
- Within the `content` slot, sections follow declaration order: read-only
  lists/tables before read-write islands, unless the domain clearly dictates
  otherwise. Each is its own detail section. No nested column layouts; no
  wrapping `<div>`s without a structural reason.

**Editability variant** (composition, not a prop — see `docs/CHOOSING-A-SURFACE.md`):
a detail section takes arbitrary children + an `actions` slot, so the same
archetype spans three editability flavors, all conformant — don't treat a
detail page that edits as drift:
- **read-only** — sections render values only (the default reference shape).
- **inline-edit** — a section's children include edit controls (an editable field,
  an inline form island) that mutate in place.
- **action-dialogs** — a section's `actions` slot carries a button that opens a
  crud-dialog (J) / confirm to mutate, while the section itself stays read-only.
Mix per section as the domain needs; the slot order and section chrome are unchanged.

**Forbidden:**
- Passing sections as free-form children of the shell (the v2.0 API has no
  `children` prop — this no longer compiles).
- Wrapping the entire page in a single card surface (cards belong to
  individual sections, not the whole page).
- Hand-rolled flex/grid containers at the shell level. The shell owns its
  layout: a vertical stack (`layout="vertical"`) or the Command Rail
  (`layout="rail"`). Consumers never add their own page-level columns — the only
  horizontal layout is the shell-owned rail variant.

---

## Layer 6 — Content sections (mixed-content taxonomy)

A detail-overview page is composed from a small taxonomy of section kinds.
Each kind has its own contract. A page may use any combination — but their
placement is fixed by the canonical slot order: key/value rows (6b, master
data) belong to the `summary` slot, the stat strip (6a, aggregates) to
`stats`, tables/islands (6c–6e, transactional data) to `content`, and
reference panels (6f) to `references`. All of 6b–6f render inside a
detail-section boundary.

### 6a. Stat strip

**Required:**
- The strip is **typed data, not markup**: the page passes `stats` as the
  list of cells (label, formatted value, optional hint), and the shell renders
  the stat-tile row from it — ONE bounded surface with internal hairline
  dividers, never a row of separate mini-cards. The strip's column count
  **follows the data's length** (2–4 cells → 2–4 columns); a call site never
  passes a hand-matched column count, so the count can't drift from the
  items.
- Each cell: an overline label (in the canonical overline/kicker style,
  muted), a large value in the canonical tabular-figure style, an optional
  small muted hint. When data is unavailable, render `—`.
- Responsive collapse: single-column stacked with horizontal hairlines on
  narrow viewports, expanding to a multi-column layout with vertical
  hairlines on wider ones.
- Flat surface (no shadow) — part of the page's graded hierarchy.

**Forbidden:**
- A fixed three-column layout (or any non-responsive column count). The strip
  must collapse on narrow viewports.
- Hand-rolled tile cells. Use the stat-tile primitive.

### 6b. Key/value rows (master data)

**Required:**
- The key-value list primitive rendering a ruled `<dl>` of hairline-divided
  rows, flush inside the `summary` slot's detail section (typically titled
  "Details").
- Each row: label left (in the canonical muted small-text style), value right
  (medium weight, right-aligned, in the canonical tabular-figure style).
  Empty values render `—`.
- Categorical chip attributes (badge strips) are master data and belong here
  as a row whose value is a right-justified chip span — not in a floating
  section of their own.

**Allowed variation:**
- A `block` prop on a key-value row for long free-text fields (notes,
  reasons): stacked label-over-value with relaxed line height instead of
  fighting the right-aligned column.

### 6c. Bounded section

**Required:**
- A detail section with a `title` (short noun phrase, rendered as the ruled
  overline bar via the shared section-heading primitive) and optional
  right-aligned `actions` — the uniform surface for every section in the
  `content` and `references` slots. The overline itself is a baseline-wide
  primitive, shared with grouped-list and form-page; detail-overview adds the
  ruled bar around it.
- Contents: ruled row lists use `flush` (rows own their own padding and
  hairline dividers); free-form content (islands, prose) omits it and gets
  the section's default padding. Do not use the project's base card
  primitive directly at section level; it remains fine for smaller surfaces
  nested inside a section.
- Surface grading: data sections use the default tone; reference panels use
  `tone="muted"`. The stat strip (6a) is flat. Three weights, fixed meaning —
  this is the page's visual hierarchy.
- Collapsible (optional, behaviour): a secondary section the reader opens on
  demand (run history, raw payloads) may be collapsible — the section's title
  becomes the disclosure toggle, the body shows only while open, and the
  section keeps the same surface as its non-collapsible neighbours (chromeless
  inside the unified rail, bounded card elsewhere). Never a hand-rolled
  collapsible card beside the bounded section.

### 6d. Embedded read-only table

**Required:**
- The table is rendered as a child component, not inline markup. It must be
  the project's base table primitive — the same shared table primitive used
  by list-with-detail pages — used in a non-interactive configuration (no
  row-action menu, no clickable identifier).
- Above the table, an optional one-line caption or `<h3>` section title is
  allowed.

**Forbidden:**
- Inline table markup. Always go through the shared table primitive.
- Row-action dropdowns or row-click navigation in an embedded read-only table.
  If the rows are interactive, the page is composing the wrong archetype —
  consider extracting the table to its own route as a list-with-detail page.

### 6e. Embedded read-write island

**Required:**
- An island is a self-contained client component that owns its own mutations
  and revalidation. It exposes its props but does not lift mutation state to
  the page.
- Example: a stage-control widget, a positions editor, an assignment toggle.

**Forbidden:**
- The page component itself becoming `'use client'` to host mutation state.
  Pages stay server components; mutation islands live below the page in the
  tree.

### 6f. Reference panel

**Required:**
- A reusable read-only display component for cross-entity references (e.g. a
  panel of external links, a related-records list).
- The panel is consumer-owned. The archetype does not prescribe its internal
  shape; it only mandates that the panel render inside a detail section
  (not naked) so the page rhythm is preserved.

---

## Layer 7 — Empty / loading / error states

**Required:**
- **Entity not found** — call the framework's `notFound()` in the page's data
  block. Do not render an inline "not found" panel.
- **Loading** — owned by the route via `loading.tsx`. The archetype does not
  ship a loading primitive. Consumers may render a skeleton structure mirroring
  the section taxonomy or a neutral spinner.
- **Error (unhandled)** — owned by the route via `error.tsx`. The archetype
  does not catch errors at the page level.

**Allowed variation:**
- **Feature-availability gate** — when the entity exists but a sub-area is
  unavailable for it (e.g. a "devices" tab for an entity that isn't linked to
  the upstream system), the page may early-return a single card surface
  explaining the state and offering a CTA. This is **not** an empty state; it
  is a branch of the data shape. Tag it visually as informational, not as an
  error.

**Forbidden:**
- Wrapping the page body in a `try/catch` that renders fallback UI inline.
- Per-section loading skeletons (route-level `loading.tsx` covers the whole
  surface; sections rendering with different freshness windows belong to
  list-with-detail or a future dashboard archetype).

---

## Layer 8 — Data fetching (contract)

The page is a server component. It calls server-side data functions directly
and `await`s them.

**Required props/inputs the page reads:**
- `params: Promise<{ id: string }>` (or the equivalent App-Router-15+ shape).

**Required data calls:**
- A single primary fetch resolving the entity by id (e.g. `getEntity(id)`).
- Optional auxiliary fetches (child collections, reference lists). When two or
  more, run them in parallel via `Promise.all([...])`. Do **not** serialise
  awaits that don't depend on each other.

**Forbidden:**
- Client-side data fetching at the page level (e.g. `useSWR` / `useQuery` in a
  `'use client'` page). Client islands inside sections may use client-side
  fetching, but the page itself is server-rendered.

---

## Layer 9 — Type shapes (contract)

**Required:**
- Entity types are inferred from the server function's return type
  (`Awaited<ReturnType<typeof getEntity>>`) or imported from a generated schema
  source. Hand-written page-local entity types are forbidden.
- Discriminated-union data shapes (e.g. `{ available: true; data } |
  { available: false; reason }`) are allowed and recommended when a
  feature-availability gate is in play (Layer 7).

**Forbidden:**
- Page-local type aliases that duplicate fields from the schema or server
  function. Inference or generated types only.

---

## Layer 10 — Mutations & invalidation (contract)

**Required:**
- The page itself contains no mutation state. All write actions are owned by
  one of:
  1. An out-of-band route (e.g. a linked "Edit" navigation link to a
     form-page).
  2. A J dialog opened from a section action.
  3. A self-contained client island within a section (Layer 6e) that calls
     server actions directly and triggers revalidation via `revalidatePath` /
     `revalidateTag` (or framework-equivalent).

**Allowed variation:**
- An island may opt into optimistic UI when the latency between action and
  refresh is user-visible; otherwise prefer revalidation-only.

**Forbidden:**
- The page component becoming `'use client'` solely to host a mutation.
- Calling server actions from the page module's top-level body (the page is a
  render function, not a controller).

---

## Layer 11 — Mobile variant

**Required:**
- The stat strip collapses to a single stacked column with horizontal
  hairlines on narrow viewports, expanding to a responsive multi-column
  layout on wider ones — never a fixed multi-column treatment.
- Key/value rows are single-line flex rows and need no collapse; long values
  wrap against the right edge, and long free-text uses `block` rows.
- Embedded read-only tables inherit the table primitive's mobile behaviour
  (horizontal scroll on overflow). The page does not add its own scroll
  wrapper.
- Sections stack naturally via the shell's canonical vertical rhythm; no
  extra mobile treatment is required.

**Forbidden:**
- A hard-coded multi-column layout without a responsive ramp down to a single
  column.
- A dedicated `/mobile/...` variant route.

---

## Layer 12 — Permissions

**Required:**
- Route-level auth via the app shell's auth group (e.g. Next.js route group
  like `(app)`). The detail-overview page itself does not perform role checks.
- **Entity-state gating** is in scope at the page level: an action button may
  render conditionally based on entity state (e.g. "Convert" only when the
  entity is in a pre-conversion state). This is a UX correctness rule, not a
  security boundary.

**Forbidden:**
- Role-based UI gating in the page component. If a project needs role-based
  visibility, attach it at the route / layout level, not in the section
  composition.

---

## Forbidden patterns

The following are never permitted in a detail-overview page, regardless of
domain:

1. **Toolbar.** No filter/search/pill bar. The entity is already resolved.
2. **Pagination, sorting, or row-action menus at the page level.** Those belong
   to embedded list-with-detail surfaces or list pages, not here.
3. **Ad-hoc horizontal layouts.** Side-by-side columns or sidebars created with
   page-level flex/grid. The **only** permitted horizontal layout is the
   shell-owned `layout="rail"` variant (v2.1).
4. **Page-level `'use client'`.** Mutations belong to child islands.
5. **Inline error fallback UI.** Use `error.tsx`.
6. **Fixed multi-column layout without a responsive ramp.** Always collapse to
   one column on narrow viewports.
7. **Wrapping the whole page body in one card surface.** Cards are per-section,
   not page-wide.
8. **Embedded settings-table (archetype D2).** A page-level settings shape does
   not belong inside a detail-overview. Promote that surface to its own route
   or modal.
9. **Slot-order subversion.** Recreating the page as free-form markup beside
   the shell, or placing slot-shaped content (stat rows, k/v grids, reference
   panels) inside the wrong slot to dodge the canonical order. If the order
   genuinely doesn't fit, the page is a different archetype — escalate to a
   spec discussion, don't subvert the blueprint.
10. **Naked sections.** Content floating between bounded neighbours without a
    detail-section boundary (a bare chip strip, a bare `<dl>`, a bare list).
    Everything below the header is bounded.

---

## Migration notes (project-extension contract)

**Allowed project extensions:**
- **Custom section components.** Consumers may define project-specific section
  components (e.g. an external-links panel, an activity-timeline panel) and
  drop them into the shell as long as each renders within a detail-section
  boundary and respects the layer rules.
- **Custom stat-tile renderers.** A consumer may pass formatted node values
  (e.g. `fmtCurrency(amount)`) into a stat-tile cell; the primitive does not
  format.
- **Server-action islands** for in-context mutations (Layer 6e). The archetype
  does not prescribe the action library or revalidation mechanism.

**Stays in the project (does not propagate to baseline):**
- Domain-specific section components (panels, badge sets, etc.).
- Server action implementations and revalidation topology.
- Entity types and the server functions that resolve them.
- Routing topology (which detail routes nest under which parent layouts).

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page is scored
> against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)). It is
> layout-agnostic — every item holds for both `layout="vertical"` and `layout="rail"`.
> A page that imports the detail-overview shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · aligned figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

### REQUIRED — single-home & subtraction (the wrapper detectors)

- [ ] **Status has one home.** Each status dimension (order/payment/shipping,
      stage/forecast, …) appears **exactly once** — in the header badge row. No
      floating badge stack, no per-section status label, no second copy in a band.
      *Fails when:* the same status value renders in ≥ 2 places.
- [ ] **No status/meta band in `content`.** The content column contains **no**
      full-width "Status + Payment + Currency + Address" selector/meta card. Status
      *editing* is inline in the header; meta fields are master-data in the `summary`
      key-value list.
- [ ] **`content` is stacked, not tabbed.** Primary transactional sections
      (records, breakdown) are always-visible detail sections. A tab group is
      allowed **only** for genuinely secondary surfaces (history, external sync,
      logs) and must not front the primary records.
      *Fails when:* a tab-group primitive is the primary navigation of the main content.
- [ ] **Primary records are visible without interaction.** The main line collection
      (items/positions/…) renders directly in a detail section, not behind a tab
      or accordion. (Omit only if the entity has no line collection.)
- [ ] **Actions are ranked.** The header carries **one** filled primary action + an
      overflow `⋯` menu. No row of ≥ 3 equal-weight action buttons.
- [ ] **Shell owns the inset.** The page adds no outer padding of its own; the
      shell owns the section stack (and, in vertical layout, the contained
      measure it renders by default — see Layer 2). The top-level app shell's
      main region is the sole inset owner.
- [ ] **One outer frame, not a card scatter.** Every detail-overview page is
      wrapped in a single bounded surface (frame) holding its header + main —
      and, in `layout="rail"`, the rail. The **rail** is a flush,
      hairline-divided strip (chromeless sections, padding kept); the **main**
      keeps its carded detail sections **inside** the frame. *Fails when:*
      the page is loose card surfaces floating on the bare page background
      with no outer frame (the "scatter" drift), OR the rail is carded
      instead of flush.

### REQUIRED — slot order & roles

- [ ] **Canonical order holds.** Reading order is header → summary (master data) →
      stats/figures → content (transactional) → references — top-to-bottom in
      vertical, and rail-then-main in `rail` (§4/§5). Slots are not reordered.
- [ ] **Headline figures at a glance.** The 2 decision figures (e.g. Revenue +
      Gross profit / Gesamtwert + ARR) are visible in `summary` without a click;
      secondary figures sit behind a disclosure (the metric-list primitive) —
      never the reverse.
- [ ] **References last.** Documents / linked records live in the `references` slot
      (rail foot, or page end in vertical), never interleaved with `content`.

### REQUIRED — visual substrate ([spine], restated at the gate)

- [ ] **Figures are mono.** All money, IDs, quantities, dates use the canonical
      tabular-figure style — the baseline adopted mono figures at the
      house-style level (STYLE.md, 2026-06-21 Plex Ledger amendment). *(S5)*
- [ ] **Brand primary, not default.** Primary actions/active states read the
      brand primary color (the target's token override is applied), not donor
      slate. *(S6)*
- [ ] **Semantic state.** Negative / at-risk values (a loss, an overdue date) read
      in the destructive semantic color; positive emphasis reads the brand —
      never a literal color. *(S4)*
- [ ] **Tokens + atoms only.** No literal palette colors, no raw `<button>/<input>/
      <select>` where an atom exists, standard focus ring. *(S4)*

### SHOULD — quality polish (yellow, not red)

- [ ] Lifecycle, if the entity has ordered stages, leads `content` as a
      lifecycle/pipeline stepper (not a vertical list, not a tab).
- [ ] Line records with images show thumbnails (≥ 40px); name + secondary note;
      figures right-aligned with a subtotal footer.
- [ ] `summary` master-data uses the key-value list primitive (label left, value
      right, tabular), not a hand-rolled grid.
- [ ] Density suits the entity: `rail` for money-dense (order/deal/invoice),
      `vertical` for light (lead/inquiry). A sparse rail on a light entity is a
      signal to switch to vertical, not a failure.

### Scoring example

```jsonc
{ "route": "/orders/:id", "archetype": "C", "adopted": true,
  "adoptionQuality": {
    "score": 0.45, "wrapper": true,
    "findings": [
      { "box": "status-one-home", "tier": "red", "fix": "remove floating badges + band; keep header row" },
      { "box": "content-stacked", "tier": "red", "fix": "stack Items + Financials; tabs → secondary only" },
      { "box": "actions-ranked",  "tier": "red", "fix": "1 primary + ⋯ overflow" },
      { "box": "figures-mono",    "tier": "red", "fix": "apply the tabular-figure style to figures" }
    ]
  } }
```

For any route the page-level pass marks `adopted` for archetype C, walk this gate
(deterministic tripwires from `audit-signals.json → adoptionQuality` pre-flag the
likely-red ones; the gate is the verdict). Emit one `findings[]` entry per failed
REQUIRED box with its `fix`. Route every `wrapper: true` page to the teardown
playbook; the remediation PR must paste this gate, fully checked, to close the ticket.
