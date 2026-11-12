# Page body as a stack of raised section cards — design spec

- **Roadmap:** [`page-body-section-card-stack`](../../backlog/page-body-section-card-stack.md)
- **Stories:** [`section-cards-on-canvas`](../../stories/section-cards-on-canvas.md), [`section-card-stack-choice-lives-in-shell`](../../stories/section-card-stack-choice-lives-in-shell.md)
- **Date:** 2026-11-12
- **Decision visual:** https://claude.ai/artifact/EKZpZFYep8Uc9TaTX3RAZd (today vs. border everywhere vs. border on stack cards only; the operator chose border everywhere)
- **Mockup:** https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw ("Order detail V2")

## Problem

Every baseline page is one pale `SurfaceFrame` with hairline-divided strips (ADR-0008 §3: "the frame is the page's only raised surface"), and raised surfaces separate from the canvas by tone alone (ADR-0007 §3). The operator calls the result flat. The mockup separates each section into its own bordered, rounded card on the grey canvas with a gap between cards. ADR-0008 already named the risk: dashboard widgets and kanban lanes inside one frame separate too weakly.

`transaction-document` v1.2 (package 0.38.0) shipped with sections still as strips inside the one frame, plus a local `max-w-4xl` column bound next to `AppShell`'s 1180px column. It is the first consumer.

## The rule (ADR-0015)

A new ADR, next number after 0014, **supersedes ADR-0008 §3 and ADR-0007 §3 only**. ADR-0008 §1 (one `PageHeader` title), §2 (slot-owned placement) and §4 (rules live in code) stay unchanged. ADR-0007 §1, §2 and §4–§8 stay.

1. **One raised-surface chrome.** Every raised surface directly on the canvas carries the `surface-raised` fill, a **hairline border** (`border`, the `--border` role) and the fixed radius (`rounded-lg`). This applies to the single page frame, every stack card, `SectionCard` and `StatTileRow`, everywhere. There is one chrome string, not a stack-only variant. A single-frame page reads as a one-card stack.
   *Chosen over "border only on stack cards" (operator, 2026-11-12, decision visual above): the visible difference is small, and one rule beats a mode switch in the chrome plus two surface rules in the ADR. Cost: Phase 1 regenerates every screenshot baseline.*
