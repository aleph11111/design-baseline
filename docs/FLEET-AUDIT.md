# Fleet audit — fit & drift

The evidence layer before any unify-and-adopt decision. A **read-only** sweep that
maps every frontend project's pages onto the baseline archetypes and tells you
three things: what's **adopted**, what's **drifted/diverged**, and what's **missing**
(candidate archetypes). It never changes code — its output is an inventory + a
triaged action list.

This is the automated application of `docs/CHOOSING-A-SURFACE.md`: where that doc
is the human rubric for picking a surface, the audit *measures* which surface each
real page actually uses and whether it should.

## What it answers

- **Fit** (every `surfaces:["frontend"]` project, adopted or not): for each route,
  which archetype does this page *resemble*, how strongly, and does it use the
  baseline primitive or a hand-rolled equivalent? Routes that resemble *nothing*
  are **gaps** → candidate new archetypes.
- **Drift** (adopted projects): which adopted archetype versions trail the donor
  (`MANIFEST.json`), and which pages match an archetype's shape but bypass its
  reference primitive (silent divergence the version-drift scan can't see).
- **Adoption quality** (Axis C — adopted pages): given a page *does* use the
  archetype shell, did it also remove the content the archetype subsumes, or did it
  wrap the old page? Scored against the archetype's `## Acceptance gate`; a wrapper
  adoption is `adopted: true` AND red. See [`ADOPTION-QUALITY.md`](ADOPTION-QUALITY.md).

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

### Two axes for every hand-rolled element

A hand-rolled element raises **two independent questions** — don't conflate them
(an earlier version of this doc did, and it created a false "sanctioned exception"
bucket that let things drift visually):

- **Axis A — should it be a shared *component* the donor owns?** Yes if its
  *structure + behaviour* recurs (rule-of-2) and is stable. Output: **promote** (a
  new primitive, a variant on an existing one, or a thin **wrapper** around a native
  control). "Special functionality" is **not** an escape — an inline-cell editor is
  functionally special but visually just an `<Input>`/`<Select>`; it gets a thin
  `<CellInput>`/`<CellSelect>` primitive, not an exemption. A chronological feed is
  not a `<Table>`, but the donor already owns the feed molecule (`FeedItem`) — adopt
  it. Even native-only gaps (`<input type=color|file>`) get **wrapped**
  (`<ColorField>`/`<FileField>`) so they're shared *and* on-token.
- **Axis B — must it obey the shared *visual language* (tokens, spacing scale,
  radius, focus ring, typography, composed atoms)?** **Always yes — no exceptions.**
  This applies to *every* element, including the legitimately project-specific ones
  the donor will never own. An add-on doesn't have to *be* a baseline component, but
  it must *pass conformance* (see the Conformance rubric below) so the seam between
  "base system" and "per-project add-on" is invisible.

The only genuine "leave it raw" cases are elements that are **both** singular (fails
rule-of-2) **and** already fully token-conformant. Everything else is **promote**
(Axis A) and/or **conform** (Axis B). Record the routing per finding: `promote` |
`wrap` | `adopt-existing` | `conform-only` | `sanctioned` (rare).

### Molecule rubric (hand-rolled content molecules → owner)

This is the **Axis-A** scan: grep-able heuristics for hand-rolled content molecules
that a baseline component already owns. Each match is a 🔴 drift hit pointing at the
owner (see STYLE.md "Shared content molecules"). Signals, not proof — a human
confirms. Where the donor lacks the owner but the pattern recurs, the routing is
**promote/wrap**, not "exception" (the matrix-grid pivot `<table>` stays native, but
its inline-cell control is a `<CellSelect>` candidate, not a permanent carve-out).

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

### Conformance rubric (Axis B — applies to EVERY component, incl. project add-ons)

The molecule rubric only catches "you hand-rolled a thing we own." This rubric
catches the deeper problem: **a hand-rolled thing that doesn't look like ours.** It
runs against *all* components — baseline, adopted, and the legit project-specific
add-ons the donor will never own — because that's what keeps the add-ons visually
native (the "no one can tell base from add-on" goal). A component passes Axis B when
it uses **tokens + atoms + recipes**, not literal values or raw HTML.

| Conformance violation (signal) | Should use |
|--------------------------------|------------|
| Literal palette color: `bg-/text-/border-(slate|gray|zinc|green|red|blue|amber|yellow|emerald|teal)-\d00` | semantic tokens (`bg-muted`, `text-muted-foreground`, `border-input`, `text-destructive`, `bg-primary`, `<Badge variant>`) |
| Hard-coded hex/rgb in `className` or `style` | tokens |
| `focus:ring-1` / `focus:outline-none` without `focus-visible:ring-2 ring-ring` | the standard focus ring |
| Hard-coded radius/shadow (`rounded-[..]`, arbitrary `shadow-[..]`) | `rounded-md`/`rounded-lg`, token shadows |
| Ad-hoc spacing off the scale (`p-[7px]`, `gap-[5px]`) | the 4px spacing scale + the rhythm in STYLE.md |
| Raw `<button>`/`<input>`/`<select>`/`<textarea>` where a shadcn atom exists | the shadcn atom (`Button`/`Input`/…) |
| Re-declared typography (`text-[13px]`, custom uppercase tracking) | the heading/overline signatures (`OVERLINE_CLASS`, etc.) |

A conformance hit is **not** "you must adopt a baseline component" — it's "however
you build this, build it from our substrate." It is the cheapest, highest-coverage
check in the audit and the one that makes add-ons indistinguishable from baseline.
Record hits in `conformanceViolations` (schema below).

### Adoption-quality rubric (Axis C — the wrapper-adoption detector)

Axes A/B catch *not using* the primitive. Axis C catches the opposite failure: a page
that **does** import an archetype shell — so the page-level pass scores it
`adopted: true` — but kept the legacy content the archetype was meant to replace (the
status band, the toolbar, the tab-as-primary-nav). The shell is new; the furniture is
old. The full rationale, scan model, and rollout loop live in
[`ADOPTION-QUALITY.md`](ADOPTION-QUALITY.md); the mechanics:

1. **Deterministic tripwires** — `audit-signals.json → adoptionQuality`. Each is gated
   by `coOccursWith` (the archetype's shell import names) so it ONLY fires on a file
   that actually adopts that archetype. A tripwire is a **candidate, never a verdict**
   (`tier: red|yellow`); it flags a route for stage 2.
2. **Per-page acceptance gate** — for every route the page-level pass marks `adopted`
   (and every tripwire-flagged route), walk the archetype's **`## Acceptance gate`**
   (the canonical checklist in `docs/archetypes/<slug>.md`, restating Axis A/B via the
   shared S1–S6 conformance spine). Each failed REQUIRED box is an Axis-C finding;
   `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`, and `wrapper = true`
   when score < 1.0. Record per route in `adoptionQuality` (schema below).

A page can now be **`adopted: true` AND red** — the state Axes A/B couldn't express.
Every 🔴 wrapper-adoption route routes to the teardown ritual
([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)): DELETE-first,
then re-map slots, with the filled inventory table + checked gate as required PR
deliverables.

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
      "notes": "matches detail-overview but doesn't use DetailSection" },
    { "route": "/orders/:id", "file": "...",
      "archetype": "C", "fit": 1.0, "adopted": true,
      "signals": ["DetailOverviewShell","layout=rail"],
      "adoptionQuality": {                      // Axis C — only on adopted shell archetypes
        "score": 0.4, "wrapper": true,          // adopted the shell, kept legacy content
        "findings": [
          { "box": "status-one-home", "tier": "red", "fix": "delete band; status→header, meta→rail facts" },
          { "box": "content-stacked", "tier": "red", "fix": "stack primary sections; tabs only for secondary" }
        ]
      },
      "notes": "wrapper adoption — run the teardown ritual" }
  ],
  "gaps": [ { "route": "/pipeline", "shape": "kanban board", "signals": [...] } ],
  "versionDrift": [ { "key": "J", "local": "1.2", "baseline": "1.3", "severity": "minor" } ],
  "moleculeDrift": [
    { "route": "/companies", "file": "...", "molecule": "record-list",
      "signal": "<ul> rows", "shouldUse": "Table", "route_axis": "promote-or-adopt" }
  ],
  "conformanceViolations": [
    { "file": "...", "rule": "literal-color", "signal": "bg-green-100",
      "shouldUse": "bg-muted / Badge variant" }
  ],
  "handRolledMolecules": [
    { "pattern": "inline-cell editor", "file": "...", "axisA": "promote",
      "donorTarget": "CellInput", "tokenConformant": true }
  ]
}
```

`handRolledMolecules` records *every* recurring-looking element a page builds itself
(even ones the donor doesn't own yet) so the fleet pass can cluster them — that
cluster is what powers the promotion radar.

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
  "adoptionQuality": [
    { "project": "brickshop-manager", "adopted": 5, "wrappers": 2, "meanScore": 0.71,
      "redRoutes": ["/orders/:id"] }
  ],
  "conformance": [ { "project": "...", "violations": 12, "topRules": ["literal-color","raw-html"] } ],
  "promotionRadar": [
    { "pattern": "inline-cell editor", "projects": ["brickshop-manager","controlling-app","hk-crm"],
      "count": 3, "axisA": "promote", "donorTarget": "CellInput/CellSelect", "status": "candidate" },
    { "pattern": "skeleton list loader", "projects": ["hk-crm","brickshop-manager","controlling-app"],
      "count": 3, "axisA": "promote", "donorTarget": "ListSkeleton", "status": "candidate" }
  ],
  "triage": [
    { "finding": "...", "tier": "red|yellow|green", "action": "..." }
  ]
}
```

