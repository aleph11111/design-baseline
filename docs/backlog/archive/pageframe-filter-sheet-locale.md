---
area: layout
opened: 2026-10-08
status: done
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: "2026-10-08T13:45:00Z"
---

# PageFrame filter-sheet labels fall back to English when a page omits filterLabels

## Context

`PageFrame`'s mobile filter sheet (the `data-filter-sheet` container in
`src/components/layout/PageFrame.tsx`, shipped by `[[pageframe-mobile-filter-sheet]]` v0.6.0)
labels its three sheet buttons from the `filterLabels` prop
(`{ filter?: string; done?: string; reset?: string }`), and the per-part fallbacks are
hard-coded English: `labels?.filter ?? "Filter"` and the `Reset` / `Done` siblings
(PageFrame.tsx:266-268). Every page that forgets `filterLabels` — the prop's own
JSDoc says "English defaults; override per page" — therefore shows English sheet buttons,
so German apps leak English there. Seen in the 2026-10-08 fleet visual pass: mistra
`/aufgaben`, hk-crm `/settings/synchronisation` and `/settings/import`. Same i18n line as
the shipped `layout-primitives-hardcoded-german` and `archetype-shell-locale-overrides`
rule — "English defaults overridable per call site" ([docs/PACKAGE.md](/docs/PACKAGE.md),
locale row) — this ticket adds the missing tier below per-call: the defaults become
locale-aware (an explicit LocaleProvider preset wins; absent one, `document.documentElement.lang`
picks `de` over `en`), so a page needs no per-call labels, and `filterLabels` stays the
per-call override. The `de` preset mechanism is being built independently by the open i18n
sibling `[[component-locale-provider]]`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `src/components/layout/PageFrame.tsx`, resolve the filter-sheet labels locale-aware: an explicit LocaleProvider preset (per `[[component-locale-provider]]`) wins; without one, read `document.documentElement.lang` and pick `de` (else `en`); replace the hard-coded `"Filter"` / `"Reset"` / `"Done"` fallbacks with the resolved `de`/`en` values (de: "Filtern" / "Zurücksetzen" / "Fertig" — matching the demo's existing `filterLabels` at `src/examples/list-with-detail-demo.tsx:443`), keeping English the no-locale default.
- [ ] Keep `filterLabels` as the per-call override: any per-part prop value wins over the locale resolution, and an English page renders exactly today's "Filter" / "Reset" / "Done".
- [ ] Extend `src/components/archetypes/locale-overrides.test.tsx` (the home of the per-seam override tests) with the PageFrame sheet cases: under a `de` preset (or `document.documentElement.lang = "de"`) the sheet renders "Filtern", "Zurücksetzen", "Fertig"; `lang = "en"` renders "Filter", "Reset", "Done"; passing `filterLabels` beats both.
- [ ] Bump `package.json` from `0.6.6` and add a matching `CHANGELOG.md` entry — `scripts/verify-package-version.mjs` (a `pretest`) fails `npm test` on a bump without a matching entry; re-verify the current trunk version at execution time (a parallel ticket may take 0.6.7).

## Acceptance

- A `PageFrame` with the page locale `de` (provider preset or `document.documentElement.lang`) renders its filter sheet's buttons as "Filtern", "Zurücksetzen", "Fertig" with no `filterLabels` passed; no other filter sheet on a `de` page shows the English "Filter" / "Reset" / "Done".
- With locale `en` (or absent) the sheet renders "Filter", "Reset", "Done" unchanged; an explicit `filterLabels` renders its per-part values over the locale resolution.
- The new `locale-overrides.test.tsx` PageFrame cases pass and `npm test` returns green; after the bump `npx tsc --noEmit` reports no errors.

## Related

- [[pageframe-mobile-filter-sheet]] — the shipped v0.6.0 ticket that introduced the sheet and its `filterLabels` seam
- [[component-locale-provider]] — the open i18n sibling building the shared de-English preset; its strings cover "Filtern" / "Zurücksetzen", so wire PageFrame through the same seam once it lands
- [[wizard-shell-back-busy-label-props-and-hardcoded-english-label-sweep]] — same i18n line (per-call override + English default), the class-level template here
- [docs/PACKAGE.md](/docs/PACKAGE.md) — the consumption-contract locale row this extends one tier down
- [[pageframe-filter-sheet-stacks-nested-fields]] — same `data-filter-sheet` container

## Decision

Provider-first (`BaselineLabelsProvider`, shipped v0.8.0 / #516), `document.documentElement.lang`
as the no-provider fallback, English last (orchestrator, 2026-10-09). #516 already routes the sheet
labels through `useLabels()` but left the no-provider case English and `labelsDe.filter` as "Filter",
so the ticket was not fully subsumed; shipped as v0.8.1 in `useLabels()` (all components, not just PageFrame).
