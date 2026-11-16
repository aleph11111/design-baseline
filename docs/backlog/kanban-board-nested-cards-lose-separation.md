---
area: archetypes
opened: '2026-11-12'
status: ready
value: normal
model: sonnet
model_reason: "design decided by operator 2026-11-16 (BoardColumn context reset); one-line provider + ADR sentence + test + demo"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-16T00:00:00Z'
---

# Nested kanban-board cards lose separation inside a raised surface

## Context

Found in review of PR #744 (`feat/page-body-section-card-stack-kanban-board`, v0.41.0, merged as `1ab291b`). `src/components/archetypes/kanban-board/BoardCard.tsx:20` reads `useRaisedChrome()` (`src/components/layout/surface.ts:16`), which returns no border and no fill when `RaisedSurfaceContext` is true. A `BoardShell` nested under a parent raised surface (e.g. a `SectionCard`) takes `PageFrame`'s `nested` branch, which does not reset the context, so its cards render borderless and fill-less inside the sunken lanes and become indistinguishable from the lane. The same happens on `PageFrame`'s `hostTitled` branch (`src/components/layout/PageFrame.tsx:188`, a board in a titled dialog/drawer), which sets the context to true. The kanban contract's Layer 1 allows "a tab within a larger surface", so the nested case is legitimate. Top-level cards carry `border bg-surface-raised` (the `useRaisedChrome` chrome).

Repro: render `<SectionCard><BoardShell title="x"><BoardColumn title="a"><BoardCard>c</BoardCard></BoardColumn></BoardShell></SectionCard>` — the card has no visible edge against the lane.

Decision (operator, 2026-11-16): a sunken region starts a fresh surface. `BoardColumn` (`src/components/archetypes/kanban-board/BoardColumn.tsx`) wraps its cards in `<RaisedSurfaceContext.Provider value={false}>`; a raised object on a sunken lane is not card-in-card. `BoardCard` stays unchanged and keeps reading `useRaisedChrome`, so the hook remains the one signal (ADR-0015 rule 2). Verified 2026-11-16 on `origin/main`: the other `useRaisedChrome` consumers (`SurfaceFrame`, `SectionCard`, `StatTileRow`) are surfaces that correctly flatten when nested; `BoardCard` is the only item-level consumer.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `BoardColumn.tsx`, wrap the lane's card stack in `<RaisedSurfaceContext.Provider value={false}>` and update its doc comment (the lane now resets the context instead of "provides no `RaisedSurfaceContext`").
- [ ] Amend ADR-0015 rule 2 with one sentence: a sunken region (e.g. a board lane) starts a fresh surface, so a raised object on it keeps its chrome — that is not card-in-card.
- [ ] Add a nested-render test for the repro above (`SectionCard > BoardShell > BoardColumn > BoardCard` — card has `border` and `bg-surface-raised`), plus a top-level case asserting the same classes.
- [ ] Add a gallery demo of the nested board (board inside a `SectionCard`), per the living-demos convention.

## Acceptance

- A `BoardCard` rendered inside `SectionCard > BoardShell` renders `border bg-surface-raised`, visibly separated from its sunken lane.
- A `BoardCard` inside a `hostTitled` `BoardShell` renders the same chrome.
- Top-level `BoardShell` cards are unchanged from the v0.41.0 rendering.
- No other `useRaisedChrome` consumer changes rendering: `SurfaceFrame`, `SectionCard` and `StatTileRow` still drop border and fill when nested.

## Related

- [[page-body-section-card-stack-kanban-board]] — the ticket (PR #744) that introduced the regression
- [[page-body-section-card-stack]] — parent roadmap
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — rule 2, no card-in-card
