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
 * archetype, inside the `DashboardShell` stack. A gapped grid on the canvas:
 * each widget is its own raised card (ADR-0015). Each widget's width comes from
 * its `span`, keyed to the widget's kind by the contract.
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
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

DashboardGrid.displayName = "DashboardGrid";
