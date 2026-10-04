"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";

export type DashboardGridProps = {
  /** `<DashboardWidget>` children. */
  children: React.ReactNode;
  className?: string;
};

/**
 * DashboardGrid — the responsive widget grid for the analytics-dashboard (G)
 * archetype, inside the `DashboardShell` frame. Widgets are hairline-divided
 * cells of the page's one surface, never cards (ADR-0008 §3): each cell rules
 * its right and bottom edge, and the grid pulls the outermost lines under its
 * clip so only the inner hairlines show. Each widget's width comes from its
 * `span`, keyed to the widget's kind by the contract.
 *
 * The column count is fixed in the component (1 col, 2 at `sm`, 3 at `lg`) — a
 * per-page column count is an appearance the contract does not derive, and rule
 * 12 (ADR-0004) puts a visual choice with no keying rule in the component, not on
 * the call site.
 */
export function DashboardGrid({
  children,
  className,
}: DashboardGridProps): React.ReactElement {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="-mr-px -mb-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

DashboardGrid.displayName = "DashboardGrid";
