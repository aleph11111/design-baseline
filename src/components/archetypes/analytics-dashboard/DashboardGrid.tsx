import * as React from "react";
import { cn } from "@/lib/utils";

const COLS_MAP: Record<2 | 3 | 4, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export type DashboardGridProps = {
  /**
   * Column count at the `lg` breakpoint and up. Always collapses to a single
   * column on narrow viewports, then 2 columns at `sm`, then `columns` at `lg`.
   * Defaults to 3.
   */
  columns?: 2 | 3 | 4;
  /** `<DashboardWidget>` children. */
  children: React.ReactNode;
  className?: string;
};

/**
 * DashboardGrid — the responsive widget grid for the analytics-dashboard (G)
 * archetype. Hosts `<DashboardWidget>` cards; each widget may span more than one
 * column via its `span` prop. This is the only chrome the archetype adds beyond
 * reusing `<StatTileRow>` (KPIs) and `<SectionCard>` (widget surface).
 */
export function DashboardGrid({
  columns = 3,
  children,
  className,
}: DashboardGridProps): React.ReactElement {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        COLS_MAP[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}

DashboardGrid.displayName = "DashboardGrid";
