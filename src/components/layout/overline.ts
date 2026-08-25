/**
 * The baseline's canonical overline class — a quiet, uppercase, tracked, muted
 * label. This is the single source of the section/label signature: SectionHeading,
 * StatTile, BoardColumn, and the sidebar/nav group labels all compose it so the
 * uppercase-label look never drifts (e.g. tracking was previously split between
 * `0.08em` here and `tracking-wider`/`0.05em` in the nav).
 *
 * Compose with `cn(OVERLINE_CLASS, "…extra…")` — never re-type the string.
 */
export const OVERLINE_CLASS =
  "text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground";

/**
 * The smaller table/ruler-column-header rung of the overline scale (9.5px) —
 * the `text-` size is the only thing that differs from `OVERLINE_CLASS`,
 * weight/tracking/case/color stay shared so the two rungs can't drift apart.
 * Owners of the figure-table and calendar column signatures (shared
 * `FigureTable`, `CalendarShell`) compose it; never re-type the string.
 */
export const COL_HEADER_CLASS =
  "text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground";
