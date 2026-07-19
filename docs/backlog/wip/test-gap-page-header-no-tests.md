---
area: test-gap
opened: 2026-07-19
status: ready
---

# PageHeader's back-link resolution has no test coverage

## Context

`src/components/layout/PageHeader.tsx` (133 lines) changed in 4 commits over the last 90 days and has no test file, despite being documented as "the single source of truth for page-level header layout and typography" that archetype-specific headers (`FormPageHeader`, `SettingsPageHeader`, `DetailOverviewHeader`) wrap.

The untested branch worth pinning down is the back-link resolution:
```
const backLink = backHref
  ? renderBackLink ? renderBackLink(backHref, backLabel) : <a href={backHref}>...</a>
  : null;
```
This three-way branch (no back link / default `<a>` / consumer-supplied `renderBackLink`) exists specifically so a framework router's `<Link>` can be wired in without the baseline depending on it — a regression that drops `renderBackLink` silently reintroduces a full page reload for router-based consumers. `icon`/`badges`/`actions`/`subtitle` conditional rendering is also untested.

## What to do

- [ ] Add `src/components/layout/PageHeader.test.tsx` covering: no `backHref` renders no back-link element.
- [ ] Test `backHref` without `renderBackLink` renders the default `<a href>` with `backLabel` (default "Back").
- [ ] Test `backHref` with `renderBackLink` calls it with `(backHref, backLabel)` and renders its return value instead of the default `<a>`.
- [ ] Test `icon`, `badges`, and `actions` render only when provided.

## Acceptance

- `PageHeader.test.tsx` exists and passes under `npm test`.
- A test fails if `renderBackLink` stops being invoked or the default `<a>` fallback is dropped.

## Related

- None — no existing ticket references this file.
