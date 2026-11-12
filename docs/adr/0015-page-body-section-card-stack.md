# 0015 — The page body is one frame or a stack of raised section cards

- **Status:** Accepted
- **Date:** 2026-11-12
- **Supersedes:** [ADR 0008](0008-one-page-frame-slot-owned-placement.md) §3 ("one raised surface per page") and [ADR 0007](0007-fleet-house-look-fixed-vs-brand-roles.md) §3 (raised surfaces separate from the canvas by tone alone). Everything else in both ADRs stands: ADR 0008 §1 (one `PageHeader` title), §2 (slot-owned placement), §4 (rules live in code); ADR 0007 §1–§2 and §4–§8.
- **Respects:** [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (appearance is fixed in the component, never chosen per call site).
- **Design:** `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md`

## Context

Every baseline page is one pale frame with hairline-divided strips inside it. The operator calls the result flat: sections do not read as separate things. ADR 0008 already named the risk, that dashboard widgets and kanban lanes separate too weakly inside one frame. The mockup ("Order detail V2") gives each section its own bordered, rounded card on the grey canvas, with a gap between cards. The operator chose this on 2026-11-12 from a three-way decision visual: today, border everywhere, or border on stack cards only.

## Decision

1. **One raised-surface chrome.** Every raised surface directly on the canvas carries the raised fill, a hairline border (the `--border` role) and the fixed radius. This holds for the single page frame, every stack card, section cards and stat-tile rows. There is one chrome, not a stack-only variant. A single-frame page reads as a one-card stack.
2. **No card-in-card still holds.** A raised surface nested in another raised surface drops both its border and its fill. The nested-surface context stays the one signal.
3. **Two body shapes.** A page body is either **one frame** (today's shape, now bordered) or a **stack** of raised cards on the canvas with a fixed vertical gap.
4. **The shape is chosen per archetype, inside the shell, never at a call site** (ADR 0004). A shell picks its shape once and does not expose the choice as a prop. The adherence lint fails a call-site opt-in.
5. **The toolbar band sits on the first card.** In a stack, the toolbar band (scoping controls, count, view options, and the mobile filter sheet) renders as the top ruled band of the first card. A shell whose first child is not a card renders a band-only first card.
6. **Toned callout.** A stack card may carry a status tone fill when the archetype contract keys the tone to state (RULES rule 10). The border stays the hairline.

### Rejected: border on stack cards only

Keeps today's borderless single frame and borders only the stack cards. Rejected: the visible difference on a single-frame page is small, and the split costs a mode switch in the chrome plus two surface rules in this ADR. One rule everywhere is cheaper to state, lint and review. Cost accepted: every screenshot baseline regenerates once.

## Consequences

- The code follows in the roadmap's primitive ticket (chrome, body mode, lint, tests, minor version bump). This ADR changes no code.
- `docs/STYLE.md`, `docs/PLACEMENT.md` and `docs/audit-signals.json` stop restating "one raised surface" and "tone, not border".
- Archetypes switch to a stack one slice at a time. Each `kind: page` archetype gets a slice ticket or a recorded keep-single-frame decision in its contract.
- Out of scope: shadows beyond the hairline, the tone percentages of the surface ladder, `PageHeader` and slot placement.

## Amendment to ADR 0007 §1 — the document column (2026-11-12)

The transaction-document slice had two width bounds: its own `max-w-4xl` inside `AppShell`'s stepped content column. It now has one. A document-column archetype shell (today only `transaction-document`) carries a derived marker on its root, the sibling of the full-bleed marker, and `AppShell`'s content column bounds itself to a `--db-document-max` token (896px) when it holds one. The wide-desk steps restyle only `--db-content-max`, so they never widen the document column. As with full-bleed, the marker is derived from the archetype (ADR 0004), never a call-site prop, and it is dropped when the shell is nested in another raised surface. The width has one owner: `AppShell`'s tokens.
