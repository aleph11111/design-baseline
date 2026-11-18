---
area: archetypes
opened: 2026-11-18
status: needs-enrichment
value: normal
depends_on: [list-with-detail-sheet-title-squeezed-by-actions, list-with-detail-sheet-actions-squeeze-title]
model: opus
model_reason: "public detailActions contract change (new accepted shape) and an overflow rule across archetypes; design is the deliverable"
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "auto-resolved fork (typed form vs. consumer-composed menu) awaits operator confirmation"
  graded_at: 2026-11-18T00:00:00Z
---

# List-with-detail detail sheet header caps inline detailActions with overflow

## Context

The list-with-detail overlay header has no rule for how many `detailActions` sit inline. `ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`, detailPanel ~l.364-386) takes `detailActions` as a `ReactNode` and renders any number of buttons beside the `detailTitle`; `docs/archetypes/list-with-detail.md` (Layer 11, l.352) only says they "sit beside the title". Its siblings do cap: `docs/archetypes/crud-dialog.md:330`, `form-page.md:371` and `transaction-document.md:129` put secondary actions behind a `⋯` overflow menu beside the primary group, and the page header already enforces "≤ 1 primary + 2 secondary, the rest in `⋯`" through the typed `HeaderActions` model (`src/components/layout/HeaderActions.tsx`, shipped by [[page-header-action-hierarchy-overflow-menu]]). After the wrap fix in [[list-with-detail-sheet-title-squeezed-by-actions]] the title gets its own row and the actions wrap below, but 4+ actions still give a header of several button rows. Refero prior art (2026-11-18: Patreon member drawer `refero.design/pages/0bd71254-4b8b-4a10-84a1-42a49b58a31a`, Fourthwall member `refero.design/pages/f6d75583-f01b-4d62-a5f1-9f544a738d7b`, Fibery contact `refero.design/pages/c868628b-c4d1-4caf-8b57-8add54187bc4`) shows real side-sheet headers keep one primary action plus a `⋯` More menu. This is separate from the class-only wrap fix: it widens the `detailActions` contract, so it needs an ADR-0004 check (items carry behaviour, not appearance).

## What to do

- [ ] Decide and document the sheet-header rule as the same "primary inline, rest in overflow" hierarchy as the page header: at most 1 primary and `MAX_SECONDARY_ACTIONS` secondary inline, destructive only in the `⋯` menu (per `HeaderActions`, ADR-0004: behaviour, not appearance).
- [ ] Accept the existing `HeaderActions` typed form on `detailActions` (`ReactNode | HeaderActions`, discriminated by `isHeaderActions`) and render it through the shared `HeaderActions` renderer and `RowActionsMenu`, instead of a second dropdown or a new prop shape. Keep the `ReactNode` form working unchanged, marked as the unbounded legacy form.
- [ ] Keep the `pr-8` Sheet-close clearance working with the `⋯` trigger as the last element of the actions row.
- [ ] Update `docs/archetypes/list-with-detail.md` (Layer 11 / overlay header, l.352 and the `detailActions` data-prop note at l.119) with the rule, and `docs/PLACEMENT.md` where the header action hierarchy is stated.
- [ ] Add a `ListWithDetailShell` render test (typed actions: 1 primary, 4 secondary, 1 destructive) and a gallery demo case; check in real Chrome at the device triad that the header is at most two rows and nothing overflows.
- [ ] Bump `package.json` and add the `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` fails `npm test` on a bump without one); consumer note: existing `ReactNode` callers are unaffected.

## Acceptance

- A `ListWithDetailShell` given typed `detailActions` with 1 primary, 4 secondary and 1 destructive action renders at most 1 primary and 2 secondary buttons inline and the rest behind one `⋯` trigger; the destructive one renders only inside the menu.
- A typed `detailActions` with 1 primary and 1 secondary renders with no `⋯` trigger.
- The `ReactNode` form of `detailActions` still renders unchanged, no other call site of the header actions slot changes behaviour, and every `detailActions` consumer in the gallery keeps compiling.
- `npm test` fails on a version bump without a `CHANGELOG.md` entry, and passes after the entry is added.

## Related

- [[list-with-detail-sheet-title-squeezed-by-actions]] — must ship first: the wrap fix rewrites the same header bar and `detailActions` wrapper, so building the overflow first means building it twice
- [[list-with-detail-sheet-actions-squeeze-title]] — must ship first: same open title/actions squeeze fix in the same header
- [[page-header-action-hierarchy-overflow-menu]] — precedent: the typed `HeaderActions` model and `RowActionsMenu` reuse
- [[shell-header-actions-prop-naming]] — earlier decision on shell header action prop naming
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality: the new shape must carry behaviour only
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — the overlay sizes to its content

## Open question

Fork auto-resolved to the recommended default (not asked, headless): reuse the existing typed `HeaderActions` form on `detailActions` (union with `ReactNode`). Alternatives: (b) leave `detailActions` a `ReactNode` and only document the rule, with consumers composing their own `RowActionsMenu` (no enforcement, the option rejected for the page header); (c) a new sheet-specific prop shape (rejected: a second typed model for the same hierarchy). Confirm before `/feat`.
