---
key: C
slug: detail-overview
kind: page
version: 2.4
promoted_from: hk-crm
promoted_at: 2026-05-23
source_spec_version: 1.0
status: locked
blueprint: docs/archetypes/detail-overview-blueprint.svg
---

# Archetype C — Detail Overview

> **v2.4 (2026-06-22) — header status badges.** `<DetailOverviewHeader>` (and the
> shared `<PageHeader>`) gain a `badges` slot — read-only `<Badge>`s inline next
> to the title. This is the archetype's **one home for status** (the acceptance
> gate's status-once rule): an entity's status dimensions live here, not duplicated
> in the rail or a content band. Additive, backward-compatible. See Layer 3.
>
> **v2.3 (2026-06-21) — the unified-surface variant (hybrid).** The shell gains a
> `surface` prop (`"separated"` default | `"unified"`), orthogonal to `layout`.
> `"unified"` wraps the record in **one bounded outer frame**: the **rail** renders
> chromeless + hairline-divided + tinted (its `<DetailSection>`s drop card chrome
> via a rail-scoped `UnifiedSurfaceContext`; `SectionCard` gains a `chrome` prop),
> while the **main** keeps its carded sections inside the frame. The cohesion comes
> from the frame, not from stripping every card — making everything chromeless was
> an over-application a measured reference corrected. The cohesive pairing for dense
> record pages is `layout="rail" surface="unified"`. Additive, backward-compatible
> (default unchanged). Two new
> shared layout primitives ship alongside for the rail's vocabulary:
> `ProgressTracker` (lifecycle/pipeline stepper) and `MetricList`/`MetricRow` (the
> compact "figures at a glance" readout). The acceptance gate gains a "One bounded
> surface, not a card scatter" REQUIRED box, and S5 is restated as *aligned*
> (`tabular-nums`) rather than *mono* figures. See "Surface variant" below.
>
> **v2.1 (2026-06-21) — the Command Rail variant.** The shell gains a second
> sanctioned layout, `layout="rail"` (default still `"vertical"`): a sticky left
> identity rail (`summary` + `references`) beside a scrolling main column
> (`stats` + `content`) on `lg+`, collapsing to the exact canonical vertical
> order below `lg`. This reverts v2.0's blanket prohibition on horizontal
> layouts — but *only* through this shell-owned variant; ad-hoc sidebars and
> hand-rolled columns stay forbidden. The slot model, story order, taxonomy,
> data contract, and graded surfaces are all unchanged; the rail only changes
> how the same ordered slots are placed in 2D on wide viewports. Additive,
> backward-compatible (no API removed, default unchanged). See
> "Layout variants — vertical & Command Rail" below.
>
> **v2.0 (2026-06-12) — fixed-blueprint upgrade.** The shell now owns the page
> layout via named slots in a canonical order (header → summary → stats →
> content → references: master data, then aggregates, then transactional
> data); free-form children were removed, and every zone below the header is
> a bounded `<DetailSection>` surface — no naked sections. Order and
> anchoring were settled in a rendered design review (2026-06-12), not from
> spec text alone. Compliant pages in different applications now share one
> recognizable layout, and layout iterations are a single-file change to
> `<DetailOverviewShell>` / `<DetailSection>` that propagates via
> `/style-archetypes --update`. Breaking primitive API change (v1.x pages
> must move their sections into slots). A second rendered review settled the
> **ledger design**: ruled master-data rows (`<KeyValueList>`/`<KeyValueRow>`
> replace the k/v grid), overline section title bars as the cross-app
> signature, ONE unified stat strip with internal dividers, and graded
> surface weights (shadowed data sections, flat strip, muted references).
> See the annotated blueprint:
> [`detail-overview-blueprint.svg`](detail-overview-blueprint.svg).

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

- **Edit forms** — use archetype B (form-page); the page is a `<Form>` wrapping
  controlled fields.
- **Lists of any kind** — use A (list-with-detail).
- **Modal-shaped detail** — use J (crud-dialog) when the detail lives in a
  Sheet/Modal rather than at a dedicated route.

## Reference primitives

`<DetailOverviewShell>` in `src/components/archetypes/detail-overview/` — the
outer container for the route. Composed alongside:

