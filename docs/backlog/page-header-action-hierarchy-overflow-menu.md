---
area: layout
opened: 2026-11-07
status: needs-enrichment
value: normal
depends_on: [heading-row-actions-squeeze-title-container-query]
model: opus
model_reason: "design is the deliverable: a public PageHeader action-hierarchy API and overflow rule across archetypes"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved design fork under ## Open question — needs an interactive operator decision before /feat"
  graded_at: 2026-11-07T00:00:00Z
---

# PageHeader action hierarchy with overflow menu

## Context

`PageHeader` in `src/components/layout/PageHeader.tsx` takes a flat `actions?: React.ReactNode`, so a page with many actions (brickshop-manager `/orders/:id`, SO-2026-00053, 9 header actions) renders all of them inline, including destructive ones such as Delete Order. Container-query layout ([[heading-row-actions-squeeze-title-container-query]]) stops the title collapsing but does not say which actions deserve prominence. Operator direction: give `PageHeader` an action hierarchy — at most ~2 primary actions visible, the rest in an overflow menu, destructive actions only in the menu. Some archetypes (form-page, crud-dialog) forbid header actions entirely (see the `actions` JSDoc), and the baseline already has a row-actions menu to reuse ([[row-actions-trigger-label-override]]).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Define the public API on `PageHeader` (recommended: a typed `actions` model, `{ primary, menu }` items with a `destructive` flag, rendered through the existing row-actions menu primitive) and document it in `docs/PLACEMENT.md` and the `PageHeader` JSDoc.
- [ ] Add a `PageHeader.test.tsx` case asserting at most 2 primary actions render inline, the rest sit in the menu, and a destructive item never renders inline.
- [ ] Add a gallery demo, bump `package.json` and add the `CHANGELOG.md` entry.

## Acceptance

- A `PageHeader` given 9 actions shows at most 2 primary buttons inline and the remainder behind one overflow menu trigger.
- A destructive action is shown only inside the menu, never inline; no other call site renders one inline.
- A header with 2 or fewer non-destructive actions renders unchanged.

## Related

- [[heading-row-actions-squeeze-title-container-query]] — must ship first: it rewrites the same `HeadingRow` actions wrapper this API renders into
- [[row-actions-trigger-label-override]] — the existing overflow-menu primitive
- [[pageframe-toolbar-overflow-collapse-rule]] — precedent for a cap-and-collapse rule
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — no per-call-site appearance props
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — slot-owned placement

## Open question

How is the hierarchy expressed? (a) Typed items `{ primary, menu }` with a `destructive` flag, baseline renders the menu (Recommended — enforces the rule mechanically, matches ADR-0004); (b) keep `actions: ReactNode` and add a `<PageHeaderMenu>` slot consumers fill by hand (no enforcement); (c) auto-collapse by measured overflow (no fixed cap, harder to test). Also: is the flat `ReactNode` form kept for back-compat or removed in a breaking bump?
