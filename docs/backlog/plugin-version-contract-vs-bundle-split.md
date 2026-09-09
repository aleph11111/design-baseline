---
area: tooling
opened: '2026-09-08'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-08T00:00:00.000Z'
value: high
model: sonnet
model_reason: >-
  the decision is already made in the roadmap spec (drop-drift-machinery, E3); the work is a
  documented contract edit plus a grep over the readers
roadmap: archetype-convergence
---

# Split MANIFEST plugin.version's contract meaning from the installed bundle version

## Context

`docs/archetypes/MANIFEST.json`'s `plugin.version` carries two incompatible meanings.
`docs/PLUGIN-CONTRACT.md:64` documents it as the **contract** version — "bump on
breaking changes to this shape" — and `coding-dashboard/server/designPlugin.ts:68`
reads it that way. But `coding-dashboard/server/archetypeDrift.ts:212` reads the same
field as the chrome **bundle** stamp, comparing it against each consumer's
`docs/design-baseline-chrome.json`. The two meanings have visibly diverged: the field
says `0.10.2` while `package.json` — the number a consumer actually resolves, equal to
the git tag `v0.2.1` — says `0.2.1`. This is the `archetype-convergence` roadmap
Context's complaint stated exactly: *one hand-bumped number standing in for the whole
44-component shell*, moved ten times against 39 commits touching `src/`.

Settling it is prerequisite to the roadmap's `drop-drift-machinery` phase (decision E3),
which replaces the drift scanner's chrome axis with a comparison against the consumer's
installed `design-baseline` dependency range. With `plugin.version` still doubling as a
bundle stamp, that change has two candidate numbers to read and no document saying which
one is wrong.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. Here the shared point is `docs/PLUGIN-CONTRACT.md`'s Versioning section — every reader (`designPlugin.ts`, `archetypeDrift.ts`, `/style-baseline`) keys off it, so the rule goes there rather than into any one reader.
- [ ] State in `docs/PLUGIN-CONTRACT.md`'s Versioning section that the **installed / bundle** version is `package.json`'s `version` — equal to the git tag, what a consumer resolves — and that `plugin.version` is the **contract shape** version only, bumped on a break to the `plugin` block's shape and on nothing else.
- [ ] Say explicitly that `plugin.version` no longer moves when `src/components/` or `src/styles/` change; a chrome or primitive change bumps `package.json` and cuts a tag (per `drop-drift-machinery` E9: git tag, demand-driven cadence).
- [ ] Leave `MANIFEST.json`'s `plugin.version` value at `0.10.2`. Renumbering it to match `package.json` would be a contract-shape bump that no shape change earned, and `designPlugin.ts` reads it correctly today.

## Acceptance

- `docs/PLUGIN-CONTRACT.md`'s Versioning section names both numbers, their owners, and what bumps each — `package.json` / the tag for the installed bundle, `plugin.version` for the contract shape.
- The section states that `plugin.version` is unchanged by any `src/` edit, so a reader cannot derive a bundle version from it.
- `grep -rn "plugin.version" ~/Documents/dev/coding-dashboard/server ~/Documents/dev/coding-dashboard/client/src` shows no other call site reading the field as a bundle or installed version — every call site treats it as the contract version, not only `archetypeDrift.ts:212`, which `dashboard-drop-drift-machinery` removes.
- `node scripts/verify-exports.mjs` reports 7/7 ok and `npx tsc --noEmit` exits 0 — the donor's shipped surface is unchanged by a doc-only edit.
- `docs/archetypes/MANIFEST.json`'s `plugin.version` is byte-unchanged after the ticket.

## Related

- [archetype-convergence.md](archetype-convergence.md) — parent roadmap, phase `drop-drift-machinery`, decision E3
- [docs/superpowers/specs/2026-08-17-archetype-convergence-design.md](../superpowers/specs/2026-08-17-archetype-convergence-design.md) — "## Phase drop-drift-machinery — retire the copy comparand"
- [archive/archetype-doc-manifest-version-drift.md](archive/archetype-doc-manifest-version-drift.md) — the same two-counters-one-meaning shape, at archetype rather than plugin level
- [archive/archetype-manifest-version-verify-script.md](archive/archetype-manifest-version-verify-script.md) — the verify script that made archetype version fields self-checking
- coding-dashboard `dashboard-drop-drift-machinery` — the cross-repo child this unblocks
