---
area: archetypes
opened: 2026-10-10
status: ready
value: normal
---

# DetailOverviewShell body doubles the horizontal inset

## Context

`DetailOverviewShell` (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx`) padded its main-body wrapper with a fixed `p-5` in both layouts (the rail branch's `main` and the vertical branch's body). Every child the body holds already owns a `px-5` gutter: a `DetailSection` nested in the page frame drops its fill (`SectionCard`, no card-in-card) but keeps `px-5`, and stat tiles and key-value rows pad themselves. So the body's horizontal pad was 20px of empty space in front of a gutter that already existed. Measured in hk-sales-agent Firmenakte at 430px (2026-10-10): row labels at x=76 against the page title at x=16. It also showed on desktop: in the vertical layout the summary band has no pad, so main-column labels sat 20px in from summary labels.

The hk-sales-agent PR 38 review accepts only a shared fix. The first draft proposed a `flush` prop defaulting to `p-5`; ADR-0004 / RULES rule 10 rule that out (a backwards-compatible default is inherited, not derived, and the contract has no keying rule for it). The single inset is already the contract's rule ("Shell owns the inset"), so the fix belongs in the shell with no prop.

## What to do

- [x] Fix at the shared point: both body wrappers in `DetailOverviewShell` (rail `main`, vertical body) pad vertically only (`py-5`).
- [x] Add a `DetailOverviewShell.test.tsx` case asserting the body wrapper carries `py-5` and no horizontal padding class, in both `rail` and `vertical` layouts.
- [x] Measure the gallery demo in real Chrome at 430px and 1280px: main-column labels align with rail / summary labels; the nested vertical stat strip aligns with its title.
- [x] Bump the `detail-overview` MANIFEST version (contract unchanged, RULES rule 8), bump `package.json`, add a `CHANGELOG.md` entry (consumer: none required; breaking: no).

## Acceptance

- At 430px, a section nested in the body starts at the frame edge and its labels sit at the same x as the rail / summary labels (36px), not 40px further in.
- No `DetailOverviewShell` body wrapper carries horizontal padding, in either layout.
- No new prop on `DetailOverviewShell`.
- `npm test` passes, including the CHANGELOG guard for the version bump.

## Related

- [[detail-overview-empty-body-strip-renders]] — last change to the same body wrapper
- [[archetype-rollout-detail-overview-collapsible-rail-body-has-no-vertical-padding]] — prior padding fix in this shell's rail
- [[settings-table-body-flush-default-outside-tab]] — precedent for a `flush` body option
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality, rules out a per-call-site padding prop
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — frame owns placement
