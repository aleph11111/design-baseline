import * as React from "react";
import { SectionCard } from "@/components/layout/SectionCard";
import { cn } from "@/lib/utils";

const SPAN_MAP: Record<1 | 2 | 3, string> = {
  1: "",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
};

export type DashboardWidgetProps = {
  /** Widget heading, rendered as the ruled overline title bar (via SectionCard). */
  title: React.ReactNode;
  /** Optional right-aligned controls in the title bar (a small range toggle, a menu). */
  actions?: React.ReactNode;
  /**
   * How many grid columns this widget spans. Defaults to 1. The grid collapses
   * responsively, so spans only apply at `sm`+.
   */
  span?: 1 | 2 | 3;
  /**
   * The widget body — a chart (consumer brings the chart library; the baseline
   * ships none), a number, a small table. Rendered with `px-5 py-4` padding.
   */
  children: React.ReactNode;
  className?: string;
};

/**
 * DashboardWidget — one card in a `<DashboardGrid>`. A thin wrapper over the
 * shared `<SectionCard>` (so it carries the same titled-bounded-section chrome as
 * the rest of the system) plus a grid column `span`. The body is chart-agnostic:
 * the archetype owns the frame, not the chart.
 */
export function DashboardWidget({
  title,
  actions,
  span = 1,
  children,
  className,
}: DashboardWidgetProps): React.ReactElement {
  return (
    <SectionCard title={title} actions={actions} className={cn(SPAN_MAP[span], className)}>
      {children}
    </SectionCard>
  );
}

DashboardWidget.displayName = "DashboardWidget";
