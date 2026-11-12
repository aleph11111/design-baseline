---
area: archetypes
opened: '2026-11-12'
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
  graded_at: '2026-11-12T00:00:00Z'
value: high
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: sonnet
model_reason: decision already made in the spec; the work is writing the ADR and rewording three docs
roadmap: page-body-section-card-stack
---

# Write ADR-0015 for the section-card stack and supersede ADR-0008 §3 and ADR-0007 §3

## Context

Phase 1, step 1 of roadmap [[page-body-section-card-stack]]. The design is settled in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "## The rule (ADR-0015)". Today, `docs/adr/0008-one-page-frame-slot-owned-placement.md` §3 says the frame is the page's only raised surface. `docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md` §3 says raised surfaces separate from the canvas by tone alone, with no border. The operator chose (2026-11-12, decision visual https://claude.ai/artifact/EKZpZFYep8Uc9TaTX3RAZd) a hairline border on **every** canvas-raised surface, the single frame included, and a body that may be a stack of raised cards. This ticket writes the rule down; the code follows in [[page-body-section-card-stack-primitive]].

## What to do

- [ ] Write `docs/adr/0015-page-body-section-card-stack.md` (status Accepted) with the six rules from the spec section "## The rule (ADR-0015)":
  - one raised-surface chrome (fill, hairline `border`, `rounded-lg`) on every canvas-raised surface;
  - a nested surface drops both border and fill;
  - the body shape is `frame` or `stack`;
  - the shape is chosen per archetype in the shell, never per call site (per [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md));
  - the toolbar band sits on the first card;
  - a stack card may carry a toned callout keyed by the contract.

  Record the rejected alternative (border on stack cards only) and why.
- [ ] Supersede only ADR-0008 §3 and ADR-0007 §3: add "§3 superseded by ADR-0015" to both status lines, and leave ADR-0008 §1, §2, §4 and ADR-0007's other sections untouched.
- [ ] Add the ADR-0015 row to `docs/adr/INDEX.md`, and mark the 0007 and 0008 rows as partially superseded.
- [ ] Reword `docs/STYLE.md`, `docs/PLACEMENT.md` and `docs/audit-signals.json` wherever they restate "one raised surface per page", "tone not border" or "no border on the canvas". Docs carry roles only (RULES rules 2–3): no Tailwind classes or primitive names in contract bodies.

## Acceptance

- `docs/adr/INDEX.md` lists ADR-0015 as Accepted, and the ADR-0007 and ADR-0008 status lines name ADR-0015 as superseding §3.
- `git diff` shows ADR-0008 §1, §2 and §4 unchanged.
- `grep -rn "only raised surface\|tone, not a border\|no border" docs/STYLE.md docs/PLACEMENT.md docs/audit-signals.json` returns no line that contradicts ADR-0015.
- `npm test` still passes; nothing in `src/` changes in this ticket.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p1)
- [[page-body-section-card-stack-primitive]] — follows this ticket and declares the dependency on its side
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §3 superseded
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — §3 superseded
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance is fixed in the component
