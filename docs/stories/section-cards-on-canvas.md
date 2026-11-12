---
persona: operator
status: draft
origin: operator
opened: '2026-11-12'
roadmaps:
  - page-body-section-card-stack
---

# As an operator, I open an order detail page and see each section as its own bordered card on the grey canvas

## Situation
I open a sales order in a consumer app (the `transaction-document` archetype; gallery demo `transaction-document`). Today the next step, ledger and facts are hairline-divided strips inside one pale frame, and the page reads flat.

## Outcome
- The next step, the ledger and the facts each render as a separate card with a hairline border and rounded corners, with a visible gap of canvas between cards.
- The next-step card keeps its tone fill (warning, danger, success) as a toned callout.
- A page that keeps a single frame (a list or table page) shows the same hairline border on its frame, so both page shapes read as the same material.
- A card nested inside another card shows no second border and no second fill.

## Not
- Does not change the page title, header actions or slot placement (ADR-0008 §1, §2, §4 stay).
- Does not move every archetype to a stack; each archetype decides stack or single frame in its own slice.

## Open questions

## Related
- [[page-body-section-card-stack]] — the roadmap
- [[section-card-stack-choice-lives-in-shell]] — sibling story
- Operator mockup "Order detail V2": https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw
