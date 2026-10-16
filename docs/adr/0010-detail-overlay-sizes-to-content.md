# 0010 — The list-with-detail overlay sizes to its content; a detail that cannot fit gets its own route

- **Status:** Accepted
- **Date:** 2026-10-15
- **Amends:** list-with-detail (A) Layer 11, contract v4.2 / MANIFEST 4.5; `docs/CHOOSING-A-SURFACE.md` v2.1 (the read/detail spectrum).
- **Respects:** [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) — the width is derived from the content, not a per-call-site prop.

## Context

Since v3.0 the A detail always opens as an overlay sheet, and that sheet had one fixed width: 448px from the small breakpoint up. A detail that shows data in a table scrolled sideways inside it. gebo-stock-kiosk's Artikelsuche shows one storage-bin table per company; its last two columns sat off-screen until the consumer squeezed every cell's padding (gebo#66). The closed shell API offered no other answer: no width prop, by design.

Operator ruling (2026-10-15): the data decides the sheet's width. Scrolling sideways inside the sheet, or nested tables the user has to scroll to read, is a defect. A detail that cannot fit belongs on its own `detail-overview` route. When the row already shows the entity's summary and the detail is a child collection or workspace, the row may go straight to that route.

`CHOOSING-A-SURFACE.md` still described the pre-v3.0 pane "beside its list", and called row → route with no pane in between "the drift".

## Decision

1. **Content-sized, clamped.** From the small breakpoint up, the overlay is `min-content` wide, clamped between a **floor of 28rem** (448px, the old fixed width) and a **ceiling of `100vw − 4rem`**. Below the small breakpoint it stays full-screen.
2. **Min-content, with table rows held on one line.** Inside the detail, from the small breakpoint up, table header and data cells do not wrap. On mobile they wrap as before, because the full-screen sheet cannot widen and nowrap would only force a sideways scroll. So everything that can wrap (prose, label/value pairs, badges) wraps at the floor, and a summary detail opens exactly as before. Only content that cannot wrap, which in practice means tables, widens the overlay. `max-content`, the ticket's first sketch, was rejected: one long description paragraph would push every summary detail to the ceiling.
3. **The title never widens the overlay.** The header's title is size-contained (`contain: inline-size`), so a long title truncates at whatever width the content chose.
4. **No sideways scroll; escalate instead.** If the content still overflows at the ceiling, the detail belongs on its own route. In development builds the shell warns once per opened detail when the body, or any scroll container in it (a nested table's wrapper), is wider than it can show. While the detail is open, the shell re-measures on every content change and every resize, so a detail that loads its table after the first frame still warns. The warning names `detailTitle` and points at the escalation rule. Not checked below the small breakpoint, where a wide table scrolling inside its own container is accepted.
5. **No new prop.** Rule 10 of `docs/RULES.md` (ADR 0004) holds: two consumers passing the same detail get the same width.
6. **Row → route directly is sanctioned** when the row already shows the summary and the detail is a child collection or workspace. The drift is a row that navigates away with no workspace behind it, or an overlay that crams a workspace into a sheet.

### Why these numbers

- **Floor 28rem.** This is today's width, so every existing summary detail is unchanged, pixel for pixel.
- **Ceiling `100vw − 4rem`.** A 4rem strip of the dimmed list stays visible at the leading edge. It keeps the overlay reading as "over the list", not as a page swap, and it leaves a backdrop strip to click to dismiss. With a sidebar app shell at 1280px, this leaves 1216px for the detail. That is wider than any detail that still belongs in an overlay. Content wider than that is a workspace.

## Consequences

- A detail with a wide table now opens wider with no consumer change. In the gallery, a 7-column episode table opens at 723px at a 1280px viewport, with no sideways scroll.
- Consumers that squeezed cell padding to fit 448px can drop the squeeze. A detail that triggers the warning moves to a `detail-overview` route. gebo-stock-kiosk is moving its item detail to a route separately.
- Table cells in a detail no longer wrap. ~~A table with a free-text column reaches the ceiling and warns. That is the intended signal: free text in a detail table means the detail is a workspace.~~ Superseded by the 2026-10-15 amendment below: a free-text column is marked and wraps; only an unmarked one reaches the ceiling and warns.
- The guard is development-only. It reads `process.env.NODE_ENV` the way `utils/logger.ts` does, but inside a `try`, because Vite replaces only the `process.env.NODE_ENV` text and leaves `process` undefined in the browser.
- The real-browser check is `npm run check:detail-sheet`. It needs local Chrome and is not run in CI, like `check:desk-width`. It builds a development gallery so the warning is live.

## Amendment (2026-10-15) — free-text table cells wrap

**Context.** Decision 2 held every table cell on one line, so a detail table with one free-text column (a description, a long key/value value) pushed the overlay to the ceiling and warned. That made an ordinary line-item table — codes, quantities, a bin, a status, and one description — read as a workspace, and the list behind it disappeared.

**Decision (operator, option B of the mockup).** Free-text cells wrap. The donor exports one way to mark them: `FreeTextCell` from `design-baseline/archetypes/list-with-detail`. A marked cell wraps inside a readable band — a floor of about 24ch, so min-content sizing does not collapse it to one word, and a cap of about 48ch. Every unmarked cell keeps the one-line rule, so codes, numbers, dates and status badges never wrap. The overlay therefore grows only by its single-line columns plus one readable text column and stays an overlay with the list visible beside it. The no-sideways-scroll rule stands; for free text it is now met by wrapping, not by width. The marker names the kind of content, not a width: it takes no class or style, so rule 10 (ADR 0004) still holds. The band applies from the small breakpoint up; below it the sheet is full-screen and every cell wraps, as before.

**Option A rejected** (keep one-line cells; a free-text column means the detail is a route). It sent ordinary line-item details — the most common detail table — off to a route just because one column holds a sentence, and it turned the overflow warning into noise consumers learn to ignore.

**Consequences.** The overflow warning, when it fires on a detail that contains a table, now says to mark free-text columns with `FreeTextCell` before escalating to a route. In the gallery a six-column request-lines table with a marked description opens below the ceiling at 1280px without warning; the same table unmarked still reaches the ceiling and warns. `npm run check:detail-sheet` covers both, and the existing cases keep their widths.
