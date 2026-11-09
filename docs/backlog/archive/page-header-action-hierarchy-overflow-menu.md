---
area: layout
opened: 2026-11-07
status: done
value: normal
depends_on: [heading-row-actions-squeeze-title-container-query]
model: opus
model_reason: "design is the deliverable: a public PageFrame action-hierarchy API and overflow rule across archetypes"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T23:00:00Z
---

# PageHeader action hierarchy with overflow menu

## Context

`PageHeader` in `src/components/layout/PageHeader.tsx` takes a flat `actions?: React.ReactNode`, so a page with many actions (brickshop-manager `/orders/:id`, SO-2026-00053, 9 header actions) renders all of them inline, including destructive ones such as Delete Order. Container-query layout ([[heading-row-actions-squeeze-title-container-query]]) stops the title collapsing but does not say which actions deserve prominence. Some archetypes (form-page, crud-dialog) forbid header actions entirely (see the `actions` JSDoc), and the baseline already has a row-actions menu to reuse ([[row-actions-trigger-label-override]]).

The cap is not new: `docs/PLACEMENT.md:71` and the `PageFrame` `actions` JSDoc (`src/components/layout/PageFrame.tsx:54-57`) already state "≤ 1 primary + 2 secondary; the rest in `⋯`". Nothing enforces it. This ticket makes that existing rule mechanical — it does not invent a different cap.

The shared point is `PageFrame`, not `PageHeader`: pages pass `actions` to `PageFrame`, which renders them on three paths — `PageHeader` (default), `NestedPageHeading` (nested), and a plain `flex justify-end gap-2 px-4 pb-3` row on the host-titled path (`PageFrame.tsx:232`). A fix in `PageHeader` alone leaves two paths unguarded.

Operator decision (2026-11-07, option a): typed action items rendered by the baseline. Rejected: (b) a consumer-filled `<PageHeaderMenu>` slot — no enforcement, the same unenforced convention as today; (c) auto-collapse by measured overflow — no fixed cap, untestable in jsdom, and width is already handled by the container-query ticket.

## What to do

- [ ] Before editing, grep every caller of `actions` on `PageFrame` / `PageHeader` / `NestedPageHeading` and every archetype shell that forwards it; fix at the shared point (`PageFrame`), not only the call site this report names.
- [ ] Add the typed model on `PageFrame`'s `actions` prop: `actions?: { primary?: HeaderAction; secondary?: HeaderAction[]; menu?: HeaderActionItem[] }`, with `HeaderAction = { label, onSelect? | href?, icon?, disabled?, destructive? }` and `HeaderActionItem` = `HeaderAction` | separator | heading (mirroring `RowActionItem`). Per ADR-0004 the items carry behaviour, not appearance.
- [ ] Render it through one shared renderer used by all three `PageFrame` paths: the type allows one `primary`; `secondary` items beyond 2 spill into the menu; any item with `destructive: true` renders only in the menu, wherever it was passed. `PageHeader` / `NestedPageHeading` / `HeadingRow` keep accepting rendered nodes.
- [ ] Reuse `RowActionsMenu` (`src/components/archetypes/shared/RowActionsMenu.tsx`) for the `⋯` menu instead of a second dropdown: add an optional `href` on `RowAction` plus a router-link render hook (same pattern as `PageHeader`'s `renderBackLink`), let it run without a row (e.g. `Row = void`), and add a header-specific trigger label key to `src/lib/labels.tsx` (en + de, next to `rowActions`).
- [ ] Keep the flat `ReactNode` form working for one minor, marked `@deprecated` in the JSDoc; file a follow-up ticket (via `/ticket`) to remove it in a later breaking bump. Consumers: controlling-app, hk-crm, brickshop-manager.
- [ ] Document the API in `docs/PLACEMENT.md` (page-frame slot table, line 71) and the `PageFrame` / `PageHeader` JSDoc; state that "destructive only in the menu" applies to page-header actions only — form/dialog footers keep `PLACEMENT.md:132` (Delete at the left edge, behind a confirm).
- [ ] Add `PageFrame.test.tsx` cases covering all three paths and a `RowActionsMenu.test.tsx` case for an `href` item.
- [ ] Add a gallery demo (9 actions incl. one destructive), bump `package.json` (currently 0.29.2) and add the `CHANGELOG.md` entry.

## Acceptance

- A `PageFrame` given 9 typed actions renders at most 1 primary and 2 secondary buttons inline and the remainder behind one `⋯` menu trigger.
- A destructive action renders only inside the menu, never inline, on every one of the three `PageFrame` paths (default, nested, host-titled); no other call site renders one inline.
- A header with 1 primary and ≤ 2 non-destructive secondary actions renders unchanged — no menu trigger.
- An `href` menu item renders as a link through the router-link hook; an `onSelect` item fires its handler.
- The deprecated flat `ReactNode` form still renders as before.

## Related

- [[heading-row-actions-squeeze-title-container-query]] — must ship first: it rewrites the same `HeadingRow` actions wrapper this API renders into (PR #695 open)
- [[row-actions-trigger-label-override]] — the existing overflow-menu primitive
- [[pageframe-toolbar-overflow-collapse-rule]] — precedent for a cap-and-collapse rule
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — no per-call-site appearance props
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — slot-owned placement
