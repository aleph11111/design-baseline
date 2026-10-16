---
area: archetypes
opened: 2026-10-10
status: needs-enrichment
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-10-10T00:00:00Z
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
