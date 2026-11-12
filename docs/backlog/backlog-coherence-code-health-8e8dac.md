---
area: tooling
opened: '2026-11-12'
status: needs-enrichment
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed:
    - open_question: >-
        unresolved design fork under ## Open question — needs an interactive operator decision
        before /feat
  graded_at: '2026-11-12T02:28:51.452Z'
model: opus
---

# Decide: 10 overlapping cards in code-health

## Context

The backlog-coherence ritual found overlapping open cards in `docs/backlog/` that are linked by shared artifacts. Run `design-baseline-backlog-coherence-2026-11-12T02:14:05.919Z` at truth ref `62ac004ba042bf9d82d3b88deacac68ee8760044`.

- [[code-health-lint-design-rule-kind-dispatch]] (`docs/backlog/code-health-lint-design-rule-kind-dispatch.md`)
- [[code-health-settings-table-shell-prop-reforwarding]] (`docs/backlog/code-health-settings-table-shell-prop-reforwarding.md`)
- [[code-health-toolbar-band-extract-from-pageframe]] (`docs/backlog/code-health-toolbar-band-extract-from-pageframe.md`)
- [[invariants-duplicate-fact-check]] (`docs/backlog/invariants-duplicate-fact-check.md`)
- [[invariants-overflow-blind-under-mobile-emulation]] (`docs/backlog/invariants-overflow-blind-under-mobile-emulation.md`)
- [[page-body-section-card-stack]] (`docs/backlog/page-body-section-card-stack.md`)
- [[playwright-bin-compose-consumer-support]] (`docs/backlog/playwright-bin-compose-consumer-support.md`)
- [[playwright-bin-docker-args-passthrough]] (`docs/backlog/playwright-bin-docker-args-passthrough.md`)
- [[playwright-bin-rootless-docker-user-mapping]] (`docs/backlog/playwright-bin-rootless-docker-user-mapping.md`)
- [[transaction-document-mockup-fidelity]] (`docs/backlog/transaction-document-mockup-fidelity.md`)

Shared keys: `PageFrame.tsx`, `SettingsTableShell.test.tsx`, `SettingsTableShell.tsx`, `SurfaceFrame.tsx`, `V2.dc.html`, `_adherence.json`, `check-visual.sh`, `design-baseline-playwright.mjs`, `invariants.mjs`, `lint-design.mjs`, `transaction-document-demo.tsx`

- `transaction-document-mockup-fidelity` läuft schon und müsste auf `backlog-coherence-code-health-8e8dac` warten, anhalten?

## Open question

### One generic docker-args variable, or dedicated network/env/mount variables for the Playwright bin?

**Option A:** Keep only the generic DESIGN_BASELINE_PLAYWRIGHT_DOCKER_ARGS card, always add the add-host default, and fold the rest into DOCKER_ARGS examples. One card, one env var.

> so a consumer cannot attach the Playwright container to its compose network and address services by name
> — [[playwright-bin-docker-args-passthrough]]

**Option B:** Keep the dedicated variables (NETWORK, ENV, MOUNTS) and drop or narrow the generic card. More explicit, VISUAL_* wildcard convenience, several env vars to document.

> so repo-root files outside the cwd are readable without copying them in
> — [[playwright-bin-compose-consumer-support]]

**What it means for you:** A) is one small change and one doc paragraph. B) is a bigger bin and PACKAGE.md surface that a generic variable would already cover.

**Recommendation:** A (confidence: medium) — DOCKER_ARGS covers network, add-host, -e and -v. A dedicated variable per flag duplicates it. A caveat: whitespace splitting cannot take paths with spaces.

### Bound the Td column now in the fidelity ticket, or wait for the section-card roadmap?

**Option A:** Ship the bounded column in the fidelity ticket now. The roadmap's Td slice reconciles to one bound later.

> Bound the content column in
> — [[transaction-document-mockup-fidelity]]

**Option B:** Leave the column unbounded until the roadmap's Td slice and do all of the layout together. The roadmap has no spec yet, so this blocks on it.

> ending in one bound, not two
> — [[page-body-section-card-stack]]

**What it means for you:** A) removes the 1600px label-to-amount gap soon. B) avoids doing the bound twice but waits on an unspecced roadmap.

**Recommendation:** A (confidence: medium) — The roadmap is not dispatchable (tickets empty, no spec). Fixing the gap now is cheap; the roadmap slice can edit the bound it inherits.

## Ticket verdicts

