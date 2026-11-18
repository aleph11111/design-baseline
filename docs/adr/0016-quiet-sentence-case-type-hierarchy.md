# 0016 — Retire the uppercase overline for a quiet sentence-case hierarchy

- **Status:** Accepted
- **Date:** 2026-11-18
- **Amends:** [ADR 0007](0007-fleet-house-look-fixed-vs-brand-roles.md) §2 (the "overlines stay tight" clause). The 30px page-title display step and the 34px stat step stand unchanged.
- **Respects:** [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (each rung is fixed in its owner, never a prop) and [ADR 0015](0015-page-body-section-card-stack.md) (the raised section cards whose title band this removes).

## Context

The section heading was the ledger overline: 10.5px, semibold, uppercase, +0.09em tracking, muted. It sat visually behind the cards it introduced, so a heading like "Summary" did not guide the reader, and a Refero audit found the overline repeated on every container reads as templated. Table column headers ran a 9.5px variant of the same look, and every titled `SectionCard` drew its title in a ruled `border-b` band. The operator chose option 3 of the visual-audit decision (item C, 2026-11-18): a quiet sentence-case hierarchy.

## Decision

1. **One quiet scale, top to bottom.** Page title 30px (unchanged, ADR 0007 §2) > section heading **15px semibold, sentence case, foreground** > card title **13px semibold, sentence case, foreground** > body 13px. Labels sit beside the scale at **12px medium, muted, sentence case**.
2. **No shared label renders uppercase or letter-spaced.** The overline role is retired. Its owners keep their names so consumer imports resolve: `OVERLINE_CLASS` and `COL_HEADER_CLASS` (`layout/overline.ts`) now carry the 12px label rung; `SECTION_HEADING_CLASS` and `CARD_TITLE_CLASS` join them.
3. **Placement picks the heading rung, never a prop.** `SectionHeading` renders the 15px section heading bare and the 13px card title inside a `SectionCard`. The card sets the rung through an internal context; there is no size prop.
4. **The card title lives inside the card's padding.** `SectionCard` drops the ruled `border-b` title band. The title and the body read as one block, separated by whitespace only. The dialog/drawer header bar (`SurfaceHeaderBar`) and the matrix-grid inspector header drop their `border-b` too. Toolbar bands (ADR 0015 §5) and hairline row dividers stay.
5. **Labels.** Sidebar group labels, `StatTile` labels, kanban column titles, nav-group labels, the typed `<Overline>`, and table column headers render on the 12px label rung. The sidebar group chevron shows on hover and keyboard focus only.
6. **The warning callout is border-only.** `Alert`'s `warning` variant drops its tinted fill: the status colour sits on the border and the icon, the text is foreground. The other status variants are unchanged.

## Consequences

- Every consumer's screenshots change: section headings, card titles, stat tiles, table headers, sidebar labels, dialog headers. Consumers re-baseline on the bump; no API changes.
- A consumer that hand-typed the old overline string still renders uppercase until it composes the owner; the `overline-typed` audit signals keep catching those strings.
- The density ticket (visual-audit item B) builds on this scale and must run after it, never in parallel: both edit `docs/STYLE.md` and every screenshot baseline.
