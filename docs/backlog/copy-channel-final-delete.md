---
area: tooling
opened: '2026-09-13'
status: ready
value: normal
depends_on: [hk-crm-package-install-cutover]
model: opus
model_reason: "retires three dashboard scanners and their state files across two repos — each deletion needs the call on what the surviving axis should report"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-13T00:00:00Z'
roadmap: archetype-convergence
---

# Delete /style-baseline and /style-archetypes and the dashboard machinery that measures the copies

## Context

Part B of the `archetype-convergence` roadmap's `fleet-commands` phase, and the phase's last
ticket. `/style-baseline` (505 lines) and `/style-archetypes` (516 lines) in
`coding-dashboard/fleet/commands/` are the copy-distribution channel this whole roadmap exists to
replace. They cannot be deleted while they are the only channel — spec decision H10 states the
invariant as *at every moment at least one distribution channel exists, never zero* — so this
ticket is **gated**: it may only start once at least one consumer resolves `design-baseline` from
`node_modules` and carries no `src/components/archetypes/` (H7), which is
`hk-crm-package-install-cutover`'s job.

Check the gate first, as the ticket's first step:

```sh
cd ~/Documents/dev/hk-crm
node -e "require.resolve('design-baseline/package.json')" && ls src/components/archetypes
```

The commands' readers are dashboard-side, and `drop-drift-machinery` (E4) kept several of them
*explicitly for copy-vendored repos*. That justification expires here.

## What to do

- [ ] Verify the gate above before touching anything; if it does not hold, stop and leave the
      ticket blocked rather than deleting the fleet's only channel.
- [ ] Delete `coding-dashboard/fleet/commands/style-baseline.md` and `style-archetypes.md`, then
      run `bash fleet/install.sh` — it reaps both `~/.claude/commands/` symlinks itself
      (`install.sh:474-495`), the same way `adopt-baseline-command-retire` handled its own.
- [ ] Rewrite the five ritual-prompt sites **first**, since they actively instruct the dead
      commands: `server/rituals-prompts.ts:134` (the adoption ritual's "run `/style-archetypes`"
      becomes the package install), and `:486`, `:502`, `:551`, `:564` (the donor-iteration and
      promotion prompts' `--update` propagation story becomes a tag bump). Then follow with
      `server/ritualsDesign.test.ts:24,39`, whose two assertions match those prompts.
- [ ] Retire `server/archetypeShapeAudit.ts` — its shape axis and its `/style-archetypes --update`
      event trigger lose their subject — together with `selectBumpedShapeKeys`,
      `selectResolvedShapeKeys` and the `~/.claude/state/archetype-shape-flags.json` /
      `archetype-shape-refire-flags.json` stores. Keep its surviving
      *"should this be an archetype?"* half, which is a separate inherited deferral.
- [ ] Retire `server/methodologyAdoption.ts`, `computeCompletionGate` and the third adoption axis
      at `server/routes/design.ts:266`, plus `archetypeDrift.ts`'s `LocalArchetypeEntry` /
      `keyCollidesWithBaseline` — the E4 keep whose last copy-vendored subject is gone.
- [ ] Follow with the prose: `docs/ARCHITECTURE.md:43,54,136,137,141,326`,
      `server/lib/adoptionLayers.ts:7`, `server/ritual-key.ts:5`, `server/types/worktrees.ts:135`,
      `server/lib/liveSession.ts:7`.
- [ ] Donor doc pass, the ~50 sites `adopt-baseline-command-retire` deliberately deferred:
      `README.md:5,55,60,65,88`, `CLAUDE.md:7,26,27,45`, `docs/STYLE.md`'s thirteen sites,
      `docs/TAXONOMY.md:11-14,31-36`, `docs/ARCHITECTURE.md:7,32,65,70,136,145,146`,
      `docs/archetypes/README.md:30,164-176,228`, `docs/PROMOTION-RADAR.md:84,89` and
      `docs/promotion-radar.json:381`, `vite.config.ts:11`, `src/utils/logger.ts:18`,
      `src/components/layout/AuthCard.tsx:21`, `scripts/verify-exports.mjs:33`. `docs/RULES.md`
      rule 8 is **deleted, not rewritten** — it governs a `MANIFEST.json` merge that no longer
      happens — and the remaining rules renumber contiguously.

`/promote-archetype` stays. It is the surviving producer, and `donor-docs` G6 already made it the
one fleet command `plugin.actions` advertises.

## Acceptance

- `fleet/commands/` holds nine files and `promote-archetype.md` is among them;
  `bash fleet/install.sh --check` exits 0 with no dangling managed link.
- `grep -rn 'style-baseline\|style-archetypes\|adopt-baseline' server/ client/src/` in
  `coding-dashboard` returns nothing outside `docs/backlog/` and `docs/superpowers/` — every call
  site is gone, not only the ones this ticket lists — and `npm test` passes.
- The hub reports the design plugin `connected: true` and renders the Design tab with no runtime
  error from a removed `shapeEntries` or `methodology` field.
- In the donor, `grep -rn 'style-baseline\|style-archetypes' --include='*.md' --include='*.ts'
  --include='*.tsx' --include='*.mjs' --include='*.json' .` returns nothing outside
  `docs/backlog/`, `docs/adr/`, `docs/audits/` and the roadmap's design spec.
- `docs/RULES.md` carries no rule governing a `MANIFEST.json` merge and its numbering is
  contiguous.
- Donor gates unchanged: `npx tsc --noEmit` clean, `node scripts/lint-design.mjs` 0 errors,
  `node scripts/verify-exports.mjs` 7/7 ok, `node scripts/verify-manifest-versions.mjs` ok.

## Related

- [[hk-crm-package-install-cutover]] — must ship first: this ticket's gate is that ticket's first
  two acceptance bullets, and deleting the copy commands before a consumer is on the package
  leaves the fleet with no distribution channel at all.
- [[archetype-convergence]] — the roadmap; this is phase `fleet-commands`, Part B. Spec section
  `## Phase fleet-commands — retire the copy channel, one part now and one gated`, decisions
  H7/H9/H10.
- [[adopt-baseline-command-retire]] — Part A; established the delete-plus-`install.sh` mechanics
  and deferred this ticket's ~50 donor doc sites.
- [plugin-version-contract-vs-bundle-split.md](archive/plugin-version-contract-vs-bundle-split.md)
  — `drop-drift-machinery`'s E4, which kept `LocalArchetypeEntry` for copy-vendored repos; this
  ticket is where that keep expires.
- ADR-0003 — adherence lint ships as a zero-dep scanner; the lint is kept, retargeted, not deleted
  with the commands.
