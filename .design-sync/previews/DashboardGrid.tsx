import * as React from "react";
import { DashboardGrid, DashboardWidget } from "design-baseline";

// Placeholder chart bits — no chart lib shipped; the archetype owns the
// frame, not the chart (consumer brings recharts/nivo/etc).
const BAR_CHART_HEIGHT = 128; // px — matches the h-32 chart area

function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3" style={{ height: BAR_CHART_HEIGHT }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <div
            className="w-full rounded-t bg-primary/80"
            style={{ height: Math.round((d.value / max) * (BAR_CHART_HEIGHT - 16)) }}
          />
          <span className="truncate text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function HBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2 text-[13px]">
          <span className="w-20 shrink-0 truncate text-muted-foreground">{d.label}</span>
          <div className="h-3 flex-1 rounded bg-muted">
            <div className="h-3 rounded bg-primary/70" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right font-mono tabular-nums text-muted-foreground">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// 3-column grid, one widget spanning 2 columns — the canonical widget-grid shape.
export function ThreeColumn() {
  return (
    <DashboardGrid columns={3}>
      <DashboardWidget title="Revenue over time" description="Trailing 12 months" span={2}>
        <Bars data={[{ label: "Jan", value: 40 }, { label: "Feb", value: 55 }, { label: "Mar", value: 48 }, { label: "Apr", value: 62 }, { label: "May", value: 70 }]} />
      </DashboardWidget>
      <DashboardWidget title="Orders by channel">
        <HBars data={[{ label: "Web", value: 540 }, { label: "Retail", value: 210 }, { label: "Wholesale", value: 62 }]} />
      </DashboardWidget>
    </DashboardGrid>
  );
}

// 2-column grid — narrower widget-grid variant.
export function TwoColumn() {
  return (
    <DashboardGrid columns={2}>
      <DashboardWidget title="Top categories">
        <Bars data={[{ label: "Sets", value: 38 }, { label: "Parts", value: 27 }, { label: "Minifigs", value: 19 }, { label: "Books", value: 9 }]} />
      </DashboardWidget>
      <DashboardWidget title="Conversion funnel">
        <HBars data={[{ label: "Visits", value: 100 }, { label: "Cart", value: 42 }, { label: "Checkout", value: 28 }, { label: "Purchased", value: 21 }]} />
      </DashboardWidget>
    </DashboardGrid>
  );
}