- `<DetailOverviewHeader>` — optional standalone header (title + actions row).
- `<DetailSection>` — the bounded section surface: ruled overline title bar
  (small-caps `text-xs` tracked label + right-aligned actions), `flush` or
  padded content, graded `tone` (`default` card surface with shadow, `muted`
  for the lightest sections). A thin wrapper over the shared `<SectionCard>`
  layout primitive (the same titled-section shape grouped-list and form-page
  use). Every zone below the header renders inside one; the shadcn `<Card>`
  family is not used directly at section level.
- `<StatTileRow>` + `<StatTile>` — the unified aggregate strip: ONE bounded
  surface with internal hairline dividers, overline labels, tabular values.
  (Now shared `layout/` primitives — also used by the analytics-dashboard KPI
  row — and re-exported from this archetype's barrel for back-compat.)
- `<KeyValueList>` + `<KeyValueRow>` — ruled master-data rows: label left,
  value right, hairline dividers; `block` rows for long free-text.

The shell owns the page layout via **named slots** rendered in the canonical
order (see "Canonical slot order" below). Consumers fill the slots that apply
and omit the rest; they cannot reorder them. The shell also enforces vertical
rhythm and responsive collapse.

## Canonical slot order

Every detail-overview page presents its slots in this fixed order — this is
what makes the archetype *recognizable across applications*: the eye finds the
same information in the same place everywhere. The order tells the entity's
story: **master data** (what this is), then **aggregates** (how it's doing),
then **transactional data** (what happened), then references.

| # | Slot | Required content | Omit when |
|---|------|------------------|-----------|
| 1 | `header` | `<DetailOverviewHeader>` (title + right-aligned actions) | Mode B — a parent layout owns the title |
| 2 | `summary` | master data: a `<DetailSection>` (typically titled "Details", `flush`) wrapping a `<KeyValueList>` of ruled rows, including categorical chip attributes | the page is purely metric/tabular |
| 3 | `stats` | aggregates: a `<StatTileRow>` strip with 2–4 `<StatTile>` cells | the entity has no headline metrics |
| 4 | `content` | transactional data: embedded read-only lists/tables and read-write islands, each in its own `<DetailSection>` | nothing beyond the summary exists |
| 5 | `references` | a `<DetailSection>` of cross-entity links, related records, external resources | no references exist |

**Everything below the header is bounded.** Each slot's content renders inside
a `<DetailSection>` surface (stat tiles carry their own card-style tile
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
on wide viewports. Choose with the `layout` prop on `<DetailOverviewShell>`.

### When to use which

| Entity profile | Layout |
|---|---|
| Dense + transactional + financial — **orders, deals/opportunities, invoices** | **`layout="rail"`** |
| Light / early-stage — **leads, inquiries, simple contacts** | **`layout="vertical"`** (default). Rail is *allowed* but mostly empty — prefer vertical. |
| Any entity below the `lg` breakpoint | Rail **auto-collapses to vertical** (see "Responsive contract") |

Rule of thumb: if the page has ≥ 2 headline metrics **and** a long
transactional body, use the rail. Otherwise stay vertical.

### Rail slot placement (`lg+`)

The header spans full width as a top bar. The remaining slots split across two
columns; **reading order is preserved** — rail top→bottom, then main
top→bottom, tells the same story.

```
┌───────────────────────────────────────────────────────────┐
│  header  (back · breadcrumb · status badges · actions)      │  full width
├───────────────┬───────────────────────────────────────────┤
│  RAIL (aside) │  MAIN (scrolls)                             │
│  ~300px,sticky│   stats        (StatTileRow — aggregates)   │
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
| `header` | Full-width top bar (back, breadcrumb, status badges, actions + primary CTA) |
| `summary` | **Aside** — master-data `<KeyValueList>` + an optional compact metric readout (see note). Sticky on `lg+`. |
| `stats` | **Main**, top — `<StatTileRow>`. *May be omitted* when its 2–4 metrics are surfaced as the rail's compact readout instead (recommended for the rail variant, to avoid duplication). |
| `content` | **Main** — the transactional sections in declaration order |
| `references` | **Aside**, bottom (documents, linked records, external links) |

**Compact metric readout (rail).** In the rail variant the `summary` slot may
lead with a condensed, ruled metric list (label left, tabular value right, a
"show more" disclosure for secondary figures) instead of the full
`<StatTileRow>` — the "financials at a glance" affordance. It is still
`summary`-slot master data, still ruled rows, **no new primitive**. Because
`summary` is rendered once and placed into both the sticky aside (desktop) and
the canonical vertical flow (mobile), keep it presentation-only — stateful
edit islands belong in `content`, not in `summary` or `references`.

### Responsive contract (the compliance keystone)

Below `lg`, `layout="rail"` **collapses to the canonical vertical order**:
`header → summary → stats → content → references`. The rail is purely a wide-
viewport reflow of the same ordered slots; it never introduces a second scroll
region, and it degrades to the vertical layout exactly. This is what keeps the
rail variant *the same archetype* rather than a fork.

- The aside is `lg:sticky lg:top-6 self-start`, its own `~300px` column on
  `lg+`; full-width stacked above main below `lg`.
- **No nested scroll containers** — the page scrolls; the rail is
  `position: sticky`, not independently scrollable. The rail must never become a
  second scroll surface; that rule preserves the single-surface mental model and
  mobile parity.
- Stat strip / metric readout keep their `grid-cols-1 → sm:grid-cols-N` ramp.

### Surface variant — separated vs unified (Amendment v2.3)

Orthogonal to `layout`, the `surface` prop chooses the **container model**:

- **`surface="separated"`** (default): each slot's `<DetailSection>`s are
  individually bordered cards with gaps between them — the v2.0/v2.1 look. Zero
  churn for existing pages.
- **`surface="unified"`** (the **hybrid** model, corrected against a measured
  reference): the page is wrapped in **one bounded outer frame** holding header +
  rail + main. The cohesion comes from the *frame*, not from stripping every card:
  - the **rail** (aside) renders *chromeless* — flush, hairline-divided, lightly
    tinted (`bg-muted/40`). Its `<DetailSection>`s drop their card chrome (keeping
    padding so the hairline floats in whitespace) via a `UnifiedSurfaceContext`
    scoped to the rail subtree only.
  - the **main** column keeps its **carded** `<DetailSection>`s / `<StatTileRow>`
    with gaps — the context is false there. Framed, those cards read as units, not
    a scatter.

  Stripping chrome from the main column too is the over-application the measured
  reference corrects. Works with either layout; the canonical pairing for dense
  record pages is **`layout="rail" surface="unified"`**.

The acceptance gate's **"One outer frame, not a card scatter"** REQUIRED box
scores this: a rail page is a wrapper adoption if it is loose cards on the bare
page background with no frame, *or* if the rail is carded instead of flush.

### API

```tsx
<DetailOverviewShell
  layout="rail"            // "vertical" (default) | "rail"
  surface="unified"        // "separated" (default) | "unified"
  header={<DetailOverviewHeader … />}
  summary={…}              // → aside (master data + optional compact metrics)
  stats={…}                // → main top (omit if surfaced in summary)
  content={<>…</>}         // → main
  references={…}           // → aside bottom
/>
```

`layout` and `surface` both default to the v2.0/v2.1 behaviour → zero churn for
existing pages. Future rail/surface tweaks propagate baseline-wide via
`/style-archetypes --update`, same as any other shell-owned layout iteration.

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
- Outer container: a single `<DetailOverviewShell>` (or a `<div>` matching its
  contract: `space-y-{4|5}`, no other layout classes by default).
- Vertical rhythm: `space-y-5` (default record-page rhythm) or `space-y-4`
  (compact, short pages). Choose once per page.

**Allowed variation:**
- `width="md"` (`max-w-3xl`) is the record-page default — ruled rows and the
  stat strip read best in a contained column. Use `width="none"` only when
  the page carries wide embedded tables that need the full content column.
- `layout="rail"` (default `"vertical"`) renders the slots in the two-column
  Command Rail placement (see "Layout variants" below) on `lg+` and collapses
  to the canonical vertical order below `lg`. `width` is ignored when
  `layout="rail"` (the rail variant manages its own widths).

**Forbidden:**
- Horizontal layouts are permitted **only** through the sanctioned
  `layout="rail"` variant of `<DetailOverviewShell>` (Amendment v2.1). Ad-hoc
  sidebars, hand-rolled side-by-side columns, or any second scroll container
  remain forbidden — the rail is a shell-owned layout, not a per-page
  flex/grid. If a page needs a sidebar that the rail does not provide, it is
  mis-classified — consider a list-with-detail layout or a custom shape.
- Direct `<main>` / `<section>` semantics at the shell level — those belong to
  the app layout above the page.

---

## Layer 3 — Page header

The header has **two modes**, both first-class:

### Mode A — standalone

The page renders its own header because no parent layout owns it (typical for
top-level entity routes like `/opportunities/[id]`).

**Required:**
- `<DetailOverviewHeader>` renders title (`text-2xl font-semibold tracking-tight`)
  and an optional right-aligned actions row. It is a thin wrapper over the
  baseline `<PageHeader>` layout primitive (`@/components/layout`), narrowed to
  the detail-overview contract (no icon, no back link).
- Title text reflects the entity name; optional subtitle reads
  `text-sm text-muted-foreground` and may include a link back to the parent
  entity (e.g. an order's owning customer).

**Allowed variation:**
- Actions row: zero or more buttons. Each is either an inline `<Link>` for
  navigation (e.g. "Edit" routing to a form-page) or a `<Button>` whose
  visibility depends on entity state (e.g. "Convert" only when
  `status === 'PENDING'`).
- **Status badges (`badges` slot).** An entity's status dimensions (order:
  paid / shipped; deal: stage / forecast) render as read-only `<Badge>`s inline
  next to the title, via `<DetailOverviewHeader badges={…}>` (a `badges` prop on
  the shared `<PageHeader>`). This is the archetype's **one home for status** —
  the acceptance gate fails a page that also repeats status in the rail or a
  content band. Badges are read-only; interactive controls go in `actions`.

### Mode B — nested

The page omits the header because a parent route layout already renders the
entity title and any tab nav (typical for tabbed sub-routes like
`/:resource/[id]/:section`).

**Required:**
- The page renders **no** `<h1>` or top-level title.
- The page **may** introduce a section-level `<h2>` heading for the sub-area
  (e.g. "Devices", "History", "Members") when the parent's tab label alone is
  insufficient context.
- An action row, if present, is right-aligned and visually distinct from the
  section title (e.g. via `flex justify-end gap-3`).

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
- Sections are passed to the shell via its **named slots** (`header`, `stats`,
  `summary`, `content`, `references`) — see "Canonical slot order". The shell
  renders them in canonical order; the page does not control ordering.
- Within the `content` slot, sections follow declaration order: read-only
  lists/tables before read-write islands, unless the domain clearly dictates
  otherwise. Each is its own `<DetailSection>`. No nested column layouts; no
  wrapping `<div>`s without a structural reason.

**Editability variant** (composition, not a prop — see `docs/CHOOSING-A-SURFACE.md`):
a `<DetailSection>` takes arbitrary children + an `actions` slot, so the same
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
- Wrapping the entire page in a single `<Card>` (cards belong to individual
  sections, not the whole page).
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
`<DetailSection>` boundary.

### 6a. Stat strip

**Required:**
- `<StatTileRow>` containing 2–4 `<StatTile>` cells: ONE bounded surface with
  internal hairline dividers — never a row of separate mini-cards.
- Each cell: overline label (`text-xs font-semibold uppercase` tracked,
  muted), large value (`text-2xl font-semibold tabular-nums`), optional
  `text-xs` muted hint. When data is unavailable, render `—`.
- Responsive collapse: `grid-cols-1` stacked with horizontal hairlines on
  narrow viewports, `sm:grid-cols-N` with vertical hairlines from `sm` up.
- Flat surface (no shadow) — part of the page's graded hierarchy.

**Forbidden:**
- Fixed `grid-cols-3` (or any non-responsive column count). The strip must
  collapse on narrow viewports.
- Hand-rolled tile cells. Use `<StatTile>`.

### 6b. Key/value rows (master data)

**Required:**
- `<KeyValueList>` rendering a ruled `<dl>` (`divide-y`) of `<KeyValueRow>`
  children, flush inside the `summary` slot's `<DetailSection>` (typically
  titled "Details").
- Each row: label left (`text-sm text-muted-foreground`), value right
  (`text-sm font-medium`, right-aligned, `tabular-nums`). Empty values render
  `—`.
- Categorical chip attributes (badge strips) are master data and belong here
  as a row whose value is a right-justified chip span — not in a floating
  section of their own.

**Allowed variation:**
- A `block` prop on `<KeyValueRow>` for long free-text fields (notes,
  reasons): stacked label-over-value at `leading-relaxed` instead of fighting
  the right-aligned column.

### 6c. Bounded section

**Required:**
- `<DetailSection>` with a `title` (short noun phrase, rendered as the ruled
  overline bar via the shared `<SectionHeading>` primitive) and optional
  right-aligned `actions` — the uniform surface for every section in the
  `content` and `references` slots. The overline itself is baseline-wide
  (`<SectionHeading>`), shared with grouped-list and form-page; detail-overview
  adds the ruled `border-b` bar around it.
- Contents: ruled row lists use `flush` (rows own their `px-5` padding and
  `divide-y` hairlines); free-form content (islands, prose) omits it and gets
  the default `px-5 py-4` padding. Do not use the shadcn `<Card>` family
  directly at section level; `<Card>` remains fine for smaller surfaces nested
  inside a section.
- Surface grading: data sections use the default tone; reference panels use
  `tone="muted"`. The stat strip (6a) is flat. Three weights, fixed meaning —
  this is the page's visual hierarchy.

### 6d. Embedded read-only table

**Required:**
- The table is rendered as a child component, not inline JSX. It must be the
  same shared table primitive used by list-with-detail pages
  (`<RecordTable>` / equivalent), used in a non-interactive configuration
  (no row-action menu, no clickable identifier).
- Above the table, an optional one-line caption or `<h3>` section title is
  allowed.

**Forbidden:**
- Inline `<Table>` markup. Always go through the shared table primitive.
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
  shape; it only mandates that the panel render inside a `<DetailSection>`
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
  the upstream system), the page may early-return a single `<Card>` explaining
  the state and offering a CTA. This is **not** an empty state; it is a branch
  of the data shape. Tag it visually as informational, not as an error.

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
  1. An out-of-band route (e.g. a linked "Edit" `<Link>` to a form-page).
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
  hairlines on narrow viewports (`grid-cols-1` → `sm:grid-cols-N`) — never a
  fixed multi-column class.
- Key/value rows are single-line flex rows and need no collapse; long values
  wrap against the right edge, and long free-text uses `block` rows.
- Embedded read-only tables inherit the table primitive's mobile behaviour
  (`overflow-x-auto`). The page does not add its own scroll wrapper.
- Sections stack naturally via the shell's `space-y-*` rhythm; no extra mobile
  treatment is required.

**Forbidden:**
- Hard-coded `grid-cols-{2,3,4}` without a `sm:` / `md:` / `lg:` ramp.
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
6. **Fixed `grid-cols-*` without responsive ramp.** Always collapse to one
   column on narrow viewports.
7. **Wrapping the whole page body in one `<Card>`.** Cards are per-section, not
   page-wide.
8. **Embedded settings-table (archetype D2).** A page-level settings shape does
   not belong inside a detail-overview. Promote that surface to its own route
   or modal.
9. **Slot-order subversion.** Recreating the page as free-form markup beside
   the shell, or placing slot-shaped content (stat rows, k/v grids, reference
   panels) inside the wrong slot to dodge the canonical order. If the order
   genuinely doesn't fit, the page is a different archetype — escalate to a
   spec discussion, don't subvert the blueprint.
10. **Naked sections.** Content floating between bounded neighbours without a
    `<DetailSection>` boundary (a bare chip strip, a bare `<dl>`, a bare list).
    Everything below the header is bounded.

---

## Migration notes (project-extension contract)

**Allowed project extensions:**
- **Custom section components.** Consumers may define project-specific section
  components (e.g. an `<ExternalLinksPanel>`, an `<ActivityTimeline>`) and drop
  them into the shell as long as each renders within a `<DetailSection>`
  boundary and respects the layer rules.
- **Custom stat-tile renderers.** A consumer may pass formatted node values
  (e.g. `fmtCurrency(amount)`) into `<StatTile>`; the primitive does not format.
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
> A page that imports `DetailOverviewShell` is **conformant** only when every REQUIRED
> box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**, routed to
> the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
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
      `KeyValueList`.
- [ ] **`content` is stacked, not tabbed.** Primary transactional sections
      (records, breakdown) are always-visible `<DetailSection>`s. A tab group is
      allowed **only** for genuinely secondary surfaces (history, external sync,
      logs) and must not front the primary records.
      *Fails when:* a `<TabsList>` is the primary navigation of the main content.
- [ ] **Primary records are visible without interaction.** The main line collection
      (items/positions/…) renders directly in a `<DetailSection>`, not behind a tab
      or accordion. (Omit only if the entity has no line collection.)
- [ ] **Actions are ranked.** The header carries **one** filled primary action + an
      overflow `⋯` menu. No row of ≥ 3 equal-weight action buttons.
- [ ] **Shell owns the inset.** The page adds no outer `p-*`/`px-*`/`py-*`; only
      `space-y-*` (+ optional `max-w-*` in vertical). `AppShell`'s `<main>` is the
      sole inset owner.
- [ ] **One outer frame, not a card scatter.** A `layout="rail"` page is wrapped in
      a single bounded surface (frame) holding header + rail + main. The **rail** is
      a flush, hairline-divided strip (chromeless sections, padding kept); the
      **main** keeps its carded DetailSections **inside** the frame. *Fails when:*
      the page is loose `SectionCard`s floating on the bare page background with no
      outer frame (the "scatter" drift), OR the rail is carded instead of flush.

### REQUIRED — slot order & roles

- [ ] **Canonical order holds.** Reading order is header → summary (master data) →
      stats/figures → content (transactional) → references — top-to-bottom in
      vertical, and rail-then-main in `rail` (§4/§5). Slots are not reordered.
- [ ] **Headline figures at a glance.** The 2 decision figures (e.g. Revenue +
      Gross profit / Gesamtwert + ARR) are visible in `summary` without a click;
      secondary figures sit behind a disclosure (`MetricList`) — never the reverse.
- [ ] **References last.** Documents / linked records live in the `references` slot
      (rail foot, or page end in vertical), never interleaved with `content`.

### REQUIRED — visual substrate ([spine], restated at the gate)

- [ ] **Figures are aligned.** All money, IDs, quantities, dates use `tabular-nums`
      for column alignment, in the **baseline's own font** (mono is not required
      unless the baseline adopts mono figures at the house-style level). *(S5)*
- [ ] **Brand primary, not default.** Primary actions/active states read the brand
      `--primary` (the target's token override is applied), not donor slate. *(S6)*
- [ ] **Semantic state.** Negative / at-risk values (a loss, an overdue date) read
      `text-destructive`; positive emphasis reads the brand — never a literal color. *(S4)*
- [ ] **Tokens + atoms only.** No literal palette colors, no raw `<button>/<input>/
      <select>` where an atom exists, standard focus ring. *(S4)*

### SHOULD — quality polish (yellow, not red)

- [ ] Lifecycle, if the entity has ordered stages, leads `content` as a
      `ProgressTracker` (not a vertical list, not a tab).
- [ ] Line records with images show thumbnails (≥ 40px); name + secondary note;
      figures right-aligned with a subtotal footer.
- [ ] `summary` master-data uses `KeyValueList`/`KeyValueRow` (label left, value
      right tabular), not a hand-rolled grid.
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
      { "box": "figures-mono",    "tier": "red", "fix": "apply --font-mono to figures" }
    ]
  } }
```

For any route the page-level pass marks `adopted` for archetype C, walk this gate
(deterministic tripwires from `audit-signals.json → adoptionQuality` pre-flag the
likely-red ones; the gate is the verdict). Emit one `findings[]` entry per failed
REQUIRED box with its `fix`. Route every `wrapper: true` page to the teardown
playbook; the remediation PR must paste this gate, fully checked, to close the ticket.
