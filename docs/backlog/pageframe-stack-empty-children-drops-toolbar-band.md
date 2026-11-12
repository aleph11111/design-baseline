---
area: archetypes
opened: '2026-11-12'
status: ready
value: normal
model: sonnet
model_reason: "cause established at one shared function (stackChildren in PageFrame); one guard plus a test"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# PageFrame stack body drops the toolbar band when it has no renderable children

## Context

In `src/components/layout/PageFrame.tsx`, `stackChildren()` hands the toolbar band to the first `React.Children.toArray(children)` entry through `ToolbarLeadContext` (consumed by `SectionCard`). With zero renderable children (all `null`/`false`, e.g. every group hidden by an active search) there is no first child, so the band — search input, filters, mobile filter sheet — is not rendered and the user cannot clear the search that emptied the page. Found by the review gate on grouped-list PR #754, which patched only `GroupedListShell`. Every stacked shell (transaction-document, analytics-dashboard, kanban-board, form-page, grouped-list, settings-sections, detail-overview) routes through this one function, so the fix belongs here (ADR-0015).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `stackChildren()` (`src/components/layout/PageFrame.tsx`), when `band` is non-null and `React.Children.toArray(children)` is empty, render a band-only `SurfaceFrame` card (`<SurfaceFrame toolbar={band} />`) instead of nothing.
- [ ] Add a test in `src/components/layout/PageFrame.test.tsx` for the empty-children case.
- [ ] Once shipped, drop any per-shell empty-children guard (e.g. the one #754 added to `GroupedListShell`) that the shared fix makes redundant.

## Acceptance

- `<PageFrame body="stack" toolbar={<input/>}>{null}{false}</PageFrame>` renders the toolbar input.
- No other stacked shell needs its own empty-children guard: all stacked shells rendering `body="stack"` with all children hidden still show their toolbar band.
- With a non-empty stack, the band still renders exactly once, in the first child card, unchanged.
- With no toolbar and no children, `body="stack"` still renders no empty card.

## Related

- [[page-body-section-card-stack]] — parent roadmap
- [[page-body-section-card-stack-grouped-list]] — shell whose PR #754 found this
- [[page-body-section-card-stack-primitive]] — introduced `stackChildren` / `body="stack"`
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — page body as one frame or a stack of raised section cards
