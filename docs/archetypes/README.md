# Page Archetypes

This folder defines **page archetypes** — shared page shapes that every application built from the design-baseline can adopt. An archetype describes a page or dialog end-to-end: URL, layout, header, toolbar, content area, empty states, data fetching contract, types, mutations, mobile variant, permissions. Not just visuals.

Baseline archetypes are generalised from mature, real-project implementations. They carry no project-specific code, routes, or domain types — only the chrome, structural contracts, and generic primitive components that any project can apply. See the **Promotion contract** section below for how archetypes move from source projects into this baseline.

> **Living manifest:** `MANIFEST.json` is the source of truth for which archetypes baseline currently ships and at what version.

## Contract vs. reference implementation (two files per archetype)

Each archetype ships as **two files**, so the portable asset (the page-shape contract) is decoupled from the non-portable one (the baseline-stack implementation):

| File | What it is | Portable? |
|------|-----------|-----------|
| `docs/archetypes/<slug>.md` | The **stack-agnostic contract** — every layer / required / forbidden / allowed-variation rule expressed in terms of **roles** ("the top-level app shell", "the canonical page-title type style", "the search-input molecule"), never a concrete primitive or Tailwind class. | ✅ Any stack |
| `docs/archetypes/<slug>.baseline.md` | The **baseline reference implementation** — binds each contract role to its concrete design-baseline primitive (`<AppShell>`, `<SurfaceHeader>`, …) and Tailwind-4 class strings, layer by layer. | ❌ shadcn/ui + Tailwind 4 + sidebar shell only |

Why: a divergent consumer (e.g. a Tailwind 3 / Next project with its own component system) can legitimately adopt the **contract** — layers, slots, states, responsibilities — and audit a page against it **without** having the baseline's primitives installed. The `.baseline.md` sibling is the reference binding for projects that *do* run the baseline stack. This split is what makes stack-agnostic fit-scoring possible (see [`docs/FLEET-AUDIT.md`](../FLEET-AUDIT.md)).

**The rule for authors:** the contract file names a **role**; the sibling names the **primitive**. If a required/forbidden rule mentions a `src/components/...` import or a literal Tailwind class, it belongs in the sibling, not the contract. `MANIFEST.json` records both via `spec` (contract) and `reference_impl` (sibling) per entry.

## Identifying archetypes: slug, key, and namespace

**`slug` is the canonical cross-doc identifier.** Slugs (`list-with-detail`, `settings-table`, `crud-dialog`, …) are globally unique by construction, so drift audits, page→archetype registries, ADRs, and tickets must reference archetypes **by slug**. `MANIFEST.json` records `"canonical_id": "slug"` to make this explicit.

**The letter `key` is namespace-scoped display/ordering metadata only — never a cross-doc identifier.** A bare letter can be ambiguous: a project that ran its own archetype audit may assign `B` to a different archetype than the donor's `B` (`form-page`). When a letter must appear in prose and could be ambiguous, qualify it with its namespace (`baseline:B`).

**`namespace` separates donor archetypes from project-local ones.** Every entry the donor ships carries `"namespace": "baseline"`. A target project that adds its own archetypes (anything not in this donor manifest) stamps them with its own namespace (e.g. `"namespace": "acme"`) and a unique slug. The field is interpreted as **"baseline when absent"**, so the disambiguator within a manifest is `(namespace, key)` — or, preferably, the always-unique `slug`.

This is why `/style-archetypes` is safe to re-run: it merges `MANIFEST.json` **by slug** and only adds or updates entries for slugs it copied from the donor. Project-local entries (different slugs, non-`baseline` namespace) are never touched, and a refreshed baseline entry preserves any target-only keys (including a `namespace` the target stamped). The framework README itself is treated as **project-maintainable** — `/style-archetypes` copies it only when the target has none or it is byte-identical to the donor's; a diverged target README is left in place (the donor's copy is dropped alongside as `README.donor.md` for manual reconciliation).

