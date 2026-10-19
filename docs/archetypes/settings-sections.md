---
key: D3
slug: settings-sections
kind: page
version: 1.0
promoted_from: brickshop-manager
promoted_at: 2026-10-19
source_spec_version: n/a (no source spec — distilled from brickshop-manager's card-stack settings pages)
status: locked
---

# D3 — Settings sections archetype — Spec

This document is the cross-project contract for every **settings-sections**
page. Any new page of this archetype must satisfy every rule marked *required*.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/settings-sections`; the prop surface is the API and the sandbox demo (`src/examples/settings-sections-demo.tsx`) is the gallery reference.

---

## What this archetype is

A **settings-sections** page configures one area through a short stack of
**independent sections** on one scroll — "Home location", "Defaults", "Filter
defaults" — each with its own title and its own save. Nothing tabs between the
sections; the user sees all of them at once.

Pick it over its neighbours (see `docs/CHOOSING-A-SURFACE.md`):

- **tabbed-settings (F2)** — the categories are big enough that each needs the
  whole surface, so they tab. Settings sections are small enough to sit
  together on one scroll.
- **settings-table (D2)** — the page administers many records of one kind. A
  settings-sections page edits a fixed set of options, not a record list.
- **form-page (B)** — one entity's form with one commit at its foot. Settings
  sections save independently; there is no single entity and no page-wide
  commit.

---

## The twelve-layer spec

### Layer 1 — Route config

**Required:**
- The page module is lazy-imported (code-split) and wrapped in a suspense
  fallback, behind the app's auth guard.

**Allowed variation:**
- Nested under a shared settings layout route: inherit the auth guard, app
  shell and settings layout from the parent. Do not re-apply them.

### Layer 2 — Page shell

**Required (via the settings-sections shell):**
- One page frame: the page header, then the page's one raised surface holding
  the sections, stacked and divided by hairlines.
- A **render-error boundary** wraps all page content (provided by the shell).
- No outer **page inset** on the page component — the app shell (or the
  surrounding settings layout) supplies it.

**Forbidden:**
- A page header rendered by the page itself above the shell — the shell
  renders the only one (the adoption scan's `page-header-above-shell`).
- A second raised surface — a card per section, or a card around the stack.

### Layer 3 — Page header

**Required:**
- `title` (required) names the area the page configures. It is the page's only
  title; `subtitle` is optional (a breadcrumb trail rides here too).
- **Page verbs go in `actions`** — a verb on the whole page ("Refresh",
  "New template", "Sync"). At most one primary and two secondary; collapse the
  rest into an overflow menu.

**Forbidden:**
- A section's save in the page `actions` — each section saves itself (Layer 5).
- A second title — a heading or titled block repeating the page title.

### Layer 4 — Toolbar

Not applicable. A settings-sections page has no scoping toolbar: nothing
filters or searches a fixed set of options. A page that needs one is a
settings table (D2).

### Layer 5 — Sections

**Required:**
- Each section has a `title` (required), rendered once in the section's own
  title bar. `description` is an optional one-line clarifier.
- A section that edits values **owns its save**: pass `onSave`, and the save
  renders at the section's foot, trailing edge. It saves that section only.
- The save's in-flight state (`isSaving`, `savingLabel`) and its gate
  (`saveDisabled` — nothing changed, invalid input) belong to that section.

**Allowed variation:**
- **Read-only section** — no `onSave`: a reference panel or a status read-out.
- **Section controls** — `actions` holds small section-scoped controls in the
  title bar (a count, a "Re-read" ghost button). Never the save.
- **Section body** — fields, a short list, or an embedded table. A body that
  becomes many records of one kind is a settings table (D2) instead.

**Forbidden:**
- One page-wide save for all sections — that is a form page (B).
- A section without a title, or a body heading repeating the section title.
- Tabs inside the stack — that is tabbed settings (F2).

### Layer 6 — Section content

**Required:**
- Field rules follow the form-page field contract (labels, help text,
  validation messages).
- Keep the section count small enough to scan on one scroll. Past about seven
  sections, split the page or move to tabbed settings (F2).

### Layer 7 — Empty / loading / error states

**Required:**
- Loading, empty and error are per section, in that section's body, with the
  documented state treatments. The section title stays visible.
- Render errors are caught by the shell's error boundary.

**Forbidden:**
- A page-level loading card that replaces the whole stack.

### Layer 8 — Data fetching (contract)

**Required:**
- The shell is presentational — it fetches nothing. Use the project's
  server-state / query layer; no `useState + useEffect` fetch in the page.
- Fetching is per section (or shared by sections that read one record), never
  one blocking load for the page.

### Layer 9 — Type shapes (contract)

**Required:**
- Each section's draft is an explicit type — never `any`.
- The shell and section primitives carry no domain types.

### Layer 10 — Mutations & invalidation (contract)

**Required:**
- Each section's save goes through the project's mutation layer; on success,
  invalidate the affected query state. Feedback uses the single toast system.
- Destructive actions inside a section go through the shared confirm dialog.

### Layer 11 — Mobile variant

**Required:**
- No dedicated mobile route. The stack reflows to one column; the page verbs
  collapse with the page header.

### Layer 12 — Permissions

**Required:**
- The route is behind the app's auth guard. A read-only user sees every
  section without its save.

---

## Migration acceptance checklist

- [ ] **Layer 2** — the settings-sections shell renders the page; no page
      header above it; no card per section; no outer page inset
- [ ] **Layer 3** — one page title; page verbs in `actions`, no save there
- [ ] **Layer 5** — every section titled once; each editable section saves
      itself at its foot
- [ ] **Layer 7** — loading / empty / error per section
- [ ] **Layers 8, 10** — query and mutation layer; invalidation; single toast

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — see
> [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md). A page composing this
> shell is **conformant** only when every REQUIRED box passes.

**REQUIRED**

- [ ] **No page header above the shell** — title, subtitle and page verbs are
      passed to the shell once.
- [ ] **Sections are the shell's sections**, not hand-rolled cards inside its body.
- [ ] **Each save belongs to its section**, at its foot — no global save bar.
- [ ] **[spine] S1, S2, S3, S4, S6.**

**SHOULD** (yellow, not red)

- [ ] ≤ ~7 sections.

---

## Revision log

- **v1.0 (2026-10-19):** Promoted from brickshop-manager, where about twelve
  settings pages (sourcing, system, message hub, carriers, lead times,
  numbering, email / invoice templates, payment texts, pricing rules, legal
  texts, drift) stacked independent cards under a local page shell that drew
  its own page header. No source spec existed; the shape is distilled from
  those pages. One page frame (ADR-0008), page verbs in `actions`, each section
  titled once and saving itself.
