# PACKAGE.md — installing the design-baseline as a source package

The Design Baseline can be consumed as a **git source package** instead of a `cp -R`
copy. A consumer adds one dependency line and four wiring lines:

```
"design-baseline": "github:aleph11111/design-baseline#v0.2.0"
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
"design-baseline": "github:aleph11111/design-baseline#v0.2.0"
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

## Migrating a vendored consumer

The wiring above is the **greenfield** path. A project that already carries a
`cp -R` corpus — hk-crm, the first real consumer, has 155 files under
`src/components/{ui,layout,archetypes}`, a pre-#178 merged `tokens.css`, and
102 per-file vendor stamps (38 × `design-baseline@0.1.0`, 64 × `@0.10.0`) — does
not delete that corpus and re-point blindly. It **triages the fork first**, then
installs. The steps are ordered so the fork is visible *before* any file moves;
the whole path for hk-crm was dry-run proven at tag `v0.2.0` (see the ticket
`package-ui-ownership-and-vendored-consumer-runbook`, `## Outcome`).

### Step 1 — Fork triage (normalise, then diff; before anything is deleted)

Per **C5** of the `consumer-migration` design section. For every file the project
carries that the installed package tag also ships, remove the noise that is not a
choice, then diff what remains. That is the **normalisation** pass:

1. strip the per-file **vendor stamp** header line (`design-baseline@…`),
2. strip the `"use client"` directive (the package's `ui/` leaves at `v0.2.0`
   ship it un-directive; its presence/absence is a build-wiring difference, not a
   code difference — see the directive-gap ticket),
3. rewrite `@/components/ui/…` and the relative siblings to one form so the
   import-graph difference does not read as a content difference.

What the normalisation reveals is the fork, and the fork decides the file's fate:

| Triage outcome (diff after normalisation) | Meaning | Action |
|---|---|---|
| identical | vendor drift only — the consumer carried stale copy | **delete** the project file; the alias array resolves the package's copy (C2) |
| differs, donor is ahead | consumer copy is behind a donor change | **take the package's file** — delete the project copy, same as identical |
| differs, consumer is ahead **and general** | a change worth promoting back | keep the project file (it shadows the package's via the project-first array) and `/promote-archetype` it; delete it only once the promotion lands in the donor and the consumer re-points at that new tag |
| differs, **locale** | not drift at all — the consumer's copy is its own localisation | **permanent consumer-owned file** — keep it, never un-fork it at file granularity (the packaged surface is English defaults overridable per call site) |

Measured against hk-crm at tag `v0.2.0`, of the 36 `ui/` primitives the project
and the package share, the normalisation collapses **28 to identical** (they would
otherwise read as divergent through stamps and directives) and **8 remain
genuinely forked** — `alert`, `badge`, `button`, `confirmation-dialog`,
`error-boundary`, `file-field`, `form`, `state-view` — two of which are locale
(`confirmation-dialog` imports `@/ui-text/de`; `state-view` hardcodes
`"Lädt…"` / `"Etwas ist schiefgelaufen"`). Beyond the 36 shared, the project keeps
**13 consumer-only `ui/` files** (`breadcrumb`, `labeled-control`,
`native-field`, `results-count`, `route-error`, `select-field`,
`select-filter`, `table-row-actions`, `textarea-field`, `view-toggle` + their unit
tests) that the package has none of. The two-entry array (the project-first entry)
is what makes all 13 and the 8 forks *shadow* the package instead of breaking —
a single-entry re-point to `node_modules/…` alone makes them unresolvable across
every file that imports them.

**Record the kept-file count in the radar** (step 5): in hk-crm's case the 28
identicals split into 25 that stay (their hk copy carries `"use client"`, the
package's lacks it — see the guard) and 3 that can be deleted (directive-
consistent); the 8 forks and the 13 consumer-only files all stay. So of hk-crm's
49 `ui/` files, **46 keep** (25 + 8 + 13) and 3 delete. The number of files kept
**is** the visible guard that a fork survived the swap — shadowing is invisible
at the import site.

### Step 2 — Split the brand `tokens.css`

Move the donor-owned half of the project's `tokens.css` onto the layer import and
keep the brand half in the project's own file, exactly as wiring line 3 documents
(`@import "design-baseline/tokens.layer.css"` + the `@source` package scan). The
brand `:root`/`.dark` HSL values and the project's own `@theme` font stanza (e.g.
hk-crm's IBM Plex `next/font` binding) stay project-owned. A `cp -R` consumer's
merged `tokens.css` is the pre-#178 state this step splits.

### Step 3 — Install, wire, delete

1. Add the dependency pin (wiring line 1) and the `paths` entries (wiring line 2),
   and `transpilePackages` (wiring line 4) for Next consumers.
2. **Delete only the project files step 1 ruled as delete-or-take-the-package's**,
   in the same commit as the wiring, so the alias array alone resolves the
   package's copy of them. Everything else — the 8 forks, the 13 consumer-only
   `ui/` files, the 25 directive-asymmetric identicals, all of `layout/` and
   `archetypes/` — **stays** as a project file shadowing the package. A wholesale
   `rm -rf src/components/ui/` is what the old single-entry instruction did; it is
   the anti-pattern this runbook replaces.
3. Build and type-check before touching any stamp.

### Step 4 — Drop the per-file vendor stamps, in the same commit as step 3's deletions

The stamps exist to mark which vendored copy a file was copied from, so the project
can tell drift from drift. Once the package is the source of truth and the alias
array resolves it, the stamps are dead weight *and* lie (they still say
`@0.1.0`/`@0.10.0` while the project runs `@v0.2.0`). Remove them from every file
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

### Guard: the `"use client"` directive gap

At tag `v0.2.0` the package's `ui/` leaves ship **without** the `"use client"`
directive the consumer's vendored copies carry (48 of the package's 49 `ui/`
leaves lack it; hk-crm's copies carry it). The
donor's own gallery is client-rooted (`createRoot` + `HashRouter` +
`next-themes`' `ThemeProvider`), so the donor never exercises a `ui/` leaf's server
boundary — the gap is invisible there and only surfaces in a real Next SSR
consumer: delete a project copy of a directive-carrying leaf so the alias resolves
the directive-less package copy, and the file's RSC boundary flips, crashing with
`f.createContext is not a function`. This is why step 3 deletes only
**directive-consistent** files (hk-crm's 3: `icon-avatar`, `segmented-control`,
`tooltip` — the only identicals whose package copy also lacks the directive, so
the boundary does not change). The donor-side fix lives in the
`package-ui-leaves-use-client-directive-gap` ticket; until it lands, a consumer at
`v0.2.0` must keep every directive-carrying `ui/` leaf as a project file.

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
