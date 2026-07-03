import * as React from "react";
import { DashboardWidget, Skeleton, StateView } from "design-baseline";

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${40 - (v / max) * 36}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-32 w-full">
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// A loaded widget with a description line and a small action control.
export function WithDescriptionAndActions() {
  return (
    <DashboardWidget
      title="Revenue over time"
      description="Trailing 12 months, net of refunds"
      actions={<span className="text-[11px] font-medium text-muted-foreground">Monthly</span>}
    >
      <Sparkline values={[30, 42, 38, 55, 49, 61, 58, 67, 72, 64, 70, 78]} />
    </DashboardWidget>
  );
}

// Loading plane — a skeleton stands in for the chart body while data loads.
export function LoadingState() {
  return (
    <DashboardWidget title="Orders by channel">
      <Skeleton className="h-32 w-full" aria-hidden />
    </DashboardWidget>
  );
}

// Empty plane — the widget body composes the canonical StateView.
export function EmptyState() {
  return (
    <DashboardWidget title="Top categories">
      <StateView variant="empty" message="No data for this period." />
    </DashboardWidget>
  );
}