> **Which archetype for a given entity?** An entity shows up at different depths in different projects (a shallow `Company` vs one that owns contacts/deals/contracts). Don't build tiers of one layout — pick the right archetype by depth + context. See [`docs/CHOOSING-A-SURFACE.md`](../CHOOSING-A-SURFACE.md): the **surface ladder** (token → row → dialog → section → detail page), the **create spectrum** (dialog vs page), and when to escalate.

## Archetype kinds

Archetypes apply to different surface kinds. Each kind has its own layer set.

| Kind | Layer set | Examples |
|------|-----------|----------|
| **Page** | 12 layers (route config, page shell, header, toolbar, content wrapper, table/grid, states, data, types, mutations, mobile, permissions) | list-with-detail, settings-table, detail-view, domain-hub |
| **Dialog** | 15 layers (12 adapted + mode contract + footer contract + cross-context invocation) | crud-dialog |
| **Flow** | 13 layers (invocation contract, parameter normalization, response normalization, error taxonomy, retry/idempotency, rate limiting/concurrency, auth/credentials, side-effects, caching/invalidation, queue vs sync split, cross-consumer consistency, staleness contract, observability) — **deferred:** no baseline flow archetypes yet; layers documented per-archetype when promoted | API integration flows, batch ingestion flows |
| **Component** | 11 layers (invocation contract, state shape, selection model, keyboard/ARIA, empty/loading states, mobile affordance, theming, render-prop surface, error surface, performance contract, accessibility contract) | skeleton-loader (Sk), raw-input (I) |

The `component` kind is formalized once two projects independently build the same component-shaped archetype (rule-of-2). The `flow` kind applies to stateful multi-step operations that span network calls, side-effects, and error recovery.

## The twelve layers

Every page archetype spec covers the same twelve layers. These are the rows of the audit grid:

1. **Route config** — path, params, lazy-load, auth wrapper
2. **Page shell** — layout wrapper, sidebar entry, suspense boundary
3. **Page header** — title, icon, subtitle, breadcrumb, action buttons
4. **Toolbar** — filters, search, pill bar, quick-filter chips, global actions
5. **Content wrapper** — shell component or plain card, padding, max-width, scroll behavior
6. **Table / grid** — component used, column shapes, cell typography, number formatting, row interaction
7. **Empty / loading / error states** — what each looks like and where they live
8. **Data fetching** — hook contract, query shape, joined fields, cache key, stale time
9. **Type shapes** — row type, aggregate type, joined-summary type
10. **Mutations & invalidation** — how actions refresh data
11. **Mobile variant** — is there one, what differs
12. **Permissions** — who sees what

Layers 1–7 are visual/structural. Layers 8–10 are the data layer. Layers 11–12 are cross-cutting. Whichever layer we look at, the audit rule is the same: compare pages side-by-side, mark each row green (agreed), yellow (essential variation), or red (accidental drift).

The structural layers (3 — page header, 5 — content wrapper padding/spacing, the section titles inside 6) draw from a small set of **canonical tokens** documented in `docs/STYLE.md`: the page-title and section-title heading signatures (owned by the `<PageHeader>` and `<SectionHeading>` layout primitives), and the page-inset / vertical-rhythm / surface-padding scale ("Spacing & rhythm"). When writing or auditing a spec, reuse those values — a new fifth rhythm or a hand-rolled heading class is accidental drift (red), not essential variation.

### Every documented variant gets a living demo

When you add or document a **variant axis** on an archetype — whether it's a real
prop (e.g. `list-with-detail presentation`, `crud-dialog layout`) or a documented
composition the primitive already allows (e.g. `detail-overview editability`,
`matrix-grid` editable/ledger cells, F2 tabbed-detail) — **extend that archetype's
demo (`src/examples/<slug>-demo.tsx`) so the variant is visible and clickable in
the gallery.** A spec note nobody can *see* is half-documented: the gallery is the
review surface, so a variant that doesn't render there can't be visually inspected
or caught when it regresses. Composition-only variants (no new prop) still get a
demo — that's how a reviewer confirms the existing API actually produces the
claimed shape. Bump the archetype's `version` in `MANIFEST.json` when the demo
changes (the demo is part of the shipped deliverable).