| slug | verdict | evidence |
| --- | --- | --- |
| code-health-lint-design-rule-kind-dispatch | refresh | scripts/lint-design.mjs:458; scripts/lint-design.mjs:508; scripts/lint-design.mjs:514; Still open: five rule-kind flags and the '(?!)' sentinel are still in compileRules (line 458 now, card says 447). File is 691 lines, not 680. scanFile has about 9 `continue` statements now, not 7. Refresh the numbers only. |
| code-health-settings-table-shell-prop-reforwarding | keep | src/components/archetypes/settings-table/SettingsTableShell.tsx:623; src/components/archetypes/settings-table/SettingsTableShell.tsx:761; Still open: resolveCountLabel/resolveBulkActions are still computed in both the body (line 623) and the shell (line 761). The file is 832 lines, matching the card. |
| code-health-toolbar-band-extract-from-pageframe | refresh | src/components/layout/PageFrame.tsx:250; src/components/layout/PageFrame.tsx:270; src/components/layout/SurfaceFrame.tsx:61; src/components/archetypes/settings-table/SettingsTableShell.tsx:658; Still open: four copies of the band chrome remain. Line numbers drifted (PageFrame band at 250 and 270, not 233 and 253; file is 454 lines, not 437). The ~250-line target still needs re-sizing. The roadmap says the toolbar band stays on the first card, so this extraction should land before the roadmap's primitive slice. |
| invariants-duplicate-fact-check | refresh | src/examples/transaction-document-demo.tsx:1; docs/backlog/archive/archetype-gap-transaction-document.md; src/testing/invariants.mjs:146; Still open: no duplicateFact in invariants.mjs. But archetype-gap-transaction-document is archived and the Td demo exists, so the 'once ... exists' wording is stale and the passing-case acceptance can be stated directly. checkPageInvariants is at line 146, not 143. depends_on layout-invariants-nested-overflow is an open card outside this cluster and must be kept. The card also lacks an ordering against invariants-overflow-blind-under-mobile-emulation, which edits the same function. |
| invariants-overflow-blind-under-mobile-emulation | keep | src/testing/invariants.mjs:16; Still open: `const W = window.innerWidth` at line 16 is unchanged. Cited line numbers drifted by a few lines only. value:high; should land before duplicate-fact. |
| page-body-section-card-stack | keep | docs/adr/0008-one-page-frame-slot-owned-placement.md:58; docs/backlog/page-body-section-card-stack-start-spec.md; Roadmap is the only live pointer to the ADR-0008 §3 / ADR-0007 §3 supersession. It has tickets: [] and no spec pointer yet (a start-spec reminder card exists). Its claim that the fidelity ticket asks for per-section cards is wrong and needs editing. |
| playwright-bin-compose-consumer-support | merge-into:playwright-bin-docker-args-passthrough | bin/design-baseline-playwright.mjs:60; d3ea386; docs/backlog/archive/playwright-bin-linux-root-owned-output.md; Decision-dependent (see decision 1). Overlaps the other card on network and extra docker args. Its depends_on playwright-bin-linux-root-owned-output is stale: shipped as #657 (d3ea386) and archived. |
| playwright-bin-docker-args-passthrough | refresh | bin/design-baseline-playwright.mjs:60; d3ea386; docs/backlog/archive/playwright-bin-linux-root-owned-output.md; Still open (no DOCKER_ARGS in the bin). depends_on is stale, since #657 shipped. If decision 1 goes the recommended way this is the survivor, widened with the add-host default and the examples folded in. |
| playwright-bin-rootless-docker-user-mapping | keep | bin/design-baseline-playwright.mjs:46; bin/design-baseline-playwright.mjs:60; Still open: --user uid:gid and the chown step (lines 46 and 60) are unconditional on linux, with no rootless detection. It edits the same arg list as the docker-args card, so land it first. |
| transaction-document-mockup-fidelity | refresh | 9e54530; docs/backlog/archive/transaction-document-ledger-row-lock-add-remove.md; src/components/archetypes/transaction-document/TransactionDocumentShell.test.tsx:44; src/components/archetypes/transaction-document/TransactionDocumentShell.tsx:177; package.json:3; All four gaps are still open: Profit/Margin columns at test:44, flat divide-y td-body at shell:177, version is 0.37.0. The depends_on on ledger-row-lock-add-remove is stale (shipped #723, 9e54530, archived). The column bound is added here as a Td-local change while the roadmap wants one bound ending up, which needs reconciling. |

## Duplicates

- `playwright-bin-compose-consumer-support` duplicates `playwright-bin-docker-args-passthrough` (survivor). Fold in: always add --add-host host.docker.internal:host-gateway; document extra mounts and env pass-through as DOCKER_ARGS examples; controlling-app check-visual.sh workaround as repro. Evidence: bin/design-baseline-playwright.mjs:60

## Conflicts

### Whether the fidelity ticket asks for per-section cards

> already asks for one card per section
> — [[page-body-section-card-stack]]

> the per-section cards are **out of scope** here
> — [[transaction-document-mockup-fidelity]]

Code evidence: src/components/archetypes/transaction-document/TransactionDocumentShell.tsx:177; docs/adr/0008-one-page-frame-slot-owned-placement.md:58

## Possible tensions

- Same file, version bump, STYLE.md section ([[invariants-overflow-blind-under-mobile-emulation]], [[invariants-duplicate-fact-check]]): Both edit measure()/invariants.d.mts, bump the version and the CHANGELOG, and add to the STYLE.md device-triad section. They can both land but not in parallel. Order: overflow-blind (value high), then duplicate-fact. Duplicate-fact also waits on layout-invariants-nested-overflow, which is outside this cluster and may conflict the same way. Related: invariants-page-title-collapse, outside the cluster, also edits measure().
- SettingsTableBody band ([[code-health-settings-table-shell-prop-reforwarding]], [[code-health-toolbar-band-extract-from-pageframe]]): Both rewrite SettingsTableShell.tsx and PageFrame.tsx: one adds PAGE_SHELL_FRAME_KEYS, the other moves the band out. Do them in series; settings-table first gives the smaller merge, expressed as a depends_on on the toolbar card. Ordering only, not a conflict.
- Toolbar band vs roadmap primitive ([[code-health-toolbar-band-extract-from-pageframe]], [[page-body-section-card-stack]]): The roadmap keeps the toolbar band on the first card and touches SurfaceFrame/PageFrame. Land the ToolbarBand extraction before the roadmap's primitive slice. This is a sequencing point, not a conflict. Possible further tension with detail-overview-rail-switch-container-query and remove-pageframe-flat-actions-node-form (outside cluster, not read).
- Docker run arg list ([[playwright-bin-rootless-docker-user-mapping]], [[playwright-bin-docker-args-passthrough]], [[playwright-bin-compose-consumer-support]]): All three edit the same arg list in bin/design-baseline-playwright.mjs (and PACKAGE.md / version bump). Land rootless first, then the survivor.
- Td column bound ([[transaction-document-mockup-fidelity]], [[page-body-section-card-stack]]): Fidelity adds a Td-local bounded column now (the shell has no max-w today). The roadmap's Td slice must end in one bound, not two, so it will reconcile or remove it.

## Roadmap verdicts

- [[page-body-section-card-stack]]: keep. Evidence: docs/backlog/page-body-section-card-stack-start-spec.md; docs/adr/0008-one-page-frame-slot-owned-placement.md:58

## Proposed end state

- `code-health-lint-design-rule-kind-dispatch`: rewrite
- `code-health-settings-table-shell-prop-reforwarding`: keep
- `code-health-toolbar-band-extract-from-pageframe`: rewrite, depends_on: code-health-settings-table-shell-prop-reforwarding
- `invariants-overflow-blind-under-mobile-emulation`: keep
- `invariants-duplicate-fact-check`: rewrite, depends_on: invariants-overflow-blind-under-mobile-emulation, layout-invariants-nested-overflow
- `page-body-section-card-stack`: rewrite
- `playwright-bin-rootless-docker-user-mapping`: keep
- `playwright-bin-docker-args-passthrough`: rewrite, depends_on: playwright-bin-rootless-docker-user-mapping (decision-dependent: One generic docker-args variable, or dedicated network/env/mount variables for the Playwright bin?)
- `playwright-bin-compose-consumer-support`: merge-into → playwright-bin-docker-args-passthrough (decision-dependent: One generic docker-args variable, or dedicated network/env/mount variables for the Playwright bin?)
  Carry over:
  - always pass --add-host host.docker.internal:host-gateway (not in the docker-args card; add it to its what-to-do and acceptance)
  - extra repo-root mounts like _adherence.json and seed CSVs, as a documented DOCKER_ARGS -v example in PACKAGE.md
  - VISUAL_* env passthrough: dropped under A; record it as a DOCKER_ARGS -e example
  - controlling-app check-visual.sh workaround as the repro in the survivor's context
- `transaction-document-mockup-fidelity`: rewrite

## What to do

- Answer the open question in this ticket.
- Rewrite the affected cards and re-grade each with `/ticket --regrade <slug>`.
- Discard the duplicates through the board.
- Archive this ticket; that releases every waiting card back to Ready.

## Acceptance

- Every conflict above is resolved in the card text.
- Every carry-over item is present in its survivor.
- This ticket is archived.

## Related

- [[code-health-lint-design-rule-kind-dispatch]]
- [[code-health-settings-table-shell-prop-reforwarding]]
- [[code-health-toolbar-band-extract-from-pageframe]]
- [[invariants-duplicate-fact-check]]
- [[invariants-overflow-blind-under-mobile-emulation]]
- [[page-body-section-card-stack]]
- [[playwright-bin-compose-consumer-support]]
- [[playwright-bin-docker-args-passthrough]]
- [[playwright-bin-rootless-docker-user-mapping]]
- [[transaction-document-mockup-fidelity]]
- [[backlog-coherence-ritual]] — owning roadmap

## Not verified

- No tests or checks were run; 'still open' is read from code and grep only.
- The heading numbers of ADR-0007 §3 and ADR-0008 §3 were not checked, only the ADR-0008 line 58 text and the ADR-0007 no-card-in-card text at line 37.
- The state and content of layout-invariants-nested-overflow (outside the cluster) was not read; whether duplicate-fact's ordering behind it still holds is unchecked.
- Whether the Td demo already passes a duplicateFact check, and whether the MANIFEST 1.2 and v0.38.0 targets for fidelity are still right, were not verified.
- Fleet consumer configs (_adherence.json) behind the lint-design card's 'no behaviour change' claim were not re-checked.
- The refused-link cards (detail-overview-rail-switch-container-query, remove-pageframe-flat-actions-node-form, invariants-page-title-collapse, layout-invariants-nested-overflow) were not read.
