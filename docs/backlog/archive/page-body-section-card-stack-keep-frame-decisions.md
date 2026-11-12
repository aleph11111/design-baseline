---
area: archetypes
opened: '2026-11-12'
status: done
value: normal
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: sonnet
model_reason: 'docs-only: record a decided keep-frame line in eleven archetype contracts'
roadmap: page-body-section-card-stack
---

# Record the keep-single-frame decision in the eleven archetype contracts that do not stack

## Context

Phase 4 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 4 — Remaining archetypes". The roadmap's acceptance requires every `kind: page` archetype to carry either a stack slice ticket or a recorded keep-frame decision.

The orchestrator decided (2026-11-12) that eleven archetypes keep the single bordered frame. Their bodies are one bounded object, not a list of titled sections:
- **Full-bleed, table-first** (ADR-0007 §1 set): `list-with-detail`, `matrix-grid`, `statement-with-filters`, `calendar`.
- **One table:** `settings-table`.
- **One inbox list, with a split reading pane at `@3xl`:** `feed-inbox`.
- **Tab host whose child pages choose their own archetype:** `tabbed-settings`.
- **One step at a time:** `import-wizard`.
- **One read-through document:** `report`.
- **A paper page:** `print-statement`.
- **One workbench:** `structure-builder`.

Their shells already render the bordered frame since Phase 1 ([[page-body-section-card-stack-primitive]]). This ticket only writes the decision down.

## What to do

- [ ] In each of the eleven contracts under `docs/archetypes/<slug>.md`, add one role-only sentence. It says the page body is one frame (ADR-0015) and gives the reason from the list above. No Tailwind classes or primitive names (RULES rules 2–3).
- [ ] Add a short "Body shape per archetype" table to `docs/adr/0015-page-body-section-card-stack.md` (or an appendix it links), listing every `kind: page` archetype with `stack` or `frame`:
  - the stacks so far: transaction-document, analytics-dashboard, kanban-board;
  - the stacks in this phase: form-page, grouped-list, settings-sections, detail-overview;
  - the eleven frames above.
- [ ] Bump no MANIFEST versions, since no shipped behaviour changes.

## Acceptance

- Every `kind: page` slug in `docs/archetypes/MANIFEST.json` appears exactly once in the ADR-0015 body-shape table, as `stack` or `frame`.
- Each of the eleven keep-frame contracts names its one-frame body and the reason, and `git diff` shows no change under `src/`.
- `npm test` still passes.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p4)
- [[page-body-section-card-stack-form-page]] — stack slice in this phase
- [[page-body-section-card-stack-grouped-list]] — stack slice in this phase
- [[page-body-section-card-stack-settings-sections]] — stack slice in this phase
- [[page-body-section-card-stack-detail-overview]] — stack slice in this phase
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §1 full-bleed set
