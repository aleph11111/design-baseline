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
import { StatTile, StatTileRow } from "@/components/layout";
import {
  DashboardGrid,
  DashboardShell,
  DashboardWidget,
} from "@/components/archetypes/analytics-dashboard";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { StateView } from "@/components/ui/state-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <div key={d.label} className="flex items-center gap-2 text-[13px]">
          <span className="w-24 shrink-0 truncate text-muted-foreground">{d.label}</span>
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

// --- per-widget state planes ---------------------------------------------
//
// DashboardWidget (src/components/archetypes/analytics-dashboard/DashboardWidget.tsx)
// has no loading/empty/error prop — it is a chrome-only SectionCard wrapper
// (title/actions/description/span/children). Per docs/archetypes/analytics-dashboard.md
// Layer 7, the per-widget planes are page-composed inside the widget body via
// the canonical StateView + a skeleton, not a primitive-owned prop.

type WidgetKey = "revenue" | "channel" | "categories" | "funnel";
type WidgetPlane = "loaded" | "loading" | "empty" | "error";
type WidgetMode = "Loaded" | "Loading" | "Mixed";

// "Mixed" puts each of the three non-loaded planes on a different widget so
// loading/empty/error are all visible at once, with the rest loaded.
const MIXED_PLANES: Record<WidgetKey, WidgetPlane> = {
  revenue: "loading",
  channel: "empty",
  categories: "error",
  funnel: "loaded",
};

function widgetPlane(key: WidgetKey, mode: WidgetMode): WidgetPlane {
  if (mode === "Loaded") return "loaded";
  if (mode === "Loading") return "loading";
  return MIXED_PLANES[key];
}

function WidgetBody({
  plane,
  onRetry,
  children,
}: {
  plane: WidgetPlane;
  onRetry: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  if (plane === "loading") {
    return <Skeleton className="h-40 w-full" aria-hidden />;
  }
  if (plane === "empty") {
    return <StateView variant="empty" message="No data for this period." />;
  }
  if (plane === "error") {
    return (
      <StateView
        variant="error"
        error={new Error("Failed to load widget data.")}
        onRetry={onRetry}
      />
    );
  }
  return <>{children}</>;
}

// ------------------------------------------------------------------------------

export function AnalyticsDashboardDemo(): React.ReactElement {
  const [period, setPeriod] = React.useState<Period>("Month");
  const [channel, setChannel] = React.useState("all");
  const [widgetMode, setWidgetMode] = React.useState<WidgetMode>("Loaded");
  const [columns, setColumns] = React.useState<"2" | "3" | "4">("3");
  const k = KPIS[period];
  const retry = () => setWidgetMode("Loaded");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          Widgets degrade independently — <strong>Widget states</strong> shows
          the loading/empty/error planes (per docs Layer 7); <strong>Columns</strong>{" "}
          drives <code>DashboardGrid</code>&apos;s <code>lg</code> column count.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Widget states"
            value={widgetMode}
            onValueChange={setWidgetMode}
            options={[
              { value: "Loaded", label: "Loaded" },
              { value: "Loading", label: "Loading" },
              { value: "Mixed", label: "Mixed" },
            ]}
          />
          <SegmentedControl
            aria-label="Columns"
            value={columns}
            onValueChange={setColumns}
            options={[
              { value: "2", label: "2 cols" },
              { value: "3", label: "3 cols" },
              { value: "4", label: "4 cols" },
            ]}
          />
        </div>
      </div>

      {/* Plex Ledger board form: title + actions sit ON the primary bounded
          surface (DashboardShell); widget cards are sibling cards in the mat. */}
      <div className="rounded-xl bg-muted/30 p-4 sm:p-6 space-y-4">
        <DashboardShell
          kicker="Reporting"
          title="Revenue Analytics"
          headerActions={
            <>
              {/* Filter bar — period segmented control + a category/channel select. */}
              <SegmentedControl
                value={period}
                onValueChange={(v) => setPeriod(v as Period)}
                options={PERIODS.map((p) => ({ value: p, label: p }))}
                aria-label="Period"
              />
              <Select value={channel} onValueChange={(v) => setChannel(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </>
          }
        >
          {/* KPI row — reuses StatTileRow / StatTile. */}
          <StatTileRow columns={4}>
            <StatTile label="Revenue" value={k.revenue} hint={`vs last ${period.toLowerCase()}`} />
            <StatTile label="Orders" value={k.orders} hint="paid + fulfilled" />
            <StatTile label="Avg order value" value={k.aov} hint="net of refunds" />
            <StatTile label="Active customers" value={k.customers} hint="bought at least once" />
          </StatTileRow>
        </DashboardShell>

        {/* Widget grid — chart bodies are placeholders (consumer brings the chart lib). */}
        <DashboardGrid columns={Number(columns) as 2 | 3 | 4}>
          <DashboardWidget
            title="Revenue over time"
            description="Trailing 12 months, net of refunds"
            span={2}
          >
            <WidgetBody plane={widgetPlane("revenue", widgetMode)} onRetry={retry}>
              <Sparkline values={k.trend} />
            </WidgetBody>
          </DashboardWidget>
          <DashboardWidget title="Orders by channel">
            <WidgetBody plane={widgetPlane("channel", widgetMode)} onRetry={retry}>
              <HBars
                data={[
                  { label: "Web", value: 540 },
                  { label: "Retail", value: 210 },
                  { label: "Wholesale", value: 62 },
                ]}
              />
            </WidgetBody>
          </DashboardWidget>
          <DashboardWidget title="Top categories">
            <WidgetBody plane={widgetPlane("categories", widgetMode)} onRetry={retry}>
              <Bars
                data={[
                  { label: "Sets", value: 38 },
                  { label: "Parts", value: 27 },
                  { label: "Minifigs", value: 19 },
                  { label: "Books", value: 9 },
                  { label: "Other", value: 7 },
                ]}
              />
            </WidgetBody>
          </DashboardWidget>
          <DashboardWidget title="Conversion funnel" span={3}>
            <WidgetBody plane={widgetPlane("funnel", widgetMode)} onRetry={retry}>
              <HBars
                data={[
                  { label: "Visits", value: 100 },
                  { label: "Added to cart", value: 42 },
                  { label: "Checkout", value: 28 },
                  { label: "Purchased", value: 21 },
                ]}
              />
            </WidgetBody>
          </DashboardWidget>
        </DashboardGrid>
      </div>
    </div>
  );
}
