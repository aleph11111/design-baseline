---
area: archetypes
opened: '2026-10-10'
status: ready
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - acceptance
  failed:
    - open_question: unresolved Open question caps the score at 4
  graded_at: '2026-10-10T00:00:00.000Z'
value: normal
---

# DetailOverviewShell body has no way to drop its inner padding

## Context

`DetailOverviewShell` (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx`) wraps its `stats`/`content` body in a fixed `p-5` container (and the vertical layout's body wrapper in `border-t border-border/60 p-5 space-y-4`), with no prop to drop or reduce it. A card nested in that body therefore gets a double inset on phones. Measured in hk-sales-agent Firmenakte at 430px (verify run, 2026-10-10): the section starts at x=40 and its row labels at x=76, a 60px label inset from the viewport, while the page title and back link sit at x=16. The hk-sales-agent PR 38 review rejected local overrides and accepts only a shared fix, so the option has to ship in the donor and consumers then opt in.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. (Here: both `p-5` body wrappers in `DetailOverviewShell`, the rail branch and the vertical branch.)
- [ ] Add a padding option on `DetailOverviewShell` (flush or section-padding) that drops or reduces the body's `p-5` in both layouts; the default stays `p-5` so existing consumers are unchanged.
- [ ] Show the option in the gallery demo `src/examples/detail-overview-demo.tsx`, with a card nested in the body at a 430px viewport.
- [ ] Add a `DetailOverviewShell.test.tsx` case asserting the body wrapper carries no `p-5` when the option is set and keeps it by default, in both `rail` and `vertical` layouts.
- [ ] Bump the `detail-overview` contract version in `docs/archetypes/detail-overview.md` and `docs/archetypes/MANIFEST.json`, bump `package.json`, and add a `CHANGELOG.md` entry (consumer: opt in to the new option; breaking: no).

## Acceptance

- With the option set, a card nested in the body at 430px starts at the same x as the page title and back link, not 24px further in.
- Without the option, the body renders unchanged (`p-5`) in both `rail` and `vertical` layouts.
- Both body wrappers honour the option; no other `DetailOverviewShell` layout keeps the fixed `p-5` when it is set.
- `npm test` fails on a version bump without a `CHANGELOG.md` entry, and passes after the entry is added.

## Related

- [[detail-overview-empty-body-strip-renders]] — last change to the same body wrapper
- [[archetype-rollout-detail-overview-collapsible-rail-body-has-no-vertical-padding]] — prior padding fix in this shell's rail
- [[settings-table-body-flush-default-outside-tab]] — precedent for a `flush` body option and the padding it bleeds out of
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality, constrains a per-call-site padding prop
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — frame owns placement

## Open question

Where does the option live, and is it allowed under ADR-0004 (appearance fixed in the component, per-call-site only when derived)? Options: (A, recommended) a boolean on `DetailOverviewShell` such as `flush`, a structural layout choice rather than a className, applied to the body wrapper; (B) a prop on the section component, which is not where the padding comes from (`DetailSection` already has its own `flush` for content padding); (C) derive it from context so a nested card needs no opt-in, which needs a new context provider. Ticket text assumes A until confirmed.

## Review gate: wrong approach (2026-10-16, PR #578)

PR https://github.com/aleph11111/design-baseline/pull/578 was closed by the `/ship` review gate. Start over from this ticket, and do not repeat the rejected approach.


The ticket asks for an **opt-in** padding option on `DetailOverviewShell`. The default must stay `p-5`, so existing consumers are unchanged, and consumers opt in. The branch does the opposite. It removes the horizontal padding from both body wrappers for every consumer, adds no prop, and archives a rewritten copy of the ticket whose acceptance criteria now require "No new prop" and "No body wrapper carries horizontal padding." That rewrite has no authority: the ticket above is the authoritative copy, and the author settled its unresolved Open question (A/B/C, explicitly "assumes A until confirmed") by fiat. The ADR-0004 argument may well be correct. But it is a design decision for the ticket owner to confirm, not one the implementer can make by editing the acceptance criteria. As shipped, the change breaks the authoritative ticket's default-unchanged criterion outright, and fixing that means reverting the core edit rather than patching it.

### Findings

1. `src/components/archetypes/detail-overview/DetailOverviewShell.tsx:172` and `:196`: `p-5` → `py-5` is applied unconditionally.
   - Failure scenario: any existing consumer that does not want the change (any app on the package other than hk-sales-agent Firmenakte) upgrades to 0.11.6. Its main-column content shifts 20px outward with no opt-out.
   - This contradicts "the default stays `p-5` so existing consumers are unchanged."
   - The CHANGELOG entry also calls this "Breaking: no," even though every consumer's layout changes.
2. `docs/backlog/archive/detail-overview-shell-body-inset-no-flush.md` (new) and `docs/backlog/detail-overview-shell-body-inset-no-flush.md` (deleted): the branch replaces the ticket's Acceptance and What-to-do with self-authored ones and marks it `done`.
   - The original was `status: needs-enrichment`, with a gate failure on the open question.
   - Scenario: backlog tooling and later readers see a "done" ticket whose criteria were never the requested ones.
3. `CHANGELOG.md:7`: the entry claims labels land "36px" from the viewport edge, but the ticket's target is the page title/back-link x (16px).
   - Nothing in the diff measures this. The demo is unchanged and no layout assertion was added, so the stated alignment is unverified.
4. `src/components/archetypes/detail-overview/DetailOverviewShell.test.tsx:345`: the regex `/(^|\s)(p|px|pl|pr)-\d/` would not catch `ps-`/`pe-` or responsive (`sm:px-5`) horizontal padding.
   - A regression to `sm:px-5` would pass the "pads vertically only" test.
   - This is minor next to findings 1–3.

### Acceptance

- *With the option set, a nested card at 430px starts at the page-title x*: **not met**. There is no option, and no 430px measurement or demo is in the diff. The changelog's own figure (36px) differs from the target (16px).
- *Without the option, the body renders unchanged (`p-5`) in both layouts*: **not met**. Both layouts now render `py-5` by default.
- *Both body wrappers honour the option; no other layout keeps `p-5` when set*: **not met**, because there is no option. (Both wrappers are changed, but unconditionally.)
- *`npm test` fails on a version bump without a CHANGELOG entry, and passes after*: **cannot tell**. There is no CI status, and the diff only adds the entry. The guard script itself is untouched and unexercised here.
- What-to-do items not done:
  - Gallery demo `src/examples/detail-overview-demo.tsx` is not updated.
  - Contract version in `docs/archetypes/detail-overview.md` is not bumped; only MANIFEST.json is bumped.
  - The test does not cover option-set vs default.

### Follow-ups

None.

### Notes

- `package-lock.json` jumps from `0.7.0` to `0.11.6`. The lockfile had drifted well behind `package.json`; syncing it is harmless, but it is unrelated churn.
- The author's ADR-0004 / RULES rule 10 reasoning (a backwards-compatible default is "inherited," so a `flush` prop is disallowed) answers the ticket's Open question directly. It should go to the ticket owner to resolve option A vs a contract-level change before a fresh attempt. If the owner agrees with the no-prop design, the ticket must be rewritten upstream, with breaking/consumer impact restated, and then this diff becomes roughly the right implementation.
- The weakened selectors in the existing empty-body tests (`.p-5` → `.py-5`) are equivalent under the new classes and fine as written.
