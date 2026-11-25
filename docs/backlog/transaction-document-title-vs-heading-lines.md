---
area: layout
opened: 2026-11-26
status: needs-enrichment
value: normal
blocked_on_branch: feat/layout-invariants-nested-overflow
model: opus
model_reason: "contract tradeoff is the deliverable: title-never-cut rule against the 2-line heading invariant"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance]
  failed:
    - open_question: "unresolved fork auto-resolved to the Recommended default; operator must confirm"
  graded_at: 2026-11-26T00:00:00Z
---

# Transaction-document title rule conflicts with the headingLines check

## Context

`docs/archetypes/transaction-document.md` says the document title is "never cut (it wraps)" (line 51) and "The long title wraps in full at every width" (line 177). The demo (`src/examples/transaction-document-demo.tsx:79`) uses a deliberately long title, "Millennium Falcon UCS 75192, Hogwarts Castle 71043 and shipping for Bricks & Co. Trading GmbH, Hamburg". The `headingLines` check added by design-baseline PR #859 (v0.71.0, `src/testing/invariants.mjs`, branch `feat/layout-invariants-nested-overflow`, still open) fails any page `h1` that wraps past 2 lines.

Repro: `npm run check:viewports` on the PR branch. Every transaction-document pass fails: 90px of title text at laptop14/desk27/1024/1280 and 120px at phone/1133, where 60px is two lines. The PR records this as a page-scoped known gap, `PAGE_GAPS` in `scripts/check-viewports.mjs`, which needs this slug. The contract and the check disagree, so one of them has to change.

## What to do

- [ ] Cap the document title at 2 lines in the contract: replace "never cut (it wraps)" and "wraps in full at every width" in `docs/archetypes/transaction-document.md` with a 2-line rule. Beyond 2 lines the title is clamped, and the full title stays reachable (`title` attribute on the `h1`, full text in the DOM). Implement the clamp in `TransactionDocumentShell.tsx`, not in shared `HeadingRow`.
- [ ] Verify the clamp does not trip `textClip` in `src/testing/invariants.mjs`; if it does, extend that check's allowance for a deliberate `line-clamp` explicitly, with a unit case, never a silent skip.
- [ ] Remove the `transaction-document` entry from `PAGE_GAPS` in `scripts/check-viewports.mjs`.
- [ ] Keep the long demo title: it now exercises the clamp (a living demo per the variants convention).
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (consumer: none required; breaking: no).

## Acceptance

- `npm run check:viewports` passes every transaction-document pass (laptop14, desk27, phone, 1024, 1133, 1280) with no `PAGE_GAPS` entry for it.
- The contract text states the 2-line cap and the full-title access, and matches what `headingLines` enforces: no wording in `docs/archetypes/transaction-document.md` still promises an unclamped title.
- No other archetype's contract still promises an unbounded-wrapping page title, since every `kind: page` archetype is held to the same `headingLines` limit.
- The clamped title no longer reports `textClip` or `headingLines`, and its full text is still readable via the `title` attribute.

## Related

- [[layout-invariants-nested-overflow]] — adds `headingLines`; this ticket cannot start until it merges
- [[transaction-document-header-title-action-overlap-1024]] — same long title and header at 1024 (3 lines, 22px action overlap); the 2-line clamp may remove that overlap, so check it when working either ticket
- [[invariants-page-title-collapse]] — sibling title invariant in the same helper
- [[archetype-gap-transaction-document]] — origin of the archetype and its title contract

## Open question

Which resolution for the title-vs-`headingLines` conflict? Chosen (Recommended): (a) cap the title at 2 lines with clamp plus full-title `title` attribute, since real documents have long titles and the check is the general rule. Alternatives:

- (b) `headingLines` allows N lines on document-column pages, written as an explicit contract rule, not a silent skip. Keeps "never cut", but weakens the check for one archetype and leaves a 4-line title on phones.
- (c) Shorten the demo title only. Cheapest, but the contract still promises an unclamped title that the check forbids for real data.
