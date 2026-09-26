# PACKAGE.md — installing the design-baseline as a source package

The Design Baseline can be consumed as a **git source package** instead of a `cp -R`
copy. A consumer adds one dependency line and four wiring lines:

```
"design-baseline": "github:aleph11111/design-baseline#v0.2.3"
```

Everything below is load-bearing — each line was proven in a throwaway Vite +
Tailwind 4 consumer (tag `v0.2.0`, `@tailwindcss/postcss` pipeline) that imports
`DetailOverviewShell` from `design-baseline/archetypes/detail-overview` and applies
the wiring. The matrix at the bottom shows both CSS lines failing independently.

> The package ships **source** (`.tsx` / `.ts`), never compiled JS or CSS. The
> consumer's own toolchain transpiles the TypeScript and compiles every Tailwind
> class from source. This is the whole answer to the "Compiled-CSS version skew"
> hazard in `STACK.md` (hazard 3) — there is no compiled bundle to drift out of
> sync. See the correction there.

## The four wiring lines

### 1. `package.json` — pin the tag

A git dependency against a tag, so a version bump is a one-digit change and the
consumed commit is pinned (P7 of the spec — no registry publish).

```jsonc
// package.json
"design-baseline": "github:aleph11111/design-baseline#v0.2.3"
```

`react` / `react-dom` are the package's **peer dependencies** (`^19`) — the
consumer brings its own. The Radix set and the rest of the primitive stack are
real `dependencies` and install with the package; do not duplicate them.

### 2. `tsconfig.json` — point the component directories at the package (C2/C3)

The package **owns** `src/components/ui/`. A consumer re-points the `ui/` alias to
a **two-entry array, project first**: the project's own copy resolves first, so a
file the consumer keeps (a triaged fork, a consumer-only primitive — see
*▸ Migrating a vendored consumer*) **shadows** the package's copy without moving a
single import — and the package's own copy is what gets compiled. Ordering matters:
the three more-specific `@/components/...` entries come **before** `@/*`.

```jsonc
// tsconfig.json — more specific paths first; ui/ array project-first (C2)
{
  "compilerOptions": {
    "paths": {
      "@/components/ui/*": [
        "./src/components/ui/*",
        "./node_modules/design-baseline/src/components/ui/*"
      ],
      "@/components/layout/*": [
        "./src/components/layout/*",
        "./node_modules/design-baseline/src/components/layout/*"
      ],
      "@/components/archetypes/*": [
        "./src/components/archetypes/*",
        "./node_modules/design-baseline/src/components/archetypes/*"
      ],
      "@/*": ["./src/*"]
    }
  }
}
```

The package owns `ui/`, `layout/` and `archetypes/`, so all three get the blanket
two-entry re-point. `lib/`, `hooks/` and `utils/` get **no** entry (C3): after
`pkg`'s relativization the package resolves its own internals by relative import and
never through `@/`, so an alias re-point would only make the package's own source
resolve *back into the consumer's* `src/`. (Donor-dev-only internals like
`utils/logger` likewise stay consumer-local.)

This narrows ADR-0004's "`ui/` stays vendored" clause for projects that adopt an
archetype (not just the shell) — recorded in `docs/audits/` as a distribution-layer
note. The two-entry `ui/` array is what makes the narrowing safe: a consumer that
keeps a fork shadows it as a project file rather than having to delete `ui/`
wholesale.

### 3. the project's own `tokens.css` — import the layer + `@source` the package

Two independently load-bearing lines. The `@import` loads the donor-owned token
layer (its `@theme` is what the candidate classes resolve against); the `@source`
tells Tailwind to scan the package's source so un-imported component classes are
still emitted. Tailwind 4 does **not** scan `node_modules` on its own — `@source`
is a hard requirement, not a courtesy.

```css
/* the project's own tokens.css (here at src/styles/tokens.css) */
@import "design-baseline/tokens.layer.css";
@source "../../node_modules/design-baseline/src";
```

The `@source` path is **relative to the CSS file that imports it**, not to the
project root: for a `tokens.css` sitting at `src/styles/`, the package is two
levels up — `../../node_modules/...`. (The greenfield proof at the bottom used the
one-deep form from a root-level stylesheet; a consumer at the common `src/styles/`
location needs the two-deep form, or Tailwind silently scans nothing.)

