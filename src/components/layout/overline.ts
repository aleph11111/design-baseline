/**
 * The baseline's quiet type rungs below the page title (ADR-0016, which
 * retired the uppercase overline). Every rung is sentence case — no shared
 * label renders uppercase or letter-spaced. Top to bottom:
 *
 *   page title 30px (`PageHeader`, ADR-0007 §2)
 *   > section heading 15px semibold foreground   — `SECTION_HEADING_CLASS`
 *   > card title 13px semibold foreground        — `CARD_TITLE_CLASS`
 *   > body 13px
 *   label 12px medium muted                      — `OVERLINE_CLASS` / `COL_HEADER_CLASS`
 *
 * Compose with `cn(X_CLASS, "…extra…")` — never re-type the strings.
 */

/** A bare section heading (`SectionHeading` outside a card): 15px semibold, foreground. */
export const SECTION_HEADING_CLASS = "text-[15px] font-semibold leading-snug text-foreground";

/** A card's title, inside the card's padding with no ruled band (`SectionCard`): 13px semibold, foreground. */
export const CARD_TITLE_CLASS = "text-[13px] font-semibold leading-snug text-foreground";

/**
 * The label rung — sidebar/nav group labels, `StatTile` labels, kanban column
 * titles, the typed `<Overline>`: 12px medium muted sentence case. The name is
 * kept from the retired uppercase overline so consumer imports keep resolving;
 * the look is ADR-0016's.
 */
export const OVERLINE_CLASS = "text-xs font-medium text-muted-foreground";

/**
 * Table / ruler column headers (shared `FigureTable`, `CalendarShell`,
 * statement tables). Since ADR-0016 the same 12px medium muted sentence-case
 * rung as `OVERLINE_CLASS` — kept as its own name so column-header owners keep
 * one import and the two can diverge again in one edit.
 */
export const COL_HEADER_CLASS = OVERLINE_CLASS;