### Promotion radar (the rule-of-2 trip-wire)

The fleet pass clusters every project's `handRolledMolecules` by pattern. **The
moment a pattern appears in a 2nd project, it trips onto the radar as a promotion
candidate** — this is how a growing add-on layer becomes *visible* instead of
silently accumulating. Each radar entry carries `projects[]`, `count`, the Axis-A
verdict (`promote` / `wrap` / `adopt-existing`), a `donorTarget`, and a `status`
(`candidate` → `promoting` → `promoted` | `sanctioned`). Promotions flow back into
the donor; the next adoption cycle then *absorbs* the pattern instead of deferring
it. The radar is the durable artifact the dashboard hub renders (see
`docs/PROMOTION-RADAR.{md,json}`).

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
- 🔴 **molecule drift** (Axis A, within-page scan) — a hand-rolled molecule where a
  shared owner exists. Always red, but usually *low-effort*: swap to the primitive.
  Cluster fleet-wide (e.g. "7 raw `<select>`s across 4 projects") so one sweep fixes
  a whole class — the move this donor made in the 2026-06-14 consolidation pass.
- 🟠 **conformance violation** (Axis B) — an element off the visual substrate
  (literal colors, raw HTML, off-token focus/spacing). Applies to *every* component
  incl. legit add-ons. Action: re-base on tokens/atoms — does **not** require a
  baseline component. This is what keeps add-ons looking native; treat a rising
  conformance count as the early warning that the seam is becoming visible.
