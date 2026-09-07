---
area: docs
roadmap: archetype-convergence
opened: '2026-09-07'
status: ready
value: high
model: opus
model_reason: the throwaway install is the first real proof the package resolves in a Next-style build; judgment needed when a wiring line does not hold
depends_on:
  - archetype-package-installable
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-07T00:00:00Z'
---

# Document and prove the design-baseline package consumer wiring

## Context

Once [archetype-package-installable](archetype-package-installable.md) makes the donor
resolvable, a consumer still needs four wiring lines, and nothing in the fleet has ever
installed this package — so the wiring is unproven. Phase `pkg` of the
[archetype-convergence roadmap](archetype-convergence.md) closes both gaps together: a new
`docs/PACKAGE.md` stating the wiring once, plus a throwaway install that proves it. The
wiring is non-obvious in two places measured in the spec section
(`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`, "## Phase pkg —
consumable source package"): Tailwind 4 does not scan `node_modules`, so the `@source`
directive is a hard requirement rather than documentation courtesy; and `src/components/ui/`
must be owned by the package (141 archetype→ui edges), which a consumer absorbs by deleting
its vendored copy and re-pointing `@/components/ui/*` with one tsconfig path entry (spec
decision P2, narrowing ADR-0004's "`ui/` stays vendored" clause).

## What to do

- [ ] Write `docs/PACKAGE.md` carrying the four wiring lines and nothing else: the
      `github:aleph11111/design-baseline#<tag>` dependency pin; the `tsconfig.json` `paths`
      entry mapping `@/components/ui/*` at `node_modules/design-baseline/src/components/ui/*`
      ahead of the consumer's own `@/*`; `@import "design-baseline/tokens.layer.css"` plus
      `@source "../node_modules/design-baseline/src"` in the project's own `tokens.css`; and
      `transpilePackages: ["design-baseline"]` for Next consumers.
- [ ] Correct `docs/STACK.md` hazard 3 ("Compiled-CSS version skew", `docs/STACK.md:46-48`)
      to state that it is void for a source-distributed package — the consumer compiles every
      class itself — and point it at `docs/PACKAGE.md`.
- [ ] Correct `docs/STACK.md` hazard 5 ("Unstamped vendored peers", `:53-55`), which already
      ends *"or move to package consumption"*, to name the package version as the answer that
      replaces per-file vendor stamps.
- [ ] Prove the wiring with a throwaway Vite + Tailwind 4 consumer created outside the repo
      (in the scratch dir, not committed): install the donor as a git dependency, apply the
      four wiring lines, import `DetailOverviewShell` from
      `design-baseline/archetypes/detail-overview`, and record the result in the PR.
- [ ] Add the version-lag tripwire: one `sync` entry in `docs/promotion-radar.json` recording
      the installed donor tag per consumer, in the array the fleet audit already reads. No new
      script — four consumers pinned to four different tags is the fork problem with better
      labels, and this is what makes it visible.
- [ ] Leave `docs/ADOPTION.md` and `docs/PLUGIN-CONTRACT.md` untouched — their rewrite is the
      `donor-docs` phase's, and rewriting them against a package no consumer has installed
      would be rewriting a prediction.

## What not to do

- Do not commit a second buildable app into this repo. The install proof is a throwaway run,
  reported in the PR; `scripts/verify-exports.mjs` from the sibling ticket is what stays
  behind as the repeatable check.

## Acceptance

- [ ] The throwaway consumer both typechecks (`tsc --noEmit`) and builds, with the archetype's
      Tailwind classes present in its output CSS — proving `@source` reached the package, not
      only that the import resolved.
- [ ] Removing the `@source` line from that consumer and rebuilding shows the archetype's
      classes absent from the output CSS, confirming the directive is load-bearing.
- [ ] `docs/PACKAGE.md` exists and its four wiring lines match what the proven install
      actually used, verbatim.
- [ ] `docs/STACK.md` hazards 3 and 5 both name the package as the answer, and no other
      hazard row is changed.
- [ ] `docs/promotion-radar.json` parses and carries one `sync` entry naming the installed
      donor tag per consumer.
- [ ] `docs/ADOPTION.md` and `docs/PLUGIN-CONTRACT.md` are unchanged in this PR's diff.

## Related

- [archetype-package-installable.md](archetype-package-installable.md) — must ship first
- [archetype-convergence.md](archetype-convergence.md) — the roadmap; this is phase `pkg`
- [archive/style-baseline-stack-aware-preflight.md](archive/style-baseline-stack-aware-preflight.md) — prior STACK.md-driven consumer preflight
- [archive/tokens-header-tw-animate-import-not-plugin.md](archive/tokens-header-tw-animate-import-not-plugin.md) — the tokens-layer hazard STACK.md hazard 1 records
- ADR-0004 — appearance locality; spec decision P2 narrows its "`ui/` stays vendored" clause
- hk-crm ADR-0030 — vendor-stamp-not-package; its skew objection is what STACK.md hazard 3 carries
