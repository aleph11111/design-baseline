import * as React from "react";
import { SectionCard } from "../../layout/SectionCard";
import { cn } from "../../../lib/utils";

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
  /** Optional secondary line under the title (rendered by SectionCard). */
  description?: React.ReactNode;
  /**
   * How many grid columns this widget spans. Required and derived, never a
   * default: the contract's widget-span keying rule
   * (`docs/archetypes/analytics-dashboard.md`, Layer 6) determines it
   * exhaustively from what the widget *is* —
   *
   * - `3` — the page's single **primary trend** widget (the time-series the
   *   whole dashboard is read against). At most one per page.
   * - `2` — a **comparison/breakdown** widget whose body is multi-series or
   *   multi-category and unreadable at one column (a funnel, a stacked
   *   breakdown, a ranked bar list).
   * - `1` — every other widget: a single figure, a short ranked list, a small
   *   table, a sparkline.
   *
   * The grid collapses responsively, so spans only apply at `sm`+.
   */
  span: 1 | 2 | 3;
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
 *
 * `span` carries no default — a backwards-compatible default is what disqualified
 * it under RULES.md hard rule 12 (ADR-0004); it stays a per-call-site prop only
 * because the contract keys it exhaustively to the widget's kind.
 */
export function DashboardWidget({
  title,
  actions,
  description,
  span,
  children,
  className,
}: DashboardWidgetProps): React.ReactElement {
  return (
    <SectionCard
      title={title}
      description={description}
      actions={actions}
      className={cn(SPAN_MAP[span], className)}
    >
      {children}
    </SectionCard>
  );
}

DashboardWidget.displayName = "DashboardWidget";