2. **No card-in-card still holds.** A raised surface nested in another raised surface drops both its border and its fill (today it drops the fill only, because it had no border). `RaisedSurfaceContext` stays the one signal.
3. **Two body shapes.** A page body is either **one frame** (today's shape, now bordered) or a **stack** of raised cards on the canvas with a fixed vertical gap (`gap-4`, `md:gap-5`).
4. **The shape is chosen per archetype, inside the shell, never at a call site** (ADR-0004). A shell picks its shape once. No shell exposes the choice as a prop, and the adherence lint fails a call-site opt-in.
5. **The toolbar band sits on the first card.** In a stack, the frame's toolbar band (scoping controls, count, View menu, and the mobile filter sheet below `md`) renders as the top ruled band of the first card. A shell whose first child is not a card (a widget grid) renders a band-only first card.
6. **Toned callout.** A stack card may carry a status tone fill (Td's next step) when the archetype contract keys the tone to state (RULES rule 10). The border stays the hairline.

The ADR updates the status lines of ADR-0007 and ADR-0008 ("§3 superseded by ADR-0015") and `docs/adr/INDEX.md`. `docs/STYLE.md`, `docs/PLACEMENT.md` and `docs/audit-signals.json` restate the one-raised-surface rule today, so they move in the same change.

## The primitive

All in `src/components/layout/`. There is no new component file.

- **Chrome** (`SurfaceFrame.tsx`, `SectionCard.tsx`, `StatTileRow.tsx`): un-nested surfaces add `border`. Nested surfaces drop the border and the fill. `SectionCard` `chrome={false}` and `tone="muted"` keep their meaning; muted gets the border when it is un-nested.
- **`PageFrame` body mode**: a new prop, `body?: "frame" | "stack"`, default `"frame"`.
  - `"frame"` behaves as today (one `SurfaceFrame`, now bordered).
  - `"stack"` renders the `PageHeader`, then a `flex flex-col gap-4 md:gap-5` container on the canvas (`RaisedSurfaceContext` = false), with each child a raised card.
  - `body` joins the `Omit` list in `PageShellFrameProps`, so no shell forwards it to page call sites.
- **Toolbar band on the first card**: `PageFrame` stack mode builds the band exactly as it does today (one code path, including the mobile filter sheet). It passes the band through a `ToolbarLeadContext` that wraps only the first child (`React.Children.toArray`). `SectionCard` and `SurfaceFrame` read the context and render the band as their first ruled band, above a `SectionCard` title bar. A shell that needs a band-only first card renders an empty `SurfaceFrame`. This touches the same band code as [[code-health-toolbar-band-extract-from-pageframe]], so the primitive ticket depends on that extraction: the stack mode then passes the extracted `ToolbarBand` component through the context, and there is one band owner.
- **Nested `PageFrame`** (a tabbed sub-route): it joins the parent's surface as today. `body="stack"` is ignored when nested.
- **Lint**: a new `_adherence.json` rule, `pageframe-body-call-site`, at severity `error`, matches a `body=` attribute on `<PageFrame` in any file outside `src/components/archetypes/**` and `src/components/layout/**`. Its message tells the author that the body shape belongs to the archetype shell (ADR-0015 rule 4). Consumers are already blocked from importing `PageFrame` directly by `lint-design`'s page-shape check, so the donor-side rule is enough.

Tests (vitest):
- An un-nested `SurfaceFrame` or `SectionCard` has `border`; a nested one has neither border nor fill.
- `PageFrame body="stack"` renders a gap container with no `SurfaceFrame` around it.
- The toolbar band renders inside the first child only.
- The mobile filter sheet still opens from the band in stack mode.
- The lint rule fires on a fixture call site and stays silent inside a shell.

## Phases

### Phase 1 — Rule and primitive

1. **ADR-0015 and the docs.** Write and accept the ADR as above, update the ADR-0007, ADR-0008 and INDEX status lines, and reword `STYLE.md`, `PLACEMENT.md` and `audit-signals.json`.
2. **Chrome, stack mode and lint** (depends on 1 and on [[code-health-toolbar-band-extract-from-pageframe]]). Add the border chrome, `PageFrame` `body="stack"`, `ToolbarLeadContext`, the adherence rule and the tests. Regenerate every screenshot baseline (the border changes every page), run `check:viewports`, and bump the package version (minor). No archetype switches to stack in this phase.

### Phase 2 — transaction-document slice

`TransactionDocumentShell` switches to `body="stack"`. The next step, ledger and facts each become a card (history becomes a card when present), and the toned next-step card is the callout. The phone sticky primary bar stays outside the cards.

**Column bound, ending in one bound:** delete Td's local `COLUMN = "max-w-4xl"`. Add a derived marker class `DOCUMENT_COLUMN_CLASS`, the sibling of `FULL_BLEED_CLASS` in `surface.ts`. `AppShell`'s content column reads it to set `--db-content-max` to a new `--db-document-max` token (896px, today's `max-w-4xl`), and the wide-desk steps do not apply to it. The width then has one owner (`AppShell` tokens) and one bound, and ADR-0015 records it as an ADR-0007 §1 amendment.

Contract, demo, tests, Td screenshot baselines and MANIFEST version all move in this slice.

### Phase 3 — Weak-separation slices

These are the archetypes ADR-0008 flagged: `analytics-dashboard` (widgets) and `kanban-board` (lanes). Each one decides how stack cards map onto its grid or lanes, and where the toolbar band goes (a band-only first card is expected for a dashboard). *Left open: authored after Phase 2 lands.*

### Phase 4 — Remaining archetypes

The other `kind: page` archetypes: list-with-detail, form-page, detail-overview, settings-table, grouped-list, matrix-grid, tabbed-settings, import-wizard, feed-inbox, report, statement-with-filters, calendar, settings-sections, print-statement, structure-builder. Each gets either a slice ticket that switches it to stack, or a recorded keep-single-frame decision in its contract. A table-first or full-bleed archetype likely keeps the frame. *Left open.*

### Phase 5 — Consumer migration

One migration ticket per consumer (controlling-app, hk-crm, brickshop-manager and any other package consumer), filed through the dashboard capture API, for pinning the new package version and re-checking page baselines. Consumers have no call-site work by construction (rule 4). *Left open.*

## Acceptance (roadmap level)

- ADR-0015 is Accepted. ADR-0008 §3 and ADR-0007 §3 are marked superseded by it, and ADR-0008 §1, §2 and §4 are unchanged.
- No page call site chooses the body shape; `pageframe-body-call-site` fails one.
- After Phase 2, the Td demo shows one bordered, rounded card per section with a gap between them, and the toolbar band (where present) sits on the first card.
- Every `kind: page` archetype has a slice ticket or a recorded keep-frame decision.
- `npm run screenshots` and `npm run check:viewports` pass at the device triad (desk27, laptop14, phone) for every changed archetype.

## Out of scope

- Shadows and elevation steps beyond the hairline.
- The tone percentages of `--db-surface-*` (ADR-0007 §3's tone ladder is unchanged).
- Any change to `PageHeader`, header actions or slot placement.
