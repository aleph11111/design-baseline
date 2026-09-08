"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

const SM_COLS_MAP: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export type StatTileRowProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * StatTileRow — the unified KPI / aggregate strip.
 *
 * Shared layout primitive: detail-overview's `stats` slot and the
 * analytics-dashboard KPI row both use it. ONE bounded surface with internal
 * hairline dividers — not a row of separate mini-cards (separate tiles read as
 * stray buttons). Flat surface (no shadow): the strip sits between shadowed
 * sections, part of the page's graded hierarchy.
 *
 * The cell count is derived from the number of `<StatTile>` children (clamped to
 * 2–4), never passed in: a call-site column count is an appearance the contract
 * does not derive (RULES.md hard rule 12 / ADR-0004), and "must match the child
 * count" is a rule the component can enforce itself. The strip always collapses
 * to a single stacked column on narrow viewports (horizontal hairlines), then
 * expands at `sm` (vertical hairlines).
 *
 * Hand-rolled tile cells are forbidden — use `<StatTile>`. Fixed column
 * counts without the responsive collapse are forbidden — use this primitive.
 */
export function StatTileRow({
  children,
  className,
}: StatTileRowProps): React.ReactElement {
  const columns = Math.min(
    Math.max(React.Children.count(children), 2),
    4,
  ) as 2 | 3 | 4;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground",
        "grid grid-cols-1 divide-y divide-border sm:divide-x sm:divide-y-0",
        SM_COLS_MAP[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}

StatTileRow.displayName = "StatTileRow";
