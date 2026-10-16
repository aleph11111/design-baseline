---
area: archetypes
opened: '2026-10-10'
status: ready
value: normal
model: sonnet
model_reason: "cause established and design decided (owner-confirmed option D); scoped two-class change plus test, contract line and version bumps"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-16T01:20:00Z'
---

# DetailOverviewShell body doubles the horizontal inset of its sections

## Context

`DetailOverviewShell` (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx`) wraps its `stats`/`content` body in a fixed `p-5` container (and the vertical layout's body wrapper in `border-t border-border/60 p-5 space-y-4`). Every child that body holds already owns a `px-5` gutter: a `DetailSection` nested in the page frame drops its fill (`SectionCard`, `RaisedSurfaceContext` — no card-in-card, ADR-0007 §3) but keeps its `px-5`, `StatTile` pads `px-5 py-4`, and `KeyValueRow` pads `px-5`. So the body's horizontal `p-5` is 20px of empty space in front of a gutter that already exists. Measured in hk-sales-agent Firmenakte at 430px (verify run, 2026-10-10): the section starts at x=40 and its row labels at x=76, while the page title and back link sit at x=16. The same double inset shows on desktop: in the vertical layout the summary band carries no pad, so main-column labels sit 20px in from summary labels; in the rail layout main-column labels sit 20px further into their column than rail labels do.

The hk-sales-agent PR 38 review rejected local overrides and accepts only a shared fix, so the change ships in the donor.

**Decision (owner-confirmed 2026-10-16, resolves the former Open question):** no new prop. Option A (a `flush` boolean defaulting to `p-5`) is ruled out by [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) / `docs/RULES.md` rule 10: a backwards-compatible default is inherited, not derived, and the contract carries no rule that would let two engineers derive `flush` from the entity. A boolean look flag would also trip the hard-failing `archetype-appearance-boolean-prop` lint. The contract already states the intent ("Shell owns the inset", one inset owner), so the shell itself drops the horizontal pad from both body wrappers for every consumer. Options B (a prop on `DetailSection`) and C (a new context provider) were rejected in the same pass: the padding does not come from the section, and the section already supplies the gutter.

**Consumer impact (deliberate, must be stated in the CHANGELOG):** every consumer's main-column content moves 20px outward on the version bump, in both layouts. There is no API change (no prop added or removed, no type change), so it is not API-breaking, but it is a visible layout change and the CHANGELOG entry must say so in its **Consumer** and **Breaking** lines rather than "none required" / a bare "no". Sections, stat tiles and key-value rows inside the body keep their own `px-5`, so nothing touches the frame edge except section rules and title-bar hairlines, which already run full-bleed in the rail.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. (Here: both body wrappers in `DetailOverviewShell`, the rail branch's `main` and the vertical branch's body. `DetailSection`, `SectionCard`, `StatTileRow` stay untouched — they own the gutter.)
- [ ] In both body wrappers replace `p-5` with `py-5` (keep `border-t border-border/60`, `lg:border-t-0` on the rail one, and `space-y-4`); add one comment there saying the children own the horizontal gutter.
- [ ] State the rule in the contract `docs/archetypes/detail-overview.md`, role-only (no Tailwind classes, no primitive names — CLAUDE.md "contract is role-only"): the main body adds no horizontal inset of its own; its sections, figures and rows own the one gutter, so main-column content aligns with the rail / summary content. Put it next to the "Shell owns the inset" conformance item, and add a version note in the contract's version blockquote. This is a contract-rule change, so bump the contract `version` 4.1 → 4.2 (RULES rule 8).
- [ ] Update `DetailOverviewShell.test.tsx`: a case per layout (`rail`, `vertical`) asserting the body wrapper carries `py-5` and **no** horizontal padding class of any form — `p-*`, `px-*`, `pl-*`, `pr-*`, `ps-*`, `pe-*`, including responsive/state-prefixed variants such as `sm:px-5`. Retarget the existing empty-body tests' `.p-5` selectors to `.py-5`.
- [ ] Measure the gallery demo `src/examples/detail-overview-demo.tsx` in real Chrome (playwright-core + local Chrome, the `scripts/check-*.mjs` pattern) at 430px and 1280px in both layouts, and paste the numbers into the PR body. No demo change is needed: the demo already shows a section nested in the body in both layouts and the nested vertical stat strip.
- [ ] Bump the `detail-overview` entry in `docs/archetypes/MANIFEST.json` (4.3 → 4.4), bump `package.json` with `npm version <next> --no-git-tag-version` (it also syncs `package-lock.json`'s own version field — expected, not churn), and add a `CHANGELOG.md` entry with **Fixed**, **Consumer** ("main-column content moves 20px outward; remove any local override that countered the double inset, e.g. hk-sales-agent Firmenakte") and **Breaking** ("no API change; visible layout shift — see Consumer").

## Acceptance

- At 430px, a section nested in the body starts at the frame's left edge (x=16, the same x as the page title and back link), and its labels sit at x=36, the same x as the rail / summary labels. They no longer sit 20px further in (x=56 in the gallery; x=76 in hk-sales-agent Firmenakte, which adds the row's own gutter).
- At 1280px, main-column labels sit the same distance inside their column as rail labels do inside the rail, in the `rail` layout. In the `vertical` layout, main-column labels align with summary-band labels.
- No `DetailOverviewShell` body wrapper carries horizontal padding in either layout; every body wrapper renders `py-5`, and the test fails on any `p-`/`px-`/`pl-`/`pr-`/`ps-`/`pe-` class including prefixed variants such as `sm:px-5`.
- `DetailOverviewShell` gains no new prop; its prop type is unchanged.
- The contract `version` is 4.2, the MANIFEST entry is 4.4, and the CHANGELOG entry's Consumer line names the 20px outward shift.
- `npm test`, `npx tsc --noEmit` and `node scripts/lint-design.mjs` all pass.

## Related

- [[detail-overview-empty-body-strip-renders]] — last change to the same body wrapper
- [[archetype-rollout-detail-overview-collapsible-rail-body-has-no-vertical-padding]] — prior padding fix in this shell's rail
- [[settings-table-body-flush-default-outside-tab]] — precedent for a `flush` body option, and why a default that bleeds is a trap
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality; rules out a per-call-site padding prop
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — frame owns placement
- [docs/RULES.md](/docs/RULES.md) — rule 8 (version fields) and rule 10 (appearance locality)
- PR #578 (closed, WRONG-APPROACH) — implemented this decision, but before it was recorded here; its diff (branch tip `719a571`, kept under `refs/rejected/` once reaped) is the starting point, minus the in-branch ticket rewrite

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