- 🔴 **wrapper adoption** (Axis C) — an `adopted: true` page that fails its archetype's
  `## Acceptance gate`: it imports the shell but kept the content the archetype
  subsumes (status band, equal-weight toolbar, tab-as-primary-nav). Distinct from
  molecule drift (didn't use a primitive) and conformance (off-token) — here the
  primitive *is* used, but the subtraction wasn't done. Action: run the **teardown
  ritual** ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)) on
  the route — DELETE-first, then re-map slots; the filled inventory table + checked
  gate are required PR deliverables. Re-audit flips it green at `score → 1.0`.
- ➕ **promotion candidate** (rule-of-2 on `handRolledMolecules`) — a pattern the
  donor doesn't own yet, now hand-rolled in ≥ 2 projects. Action: promote/wrap into
  the donor (component **or** archetype). This is the root-cause heal — it removes
  the reason the pattern keeps being hand-rolled.

The hardest, most valuable call is **yellow vs red** — distinguishing essential
variation from accidental drift. The audit proposes a tier per finding; a human
confirms. Default ambiguous cases to yellow (don't unify away real difference).

## How it runs

A **multi-agent fan-out** (one scanner agent per project, in parallel) → a single
synthesis agent that aggregates, clusters gaps, and triages. Read-only; produces
the report above + a prioritized action list (promote X, add variant axis to Y,
adopt Z in project W). Each scanner runs all three axes: the deterministic molecule
(Axis A) + conformance (Axis B) + adoption-quality tripwire (Axis C) greps from
`audit-signals.json`, then — for every route it marks `adopted` for a shell archetype,
plus every Axis-C-flagged route — the per-page **acceptance-gate** pass that turns
tripwire candidates into `adoptionQuality` verdicts. It changes nothing — every action
is a proposal a human schedules (a `/ticket`, a donor iteration session, a
`/style-archetypes --update`; for wrapper adoptions, the teardown ritual).

This is the runner the dashboard hub eventually hosts (Phase 3); until then it runs
as an on-demand workflow.

## Explicitly out of scope

- No code changes, no commits, no adoption — strictly an inventory + proposals.
- No flag-day re-broadcast. Findings feed the existing incremental machinery
  (promote, iterate, adopt-per-project) tracked by the drift + coverage views.
