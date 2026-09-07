---
area: tooling
roadmap: archetype-convergence
opened: '2026-09-07'
status: done
value: high
model: opus
model_reason: mechanical bulk edit, but the exports-map and peer-dependency shape is a design call the spec fixes only in outline
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-07T00:00:00Z'
---

# Make the design-baseline donor installable as a source package

## Context

Phase `pkg` of the [archetype-convergence roadmap](../archetype-convergence.md) turns this donor
from a `cp -R` copy-source into an installable source package. The roadmap's Phase-2 sketch
named only an `exports` map; the sharpened spec section
(`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`, "## Phase pkg —
consumable source package") measured three blockers that an `exports` map alone leaves
standing: 338 internal `@/` imports under `src/components/`, `src/lib/`, `src/hooks/` and
`src/utils/` (`@/components/ui` ×141, `@/lib/utils` ×90, `@/components/layout` ×61,
`@/components/archetypes` ×36) that would resolve against the *consumer's* root alias; a
`"use client"` directive present on exactly two donor files, which a Next App Router consumer
cannot add from inside `node_modules`; and `react`/`react-dom` sitting in `devDependencies`
for donor typechecking. This ticket is the whole donor-side change; the consumer-facing
wiring doc is [archetype-package-consumer-wiring](../archetype-package-consumer-wiring.md).

## What to do

- [ ] Rewrite every `@/` import under `src/components/`, `src/lib/`, `src/hooks/` and
      `src/utils/` to a relative specifier (spec decision P1). Relative paths keep the
      `/style-baseline` copy channel working through the migration overlap — the copied
      folder shape is identical, so resolution is unchanged.
- [ ] Add `"use client";` as the first statement of all 24 exported barrels — the 23
      `src/components/archetypes/*/index.ts` files (each verified to exist) plus
      `src/components/layout/index.ts` (spec decision P4). The directive marks a module
      boundary, so one per barrel covers its subtree.
- [ ] Add the `exports` map to `package.json`: `./layout`, `./archetypes/*`, `./ui/*`
      (as `./src/components/ui/*.tsx` — Node's `exports` does no extension resolution and
      all 49 `ui/` files are `.tsx`), `./lib/utils`, `./hooks/*`, `./utils/logger`, and
      `./tokens.layer.css` (spec decision P5 — source CSS, never compiled).
- [ ] Keep `private: true` (spec decision P3): the chosen channel is a git dependency
      against a tag, which needs no publish, and the flag makes an accidental publish of a
      private donor impossible. Do not export brand `src/styles/tokens.css` (P6) — a
      consumer owns that file.
- [ ] Move `react` and `react-dom` from `devDependencies` to `peerDependencies` at `^19`,
      and scope `files` to `src/components`, `src/lib`, `src/hooks`, `src/utils`,
      `src/styles`, so `src/examples/`, `gallery/` and the vite/vitest harness stay
      donor-dev-only per `package.json`'s existing `designBaseline.notes`. Add no build step.
- [ ] Ship `scripts/verify-exports.mjs` as a zero-dep node script, matching the shape
      `scripts/lint-design.mjs` established (per ADR-0003), checking four invariants: zero
      `@/` specifiers in the packaged directories, every `exports` subpath resolving to a
      file that exists, all 24 barrels carrying `"use client"` as their first statement, and
      `files` shipping no compiled `.css`.

## Acceptance

- [ ] `npx tsc --noEmit` and `npm test` both pass, and no `@/` specifier remains under
      `src/components/`, `src/lib/`, `src/hooks/` or `src/utils/` — every packaged
      directory, not only the archetype folders the relativization starts in.
- [ ] `node scripts/verify-exports.mjs` exits 0 and reports all four invariants; it exits 1
      when any single one is broken (verified by reverting one barrel's directive).
- [ ] `node scripts/lint-design.mjs` still reports 0 errors — relativization must not
      disturb the closed-API ratchet the `warn-drain` phase engaged.
- [ ] `npm run gallery:build` still succeeds. The gallery keeps its own `@/` alias
      (`vite.config.ts:27`) and is not part of the packaged surface, so it is the
      composition regression check for the rewrite.
- [ ] `package.json` declares `react`/`react-dom` only under `peerDependencies`, still
      carries `private: true`, and its `exports` map contains no compiled-CSS entry.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — the roadmap; this is phase `pkg`
- [archetype-package-consumer-wiring.md](../archetype-package-consumer-wiring.md) — depends on this
- [archive/donor-deps-violate-stack-contract.md](../archive/donor-deps-violate-stack-contract.md) — prior dependency-block triage
- [archive/app-shell-header-props-exports.md](../archive/app-shell-header-props-exports.md) — prior barrel/export change
- ADR-0003 — adherence lint ships as a zero-dep scanner; `verify-exports.mjs` follows its shape
- ADR-0004 — appearance locality; its "`ui/` stays vendored" clause is narrowed by spec decision P2