The brand half of the tokens (the `:root` / `.dark` HSL values) stays the
consumer's own `tokens.css` — the package does not export the brand `tokens.css`,
so a donor-side default can never silently overwrite the brand palette. The same
brand file is where a project binds its own faces: a `@theme` re-declaration of
`--font-sans` / `--font-mono` appended to it (the donor ships a commented FONT
BINDING block there, ready to uncomment) is the supported way to override the
house faces — a later `@theme` replaces the layer's value rather than stacking,
and leaving it commented keeps a donor-side face change reaching the project on
a version bump. `docs/STYLE.md` §Typography documents the same seam.

### 4. `next.config.js` — `transpilePackages` (Next consumers only)

Next skips `node_modules` by default; opt the package in so its `.tsx` is
transpiled by the consumer's build. Vite/webpack consumers that already resolve
`.tsx` do not need this.

```js
// next.config.js — Next consumers only
module.exports = {
  transpilePackages: ["design-baseline"],
}
```

## Scaffolding a new page

A new page should start conformant instead of being copied from a neighbouring
page along with that page's drift. The package ships a generator for this:

```bash
npx design-baseline new-page <archetype> <Name> [--out <dir>] [--register <cmd>]
# e.g. npx design-baseline new-page list-with-detail Supplier --out src/pages
```

It writes `<dir>/<Name>Page.tsx` (never overwriting). The page imports its own
`design-baseline/archetypes/<slug>` plus consumer-local paths only (react,
react-hook-form, and the project's `@/components/ui/*` alias from wiring line 2,
for `state-view`). It renders the loading, error and empty branches: through the
shell's state props where the shell owns them, through `StateView` where the
page or widget owns them, and not at all where the contract gives them to the
route (detail-overview, matrix-grid take resolved data as props). Its data sits
behind a local stub (`use<Name>…()` / `save<Name>()`) to replace. `npx design-baseline new-page --help` lists the
archetypes that have a template.

Route registration is the consumer's: pass `--register <cmd>` and the command
runs after the file is written, with `DESIGN_BASELINE_PAGE_ARCHETYPE`,
`DESIGN_BASELINE_PAGE_NAME` and `DESIGN_BASELINE_PAGE_FILE` in its environment
(e.g. a script that adds the `<Route>` and the route-registry entry). A failing
command fails the generator with its exit code.

## The enforcement stack — four gates, cheapest first

The installed package keeps its guarantees only if the consumer can't silently
drift. The contract a project takes on with the package, in mechanical order:

| Gate | Catches | Mechanism | When |
|------|---------|-----------|------|
| 1. Types | wrong props, wrong variants | vendored `.d.ts` / package types, `tsc --noEmit` | on save / CI |
| 2. Adherence lint | literal Tailwind palette classes, weak focus rings, raw `<h1>`/`<table>`/`<button>`/`<input>`/`<select>`/`<textarea>` | `scripts/lint-design.mjs` (zero-dep scan, tag + regex rules in `_adherence.json`) | pre-commit + CI |
| 3. Visual baselines | drift the linter can't see (spacing, chrome, states) | Playwright `toHaveScreenshot()` per archetype page | CI |
| 4. Review against docs | surface choice, placement, navigation model | `SURFACES.md` + `PLACEMENT.md` + `CHOOSING-A-SURFACE.md` as the review checklist | PR review |

Gates 1–3 are mechanical; gate 4 is human but checklist-driven. A rule that lives
only in prose (gate 4) and keeps being violated should be pushed down the stack —
into the lint config (gate 2) or a snapshot (gate 3) — so it stops costing
review attention. The two-way feedback loop that feeds gate 2 (project scars
upstream, donor changes downstream) is documented in
[`docs/PROMOTION-RADAR.md`](PROMOTION-RADAR.md).

## Migrating a vendored consumer

