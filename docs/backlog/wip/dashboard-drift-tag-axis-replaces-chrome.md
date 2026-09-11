---
area: tooling
opened: '2026-09-11'
status: ready
value: high
model: sonnet
model_reason: >-
  every fork is pre-decided in the roadmap spec (drop-drift-machinery, E1-E8); the work is a
  scoped axis swap plus deletions with a named fixture set
gate:
  score: 5
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-11T00:00:00.000Z'
---

# Replace the dashboard drift scanner's chrome axis with the installed design-baseline tag

## Context

The donor now distributes itself as an installable source package (`package.json` `version` == git tag, currently `0.2.1`) and `docs/PLUGIN-CONTRACT.md`'s Versioning section — shipped by [plugin-version-contract-vs-bundle-split](../archive/plugin-version-contract-vs-bundle-split.md) — settles the two numbers: the installed/bundle version is `package.json`'s / the tag, while `docs/archetypes/MANIFEST.json`'s `plugin.version` is the **contract shape** version only and never moves with `src/components/` or `src/styles/`. coding-dashboard's `server/archetypeDrift.ts` still contradicts both facts. At `:212` it reads `baseline.plugin?.version` as the chrome-bundle comparand — a contract number co-opted as a bundle stamp, and the two donor numbers now disagree by an order of magnitude (`0.2.1` vs `0.10.2`). Its chrome axis (`CHROME_MARKERS` `:157`, `CHROME_STAMP` `:161`, `scanChrome` `:167`, called at `:228`, `ChromeStampEntry` `:64`/`:81`) treats the presence of `src/styles/tokens.css` as proof chrome is installed; the donor's token split made that file the **project-owned brand half**, which a correctly migrated consumer keeps forever, and the axis then reads `docs/design-baseline-chrome.json` for a version — a file migrated consumers no longer carry — so the absent-or-corrupt branch returns `state: "unstamped"`. Net effect: a consumer that follows `docs/PACKAGE.md`'s "Migrating a vendored consumer" runbook exactly emits a permanent false chrome flag, and the repos that did the right thing become the noisiest rows in the fleet. This is prerequisite to the first consumer install, not gated behind it: shipping after install #1 means install #1 spends its whole life emitting a false flag. **Cross-repo ticket** — every edit lands in `~/Documents/dev/coding-dashboard` and must be executed from a coding-dashboard session, because the donor's CI cannot verify them (spec decision E1).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Collapse the chrome axis and the `plugin.version` bundle comparand into ONE axis in `server/archetypeDrift.ts`: the consumer's installed `design-baseline` dependency range against the donor's `package.json` `version` (not `plugin.version`). Per repo read `package.json` `dependencies["design-baseline"]`, extract the tag with `/#v?([\d.]+)/`, and report `{ state: "behind", installed, donor }` only when the donor is newer via the existing `isNewer` (per spec decision E2, `docs/superpowers/specs/2026-08-17-archetype-convergence-design.md` anchor `## Phase drop-drift-machinery — retire the copy comparand`).
- [ ] Return `null` for a repo with no `design-baseline` dependency so it falls through to the existing copy-world axes completely unchanged — that is how the three still-unmigrated consumers (brickshop-manager, controlling-app, mistra) keep their live signal.
- [ ] Delete `CHROME_MARKERS`, `CHROME_STAMP`, `scanChrome`, `ChromeStampEntry` and the `plugin.version` read, plus the type re-exports and mirrors at `server/types.ts:31`, `server/types/worktrees.ts:156-176` and `client/src/types.ts:28`; drop the chrome fields from the `archetype-drift-flags.json` shape.
- [ ] Delete the chrome column and its action from the client Design surface: `client/src/features/design/designStates.ts` (`chrome?: ChromeStampEntry` at `:504` and `:645`, `updateChromeAction` at `:750`, the chrome-derived state string at `:759`), `DesignProjectsTab.tsx:824`, `useProjectsActions.ts:98` (`updateChrome`), and their tests.
- [ ] Keep `server/archetypeDrift.ts` as a file and leave `LocalArchetypeEntry` in place in the shrunken module — no new file (E4). Do not touch `server/methodologyAdoption.ts` or the copy half of `server/archetypeShapeAudit.ts`; they stay on the `docs-retire` + `fleet-commands` gate because `methodologyAdoption.ts` compares donor methodology-doc `version:` fields against consumer copies that still exist (E6). `moleculeAudit.ts`, `adoptionScan.ts`, `designPlugin.ts`, `usePromotionRadar.ts` and the `design` ritual are all kept.
- [ ] Add no "consumers still copy-vendored: N" counter — per-repo deletion is automatic and not an event: each module goes when its scan returns empty (E5).
- [ ] In the same PR, edit coding-dashboard's existing `docs/backlog/dashboard-drop-drift-machinery.md` rather than re-filing it (E8): its archetype half becomes this axis replacement instead of a wholesale deletion, its methodology half is unchanged, and its `blocked_reason` — currently "Gated on donor design-baseline phases `consumer-migration`… deleting now blinds real staleness" — is rewritten to E1's gate ("the machinery is correct for a migrated world"), which this ticket satisfies, so the archetype half unblocks now.

