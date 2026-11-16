---
area: archetypes
opened: '2026-11-16'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-11-16T19:00:00.000Z'
value: normal
model: opus
model_reason: "layout and API-shape decisions on a shipped archetype (side-effect presentation, progress dates vs one-home-per-fact, fact groups) plus a viewport-fold acceptance"
---

# Transaction-document next-step panel and header compact layout

## Context

`TransactionDocumentShell` (`src/components/archetypes/transaction-document/TransactionDocumentShell.tsx`) renders its header and `nextStep` panel far taller than the operator mockup V2 (brickshop artifact PS7Y9AhSeLtpZyEHRaEzEw, artboard `project/V2.dc.html`, the same mockup as the archived [[transaction-document-mockup-fidelity]]). Seen 2026-11-16 in brickshop `origin/main` c7c4c65c2 rendering a shipped/no-scan sales order: at the 1133x739 `laptop14Window` (`src/testing/devices.mjs`) no ledger shows above the fold. Shell-side gaps:

1. `nextStep.primary` renders on its own row under the description; V2 puts title + description left and primary + secondary actions right in one flex-wrap row, stacking on narrow widths.
2. `nextStep.sideEffects` ("Running alongside") lists one row per effect inside the panel, ~170px for 4 effects; V2 has none in the panel.
3. The header uses a ~36px h1; V2 uses a 24px h1. (V2 also has its breadcrumb directly under the app header. That gap is the AppShell `<main>` page inset, not the shell: see the operator decisions below.)
4. `identity.progress` steps carry no dates; V2 shows "Placed 30.10.".
5. `facts` render one block per label; V2 groups them into 3 blocks (Ship to / Payment / Documents) with sublines.

## Operator decisions 2026-11-16 (made during implementation, PR #771)

- **Fold measured shell-relative.** In the gallery the shell h1 starts at y=247: gallery header, archetype bar, demo switcher, then the AppShell `md:p-12` inset. The stress-test sales-order ledger alone (lock note, 3 detailed lines, Total) is ~400px. So "Total above 739px" cannot hold in the gallery. The PR reports the Total-row bottom minus the shell h1 top at `laptop14Window`. No automated fold assertion is added.
- **Top inset out of scope.** The space above the back link is AppShell `<main>`'s canonical page inset (`src/components/layout/AppShell.tsx:81`, `p-4 md:p-12 xl:p-14`). A shell-side negative margin was tried and rejected because it overlaps anything rendered above the shell. A separate follow-up ticket covers the inset.
- **Versions follow [RULES](/docs/RULES.md) rule 8.** The contract counts rule changes only (1.3 → 1.4). MANIFEST counts any shipped change (1.4 → 1.5). The package goes to v0.47.0.

## What to do

- [ ] Put `nextStep.primary` and the secondary actions in one right-aligned flex-wrap row beside the title and description, stacking below them on narrow widths (V2 layout, gap 1).
- [ ] Present `nextStep.sideEffects` as one compact inline line (icon plus label per effect, wrapping) instead of one row per effect, keeping `done` / `pending` / `failed` state and `link` visible (gap 2; operator decision 2026-11-16: inline line, not a "N done" fold).
- [ ] Tighten the header: set the h1 to 24px through a shell-only `PageFrame`/`PageHeader` `titleStep="document"` (not in `PageShellFrameProps`, like `body`), and tighten the header-to-body gap (gap 3; the top inset stays AppShell's, per the operator decisions above).
- [ ] Add an optional date to `TransactionProgressStep` and render it after the label, omitted when absent so existing documents render unchanged (gap 4; operator decision 2026-11-16: optional `date` per step, amending the `identity.progress` JSDoc and the contract, which today say a step names the stage only).
- [ ] Add a fact-group shape to `TransactionFact` so the shell renders grouped blocks with sublines (gap 5; operator decision 2026-11-16: optional group `{ title, items, subline }` alongside the flat fact, non-breaking), keeping the ungrouped shape working.
- [ ] Update `src/examples/transaction-document-demo.tsx` so the sales-order demo carries a 4-side-effect next step, update `docs/archetypes/transaction-document.md` by role (no Tailwind classes, per `docs/RULES.md` rules 2–3), bump the contract version (rule 8: 1.4) and `docs/archetypes/MANIFEST.json` (1.5), and refresh baselines with `npm run screenshots:update`.

## Acceptance

- The PR reports the shell-relative fold at `laptop14Window` 1133x739 for the 4-side-effect sales-order demo: the Total-row bottom minus the shell h1 top, measured with the compact header and next step in place.
- The transaction-document h1 renders at 24px; every other archetype's `PageHeader` h1 is unchanged (no other screenshot baseline changes).
- `npm run check:viewports` passes for all three transaction-document demos at the device triad and the width sweep.
- A document that passes no progress dates, no fact groups and no side effects renders unchanged (no empty date, no empty group heading).
- On a narrow viewport the primary and secondary actions stack below the title and description with no horizontal overflow.
- The contract documents the new progress date and fact group by role, and the MANIFEST version matches the released tag.

## Related

- [[transaction-document-mockup-fidelity]] — archived; shipped the tone, progress line and section cards this ticket tightens
- [[transaction-document-ledger-row-media]] — open sibling touching the same demo, contract and MANIFEST version; no ordering needed, but the second to land rebases the version bump
- [[transaction-document-ledger-row-lock-add-remove]] — archived sibling in the same shell
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — Transaction documents are their own `kind: page` archetype