The wiring above is the **greenfield** path. A project that already carries a
`cp -R` corpus — hk-crm, the first real consumer, has 155 files under
`src/components/{ui,layout,archetypes}`, a pre-#178 merged `tokens.css`, and
102 per-file vendor stamps (38 × `design-baseline@0.1.0`, 64 × `@0.10.0`) — does
not delete that corpus and re-point blindly. It **triages the fork first**, then
installs. The steps are ordered so the fork is visible *before* any file moves;
the whole path for hk-crm was dry-run proven at tag `v0.2.0` and re-validated at
`v0.2.1` (see the `## Outcome` sections of `package-ui-ownership-and-vendored-consumer-runbook`
and `package-tag-post-v0-2-0-sync`).

### Step 1 — Fork triage (normalise, then diff; before anything is deleted)

Per **C5** of the `consumer-migration` design section. For every file the project
carries that the installed package tag also ships, remove the noise that is not a
choice, then diff what remains. That is the **normalisation** pass:

1. strip the per-file **vendor stamp** header line (`design-baseline@…`),
2. **compare** the `"use client"` directive line — do not strip it away the
   `v0.2.0` runbook did. After ADR-0006 the package deliberately carries the
   directive on 34 of its 41 `ui/` leaves and intentionally leaves 7 server-safe
   (`accordion`, `calendar`, `cell-input`, `color-field`, `icon-avatar`,
   `progress`, `segmented-control`), so presence/absence encodes a real RSC-boundary
   choice. A file whose only difference after item 1/3 is the directive is
   boundary-divergent, not identical: keep the project copy until the boundary —
   not just the code — matches (see the closed-gap note in the Guard below).
3. rewrite `@/components/ui/…` and the relative siblings to one form so the
   import-graph difference does not read as a content difference.

What the normalisation reveals is the fork, and the fork decides the file's fate:

