---
slug: choosing-a-surface
kind: methodology
version: 2.0
status: locked
governs: [A, B, C, J, K, F2, M]
---

# Choosing a surface

The single decision this document owns: **when an entity needs to be created, read, or
edited, which surface does it get?** A token, a row, a dialog, a section, or a page.

This is the doc that `list-with-detail`, `crud-dialog`, `form-page`, `detail-overview`,
and `tabbed-settings` all defer to when they say "see `docs/CHOOSING-A-SURFACE.md`". It
is deliberately upstream of every archetype spec: an archetype tells you *how* to build a
shape correctly; this tells you *which shape* the situation calls for. Get this wrong and
the app fragments into a set of individually-correct pages that don't feel like one
product — every page passes its own spec, and the whole still feels stitched together.

> **The one rule.** Default to the *lowest* rung that holds the interaction. Escalate only
> when the current rung provably overflows — never by habit, never "to be safe", never
> because a sibling entity happens to have a page. An unjustified escalation is drift
> (red), not variation (yellow).

### The two questions this doc answers

1. **Part 1 — Entity surfaces.** For a single domain entity that is created, read, or
   edited, which surface does it get? (the CRUD ladder: token → row → dialog → pane → page)
2. **Part 2 — Collection & overview surfaces.** For a page whose job is *not* one entity's
   CRUD lifecycle — presenting a collection, a set of numbers, a process, a configuration —
   which page archetype does it get?

A third law — *where elements go **inside** a chosen surface* (title, actions, search,
filters, counts, per-row menus) — is not a selection question at all. It is placement, and
it lives in its own doc: [`docs/PLACEMENT.md`](./PLACEMENT.md). Selection picks the
container; placement governs the container's insides. Both must hold for an app to feel
whole.

---

## Why this exists (the scar)

An entity's surface is not a styling choice — it is a **navigation-model** choice, and the
navigation model is felt long before the pixels are. Two surfaces can share every token
(type, color, spacing, components) and still feel like different applications, because one
keeps you in place and the other tears the screen down and rebuilds it somewhere else.

When each entity's author picks a surface independently, an app ends up running **two
navigation conventions at once**: some entities create/edit in an in-place dialog, others
navigate to a dedicated route. The user's muscle memory, built on one, breaks on the
other. That mismatch — not the visual layer — is the "this screen is from a different map"
feeling. This document removes the per-author choice so the whole app resolves the same
job to the same surface every time.

---

## Part 1 — Entity surfaces: create, read, edit

For a single domain entity, its surface is chosen on the ladder and the two spectrums that
follow.

### The surface ladder

A single entity climbs this ladder as it gains depth. Each rung is a real archetype (or a
primitive within one). Start at the bottom; stop at the first rung that holds.

| Rung | Surface | Archetype | Use when the entity… | Navigation cost |
|------|---------|-----------|----------------------|-----------------|
| 1 | **Token** | Badge / cell | is a single value or status | none |
| 2 | **Row** | list row (A / K) | is one line among peers, no own screen | none |
| 3 | **Dialog** | crud-dialog (J) | is created/edited from a parent that owns the context | overlay — origin stays mounted |
| 4 | **Detail pane** | list-with-detail (A) | is read alongside its list (master-detail) | in-shell — list stays mounted |
| 5 | **Detail page** | detail-overview (C) | owns collections, tabs, or sub-entities of its own | full route — page swap |

**Escalation triggers — the only reasons to climb a rung:**

- **2 → 3 (row → dialog):** the row needs a full create/edit lifecycle (validated form,
  save, delete) that doesn't fit inline.
- **3 → 5 (dialog → page):** the entity's form or view outgrows a side-sheet — it owns
  child collections, needs 3+ logical tabs, or the read view is a dashboard in its own
  right. (A J dialog caps at 2 tabs by spec; needing a third is the signal.)
- **4 → 5 (detail pane → page):** the detail is no longer a summary — it's a workspace the
  user parks in and navigates within (its own sub-tabs, its own child lists).

Never skip from rung 2 straight to rung 5 because "it'll probably grow." Build the rung the
entity needs today; the archetypes are designed so climbing later is a bounded change.

---

## The create/edit spectrum — dialog (J) vs. page (B)

This is the decision that drifts most often, so it gets an explicit rule.

**Default: create and edit happen in a `crud-dialog` (J) — a right-side sheet over the
surface you triggered it from.** The list, the detail, the board you were on stays mounted
behind it. This is the correct answer for the large majority of business entities.

