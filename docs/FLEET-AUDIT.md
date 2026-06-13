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
  "versionDrift": [ { "key": "J", "local": "1.2", "baseline": "1.3", "severity": "minor" } ]
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