**Demo file and export naming convention (gallery registry is derived).** The
donor-dev gallery (`gallery/registry.ts`) lists its archetype routes **off the
MANIFEST plus two conventions — it contains no per-archetype literal**:

1. **File** — `src/examples/<slug>-demo.tsx` (recorded on the MANIFEST entry as
   `example`; the registry resolves it against the glob of that directory).
2. **Export** — `PascalCase(slug) + "Demo"` (`form-page` → `FormPageDemo`,
   `statement-with-filters` → `StatementWithFiltersDemo`), named (not default).

So a new promotion (`/promote-archetype`) needs **no gallery edit**: write the
demo at the conventional path with the conventional export, add the MANIFEST
entry, and the archetype appears in the gallery. Deviating from the convention
is surfaced, not silent — a MANIFEST entry whose demo file or export is missing
logs a `console.error` and renders a visible broken-demo card on its route and
in the overview grid instead of vanishing from the gallery. `kind` is a
MANIFEST field (`"page" | "dialog" | "component"`); the gallery never assigns
it locally. Demo files not claimed by a MANIFEST entry (e.g.
`section-nav-demo.tsx`, a layout demo shown under *Layout & molecules*) stay
out of the archetype list by the join itself — there is no name-based filter.

### Layer 7 — canonical state treatments

The three planes of Layer 7 have one canonical look each; vary the *copy*, never the *chrome*:

