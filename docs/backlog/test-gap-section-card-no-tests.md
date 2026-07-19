---
area: test-gap
opened: 2026-07-19
status: ready
---

# SectionCard has no tests despite being the shared section-boundary primitive

## Context

`src/components/layout/SectionCard.tsx` (130 lines) changed in 5 commits over the last 90 days and has zero test coverage. It is explicitly documented as "the single source of the 'titled section' look" and is composed by `DetailSection` (detail-overview), grouped-list groups, and form-page field groups — meaning a regression here fans out across multiple archetypes at once.

The component has real branching logic worth pinning down:
- `chrome` toggles between two entirely different render trees (chromeless `<section className="py-4">` vs. the bordered/rounded card), each with different bar/body wrapper markup.
- `hasBar = header !== undefined || title !== undefined` gates whether the title bar renders at all, and `header` wins over `title` when both are given.
- `tone` ("default" | "muted") picks the surface background class, but only in the `chrome=true` branch — the chromeless branch ignores `tone` entirely, which is easy to miss when reading the code and easy to break silently.
- `flush` changes whether content gets the `px-5 py-4` wrapper.

## What to do

- [ ] Add `src/components/layout/SectionCard.test.tsx` covering: `chrome=true` (default) renders the bordered/rounded card with a title bar bar when `title` or `header` is set, none when neither is.
- [ ] Test `chrome=false` renders the flat `<section className="py-4">` with the overline-only bar layout, and confirm `tone` has no visible effect in this branch (documents the current behavior so a future change is deliberate, not accidental).
- [ ] Test `header` prop wins over `title` when both are provided.
- [ ] Test `flush` toggles the content wrapper padding.

## Acceptance

- `SectionCard.test.tsx` exists and passes under `npm test`.
- A test fails if the `chrome` branch selection breaks or if `header`/`title` precedence flips.

## Related

- `src/components/archetypes/detail-overview/DetailSection.tsx` — thin wrapper over `SectionCard`, passes `chrome={!unified}` through.
- [[test-gap-detail-overview-shell-no-tests]] — the primary consumer of `SectionCard`'s `chrome` toggle via `UnifiedSurfaceContext`.
