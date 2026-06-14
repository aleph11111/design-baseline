/**
 * analytics-dashboard-demo.tsx
 *
 * Reference demo for the G (analytics-dashboard) archetype. Domain: a shop's
 * revenue analytics — deliberately generic.
 *
 * The archetype is **chart-agnostic**: the baseline ships no chart library, so
 * this demo draws placeholder "charts" with plain CSS/SVG. A real consumer drops
 * its own recharts/nivo/etc. components into the <DashboardWidget> bodies. The
 * archetype owns the frame (KPI row + widget grid + filter bar), not the charts.
 *
 * Reuse: KPIs are <StatTileRow>/<StatTile> (from detail-overview); each widget is
 * a <SectionCard> via <DashboardWidget>. The only new chrome is <DashboardGrid>.
 */

import * as React from "react";
import { PageHeader, StatTile, StatTileRow } from "@/components/layout";
import {
  DashboardGrid,
  DashboardWidget,
} from "@/components/archetypes/analytics-dashboard";

const PERIODS = ["Week", "Month", "Quarter", "Year"] as const;
type Period = (typeof PERIODS)[number];

// Per-period seed numbers (placeholder).
const KPIS: Record<
  Period,
  { revenue: string; orders: string; aov: string; customers: string; trend: number[] }
> = {
  Week: { revenue: "€12.4k", orders: "184", aov: "€67", customers: "142", trend: [4, 6, 5, 8, 7, 9, 11] },
  Month: { revenue: "€58.9k", orders: "812", aov: "€72", customers: "603", trend: [30, 42, 38, 55, 49, 61, 58, 67, 72, 64, 70, 78] },
  Quarter: { revenue: "€176k", orders: "2,431", aov: "€72", customers: "1,512", trend: [120, 140, 135, 160, 175, 168] },
  Year: { revenue: "€690k", orders: "9,840", aov: "€70", customers: "4,206", trend: [40, 55, 48, 62, 70, 65, 72, 80, 76, 88, 92, 98] },
};

// --- placeholder chart bits (no chart lib — pure CSS/SVG) ----------------------

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${40 - (v / max) * 36}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-40 w-full">
      <polyline
        points={pts}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((d) => (
        <div
          key={d.label}
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
        >
          <div
            className="w-full rounded-t bg-primary/80"
            style={{ height: `${(d.value / max) * 100}%` }}
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
        <div key={d.label} className="flex items-center gap-2 text-sm">
          <span className="w-24 shrink-0 truncate text-muted-foreground">{d.label}</span>
          <div className="h-3 flex-1 rounded bg-muted">
            <div className="h-3 rounded bg-primary/70" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------------------

export function AnalyticsDashboardDemo(): React.ReactElement {
  const [period, setPeriod] = React.useState<Period>("Month");
  const [channel, setChannel] = React.useState("all");
  const k = KPIS[period];

  return (
    <div className="px-6 py-6 space-y-6">
      <PageHeader
        title="Revenue analytics"
        subtitle="Sales performance across channels and categories."
      />

      {/* Filter bar — period segmented control + a category/channel select. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-md border p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={
                "rounded px-3 py-1 text-xs " +
                (period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {p}
            </button>
          ))}
        </div>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">All channels</option>
          <option value="web">Web</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
        </select>
      </div>

      {/* KPI row — reuses StatTileRow / StatTile. */}
      <StatTileRow columns={4}>
        <StatTile label="Revenue" value={k.revenue} hint={`vs last ${period.toLowerCase()}`} />
        <StatTile label="Orders" value={k.orders} hint="paid + fulfilled" />
        <StatTile label="Avg order value" value={k.aov} hint="net of refunds" />
        <StatTile label="Active customers" value={k.customers} hint="bought at least once" />
      </StatTileRow>

      {/* Widget grid — chart bodies are placeholders (consumer brings the chart lib). */}
      <DashboardGrid columns={3}>
        <DashboardWidget title="Revenue over time" span={2}>
          <Sparkline values={k.trend} />
        </DashboardWidget>
        <DashboardWidget title="Orders by channel">
          <HBars
            data={[
              { label: "Web", value: 540 },
              { label: "Retail", value: 210 },
              { label: "Wholesale", value: 62 },
            ]}
          />
        </DashboardWidget>
        <DashboardWidget title="Top categories">
          <Bars
            data={[
              { label: "Sets", value: 38 },
              { label: "Parts", value: 27 },
              { label: "Minifigs", value: 19 },
              { label: "Books", value: 9 },
              { label: "Other", value: 7 },
            ]}
          />
        </DashboardWidget>
        <DashboardWidget title="Conversion funnel" span={3}>
          <HBars
            data={[
              { label: "Visits", value: 100 },
              { label: "Added to cart", value: 42 },
              { label: "Checkout", value: 28 },
              { label: "Purchased", value: 21 },
            ]}
          />
        </DashboardWidget>
      </DashboardGrid>
    </div>
  );
}
