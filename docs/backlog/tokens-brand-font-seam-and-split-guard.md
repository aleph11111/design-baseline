---
area: tooling
roadmap: archetype-convergence
opened: '2026-09-07'
status: ready
value: normal
model: sonnet
model_reason: "mechanical — a documented CSS stanza, two regex invariants in an existing script, and three stale doc lines; every design decision is settled in the spec section"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-07T00:00:00Z
---

# Give font binding a project-owned seam and guard the tokens split

## Context

PR #178 (`4e75636`) split `src/styles/tokens.css` into a donor-owned
`src/styles/tokens.layer.css` (the `@import "tailwindcss"` entry, `@theme`
roles and keyframes, `@custom-variant`, utility definitions, `@layer base`
resets) and a brand-only `src/styles/tokens.css` (`:root` / `.dark` HSL
triplets plus `--radius`) that imports the layer. Phase `pkg` then shipped the
layer as the `./tokens.layer.css` export subpath, so a donor-side `@theme`
change reaches a consumer on a version bump.

Three pieces of residue are left, and this ticket is the `token-split` phase of
the `archetype-convergence` roadmap in full.

**1. Font binding has no project-owned declaration site.** `docs/RULES.md` rule
12 and `docs/adr/0004-appearance-locality-derived-vs-inherited.md:35` name the
token tier as *brand colour, font binding, radius — declared once per project in
`src/styles/tokens.css`*. Colour holds and `--radius` holds, but `--font-sans`
and `--font-mono` are declared at `src/styles/tokens.layer.css:100-101`, inside
the **donor-owned** half — the file `/style-baseline --force` overwrites on
every re-apply, and the file a package consumer cannot edit at all because it
resolves inside `node_modules`. A consumer binding its own faces (hk-crm binds
`--font-sans` through `next/font`, the roadmap's 132-line "legitimate"
divergence) has nowhere legal to say so.

The seam already exists in Tailwind 4's semantics and is only undocumented.
Measured during sharpening: appending `@theme { --font-sans: "ZZTestFace",
sans-serif; }` to `src/styles/tokens.css` and running `npm run gallery:build`
emits `font-sans:"ZZTestFace", sans-serif` as the **sole** `font-sans` value in
`gallery-dist/assets/*.css` — `@theme` blocks merge in source order and a later
declaration replaces the donor's rather than stacking with it.

**2. Nothing mechanical keeps the two halves apart.** The separation is prose
only (the header comment of each file, `docs/STYLE.md:262,282`). It cannot catch
brand HSL values drifting into the layer, where the next `--force` re-apply
blasts them, nor a brand file regressing to the pre-#178 merged shape by
re-acquiring the `@import "tailwindcss"` entry.

**3. Three donor docs still describe the merged file.**
`docs/ARCHITECTURE.md:31` calls `tokens.css` the "Tailwind 4 entry point + HSL
design tokens"; `docs/TAXONOMY.md:11` names it as the token artifact without the
layer; `docs/STYLE.md:21` says "All tokens are HSL triplets in
`src/styles/tokens.css`" — while `STYLE.md:262,282` describes the split
correctly, so that file contradicts itself.

## What to do

- [ ] Add a commented, ready-to-uncomment `@theme { --font-sans / --font-mono }`
      stanza to `src/styles/tokens.css`, below the existing `@layer base` block,
      with the comment stating that a later `@theme` **replaces** the donor's
      value and that leaving it commented is what keeps a donor-side face change
      reaching you on a version bump. Exact text in the spec section's
      "The seam, concretely".
- [ ] Leave the house-face defaults (`"IBM Plex Sans"` / `"IBM Plex Mono"`) in
      `src/styles/tokens.layer.css:100-101`. Moving them into the brand file
      would destroy the operator goal in the same stroke — a family declared only
      per project reaches nobody on a bump (spec decision T2).
- [ ] Do **not** add a donor-declared `--brand-font-sans` indirection — spec
      decision T3 rejects it: a second name for one value, plus a donor-owned
      mechanism that exists only to be overridden, when the plain re-declaration
      already works.
- [ ] Add two invariants to `scripts/verify-exports.mjs`'s `report` array
      (taking the summary from `4 ok` to `6 ok`), in the same
      `readFileSync` + regex shape as the existing `findShippedCss`:
      `src/styles/tokens.layer.css` matches no `/^\s*(:root|\.dark)\b/m`, and
      `src/styles/tokens.css` matches no `/@import\s+["']tailwindcss["']/`.
      Keep them channel-agnostic (spec decision T5) — never pin the layer's
      import *specifier*, which differs between the copy channel
      (`./tokens.layer.css`) and the package channel
      (`design-baseline/tokens.layer.css`).
- [ ] Correct `docs/ARCHITECTURE.md:31`, `docs/TAXONOMY.md:11` and
      `docs/STYLE.md:21` to the two-file shape, and add the seam sentence to
      `docs/STYLE.md` §Typography (which currently says the families are
      registered in "`tokens.css @theme`", true only pre-#178) and to
      `docs/PACKAGE.md` §3, so the wiring doc and the style doc agree with the
      file.

## Acceptance

- [ ] `node scripts/verify-exports.mjs` reports `6/6 ok`, and each new invariant
      has been shown to FAIL on a deliberately broken copy of its target file (a
      `:root` block pasted into the layer; `@import "tailwindcss"` pasted into
      the brand file) before being reverted.
- [ ] Uncommenting the brand file's font stanza with a literal family and running
      `npm run gallery:build` emits that family as the sole `font-sans:` value in
      `gallery-dist/assets/*.css`; re-commenting it restores `"IBM Plex Sans"`.
      Reported in the PR, not committed.
- [ ] `grep -rn 'tokens\.css' docs/` finds no line calling the brand file the
      Tailwind entry point or the sole home of all tokens — every remaining
      mention describes the two-file shape, not only the three lines this ticket
      names.
- [ ] `docs/STYLE.md` §Typography and `docs/PACKAGE.md` §3 both name the
      brand-file `@theme` override as the supported way to bind a project's own
      faces.
- [ ] `npx tsc --noEmit`, `npm test` and `node scripts/lint-design.mjs`
      (0 errors) are unchanged — this ticket touches CSS, a node script and docs,
      so movement in those is a regression, not a result.

## Related

- [archetype-convergence.md](archetype-convergence.md) — the roadmap; this is its
  `token-split` phase, sharpened in
  [the spec's `## Phase token-split` section](../superpowers/specs/2026-08-17-archetype-convergence-design.md).
- [archive/archetype-package-installable.md](archive/archetype-package-installable.md)
  — shipped `scripts/verify-exports.mjs` and the `./tokens.layer.css` export
  subpath (spec decision P5) this ticket extends.
- [archive/archetype-package-consumer-wiring.md](archive/archetype-package-consumer-wiring.md)
  — shipped `docs/PACKAGE.md` §3, the second doc surface the seam sentence lands in.
- ADR-0004 — appearance locality; its line 35 is the rule the font axis currently fails.
- ADR-0003 — the adherence-lint scanner, deliberately NOT the home for these
  invariants (spec decision T4): it scans component source for appearance props,
  and CSS-file shape is not its vocabulary.
