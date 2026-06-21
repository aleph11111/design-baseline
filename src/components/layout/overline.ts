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
  "text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground";
