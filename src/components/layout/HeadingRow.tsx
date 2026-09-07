import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Shared row classes
// ---------------------------------------------------------------------------

/**
 * The layout classes every page-title row of the heading ladder shares:
 * outer wrapper, the two-column row, the title/badges row, the badges wrapper,
 * the subtitle scale, and the actions wrapper. They live in exactly one place
 * (this file) so `PageHeader` (the h1 rung) and `NestedPageHeading` (the h2
 * rung) read as one family and header layout iterates as one edit,
 * baseline-wide — the same single-owner treatment ADR-0004 gives the type
 * scale. See `HeadingRow` below.
 */
export const HEADING_ROW_CLASSES = {
  /** Outer wrapper. */
  outer: "space-y-1.5",
  /** Two-column row: title block left, actions right. */
  row: "flex items-start justify-between gap-4",
  /** Title block. */
  titleBlock: "min-w-0 space-y-1",
  /** Title/badges row. */
  titleBadges: "flex flex-wrap items-center gap-x-3 gap-y-2",
  /** Badges wrapper (read-only state, after the heading). */
  badges: "flex flex-wrap items-center gap-1.5",
  /** Subtitle scale. */
  subtitle: "text-xs text-muted-foreground",
  /** Right-aligned actions wrapper. */
  actions: "flex shrink-0 items-center gap-3",
} as const;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type HeadingRowProps = {
  /**
   * The heading element itself. The rungs keep owning their element, its
   * level, and its scale: `PageHeader` passes an `<h1>` and
   * `NestedPageHeading` passes an `<h2 className={NESTED_HEADING_CLASS}>`.
   * Never a heading's *treatment* — the scale is the rung's.
   */
  heading: React.ReactNode;
  /**
   * Optional element rendered above the title row, inside the outer
   * `space-y-1.5` wrapper (`PageHeader`'s back link; `NestedPageHeading`
   * passes nothing).
   */
  beforeRow?: React.ReactNode;
  /**
   * Optional element rendered before the heading inside the title/badges row
   * (`PageHeader` uses it for its decorative icon; `NestedPageHeading`
   * passes nothing).
   */
  beforeHeading?: React.ReactNode;
  /** Optional secondary line below the title. */
  subtitle?: React.ReactNode;
  /** Optional status badges, rendered inline after the heading (same row). */
  badges?: React.ReactNode;
  /** Optional right-aligned actions row. */
  actions?: React.ReactNode;
  /** Optional class for the outer wrapper. */
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * HeadingRow — the shared title-row layout for the page-title ladder.
 *
 * The single place the page-title family's layout markup lives.
 * `PageHeader` and `NestedPageHeading` compose this element and differ only
 * in the `heading` they pass (and, for the h1 rung, the `beforeHeading`
 * icon) — so the layout's shape iterates as one edit while every rung keeps
 * owning its own element and scale.
 *
 * Internal primitive of `src/components/layout/` — it is deliberately NOT
 * re-exported from the barrel. The ladder rung components are the public
 * contracts, and the rung-level JSDoc (including `NestedPageHeading`'s
 * no-appearance-prop rule) is where a consumer's props are defined.
 *
 * Layout:
 *   [beforeRow (optional)]
 *   [beforeHeading (optional)] [heading] [badges (optional)]  [actions (optional)]
 *   [subtitle (optional)]
 */
export function HeadingRow({
  heading,
  beforeRow,
  beforeHeading,
  subtitle,
  badges,
  actions,
  className,
}: HeadingRowProps): React.ReactElement {
  return (
    <div className={cn(HEADING_ROW_CLASSES.outer, className)}>
      {beforeRow && <div>{beforeRow}</div>}
      <div className={HEADING_ROW_CLASSES.row}>
        <div className={HEADING_ROW_CLASSES.titleBlock}>
          <div className={HEADING_ROW_CLASSES.titleBadges}>
            {beforeHeading}
            {heading}
            {badges && <div className={HEADING_ROW_CLASSES.badges}>{badges}</div>}
          </div>
          {subtitle && <p className={HEADING_ROW_CLASSES.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={HEADING_ROW_CLASSES.actions}>{actions}</div>}
      </div>
    </div>
  );
}

HeadingRow.displayName = "HeadingRow";
