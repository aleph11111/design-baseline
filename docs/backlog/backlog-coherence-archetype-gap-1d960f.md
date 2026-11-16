---
area: archetypes
opened: '2026-11-16'
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
  graded_at: '2026-11-16T11:10:40.523Z'
model: opus
---

# Decide: 7 overlapping cards in archetype-gap

## Context

The backlog-coherence ritual found overlapping open cards in `docs/backlog/` that are linked by shared artifacts. Run `design-baseline-backlog-coherence-2026-11-16T11:05:46.132Z` at truth ref `0ad2c154dc92ae099c05e3770a114ddfd25a677e`.

- [[archetype-gap-import-wizard-history-view-slots]] (`docs/backlog/archetype-gap-import-wizard-history-view-slots.md`)
- [[code-health-lint-design-rule-kind-dispatch]] (`docs/backlog/code-health-lint-design-rule-kind-dispatch.md`)
- [[code-health-settings-table-shell-prop-reforwarding]] (`docs/backlog/code-health-settings-table-shell-prop-reforwarding.md`)
- [[detail-overview-rail-switch-container-query]] (`docs/backlog/detail-overview-rail-switch-container-query.md`)
- [[page-body-section-card-stack]] (`docs/backlog/page-body-section-card-stack.md`)
- [[remove-pageframe-flat-actions-node-form]] (`docs/backlog/remove-pageframe-flat-actions-node-form.md`)
- [[wizard-panel-embeddable-frame]] (`docs/backlog/wizard-panel-embeddable-frame.md`)

Shared keys: `PageFrame.tsx`, `SettingsTableShell.tsx`, `StructureBuilderShell.tsx`, `WizardShell.test.tsx`, `WizardShell.tsx`, `import-wizard-demo.tsx`, `lint-design.mjs`, `verify-package-version.mjs`

## Open question

Confirm the proposed end state below before any card is rewritten, discarded or archived.

## Ticket verdicts

| slug | verdict | evidence |
| --- | --- | --- |
| archetype-gap-import-wizard-history-view-slots | keep | src/components/archetypes/import-wizard/WizardShell.tsx:39; src/examples/import-wizard-demo.tsx:1; Gap still open. WizardShell still types its frame slots as Pick<PageFrameProps, title\|subtitle\|badges>. Two open forks are recommended-defaulted and unresolved, so the card is not dispatchable as-is. It must land before or after wizard-panel-embeddable-frame, because both touch WizardShell and the import-wizard MANIFEST version. |
| code-health-lint-design-rule-kind-dispatch | refresh | scripts/lint-design.mjs:462; scripts/lint-design.mjs:489; scripts/lint-design.mjs:55; Defect still present: the sentinel '(?!)' chain is at line 462. The file is now 704 lines and the card cites 680 and line 447. Line numbers and counts in the Context and Acceptance ('7 continue statements today') are stale, so refresh them before /feat. The fix is unchanged. |
| code-health-settings-table-shell-prop-reforwarding | refresh | src/components/archetypes/settings-table/SettingsTableShell.tsx:241; src/components/archetypes/settings-table/SettingsTableShell.tsx:725; src/components/layout/PageFrame.tsx:11; Defect still present (PAGE_SHELL_FRAME_KEYS does not exist). The card is unchanged since 2026-11-04, and PageFrame has since gained the stack body mode (ADR-0015, v0.39.0). Re-verify the line numbers and the PageShellFrameProps shape before /feat. |
| detail-overview-rail-switch-container-query | keep | src/components/archetypes/detail-overview/DetailOverviewShell.tsx:207; src/components/archetypes/detail-overview/DetailOverviewShell.tsx:196; Still open. The rail still keys on viewport lg:/max-lg: and the file has no @container. Line numbers have shifted slightly (card cites 154-195). Its audit step lists StructureBuilderShell and SettingsTableShell, which overlap files with other cards, so rebases are likely. |
| page-body-section-card-stack | keep | ad30cc2; docs/adr/0015-page-body-section-card-stack.md; docs/backlog/page-body-section-card-stack.md:67; Roadmap. ADR-0015 and the primitive (stack body mode) shipped in v0.39.0 (ad30cc2), but the card's first two What-to-do boxes are still unchecked. The slice-ticket decomposition and slice ordering remain open. 11491d2 (kanban nested cards) is slice-adjacent. The card has no P1-P4 numbering. Not dissolved: it is the live pointer for the remaining slices; refresh the checkboxes. |
| remove-pageframe-flat-actions-node-form | refresh | src/components/layout/PageFrame.tsx:22; src/components/layout/PageFrame.tsx:56; src/components/layout/PageFrame.tsx:159; src/components/archetypes/structure-builder/StructureBuilderShell.tsx:130; Work is still open: the deprecated LegacyHeaderActions form and isHeaderActions branching are still present. But depends_on names page-header-action-hierarchy-overflow-menu, which is no longer an open backlog card. It shipped (typed actions and the @deprecated note exist), so drop that depends_on so the card stays dispatchable. The downstream-consumer precondition is unchecked. |
| wizard-panel-embeddable-frame | refresh | package.json:3; src/examples/import-wizard-demo.tsx:1; docs/archetypes/MANIFEST.json:175; Still open. Three stale facts: (1) it says trunk is v0.46.1 but package.json is 0.46.3 (0.47.0 is still the next minor); (2) the demo path src/components/archetypes/import-wizard/import-wizard-demo.tsx does not exist, and the real file is src/examples/import-wizard-demo.tsx; (3) the MANIFEST import-wizard version is 3.6 as stated, but it must be re-read at /feat time if the history-slots card lands first. |