## Acceptance

- [ ] `grep -rn "design-baseline-chrome" server client/src` in coding-dashboard returns nothing outside `docs/backlog/archive/` and `docs/adr/` — every call site of the chrome stamp is gone, not only the one `archetypeDrift.ts` names.
- [ ] New fixture in `server/archetypeDrift.test.ts` — the F2 regression case: a repo with `"design-baseline": "…#v0.2.1"` in `package.json`, a project-owned `src/styles/tokens.css`, no `docs/archetypes/MANIFEST.json` and no `docs/design-baseline-chrome.json` produces **zero** flags. It fails before the change with `state: "unstamped"` and passes after.
- [ ] A fixture repo pinned at `#v0.2.0` against a donor `package.json` at `0.2.1` reports `behind` exactly once, on the tag axis, with no chrome row, and no other fixture repo gains a chrome-derived flag.
- [ ] A fixture repo with no `design-baseline` dependency but a local `docs/archetypes/MANIFEST.json` reports its per-archetype version drift unchanged.
- [ ] `LocalArchetypeEntry` rows still appear for a fixture repo carrying a versionless namespaced archetype, and `keyCollidesWithBaseline` still fires.
- [ ] coding-dashboard `npm test` is green and the Design tab renders with no chrome column and no chrome-derived state string.
- [ ] No design-baseline (donor) file and no consumer repo file is edited — per-file vendor stamps, the four `design-baseline-chrome.json` files, the MANIFEST forks and the `docs/archetypes/` corpora belong to the `docs-retire` phase (E7); this ticket removes only their last reader.

## Related

- [plugin-version-contract-vs-bundle-split.md](../archive/plugin-version-contract-vs-bundle-split.md) — the donor half, shipped: settled `plugin.version` as contract-shape-only so this axis has one unambiguous comparand.
- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap; this is the dashboard side of phase `drop-drift-machinery` (spec anchor `## Phase drop-drift-machinery — retire the copy comparand`, decisions E1–E8).
- [package-ui-ownership-and-vendored-consumer-runbook.md](../archive/package-ui-ownership-and-vendored-consumer-runbook.md) — wrote `docs/PACKAGE.md`'s "Migrating a vendored consumer" runbook, the exact path that trips the false chrome flag.
- [tokens-brand-font-seam-and-split-guard.md](../archive/tokens-brand-font-seam-and-split-guard.md) — made `src/styles/tokens.css` the project-owned brand half, which is why `CHROME_MARKERS` now misreads it.
- coding-dashboard [docs/backlog/dashboard-drop-drift-machinery.md](https://github.com/aleph11111/coding-dashboard/blob/main/docs/backlog/dashboard-drop-drift-machinery.md) — edit and re-scope, never re-file (E8).
