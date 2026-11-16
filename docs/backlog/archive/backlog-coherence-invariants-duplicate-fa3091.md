---
area: tooling
opened: '2026-11-16'
status: done
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
  graded_at: '2026-11-16T11:10:40.848Z'
model: opus
---

# Decide: 6 overlapping cards in invariants-duplicate

## Context

The backlog-coherence ritual found overlapping open cards in `docs/backlog/` that are linked by shared artifacts. Run `design-baseline-backlog-coherence-2026-11-16T11:05:46.132Z` at truth ref `0ad2c154dc92ae099c05e3770a114ddfd25a677e`.

- [[invariants-duplicate-fact-check]] (`docs/backlog/invariants-duplicate-fact-check.md`)
- [[invariants-overflow-blind-under-mobile-emulation]] (`docs/backlog/invariants-overflow-blind-under-mobile-emulation.md`)
- [[invariants-page-title-collapse]] (`docs/backlog/invariants-page-title-collapse.md`)
- [[layout-invariants-nested-overflow]] (`docs/backlog/layout-invariants-nested-overflow.md`)
- [[story-coverage-gallery-catchall-route-serves-no-story]] (`docs/backlog/story-coverage-gallery-catchall-route-serves-no-story.md`)
- [[transaction-document-ledger-row-media]] (`docs/backlog/transaction-document-ledger-row-media.md`)

Shared keys: `Gallery.tsx`, `invariants.mjs`, `transaction-document-demo.tsx`

## Open question

### Gallery catch-all route: write a story or delete it?

**Option A:** Write a docs/stories entry naming the catch-all route and keep it

> If kept, add the story so each surface id is listed.
> — [[story-coverage-gallery-catchall-route-serves-no-story]]

**Option B:** Delete the route and the test that pins it

> If approved for deletion, remove the surface and any test pinning it
> — [[story-coverage-gallery-catchall-route-serves-no-story]]

**What it means for you:** A: unknown gallery URLs keep redirecting to the overview, and you add one short story. B: unknown URLs render nothing from the router, and the pinning test goes too.

**Recommendation:** A (confidence: medium) — The redirect is harmless and tiny, a test already pins it, and a one-line story is cheaper than removal. This is the operator's call per the card.

## Ticket verdicts

| slug | verdict | evidence |
| --- | --- | --- |
| invariants-overflow-blind-under-mobile-emulation | keep | src/testing/invariants.mjs:16; Still open: W = window.innerWidth at line 16 feeds the overflow and clipped checks. Should land first because it changes W for every later check. |
| layout-invariants-nested-overflow | keep | src/testing/invariants.mjs:56; No nestedOverflow, textClip, headingLines or textOverlap codes exist in invariants.mjs. Lands second. |
| invariants-duplicate-fact-check | keep | src/testing/invariants.mjs:16; No duplicateFact code exists. Already depends_on layout-invariants-nested-overflow. Its 'once the demo exists' clause is moot: transaction-document-demo already ships. |
| invariants-page-title-collapse | refresh | src/testing/invariants.mjs:16; No titleSqueeze code exists. Add depends_on layout-invariants-nested-overflow: the card links it but does not declare it, and both edit the same measure()/STYLE.md/version/CHANGELOG. |
| story-coverage-gallery-catchall-route-serves-no-story | keep | gallery/Gallery.tsx:288; Blocked on an operator decision. The catch-all route still exists and docs/stories has no story for it. |
| transaction-document-ledger-row-media | keep | src/components/archetypes/transaction-document/ledger.ts; LedgerRow has no media field yet. Independent of the other cards. The Open question holds defaults already chosen (ReactNode media; condition line fits `detail`); reverse on review if wrong. |

## Duplicates

_none_

## Conflicts

_none_

## Possible tensions

- Shared edit surface in invariants.mjs measure(), invariants.d.mts, STYLE.md 'The device triad', version bump and CHANGELOG ([[invariants-overflow-blind-under-mobile-emulation]], [[layout-invariants-nested-overflow]], [[invariants-duplicate-fact-check]], [[invariants-page-title-collapse]]): All four edit the same function and release files, so parallel builds guarantee rebase conflicts. Proposed order: overflow-blind, then nested-overflow, then title-collapse and duplicate-fact-check (those two in either order). The ticket-declared dependency is only duplicate-fact-check after nested-overflow.
- Ledger-media card adds a media row to transaction-document-demo.tsx, which duplicate-fact-check scans ([[invariants-duplicate-fact-check]], [[transaction-document-ledger-row-media]]): The ledger-media card adds a media row to transaction-document-demo.tsx. duplicate-fact-check runs over that demo via check:viewports, so a money token repeated more than twice in the new row could trip duplicateFact. Not a contradiction; keep the media row's tokens distinct.

## Roadmap verdicts

_none_

## Proposed end state

- `invariants-overflow-blind-under-mobile-emulation`: keep
- `layout-invariants-nested-overflow`: rewrite, depends_on: invariants-overflow-blind-under-mobile-emulation
  Carry over:
  - Add depends_on front-matter on invariants-overflow-blind-under-mobile-emulation; keep body unchanged
- `invariants-page-title-collapse`: rewrite, depends_on: layout-invariants-nested-overflow
  Carry over:
  - Add the missing depends_on front-matter; keep body unchanged
- `invariants-duplicate-fact-check`: rewrite, depends_on: layout-invariants-nested-overflow
  Carry over:
  - Drop the 'once the demo exists' wording; transaction-document-demo.tsx already ships
- `story-coverage-gallery-catchall-route-serves-no-story`: keep (decision-dependent: Gallery catch-all route: write a story or delete it?)
- `transaction-document-ledger-row-media`: keep

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

- [[invariants-duplicate-fact-check]]
- [[invariants-overflow-blind-under-mobile-emulation]]
- [[invariants-page-title-collapse]]
- [[layout-invariants-nested-overflow]]
- [[story-coverage-gallery-catchall-route-serves-no-story]]
- [[transaction-document-ledger-row-media]]
- [[backlog-coherence-ritual]] — owning roadmap

## Not verified

- Did not read invariants.mjs lines 28 and 144 (cited by the overflow-blind card); only lines 16 and 56 were checked.
- Did not check whether a test pins the Gallery.tsx catch-all route; the card says one does.
- Did not confirm that transaction-document-demo.tsx exists; I inferred it from the recent commit log.
- Did not read neighbour cards outside the cluster (export-page-invariants, transaction-document-ledger-row-lock-add-remove, transaction-document-mockup-fidelity).
- Did not check any ADR text; none was cited that bears on these cards.

## Resolution (2026-11-16)

Re-verified against origin/main a401d8f before acting.

- **Open question — gallery catch-all: Option A.** Kept the route; story `docs/stories/gallery-unknown-route-lands-on-overview.md` names `page:*`. The story card's "a test pins it" claim was false: no gallery test, `scripts/check-*.mjs` or `tests/screenshots.spec.mjs` visits an unknown route.
- `layout-invariants-nested-overflow`: added `depends_on: [invariants-overflow-blind-under-mobile-emulation]`; body unchanged.
- `invariants-page-title-collapse`: added `depends_on: [layout-invariants-nested-overflow]`; body unchanged.
- `invariants-duplicate-fact-check`: already done by #768 (both `depends_on` set, stale "once the demo exists" wording gone); no edit.
- `invariants-overflow-blind-under-mobile-emulation`, `transaction-document-ledger-row-media`: kept unchanged. The ledger-media card's own open question is out of scope here.