**Escalate to a `form-page` (B) — a dedicated `/<resource>/new` and `/<resource>/[id]/edit`
route — only when at least one of these is true** (the triggers named in the B spec):

- the form must be **deep-linkable / bookmarkable** (shared in a link, reopened by URL,
  survives back/forward as a distinct history entry);
- the creation context is **not owned by a parent page** (there is no list or detail the
  create was launched *from* — e.g. a top-level "New invoice" from global nav with no
  parent scope);
- the form is **genuinely large** — multiple sections that would make a sheet a scroll
  marathon, or a multi-entity composition.

If none of those hold, it's a dialog. "It has a lot of fields" is not by itself a page
trigger — a J dialog supports flat, two-column, and two-tab bodies precisely so that
field-heavy entities stay in place.

```
                        ┌─ deep-linkable / bookmarkable? ─┐
  create or edit  ──►   ├─ no owning parent context?      ├─ any YES ─►  form-page (B)
                        └─ genuinely large / multi-part?  ─┘
                                     │
                                  all NO
                                     ▼
                             crud-dialog (J)   ← default
```

**One dialog per entity, invoked from anywhere.** When an entity is created/edited in a
dialog, there is exactly one dialog component for it, opened from every call site (list row,
detail panel, another entity's page) with `open` + `entityId` + `onClose` and optional
`defaultValues`. Do not build per-context create routes or per-context copies. This is
crud-dialog Layer 15 — it's what lets "add a contact to this company" open over the company
with the company pre-filled, instead of navigating away to a foreign namespace.

---

## The read/detail spectrum — pane (A) vs. page (C)

**Default: a shallow entity's detail is revealed in-shell, beside its list** — the
`list-with-detail` (A) detail pane. Selecting a row shows the detail; the list stays
mounted and the selection stays visible. The archetype is named *list-with-detail* for a
reason: a list whose row-click always navigates to a separate route is a list-with-detail
that never renders its detail — the shape promises master-detail and delivers a teleport.

**Escalate to a `detail-overview` (C) page — a `/<resource>/[id]` route — when the entity
owns depth of its own:** child collections (contacts, deals, devices, activity), its own
sub-navigation/tabs, actions that operate on those children. Companies are a page; a
lightweight contact usually is not.

**When an entity has a C page, route to it *from* the pane, not instead of it.** The pane is
the summary and the jump-off; the page is the workspace. `onRowSelect` opening a pane, with
the pane offering "Open full page →", is coherent. `onRowSelect` hard-navigating with no
pane in between is the drift.

`detail-target` (route vs. dialog vs. pane vs. none) is expressed through the consumer's
`onRowSelect` handler — it is a composition choice governed by this document, not a prop and
not per-page license to improvise.

---

## Part 2 — Collection & overview surfaces

Part 1 chooses the surface for *one entity*. But most pages exist to present a **set** of
things, a set of **numbers**, a **process**, or a **configuration** — and those page shapes
are themselves archetypes. Choosing among them is the second half of surface selection, and
it drifts just as easily: a collection gets built as a bespoke table on one page and a
card grid on another, or numbers land in a hand-rolled panel instead of the dashboard shape.

**Choose by the page's primary *job*, not by the entity on it.** A single entity legitimately
appears in several of these — a Company is a *row* in the companies list (A), a *card* on a
pipeline (P), and a *page* of its own (C). That is expected, not drift: the surface follows
the job of the page, and the placement grammar (`PLACEMENT.md`) keeps the entity recognizable
across all of them.

> **Default collection surface: `list-with-detail` (A).** Reach for another archetype only
> when the job specifically matches its shape. Numbers existing is not a reason to build a
> dashboard; a status field existing is not a reason to build a board.

### The chooser

| The page's job | Archetype | Reach for it when | Use a different one if |
|----------------|-----------|-------------------|------------------------|
| Scan / act on a flat set of records | **list-with-detail (A)** | rows are peers in one table or grid; select → pane or page | rows fall into named groups → **K**; data is one measure across two axes → **M** |
| Present records already split into named groups | **grouped-list (K)** | items belong to sections (by owner, stage, category), each a bounded group | the groups are a pipeline you drag items between → **P** |
| Move items through a workflow | **kanban-board (P)** | status *is* the process and changing it is the primary action | status is only read, not changed → **A** with a status badge |
| Present one measure across two dimensions | **matrix-grid (M)** | data is inherently row × column (resource × period, plan × month) | it's just a list that happens to have columns → **A** |
| Show a domain's state at a glance | **analytics-dashboard (G)** | KPIs + mixed read-only widgets, drill-down leads out | it's one itemized document with totals → **R** |
| Present a formal, itemized, printable document | **report (R)** | line items + totals, meant to be read / exported / printed | it's an interactive, editable set → **A** / **M** |
| Triage a time-ordered stream of events | **feed-inbox (H)** | scannable events / notifications, read-or-act | entries are anchored to dates you navigate → **calendar** |
| Place time-anchored entries on a grid | **calendar** | day / week / month position carries meaning | order matters but the date does not → **H** |
| Administer many records of one config kind | **settings-table (D2)** | CRUD over a lookup / config table (create/edit via **J**) | it's a handful of grouped options → **F2** |
| Configure one thing across grouped options | **tabbed-settings (F2)** | settings divided into tabbed sections | it's a flat table of records → **D2** |
| Walk a user through a staged operation | **import-wizard (W)** | multi-step input with a step indicator, no single owned entity | it's a single form → **B** / **J** |

**When nothing fits.** Do not invent a one-off page shape. If two or more pages independently
need the same shape that no archetype covers, that is a new-archetype proposal under the
Rule of 2 (`docs/archetypes/README.md`) — not license to hand-roll. A single outlier stays a
documented one-off, excluded from the archetype set.

---

## Quick reference

**Entity surfaces (Part 1)**

| The job | Surface | Archetype |
|---------|---------|-----------|
| Create an entity from a list / detail you're on | Sheet dialog | **J** |
| Edit an entity in place | Sheet dialog | **J** |
| Create with no owning parent, or deep-linkable, or very large | Dedicated route | **B** |
| Read a shallow entity next to its list | In-shell detail pane | **A** |
| Read an entity that owns collections + tabs | Dedicated route | **C** |
| Add a child to a parent (contact → company) | Child's J dialog, opened over the parent, pre-filled | **J** (Layer 15) |
| A settings / config record | Sheet dialog over the table | **J** + **D2** |

**Collection & overview surfaces (Part 2)**

| The job | Archetype |
|---------|-----------|
| Flat set of records | **A** |
| Records in named groups | **K** |
| Workflow / pipeline | **P** |
| One measure × two dimensions | **M** |
| Numbers at a glance | **G** |
| Itemized printable document | **R** |
| Stream of events | **H** |
| Time-anchored entries | **calendar** |
| Config table / grouped settings | **D2** / **F2** |
| Staged operation | **W** |

---

## Applying this to a project *(required at adoption)*

The rule above is generic. Every consuming project MUST resolve it into a local
`docs/SURFACES.md` at adoption time: one table row per domain entity (create/edit
surface, read surface, notes) and one row per top-level page (archetype, why). That
table is the project's binding resolution — reviews check against it, and changing a
row requires the same grounding as changing this doc.

Template:

| Entity | Create / Edit | Detail / Read | Notes |
|--------|---------------|---------------|-------|
| … | J dialog *(default)* | A pane / C page | escalation trigger, if any |

| Page | Archetype | Why |
|------|-----------|-----|
| … | A / K / P / M / G / R / H / D2 / F2 / W | one line |

---

## What this document does *not* decide

- **Where things go inside a surface** — the placement grammar (title, actions, search,
  filters, counts, per-row menus, footers) is [`docs/PLACEMENT.md`](./PLACEMENT.md). This
  doc picks the container; that doc governs its insides.
- **Visual style** — tokens, type, spacing, color live in `docs/STYLE.md`. This doc never
  touches pixels.
- **Data fetching** — how a surface loads its data is the archetype's Layer 8 contract, not
  a surface-choice concern.
- **Whether a shape deserves a new archetype** — that's the Rule of 2 in
  `docs/archetypes/README.md`. This doc only selects among archetypes that already exist.

---

## Revision log

- **2.0** — Promoted to the Design Baseline. Project-specific application tables replaced
  by the required per-project `docs/SURFACES.md` resolution.

- **1.1** — Added Part 2 (collection & overview surface chooser: A / K / P / M / G / R / H /
  calendar / D2 / F2 / W), the "two questions" framing, and the split of *placement* into
  `docs/PLACEMENT.md`. Expanded the quick reference and the hk-crm application table to cover
  collection pages.
- **1.0** — First draft. Reifies the surface ladder and the create/edit + read/detail
  spectrums that `list-with-detail`, `crud-dialog`, `form-page`, `detail-overview`, and
  `tabbed-settings` already referenced. Adds the hk-crm application table and the
  core-entity convergence note.
