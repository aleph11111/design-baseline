---
area: refactor
opened: '2026-08-25'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-25T10:49:12.320Z'
model: sonnet
model_reason: >-
  behaviour-preserving extraction of one shared title-row block between two layout primitives with
  existing tests on both; the fixed-scale rule stays in the heading component, so no design
  decisions remain
---

# Have NestedPageHeading compose PageHeader's title row instead of re-copying its markup

## Context

Severity: **medium** (DRY). `PageHeader` (`src/components/layout/PageHeader.tsx:66`) declares itself "the single source of truth for page-level header layout and typography… the markup and type scale live here so iterating the header is one edit, baseline-wide." Three archetype headers honour that — `FormPageHeader.tsx:71`, `SettingsPageHeader.tsx:61` and `DetailOverviewHeader.tsx:69` are all thin wrappers that render `<PageHeader …>`. The second rung of the heading ladder does not: `NestedPageHeading` (`src/components/layout/NestedPageHeading.tsx:84`) re-implements the title row line for line.

Every wrapper class in `NestedPageHeading`'s render is copied from `PageHeader`'s:

- outer `space-y-1.5` (`PageHeader.tsx:106` / `NestedPageHeading.tsx:92`)
- `flex items-start justify-between gap-4`
- `min-w-0 space-y-1`
- title/badges row `flex flex-wrap items-center gap-x-3 gap-y-2`
- badges wrapper `flex flex-wrap items-center gap-1.5`
- subtitle `<p className="text-xs text-muted-foreground">`
- actions wrapper `flex shrink-0 items-center gap-3`

The only real differences are the heading element and its class (`<h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground">` vs `<h2 className={NESTED_HEADING_CLASS}>`) and `PageHeader`'s two extra affordances (`icon`, `backHref`/`renderBackLink`) that the nested rung deliberately omits. `NestedPageHeading`'s own JSDoc even says its "Prop shape matches the `PageHeader` page-title family (title / subtitle / badges / actions)… so the three ladder rungs read as one family" — the props are aligned and the markup is forked, which is the worst of both: a change to badge spacing or subtitle scale has to be made twice and will look like one family until it doesn't.

This matters more than a normal copy because the heading ladder is what the archetype-convergence roadmap is trying to close. `NESTED_HEADING_CLASS` exists so no call site can re-pick the nested weight (hard rule 12); it does not stop the *layout* around it from drifting from the h1's, which is the same class of fleet inconsistency one rung up.

## What to do

- [ ] Extract the shared title row into one internal element in `src/components/layout/` (e.g. a `HeadingRow` taking `heading: React.ReactNode`, `subtitle`, `badges`, `actions`, `className`) holding the wrapper/badges/subtitle/actions markup exactly once.
- [ ] Rebuild `PageHeader` on it, keeping its `icon` and back-link affordances above/inside the row as it renders them today.
- [ ] Rebuild `NestedPageHeading` on it, passing `<h2 className={NESTED_HEADING_CLASS}>` as the heading — `NESTED_HEADING_CLASS` and the no-appearance-prop rule stay exactly where they are.
- [ ] Keep both public prop contracts byte-identical; no consumer of `PageHeader`, `NestedPageHeading`, `FormPageHeader`, `SettingsPageHeader` or `DetailOverviewHeader` needs an edit.
- [ ] Extend the existing `PageHeader.test.tsx` and `NestedPageHeading.test.tsx` with a paired assertion that both render badges, subtitle and actions through the same row structure, and that the heading element stays `h1` / `h2` respectively.

## Acceptance

- `grep -rn "flex flex-wrap items-center gap-x-3 gap-y-2" src/components/layout` returns one hit — the shared row, not two headings.
- Changing the badges gap or the subtitle scale is one edit, and both the `PageHeader` and `NestedPageHeading` gallery demos in `gallery/layout-demos.tsx` reflect it.
- `NestedPageHeading` still renders an `<h2>` carrying `NESTED_HEADING_CLASS` and still exposes no size/weight/level/variant prop.
- `npx tsc --noEmit` and `npm test` pass with no change to either component's public props.

## Related

- [archetype-convergence-nested-heading-primitive.md](../archive/archetype-convergence-nested-heading-primitive.md) — the ticket that shipped `NestedPageHeading`; this is the layout duplication it left behind.
- [surface-header-compose-not-copy.md](../archive/surface-header-compose-not-copy.md) — the same "canonical primitive, copied markup" finding for the surface header bar.
- [test-gap-page-header-no-tests.md](../archive/test-gap-page-header-no-tests.md) — added the `PageHeader` coverage this extraction extends.
- [docs/adr/0004-appearance-locality-derived-vs-inherited.md](../../adr/0004-appearance-locality-derived-vs-inherited.md) — the rule that fixes the heading scale in the component; the layout around it deserves the same single owner.
