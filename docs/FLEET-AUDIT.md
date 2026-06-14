# Fleet audit — fit & drift

The evidence layer before any unify-and-adopt decision. A **read-only** sweep that
maps every frontend project's pages onto the baseline archetypes and tells you
three things: what's **adopted**, what's **drifted/diverged**, and what's **missing**
(candidate archetypes). It never changes code — its output is an inventory + a
triaged action list.

This is the automated application of `docs/CHOOSING-A-SURFACE.md`: where that doc
is the human rubric for picking a surface, the audit *measures* which surface each
real page actually uses and whether it should.

## Two questions it answers

- **Fit** (every `surfaces:["frontend"]` project, adopted or not): for each route,
  which archetype does this page *resemble*, how strongly, and does it use the
  baseline primitive or a hand-rolled equivalent? Routes that resemble *nothing*
  are **gaps** → candidate new archetypes.
- **Drift** (adopted projects): which adopted archetype versions trail the donor
  (`MANIFEST.json`), and which pages match an archetype's shape but bypass its
  reference primitive (silent divergence the version-drift scan can't see).

## Per-project scanner

Run once per project. Inputs: the repo path + the donor `MANIFEST.json` (archetype
keys, slugs, `primitives_dir`, `version`).

Steps:
1. **Enumerate routes/pages** — framework-aware: Next app/pages router
   (`app/**/page.tsx`, `pages/**`), React-Router route tables, or file globs under
   the project's pages dir. Record `route` + `file`.
2. **Extract structural signals** per page — table/list? RHF `<form>` on a route?
   read-only entity layout with sections/stats? side sheet/dialog with view/edit/
   create modes? a tab strip? a 2-D row×col grid? section-partitioned list? count
   of sections; whether it imports from a baseline `primitives_dir`.
3. **Classify** against the archetype set with a **fit score** (see rubric) and the
   signals that drove it.
4. **Flag** per page: `adopted` (imports the archetype's baseline primitive) vs
   `hand-rolled` (matches the shape, doesn't use the primitive → divergence); and
   `gap` (no archetype scores ≥ 0.5).
5. **Scan for hand-rolled molecules** — *within* each page, independent of which
   archetype it is. This catches the sub-page drift that the page-level pass misses
   (the kind that "drives me crazy inside the applications"): a record list built as
   `<ul>`/`<div>` rows instead of `<Table>`, a raw `<label>`/`<input>`/`<select>`
   instead of the shared field stack, a re-rolled pill toggle / search box / status
   chip / entity circle / loading-empty-error plane. See the molecule rubric below.
   Even a correctly-classified, adopted page can carry molecule drift.

### Classification rubric (signals → archetype)

| Signal | Archetype |
|--------|-----------|
| Table + row→detail/panel navigation | A — list-with-detail |
| Table on a `/settings/*` route, row→edit-dialog | D2 — settings-table |
| Table partitioned into titled sections | K — grouped-list |
| 2-D grid, rows × columns, cell interactions | M — matrix-grid |
| RHF form on a dedicated create/edit route | B — form-page |
| Side sheet / dialog with view·edit·create modes | J — crud-dialog |
| Read-only entity page, sections + stat tiles | C — detail-overview |
| Top tab strip delegating to per-tab bodies | F2 — tabbed-settings |
| Matches none ≥ 0.5 | (gap — candidate) |

**Fit score:** `1.0` = uses the baseline primitive (adopted, exact). `0.6–0.9` =
matches the shape structurally but hand-rolled (drift/divergence candidate).
`< 0.5` = weak/no match (gap candidate). Always record the signals so a human can
override the score.

### Molecule rubric (hand-rolled content molecules → owner)

Grep-able heuristics for the within-page scan (step 5). Each match is a 🔴 drift
hit pointing at the shared owner it should use (see STYLE.md "Shared content
molecules"). These are *signals*, not proof — a human confirms (e.g. the
matrix-grid pivot `<table>` and inline-cell `<select>` are sanctioned exceptions).

| Hand-rolled signal (regex-ish) | Should use |
|--------------------------------|------------|
| `<ul`/`<div>` rows rendering a record list (cells, columns) | `<Table>` |
| `<label` / `<input` / `<select` / `<textarea` (raw, not shadcn) | shared field stack (`<Label>`+`<Input>`/`<Select>`/`<Textarea>` or RHF `<FormField>`) |
| `rounded-md border p-0.5` wrapping `<button>`s | `SegmentedControl` |
| `relative … max-w-sm` + `Search` icon + `<Input className="pl-9">` | `SearchInput` |
| `rounded-full border px-2.5 py-0.5` text pill | `<Badge>` |
| `rounded-full bg-muted` icon/initials circle | `IconAvatar` |
| inline `"Loading…"` / centered muted `<div>` / ad-hoc `<Alert>` for empty/error | `StateView` |
| re-typed `text-xs … uppercase tracking-*` overline | `OVERLINE_CLASS` / `SectionHeading` |
| private `⋯` `DropdownMenu` per table | `RowActionsMenu` (`archetypes/shared`) |

Record molecule hits per route in `moleculeDrift` (schema below) so they aggregate
fleet-wide alongside archetype + version drift.

### Per-project output (schema)

```jsonc
{
  "project": "hk-crm",
  "scannedAt": "<iso>",
  "routes": [
    { "route": "/companies", "file": "src/pages/Companies.tsx",
      "archetype": "A", "fit": 1.0, "adopted": true,
      "signals": ["table", "row→/companies/:id"], "notes": "" },
    { "route": "/companies/:id", "file": "...",
      "archetype": "C", "fit": 0.7, "adopted": false,
      "signals": ["sections","stat-tiles","hand-rolled card chrome"],
      "notes": "matches detail-overview but doesn't use DetailSection" }
  ],
  "gaps": [ { "route": "/pipeline", "shape": "kanban board", "signals": [...] } ],
  "versionDrift": [ { "key": "J", "local": "1.2", "baseline": "1.3", "severity": "minor" } ],
  "moleculeDrift": [
    { "route": "/companies", "file": "...", "molecule": "record-list",
      "signal": "<ul> rows", "shouldUse": "Table" },
    { "route": "/settings", "file": "...", "molecule": "field",
      "signal": "raw <select>", "shouldUse": "shadcn Select" }
  ]
}
```

## Fleet aggregation + triage

A synthesis pass merges the per-project records into:

```jsonc
{
  "byArchetype": {
    "A": { "adopted": ["hk-crm"], "handRolled": ["brickshop-manager","pmo"], "absent": [...] }
  },
  "gaps": [
    { "shape": "kanban board", "recursIn": ["hk-crm","controlling-app"], "candidate": true }
  ],
  "divergence": [
    { "key": "C", "variants": [ {project, file, howItDiffers} ], "verdict": "?" }
  ],
  "adoption": [ { "project": "brickshop-manager", "adopted": 0, "handRolled": 4 } ],
  "triage": [
    { "finding": "...", "tier": "red|yellow|green", "action": "..." }
  ]
}
```

### Triage rubric (the README's green/yellow/red, applied fleet-wide)

- 🟢 **green** — adopted + current. No action.
- 🟡 **yellow** — *essential* variation (domain-appropriate divergence; e.g. deep
  vs shallow entity). Action: leave it, or capture it as a **variant axis** on the
  archetype (like `crud-dialog layout`). NOT something to flatten.
- 🔴 **red** — *accidental* drift: a page that hand-rolls a shape an archetype
  already covers, or an adopted archetype behind on version. Action: adopt /
  re-broadcast / reconcile.
- ➕ **gap** — a shape recurring in ≥ 2 projects with no archetype. Action: promote
  a new archetype (rule-of-2, now evidence-backed).
- 🔴 **molecule drift** (from the within-page scan) — a hand-rolled molecule where a
  shared owner exists. Always red, but usually *low-effort*: swap to the primitive,
  no archetype decision needed. Cluster fleet-wide by molecule (e.g. "7 raw
  `<select>`s across 4 projects") so a single sweep can fix a whole class — the same
  move this donor made in the 2026-06-14 consolidation pass.

The hardest, most valuable call is **yellow vs red** — distinguishing essential
variation from accidental drift. The audit proposes a tier per finding; a human
confirms. Default ambiguous cases to yellow (don't unify away real difference).

## How it runs

A **multi-agent fan-out** (one scanner agent per project, in parallel) → a single
synthesis agent that aggregates, clusters gaps, and triages. Read-only; produces
the report above + a prioritized action list (promote X, add variant axis to Y,
adopt Z in project W). It changes nothing — every action is a proposal a human
schedules (a `/ticket`, a donor iteration session, a `/style-archetypes --update`).

This is the runner the dashboard hub eventually hosts (Phase 3); until then it runs
as an on-demand workflow.

## Explicitly out of scope

- No code changes, no commits, no adoption — strictly an inventory + proposals.
- No flag-day re-broadcast. Findings feed the existing incremental machinery
  (promote, iterate, adopt-per-project) tracked by the drift + coverage views.