- **Loading** — text-only "Loading…" centred at `p-8`, `role="status" aria-live="polite"`, is the **default**. A **skeleton** (the `skeleton-loader` archetype, `Sk`) is a sanctioned alternative **when the row/column shape is known ahead of the fetch** — a list, table, or feed whose layout won't jump when data lands; it is passed through the state-view's loading-plane override so text stays the default. Do **not** skeleton a surface whose shape is unknown until the fetch resolves (a detail pane keyed on the fetched record) — text loader there. The `Sk` a11y contract (status role + sr-only label) is non-negotiable. Server-rendered pages (C — detail-overview, M — matrix-grid) delegate loading to a route-level `loading.tsx` instead of an in-shell plane.
- **Error** — two treatments, chosen by **surface**, not by cause (do not conflate them):
  - **Shell / page load error** (a full-width data shell — list, table, grouped list — failed to load) → a destructive `<Alert>`: `<AlertTriangle className="h-4 w-4" />` + `<AlertTitle>Something went wrong</AlertTitle>` + an `<AlertDescription>` holding the message and, when `onRetry` is given, a `variant="outline" size="sm"` `w-fit` "Try again" button. Wrapper `p-4`. Used by A, K, D2. The `isEmpty` flag must be gated `&& !error` so a failed query never renders as "empty".
  - **Form / dialog inline error** (an error inside a form body or a narrow dialog — a failed save, or a dialog's own entity fetch — where a full Alert is too heavy) → a compact tinted box: `bg-destructive/10 p-4 rounded text-sm text-destructive`. Used by J (crud-dialog) and B (form root error). One treatment for both; never `bg-red-50`.
- **Empty** — archetype-specific by design: the copy and any CTA (e.g. settings-table's "Add new" button in its empty state) belong to the archetype. Only the base styling is shared (`p-8 text-center text-sm text-muted-foreground`).

## The fifteen layers (dialog)

Dialog archetypes extend the twelve-layer grid with three dialog-specific layers:

1–12. All twelve page layers, adapted for dialog context (no route config; shell = Sheet/Modal/Drawer; header = dialog title + close button; toolbar = inline filter or search within the dialog; content wrapper = dialog body scroll area; etc.)

13. **Mode contract** — view-first with Edit button, or always-edit; mode-awareness in header and footer; confirm-discard behavior on dirty close
14. **Footer contract** — button set per mode (view: Edit / Close; edit: Save / Cancel; create: Submit / Cancel); loading and disabled states; error placement
15. **Cross-context invocation** — how the dialog is opened from different parent pages; what parameters are passed; how parent state is invalidated on close

## The audit process

Each archetype goes through four phases.

**Phase 1 — Scope lock.** Agree on the archetype name, the pages in scope, the reference page, and the control page. Committed to the source project's archetype docs.

**Phase 2 — Audit.** One session. Walk all twelve (or fifteen) layers across all scoped pages. Produce a grid doc at `docs/archetypes/<archetype>-audit.md` with green/yellow/red coloring for every cell.

**Phase 3 — Spec.** One session. Review the grid together. Decide every red. Write the archetype spec at `docs/archetypes/<archetype>.md` — the contract every future page of this type must satisfy.

**Phase 4 — Migration.** One page per session. Each migration is a bounded, low-risk change that brings one page into alignment with the spec. Continues until every page in scope passes the spec.

## Rule of 2

If 2+ pages share a structural shape that doesn't match an existing archetype, spawn a new one — proposed in a one-paragraph change amending the archetype README and manifest. Single-page outliers stay one-off and are excluded from standardization. This rule applies both within a source project (when deciding to promote) and across projects (when deciding to add a new baseline archetype).

## Promotion contract

### How archetypes reach baseline

Baseline archetypes are promoted from real project implementations using the `/promote-archetype` skill. The source project runs through Phases 1–4 first; baseline receives the generalised result.

**Maturity gates for first-time promotion:**

1. Spec v1+ locked in the source project (committed; an ADR exists, or the spec has `status: locked`).
2. Phase 4 migration started — at least one page is actually running on the spec in the source project.
3. Stable for at least one session of source-project work where the spec was not amended.

**First-time promotion path (via `/promote-archetype <slug>`):**

1. Read the source project's spec doc, audit doc, governing ADRs, and primitive implementations.
2. Apply the de-source-ification ruleset: replace concrete page paths with generic examples, strip domain types (`Order`, `Customer`) and replace with generics (`Row`, `Entity`), strip source-specific query hooks and Supabase select fragments, rename bespoke component names to generic baseline names.
3. Layer-by-layer review — for each of the 12 (or 15) layers, present source version vs baseline draft; accept, edit, or reject.
4. Build a sandbox second consumer in `src/examples/<slug>-demo.tsx` using a domain far from the source project's nouns (podcasts, recipes, fitness logs — anything domain-far). Write types first, with zero reference to the source spec, then plug them into the primitive. If types don't fit, the gap is real — fix the primitive before proceeding.
5. Write donor files: spec, primitives, sandbox demo, MANIFEST entry.

**Update path (via `/promote-archetype --update <slug>`):** triggered when the source project's spec version advances. Diffs each layer between source and baseline and asks the user to triage each difference as generic improvement (propagate), project-specific behavior (stay in source), or spec correction (propagate). Bumps the baseline version (minor or major per rules) and updates `MANIFEST.json`.

**Frequency:** user-initiated only. No automation.

### How target projects get archetypes

Apply via the `/style-archetypes` skill (requires `/style-baseline` to have run first):

```
/style-archetypes                   # apply all baseline archetypes
/style-archetypes list-with-detail  # apply one by slug
/style-archetypes --list            # preview what would be copied
/style-archetypes --update          # show stale archetypes in this project
/style-archetypes --force           # overwrite existing archetype files
```

What gets copied per archetype: the contract `docs/archetypes/<slug>.md`, its baseline reference sibling `docs/archetypes/<slug>.baseline.md` (both listed in the MANIFEST entry as `spec` and `reference_impl`), and `src/components/archetypes/<slug>/`. A non-baseline consumer that only wants the portable contract can copy `<slug>.md` alone and ignore the sibling. `MANIFEST.json` is always merged (by slug, preserving target-only entries and keys) so the target stays current and can run `--update` later. The framework `README.md` is copied **only when the target has none or it is byte-identical to the donor's** — a project-maintained README that diverges is never overwritten (see *Identifying archetypes* above). Sandbox demo files (`src/examples/`) are never copied to targets — they are a generic-ness contract for the donor only.

Project-added archetypes (not in the baseline MANIFEST) are never touched by `/style-archetypes`. The target's `docs/archetypes/` may freely contain project-local spec files.

### Versioning

Each archetype carries **two `version` numbers that are independent by design** — they
count different things, so they legitimately drift apart. A gap between them is not a bug.

| Field | Lives in | Counts | Bumped when |
|-------|----------|--------|-------------|
| **Spec version** | the spec doc's frontmatter `version:` (`docs/archetypes/<slug>.md`) | the archetype's written **contract** — the rules a consuming page must satisfy | a spec **rule** changes (a layer contract, a required prop, an allowed-variation boundary) |
| **Deliverable version** | the `MANIFEST.json` entry's `version:` | the whole shipped **deliverable** — spec **+** reference implementation (`.baseline.md`) **+** primitives **+** demo **+** blueprint | **any** shipped change to any of those parts, including ones that leave the contract untouched |

The deliverable version counts a **superset** of events: every spec-rule change is also a
deliverable change, but a demo-coverage pass, a blueprint panel, or a primitive styling
fix is a deliverable change that is *not* a spec-rule change. So the deliverable version
always runs **≥** the spec version and pulls ahead over time. Example: `detail-overview`
is spec `2.5` / deliverable `2.18` — the contract has had 5 minor revisions while the
deliverable has shipped 18. The **major** components stay aligned: a contract-breaking
change (spec major bump) is by definition also a breaking deliverable change (deliverable
major bump), so a `2.x` deliverable always pairs with a `2.x` spec.

**Which number does an amendment bump?**

- **A spec rule changed** (you tightened a layer, added a required prop, loosened an
  allowed variation) → bump the **spec** frontmatter `version:` per the minor/major table
  below, **and** bump the MANIFEST `version` (the deliverable changed too).
- **Only the demo, blueprint, or a primitive changed** and the written contract is
  untouched (a demo-coverage pass, a Command Rail panel on the blueprint, a styling fix) →
  bump **only** the MANIFEST `version`. Leave the spec frontmatter alone. (This is the same
  rule the "Every documented variant gets a living demo" note above states: demo changes
  bump `MANIFEST.json`, not the spec doc.)

Minor vs major applies to **both** counters:

| Bump | When | Example |
|------|------|---------|
| Minor (`1.0` → `1.1`) | Backward-compatible — new optional props, looser allowed-variation, additional layer rules | Adding an optional density prop |
| Major (`1.0` → `2.0`) | Breaking — required props change, layer rules tighten, primitives rename or split | Renaming a primitive component |

**A third, unrelated version.** `MANIFEST.json` also tracks `source_spec_version` — the
version in the *source project's* spec that fed the promotion (not a baseline version at
all). This lets `/promote-archetype --update` compute the right diff window even if
multiple source versions accumulated since the last promotion.

## What baseline does NOT ship

The following are intentionally out of scope for all baseline archetypes:

- **Auth** — login flows, session management, auth-gated shells. Pick per project.
- **Data fetching implementation** — baseline specs describe the data *contract* (what shape a hook must return) but ship no React Query hooks, Supabase clients, Prisma queries, or fetch calls. Consumers wire their own data layer.
- **Charts and analytics** — dashboard / KPI archetypes are deferred until two projects independently build the same shape (rule-of-2). No charting library is included.
- **i18n** — string externalization, locale switching, RTL layout. Not the baseline's concern.
- **Project-specific archetypes** — if a shape appears in only one project, it stays in that project. The baseline only ships shapes that two or more real applications have proven to need. Project-local archetypes live alongside baseline ones in the target's `docs/archetypes/`; `/style-archetypes` never touches files that aren't in the MANIFEST.
- **Brand tokens and visual style packs** — the baseline ships neutral HSL tokens. Re-skin is the project's job per `docs/STYLE.md`.
- **Sample pages** — applying an archetype copies spec docs and primitive components. It does not scaffold a full page. The spec doc is the reference; pages are hand-written by the consumer.
