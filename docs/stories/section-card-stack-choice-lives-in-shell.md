---
persona: operator
status: draft
origin: operator
opened: '2026-11-12'
roadmaps:
  - page-body-section-card-stack
---

# As an operator, I build a page from an archetype shell and never choose between card stack and single frame myself

## Situation
I (or an agent in a consumer repo) scaffold a page with an archetype shell, e.g. `TransactionDocumentShell` or `SettingsTableShell`, and run `npm run lint:design`.

## Outcome
- The shell renders as a card stack or a single frame by itself; no shell prop exposes the choice.
- Passing the body-mode prop to `PageFrame` from a page file outside the archetype layer fails `lint:design` with an error that names the archetype shell as the fix.
- Two pages built from the same archetype always have the same body shape.

## Not
- Does not promise that consumers may call `PageFrame` directly; that stays banned (choosing-a-page-archetype).

## Open questions

## Related
- [[page-body-section-card-stack]] — the roadmap
- [[section-cards-on-canvas]] — sibling story
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance is fixed in the component, never per call site
