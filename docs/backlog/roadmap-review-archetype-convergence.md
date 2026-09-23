---
area: roadmap-review
opened: '2026-09-23'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-23T13:49:36.349Z'
value: high
---

# Completion review of the archetype-convergence roadmap: donor done, fleet three-quarters unmigrated

## Context

[docs/backlog/archetype-convergence.md](archetype-convergence.md) is `status: in-review`. All 41
children are in `docs/backlog/archive/` with `status: done`: every `roadmap: archetype-convergence`
back-pointer, unioned with the frontmatter `tickets:` list and the nine
`archetype-convergence-*` scope matches. Intent comes from the roadmap's `## Phases` and
`## Done when`, plus the spec's per-phase Verification sections in
`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`.

The donor side is done: the closed API, the lint ratchet, the package, the token split, donor docs
and fleet commands have all shipped. The consumer side is not. On `origin/main` (read 2026-09-23),
only **hk-crm** consumes `design-baseline` as a package. `controlling-app`, `mistra` and
`brickshop-manager` still have no `design-baseline` entry in `package.json`, and each still carries
a `docs/archetypes/MANIFEST.json` fork. `brickshop-manager` also still has
`src/components/archetypes/`. In hk-crm, the twelve `/companies/[id]` route files were never
collapsed: 11 of them still import and compose `DetailOverviewShell` on their own. The spec
admitted this gap itself. Its fleet-commands "Deferred" list says H7 only needed one migrated
consumer to delete the commands, and whether the other three get migrated or stay frozen is
"a separate call". Nobody has made that call yet, and the roadmap's `## Done when` is still written
for the whole fleet.

### Delta — roadmap `## Done when`

| # | Criterion | Verdict | Evidence / gap |
|---|---|---|---|
| D1 | Two projects rendering the same archetype look identical apart from brand tokens, and no per-call-site prop can change that | partial | API closed: `archetype-convergence-detail-overview-close-api` (#122), warn-drain children #126 #127 #128 #131 #133 #184 #185 #192 #195, lint ratchet `adherence-lint-warn-to-error-ratchet` (#201). **Gap:** only one project (hk-crm, hk-crm #1087) renders from the package, so no two projects share it yet |
| D2 | Changing `--font-sans` in the donor reaches every consumer through a version bump | partial | Seam shipped: #178, `tokens-brand-font-seam-and-split-guard` (#229). **Gap:** reaches hk-crm only. The other three still vendor tokens |
| D3 | `docs/archetypes/MANIFEST.json` exists only in the donor, and no consumer has a fork | partial | hk-crm fork deleted (`hk-crm-package-install-cutover`, donor #266 / hk-crm #1087). **Gap:** `controlling-app`, `mistra` and `brickshop-manager` still have `docs/archetypes/MANIFEST.json` on `origin/main` |
| D4 | hk-crm's `archetype-rollout` ticket rate drops to zero for closed archetypes | shipped | hk-crm `docs/backlog/` holds 115 `archetype-rollout` tickets. The newest was opened 2026-08-12, and none have been opened since the close-API batch (#122–#133). Observational, since a month of silence is weak proof |
| D5 | No consumer has a vendored methodology doc or an `archetypes/` folder, and every donor doc has a named reader | partial | Donor side: `fleet-audit-and-adoption-doc-retire` (#254), `archetype-baseline-sibling-retire` (#255), `package-ships-contracts-and-plugin-actions` (#257), `package-ships-methodology-docs-single-version-source` (#245). hk-crm is clean. **Gap:** three consumers are unmigrated, and `brickshop-manager` still has `src/components/archetypes/` |

### Delta — phase bullets

| Phase | Criterion | Verdict | Evidence / gap |
|---|---|---|---|
| 0 | ADR superseding hk-crm ADR-0030's rejection of a package | shipped | `archetype-convergence-phase0-appearance-locality-decision` (#118). Its "ui/ stays vendored" split was later narrowed by `adr-0004-narrowing-crossref-and-ground1-stale` (#226) and `package-ui-ownership-and-vendored-consumer-runbook` (#233) |
| 0 | Rule 12 in `docs/RULES.md` plus ADR-0004 | shipped | #118, `docs/adr/0004-appearance-locality-derived-vs-inherited.md` |
| 1 | Retire per-call-site appearance props; delete the `surface="separated"` default | shipped | `archetype-convergence-detail-overview-close-api` (#122). `DetailOverviewShell.test.tsx:290` asserts that `surface` is absent from the props type |
| 1 | Mode B nested-header primitive | shipped | `archetype-convergence-nested-heading-primitive` (#121) |
| 1 | Encode the `stats` slot decision in the component | shipped | #122 (`stats: StatItem[]`, no `ReactNode`) |
| 1 | ? Audit the remaining twenty archetypes | shipped | warn-drain phase: #126 #127 #128 #131 #133, `archetype-convergence-component-kind-appearance-gap` (#184), #185, #192, #195, and the adherence-lint gap children #194–#227 |
| 2 | `exports` map, no compiled CSS | shipped | `archetype-package-installable` (#222). `private: true` was kept on purpose, as recorded in `adr-0004-narrowing-crossref-and-ground1-stale` |
| 2 | Document the consumer `@source` directive | shipped | `archetype-package-consumer-wiring` (#223) |
| 2 | ? Choose the distribution channel | shipped | Git tag (`v0.2.x`): `package-tag-post-v0-2-0-sync` (#238), #266, #267 |
| 3 | Split `tokens.css` into base and brand layers | shipped | #178, #229 |
| 3 | Verify that `--font-sans` reaches consumers through a bump | partial | Same as D2: proven for hk-crm only |
| 4 | Migrate hk-crm `/companies/[id]` so the twelve route files collapse to one composition | partial | The install moved the code into the package (`hk-crm-package-install-cutover`, whose acceptance says it "renders unchanged"). **Gap:** no child collapses the routes. 11 files under `src/app/(app)/companies/[id]/` still compose `DetailOverviewShell` on their own, which is the spec's "five-of-twelve KPI strip" risk surface |
| 4 | Migrate the remaining hk-crm archetypes, then `controlling-app`, `mistra`, `brickshop-manager` | partial | hk-crm migrated as a whole repo (hk-crm #1087). **Unaccounted:** no child ticket covers any of the other three |
| 4 | Divergence goes through an explicit fork, visible in imports | shipped | `package-ui-ownership-and-vendored-consumer-runbook` (#233): a two-entry, project-first `ui/` paths array |
| 5 | Retire `archetypeDrift`, `methodologyAdoption`, most of `archetypeShapeAudit`, `design-baseline-chrome.json` | shipped | `dashboard-drift-tag-axis-replaces-chrome` (coding-dashboard #1009), `plugin-version-contract-vs-bundle-split` (#241), `copy-channel-final-delete` (coding-dashboard #1203, donor #268). `methodologyAdoption.ts` and `archetypeShapeAudit.ts` no longer exist. `archetypeDrift.ts` survives by design, re-keyed to the tag axis |
| 5 | Keep the radar, `/promote-archetype`, the lint, and the narrowed LLM audit | shipped | The shape audit survives as a ritual block (coding-dashboard `server/rituals-prompts.ts` `shapeAuditBlock`). `/promote-archetype` is kept (`adopt-baseline-command-retire` acceptance) |
| 6 | Delete vendored docs, the `docs/archetypes/` corpus, stamps and Doc-Paths keys in each migrated consumer | partial | Runbook step: `package-doc-retirement-ownership-and-runbook-step` (#246). Executed in hk-crm (0 `design-baseline@` stamps remain). **Gap:** "each migrated consumer" covers only one repo |
| 6 | Archive `brickshop-manager`'s pre-donor corpus to `docs/archive/archetypes-2026/` | unaccounted | No child. `brickshop-manager` still has `docs/archetypes/` in place |
| 7 | Collapse spec + `.baseline.md` pairs; rewrite ADOPTION; re-point PLUGIN-CONTRACT; retire FLEET-AUDIT | shipped | #255, #254, #257, #268 |
| 8 | Delete `/adopt-baseline`, `/style-baseline`, `/style-archetypes`; keep `/promote-archetype` | shipped | `adopt-baseline-command-retire` (#262), `copy-channel-final-delete` (coding-dashboard #1203) |

The gaps all share one root. The roadmap's consumer-facing criteria (D1–D3, D5, Phase 4 bullet 2,
Phase 6) were written for four consumers, and the phase decomposition only ever delivered one. The
hk-crm route collapse is a second, separate gap.

## What to do

**Recommended: file follow-up tickets.** Every donor-side criterion is shipped. What is left is
three well-scoped consumer cutovers, one frozen-lineage archive, and one hk-crm refactor. That
matches the existing `hk-crm-package-install-cutover` template, so it does not need a new design
cycle. Proposed slugs (not created — the user decides):

- [ ] `controlling-app-package-install-cutover`: install `design-baseline` at the current tag, run
      `docs/PACKAGE.md`'s vendored-consumer runbook, and delete the `docs/archetypes/MANIFEST.json`
      fork. Runs from a controlling-app session.
- [ ] `mistra-package-install-cutover`: same runbook for mistra, including reconciling its
      156-line `detail-overview.md` divergence through fork-triage.
- [ ] `brickshop-manager-archetypes-archive-freeze`: archive the pre-donor `docs/archetypes/`
      corpus to `docs/archive/archetypes-2026/` (the Phase 6 carve-out). Then decide between a
      cutover and an explicit frozen state, and remove `src/components/archetypes/`.
- [ ] `hk-crm-companies-detail-single-composition`: collapse the twelve `/companies/[id]` route
      files into one `DetailOverviewShell` composition with per-tab data. This is Phase 4
      bullet 1's proof case, and it makes the KPI-strip inconsistency impossible.
- [ ] `archetype-convergence-done-when-fleet-scope`: record, in the roadmap or an ADR, whether
      `## Done when` means all four consumers or only the migrated ones. This is the "separate
      call" the spec's fleet-commands "Deferred" list left open.

Alternatives (not recommended):

- [ ] **Mark delivered.** Defensible only if the user decides that H7's "one consumer is enough"
      also narrows `## Done when` to hk-crm. D1–D3 and D5 would then need restating, because read
      literally they are still `partial`.
- [ ] **Spawn a successor roadmap** (for example `fleet-package-adoption`) through the
      `supersedes` / `superseded_by` mechanism, carrying the three cutovers plus the spec's
      deferred items (locale seam, `layout/` two-entry treatment, `_adherence.json` targets
      default). This is heavier than the gap needs unless the deferred items should be designed
      together with the cutovers.

## Acceptance

- After the user's verdict, `docs/backlog/archetype-convergence.md` shows `status: delivered`, or
  shows `superseded_by:` naming a successor. It no longer sits at `in-review`.
- If follow-ups are chosen, `docs/backlog/` shows one ticket per proposed slug above, and each
  one's `## Acceptance` includes a `require.resolve('design-baseline/package.json')` check or an
  archive-path check, as appropriate.
- After the cutovers land, `git show origin/main:docs/archetypes/MANIFEST.json` fails in
  `controlling-app` and `mistra`, which turns D3 into `shipped`.
- After the hk-crm collapse, `git grep -l DetailOverviewShell -- 'src/app/(app)/companies/[id]'`
  in hk-crm returns one file instead of eleven.

## Related

- [archetype-convergence.md](archetype-convergence.md) — the roadmap under review.
- [archive/hk-crm-package-install-cutover.md](archive/hk-crm-package-install-cutover.md) — the one
  shipped consumer cutover, and the template for the three proposed ones.
- [archive/copy-channel-final-delete.md](archive/copy-channel-final-delete.md) — the H7 gate that
  let the copy channel die after one consumer.
- [docs/superpowers/specs/2026-08-17-archetype-convergence-design.md](../superpowers/specs/2026-08-17-archetype-convergence-design.md)
  — the spec. Its fleet-commands "Deferred to the decompose loop" section names the open
  three-consumer question.
- [docs/adr/0004-appearance-locality-derived-vs-inherited.md](../adr/0004-appearance-locality-derived-vs-inherited.md)
  — the rule the closed API enforces.