| Triage outcome (diff after normalisation) | Meaning | Action |
|---|---|---|
| identical | vendor drift only — the consumer carried stale copy | **delete** the project file; the alias array resolves the package's copy (C2) |
| differs, donor is ahead | consumer copy is behind a donor change | **take the package's file** — delete the project copy, same as identical |
| differs, consumer is ahead **and general** | a change worth promoting back | keep the project file (it shadows the package's via the project-first array) and `/promote-archetype` it; delete it only once the promotion lands in the donor and the consumer re-points at that new tag |
| differs, **locale** | not drift at all — the consumer's copy is its own localisation | **permanent consumer-owned file** — keep it, never un-fork it at file granularity (the packaged surface is English defaults overridable per call site) |

Measured against hk-crm at tag `v0.2.1` (the `v0.2.0` baseline is in the
`## Outcome` of `package-ui-ownership-and-vendored-consumer-runbook`; its 8 forked
files included `alert`/`badge`, which the status-token backport
`cb77b0e` then synced to the package, collapsing them into the identical set),
of the 36 `ui/` primitives the project and the package share, the normalisation
collapses **30 to identical** (they would otherwise read as divergent through
stamps and import forms) and **6 remain genuinely forked** — `button` (donor
ahead: dev-warning on icon buttons), `confirmation-dialog`, `error-boundary`
(consumer ahead, general: locale text + `console.error` vs the donor's
`utils/logger` — promote-or-keep), `file-field` (donor ahead: native
drag-and-drop + error/required via the `fieldFrame` seam), `form` (consumer
ahead: `required` aria/mark), and `state-view` (**locale** — hk's German
defaults). Beyond the 36 shared, the project keeps **13 consumer-only `ui/`
files** (`breadcrumb`, `labeled-control`, `native-field`, `results-count`,
`route-error`, `select-field`, `select-filter`, `table-row-actions`,
`textarea-field`, `view-toggle` + their 3 unit tests) that the package has none
of. The two-entry array (the project-first entry) is what makes all 13 and the 6
forks *shadow* the package instead of breaking — a single-entry re-point to
`node_modules/…` alone makes them unresolvable across every file that imports them.

**Record the kept-file count in the radar** (step 5): all 30 identicals are also
**directive-consistent** at `v0.2.1` (28 pairs both carry `"use client"`, 2 pairs —
`icon-avatar`, `segmented-control` — both carry none), so every deletion leaves the
RSC boundary unchanged and nothing has to stay as a boundary guard. The 6 forks
and the 13 consumer-only files all stay. So of hk-crm's 49 `ui/` files, **19 keep**
(6 + 13) and **30 delete**. The number of files kept **is** the visible guard that a
fork survived the swap — shadowing is invisible at the import site.

### Step 2 — Split the brand `tokens.css`

Move the donor-owned half of the project's `tokens.css` onto the layer import and
keep the brand half in the project's own file, exactly as wiring line 3 documents
(`@import "design-baseline/tokens.layer.css"` + the `@source` package scan). The
brand `:root`/`.dark` HSL values and the project's own `@theme` font stanza (e.g.
hk-crm's IBM Plex `next/font` binding) stay project-owned. A `cp -R` consumer's
merged `tokens.css` is the pre-#178 state this step splits.

### Closed-API removals per archetype version (read before step 3)

Step 3 is mechanical only for a consumer whose archetype call sites already match
the installed tag's closed API. A consumer that last synced before these closings,
or one that grew its own props on a locally evolved shell (the pre-donor
`brickshop-manager` lineage), gets type errors the moment the alias array resolves
the package. brickshop measured 48 of them at `v0.2.3`. The props below were
deleted or tightened by the MAJOR bumps that shipped in `v0.2.0`:

| Archetype (MANIFEST version) | Prop | Change | Call-site migration |
|---|---|---|---|
| `detail-overview` (3.0, #122) | `DetailOverviewShell header?: ReactNode` | deleted | Pass `title` / `subtitle` / `badges` / `actions` as data |
| `detail-overview` (3.0, #122) | `DetailOverviewShell stats?: ReactNode` | now `StatItem[]` | Pass `{ label, value, hint? }` items; the shell renders the tile row |
| `detail-overview` (3.0, #122) | `surface`, `rhythm`, `headerFill`, `className` | deleted | Drop them; set the header fill on `<AppShell headerFill=…>` |
| `analytics-dashboard` (3.0, #195) | `DashboardGrid columns` | deleted | Drop it; the ladder is fixed (1 / 2 at `sm` / 3 at `lg`) |
| `analytics-dashboard` (3.0, #195) | `StatTileRow columns` | deleted | Drop it; the cell count comes from the number of children (2–4) |
| `analytics-dashboard` (3.0, #195) | `DashboardWidget span` | now required | Pass `span` by the contract's Layer 6 keying rule (primary trend `3`, comparison/breakdown `2`, else `1`) |
| `detail-overview` | `KeyValueRow mono` | never a donor prop | Drop it; the value always renders mono and tabular |

A consumer carrying any of these should **converge each archetype first**: move its
call sites to the closed API against its own vendored copy, one archetype per
commit, until it type-checks. Then run step 3. A prop the consumer needs that the
closed API refuses is a fork (step 1's keep-or-promote decision), not something to
cast away. Extend this table whenever a MAJOR MANIFEST bump removes or tightens
a prop.

### Step 3 — Install, wire, delete

1. Add the dependency pin (wiring line 1) and the `paths` entries (wiring line 2),
   and `transpilePackages` (wiring line 4) for Next consumers.
2. **Delete only the project files step 1 ruled as delete-or-take-the-package's**,
   in the same commit as the wiring, so the alias array alone resolves the
   package's copy of them. At `v0.2.1` that is the full 30-identical set — none
   are boundary-divergent, so there is nothing held back as a guard. Everything
   else — the 6 forks, the 13 consumer-only `ui/` files, and a file step 1 left
   boundary-divergent — **stays** as a project file shadowing the package, as
   does all of `layout/` and `archetypes/`. A wholesale `rm -rf
   src/components/ui/` is what the old single-entry instruction did; it is the
   anti-pattern this runbook replaces.
3. Build and type-check before touching any stamp.

### Step 4 — Drop the per-file vendor stamps, in the same commit as step 3's deletions

The stamps exist to mark which vendored copy a file was copied from, so the project
can tell drift from drift. Once the package is the source of truth and the alias
array resolves it, the stamps are dead weight *and* lie (they still say
`@0.1.0`/`@0.10.0` while the project runs `@v0.2.1`). Remove them from every file
step 1 triaged, in the same commit as the deletions, so a later `git blame`/diff
shows the swap and the stamp-removal as one change. The stamps on the kept forks
remain until each one resolves (step 1's promote-or-keep decision).

### Step 5 — Record the tag (and the kept-file count) in the radar

Add the project to the package-tag `sync` row in `docs/promotion-radar.json`,
naming **both** the installed `design-baseline#<tag>` and the **kept-file count**
(C6). The tag is the single stamp that replaces 102 per-file ones; the kept-file
count is the visible guard that the fork survived the swap. A consumer more than
one minor behind the newest donor tag — or whose kept count grew since last
recorded — is a `sync` row.

### Step 6 — Retire the doc corpus the swap left without a reader

Steps 1–5 swapped the *component* copies for the package. The vendored consumer
carries a second, doc-shaped corpus — the methodology docs, `SURFACES.md`, the
archetype pair forks and their `MANIFEST.json`, the chrome JSON, and the
`design:`/`patterns:` `## Doc Paths` keys — and that retirement is the sixth
step of this runbook, not a separate document: a consumer that runs steps 1–5 and
then hunts for a second document is how a half-migration happens. It is the same
three-way ownership split `ui/` got in step 1 (C2) — package-owned, dead,
project-owned-kept — not a flat delete list, because "no reader left" is false
for a third of the artifacts. Two caveats before the table. The `node_modules/…`
rows are a true instruction only against a tag that ships those docs
(`package-ships-methodology-docs-single-version-source`) — the package does not
ship `docs/ADOPTION.md` or `docs/ADOPTION-QUALITY.md`, which is what their rows
say. The retired copy-distribution command that could once re-vendor a doc
this step 6 deletes ships no such writer any more, so the re-vendor vector is
gone; the order stays reader, then file, then writer.

| Artifact | Owner after the swap | Action |
|---|---|---|
| `docs/CHOOSING-A-SURFACE.md`, `docs/PLACEMENT.md`, `docs/STACK.md`, `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md` | package | Delete the copy; read `node_modules/design-baseline/docs/<name>` |
| `docs/ADOPTION.md` **with** `version:` frontmatter | — | Delete. The contract it carries is `donor-docs`' rewrite, and "adopted" is a version in `package.json` |
| `docs/ADOPTION.md` **without** `version:` | project | Keep — it is the project's own adoption record at a donor path (`hk-crm`) |
| `docs/ADOPTION-QUALITY.md`, `docs/ADOPTION-STATUS.md` | — | Delete. The nine-gate checklist has no meaning without the command that wrote it |
| `docs/FLEET-AUDIT.md` in a consumer | — | Delete. Donor-internal; the copy in `hk-crm` was never vendored into consumers |
| `docs/SURFACES.md` | project | Keep. Its reader is review, not adoption |
| `_adherence.json`, `scripts/lint-design.mjs`, the `lint:design` script | project | Keep, retargeted. This phase's title says so |
| `docs/design-baseline-chrome.json` | — | Delete. `drop-drift-machinery` removed its last reader (E2) |
| `docs/archetypes/<slug>.md` forks | package | Delete the fork; the successor is the installed contract at `node_modules/design-baseline/docs/archetypes/<slug>.md` — the closed API's props are the contract (the binding is the shipped typed export, not a doc) |
| `docs/archetypes/MANIFEST.json` | project, shrunk | Drop every entry carrying a `version:` (baseline adoptions). Keep versionless local entries. Delete the file only if none remain (F4) |
| Per-file `design-baseline@<ver>` vendor stamps | — | Delete — already runbook step 4; the installed tag is the stamp |
| `## Doc Paths` `design:` key | — | Remove |
| `## Doc Paths` `patterns:` key | conditional | Remove iff `docs/archetypes/` is now gone; keep if F4 left local rows |

**`brickshop-manager` exception (F9).** Its `docs/archetypes/` corpus predates
the donor (its own ADR-0030, April 2026): the `.md` corpus is **archived** to
`docs/archive/archetypes-2026/` on its migration, not deleted — but its
`MANIFEST.json` stays **live** at `docs/archetypes/MANIFEST.json` carrying its
six versionless local rows (`detail-view`, `settings-form`, `domain-hub`,
`lookup`, `feed`, `item-selector`), the only live input the
promotion-candidate axis in the dashboard reads from the consumer side. The
archive bullet is about prose; archiving the axis input alongside it would
silently do what the F4 shrink rule exists to prevent.

Applying the table to the four measured consumers: `hk-crm` / `controlling-app`
/ `mistra` carry no versionless local entries, so their `MANIFEST.json` shrinks
to empty and is **deleted**; `brickshop-manager`'s shrinks to its six local
rows and is **kept**, together with its `patterns:` key.

### Closed gap: the `"use client"` directive (ADR-0006)

The hazard this section used to document is closed. At `v0.2.0` the package's
`ui/` leaves shipped **without** the `"use client"` directive the consumer's
vendored copies carry (48 of the package's 49 `ui/` leaves lacked it; hk-crm's
copies carried it). The donor's own gallery is client-rooted (`createRoot` +
`HashRouter` + `next-themes`' `ThemeProvider`), so it never exercises a `ui/`
leaf's server boundary — the gap was invisible there and only surfaced in a real
Next SSR consumer: let the alias resolve the directive-less package copy of a
directive-carrying leaf and the file's RSC boundary flips, crashing with
`f.createContext is not a function`. The donor-side fix landed as
`package-ui-leaves-use-client-directive-gap` (PR #234, **ADR-0006**): 97
consumer-measured `ui/` leaves now carry the directive — 34 of the 41
implementation leaves — guarded as `verify-exports` **invariant 7** so the donor
can never quietly regress to the directive-less surface again. The 7 leaves that
still carry none are the donor's deliberate server-safe set
(`accordion`, `calendar`, `cell-input`, `color-field`, `icon-avatar`,
`progress`, `segmented-control`). The v0.2.1 re-validation (the step-1 measurement
above, recorded in the radar sync row below and the `## Outcome` of
`package-tag-post-v0-2-0-sync`) deletes every identical `ui/` file — all 30
directive-consistent — and both gates pass, proving the gap is gone on the
consumer side too. A consumer at `v0.2.0` (or earlier) still must keep every
directive-carrying `ui/` leaf as a project file.

## Measured caveats (context, not a 5th wiring line)

- **The layout barrel drags two framework extras into the import graph.**
  `design-baseline/layout` (re-exported by every archetype `index.ts` for
  `StatTileRow` / `ProgressTracker` / etc.) carries `BottomNav`
  (`react-router-dom`) and `ThemeToggle` / `sonner` (`next-themes`). A consumer
  that type-checks the package source therefore needs those resolvable:
  `next-themes` ships in the package's real `dependencies` and installs
  automatically; `react-router-dom` is a **donor-dev** dependency and must be
  added by the consumer (Vite/webpack) or by Next's own router. This is why the
  throwaway proof installed `react-router-dom` — the wiring line is unchanged.
- **`process.env.NODE_ENV` in `ui/button.tsx` needs `@types/node`** for a
  consumer that type-checks the package source (donor-dev-only, not bundled).

## Proof matrix (throwaway consumer, tag v0.2.0)

A consumer importing `DetailOverviewShell` (rail layout, stats, sections), with
its `tokens.css` varying only the two CSS lines above. CSS presence in `dist`:

| `tokens.css` | rail (imported `DetailOverviewShell`) | `min-w-[640px]` (non-imported package) | `bg-success/10` (layer `@theme`) |
|---|:--:|:--:|:--:|
| bare `@import "tailwindcss"` only | ✗ | ✗ | ✗ |
| layer `@import` only (no `@source`) | ✗ | ✗ | ✗ |
| `@source` only (no layer) | ✓ | ✓ | ✗ |
| **layer `@import` + `@source` (the wiring)** | ✓ | ✓ | ✓ |

- **Removing `@source` drops every package class** — including the imported
  shell — confirming `@source` reaches the package, not just that the import
  resolved.
- **Removing the layer `@import` drops the token-derived classes** — confirming
  the two lines are independently load-bearing.

*Run detail: this proof is a throwaway install (a second buildable app in a repo
whose premise is "not a buildable app" is the wrong permanent cost). The
repeatable check that stays behind is `scripts/verify-exports.mjs`.*
