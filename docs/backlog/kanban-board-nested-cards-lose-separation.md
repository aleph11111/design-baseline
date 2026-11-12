---
area: archetypes
opened: '2026-11-12'
status: needs-enrichment
value: normal
blocked_on_branch: feat/page-body-section-card-stack-kanban-board
model: opus
model_reason: "design is the deliverable — ADR-0015 rule 2 needs a decision on how nested board cards separate"
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "unresolved ## Open question caps the score at 4"
  graded_at: '2026-11-12T00:00:00Z'
---

# Nested kanban-board cards lose separation inside a raised surface

## Context

Found in review of PR #744 (`feat/page-body-section-card-stack-kanban-board`, v0.41.0, not yet on `origin/main`). `src/components/archetypes/kanban-board/BoardCard.tsx:22` reads `useRaisedChrome()`, which returns no border and no fill when `RaisedSurfaceContext` is true. A `BoardShell` nested under a parent raised surface (e.g. a `SectionCard`) ignores `body="stack"`, so its cards render borderless and fill-less inside the sunken lanes and become indistinguishable from the lane. The kanban contract's Layer 1 allows "a tab within a larger surface", so the nested case is legitimate. Before v0.41.0 cards kept `border bg-card`.

Repro: render `<SectionCard><BoardShell title="x"><BoardColumn title="a"><BoardCard>c</BoardCard></BoardColumn></BoardShell></SectionCard>` — the card has no visible edge against the lane.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Decide how a `BoardCard` separates from its lane when `RaisedSurfaceContext` is already true, as an ADR-0015 rule-2 decision (rule 2: a raised surface nested in another drops both border and fill), then implement it in `useRaisedChrome` / `BoardCard.tsx` and amend the ADR.
- [ ] Check every other `useRaisedChrome` consumer for the same nested-item case (items inside a lane/list that are raised objects themselves).
- [ ] Add a nested-render test (the repro above) and a gallery demo of the nested board (per the living-demos convention).

## Acceptance

- A `BoardCard` rendered inside `SectionCard > BoardShell` shows a visible border or fill distinguishing it from its sunken lane.
- Top-level `BoardShell` cards are unchanged from the v0.41.0 rendering.
- No other raised-item primitive that reads `useRaisedChrome` loses separation when nested in a raised surface.

## Related

- [[page-body-section-card-stack-kanban-board]] — the in-flight ticket (PR #744) that introduced the regression; this card cannot start until that branch merges
- [[page-body-section-card-stack]] — parent roadmap
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — rule 2, no card-in-card

## Open question

How do nested board cards separate? Auto-resolved to the recommended option; operator to confirm before `/feat`.

- **(Recommended) Narrow carve-out in ADR-0015 rule 2:** a board card is an item in a sunken lane, not a surface nested in a surface, so `BoardCard` keeps `border bg-card` regardless of `RaisedSurfaceContext`. Matches pre-v0.41.0 look; one ADR sentence.
- Nested `BoardShell` provides a fresh context (resets `RaisedSurfaceContext` to false for its lanes), so cards raise normally. Keeps rule 2 literal but adds a context reset.
- Nested lanes become the raised unit and cards go flat with a hairline divider. Changes board look when nested only; two visual variants.
