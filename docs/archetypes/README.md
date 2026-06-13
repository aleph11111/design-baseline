# Page Archetypes

This folder defines **page archetypes** — shared page shapes that every application built from the design-baseline can adopt. An archetype describes a page or dialog end-to-end: URL, layout, header, toolbar, content area, empty states, data fetching contract, types, mutations, mobile variant, permissions. Not just visuals.

Baseline archetypes are generalised from mature, real-project implementations. They carry no project-specific code, routes, or domain types — only the chrome, structural contracts, and generic primitive components that any project can apply. See the **Promotion contract** section below for how archetypes move from source projects into this baseline.

> **Living manifest:** `MANIFEST.json` is the source of truth for which archetypes baseline currently ships and at what version.

## Archetype kinds

Archetypes apply to different surface kinds. Each kind has its own layer set.

| Kind | Layer set | Examples |
|------|-----------|----------|
| **Page** | 12 layers (route config, page shell, header, toolbar, content wrapper, table/grid, states, data, types, mutations, mobile, permissions) | list-with-detail, settings-table, detail-view, domain-hub |
| **Dialog** | 15 layers (12 adapted + mode contract + footer contract + cross-context invocation) | crud-dialog |
| **Flow** | 13 layers (invocation contract, parameter normalization, response normalization, error taxonomy, retry/idempotency, rate limiting/concurrency, auth/credentials, side-effects, caching/invalidation, queue vs sync split, cross-consumer consistency, staleness contract, observability) — **deferred:** no baseline flow archetypes yet; layers documented per-archetype when promoted | API integration flows, batch ingestion flows |
| **Component** | 11 layers (invocation contract, state shape, selection model, keyboard/ARIA, empty/loading states, mobile affordance, theming, render-prop surface, error surface, performance contract, accessibility contract) — **deferred:** no baseline component archetypes yet; layers documented per-archetype when promoted | item-selector |

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

### Layer 7 — canonical state treatments

The three planes of Layer 7 have one canonical look each; vary the *copy*, never the *chrome*:

- **Loading** — text-only "Loading…" centred at `p-8`, `role="status" aria-live="polite"`. **No skeleton screens** in a list/table shell. The only skeleton in the baseline is the J (crud-dialog) body, where the field shape is known ahead of the fetch. Server-rendered pages (C — detail-overview, M — matrix-grid) delegate loading to a route-level `loading.tsx` instead of an in-shell plane.
- **Error** — two distinct classes, each with its own treatment (do not conflate them):
  - **Load/fetch error** (the whole surface failed) → a destructive `<Alert>`: `<AlertTriangle className="h-4 w-4" />` + `<AlertTitle>Something went wrong</AlertTitle>` + an `<AlertDescription>` holding the message and, when `onRetry` is given, a `variant="outline" size="sm"` `w-fit` "Try again" button. Wrapper `p-4`. Used by A, K, D2. The `isEmpty` flag must be gated `&& !error` so a failed query never renders as "empty".
  - **Mutation/action error** (a save failed; the surface is fine) → a compact inline `text-destructive` line near the action, **not** a full Alert. Used by J (dialog save error) and B (form root error). Lighter on purpose — the data is still there.
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

What gets copied per archetype: `docs/archetypes/<slug>.md` and `src/components/archetypes/<slug>/`. The framework `README.md` and `MANIFEST.json` are always copied so the target has the methodology and can run `--update` later. Sandbox demo files (`src/examples/`) are never copied to targets — they are a generic-ness contract for the donor only.

Project-added archetypes (not in the baseline MANIFEST) are never touched by `/style-archetypes`. The target's `docs/archetypes/` may freely contain project-local spec files.

### Versioning

| Bump | When | Example |
|------|------|---------|
| Minor (`1.0` → `1.1`) | Backward-compatible — new optional props, looser allowed-variation, additional layer rules | Adding an optional density prop |
| Major (`1.0` → `2.0`) | Breaking — required props change, layer rules tighten, primitives rename or split | Renaming a primitive component |

`MANIFEST.json` tracks `version` (baseline version) and `source_spec_version` (the source project's spec version that fed the promotion). This lets `--update` compute the right diff window even if multiple source versions accumulated since the last promotion.

## What baseline does NOT ship

The following are intentionally out of scope for all baseline archetypes:

- **Auth** — login flows, session management, auth-gated shells. Pick per project.
- **Data fetching implementation** — baseline specs describe the data *contract* (what shape a hook must return) but ship no React Query hooks, Supabase clients, Prisma queries, or fetch calls. Consumers wire their own data layer.
- **Charts and analytics** — dashboard / KPI archetypes are deferred until two projects independently build the same shape (rule-of-2). No charting library is included.
- **i18n** — string externalization, locale switching, RTL layout. Not the baseline's concern.
- **Project-specific archetypes** — if a shape appears in only one project, it stays in that project. The baseline only ships shapes that two or more real applications have proven to need. Project-local archetypes live alongside baseline ones in the target's `docs/archetypes/`; `/style-archetypes` never touches files that aren't in the MANIFEST.
- **Brand tokens and visual style packs** — the baseline ships neutral HSL tokens. Re-skin is the project's job per `docs/STYLE.md`.
- **Sample pages** — applying an archetype copies spec docs and primitive components. It does not scaffold a full page. The spec doc is the reference; pages are hand-written by the consumer.