## Duplicates

_none_

## Conflicts

_none_

## Possible tensions

- WizardShell.tsx, import-wizard-demo.tsx, WizardShell.test.tsx and import-wizard MANIFEST version overlap ([[archetype-gap-import-wizard-history-view-slots]], [[wizard-panel-embeddable-frame]]): Both can hold: wizard-panel keeps WizardShell's public props unchanged, history-slots adds three optional props forwarded to PageFrame. Both bump package.json, CHANGELOG, the import-wizard spec and its MANIFEST entry (3.6); wizard-panel hard-codes 0.47.0. Whichever lands second rebases onto a new version. history-slots is not dispatchable until its two forks are confirmed, so wizard-panel will usually land first; re-derive the version at /feat.
- StructureBuilderShell.tsx and PageFrame.tsx actions area touched by several cards ([[remove-pageframe-flat-actions-node-form]], [[code-health-settings-table-shell-prop-reforwarding]], [[detail-overview-rail-switch-container-query]]): File overlap only. PageFrame.tsx is touched by remove-pageframe (actions type) and settings-table (PAGE_SHELL_FRAME_KEYS). StructureBuilderShell and SettingsTableShell are touched by detail-overview's audit step. Expect rebases, no contradiction. remove-pageframe and detail-overview both bump the package version and CHANGELOG, which serialises those two.
- lint-design.mjs is edited by lint-design-rule-kind-dispatch and referenced by settings-table card ([[code-health-lint-design-rule-kind-dispatch]], [[code-health-settings-table-shell-prop-reforwarding]]): The settings-table card cites findSwallowedSlots in lint-design.mjs only as context and does not edit it, so the dispatch refactor does not invalidate it. Neighbour cards outside the cluster that were not read: adherence-lint-swallowed-pageframe-slot-prop and code-health-toolbar-band-extract-from-pageframe.

## Roadmap verdicts

- [[page-body-section-card-stack]]: keep. Evidence: ad30cc2; docs/adr/0015-page-body-section-card-stack.md; docs/backlog/page-body-section-card-stack.md:67

## Proposed end state

- `archetype-gap-import-wizard-history-view-slots`: keep
- `code-health-lint-design-rule-kind-dispatch`: rewrite
- `code-health-settings-table-shell-prop-reforwarding`: rewrite
- `detail-overview-rail-switch-container-query`: keep
- `page-body-section-card-stack`: keep
- `remove-pageframe-flat-actions-node-form`: rewrite
- `wizard-panel-embeddable-frame`: rewrite

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

- [[archetype-gap-import-wizard-history-view-slots]]
- [[code-health-lint-design-rule-kind-dispatch]]
- [[code-health-settings-table-shell-prop-reforwarding]]
- [[detail-overview-rail-switch-container-query]]
- [[page-body-section-card-stack]]
- [[remove-pageframe-flat-actions-node-form]]
- [[wizard-panel-embeddable-frame]]
- [[backlog-coherence-ritual]] — owning roadmap

## Not verified

- No tests, tsc or check:viewports were run; all verdicts rest on reading cards and code.
- Whether controlling-app, hk-crm and brickshop-manager still pass a rendered node as actions (remove-pageframe precondition) was not checked; those repos are outside the truth ref.
- Not read: the neighbour cards adherence-lint-swallowed-pageframe-slot-prop, code-health-toolbar-band-extract-from-pageframe, heading-row-actions-squeeze-title-container-query, transaction-document-mockup-fidelity.
- The page-body-section-card-stack phase open flags were not reconciled against shipped transaction-document and kanban work (#764, #765).
- Fleet _adherence.json claims in the lint-design card (no rule sets two flags) were not rechecked.
