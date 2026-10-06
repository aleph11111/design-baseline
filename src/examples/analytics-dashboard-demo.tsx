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
 * One page frame (ADR-0008): the title + Export/Share `actions` on the canvas;
 * the period + channel filters in the frame's `toolbar`; then the KPI row
 * (<StatTileRow>/<StatTile>) and the widget grid (<DashboardGrid> of
 * <DashboardWidget>s) as hairline-divided cells of the one surface — no
 * card-in-card, no mat.
 */

import * as React from "react";
import { StatTile, StatTileRow } from "@/components/layout";
import { Download, Share2 } from "lucide-react";
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
        stroke="var(--color-chart-1)"
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
          <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// The house chart palette (ADR-0007 §8) in its fixed series order: chart-1 is
// the brand accent (follows --primary), chart-2..6 are donor-fixed hues. Class
// names are spelled out so Tailwind sees each one. The layer's `@theme inline`
// makes the utilities resolve per element, so the nested `.dark` row uses the
// same classes and picks up the dark hues.
const CHART_SWATCHES = [
  { token: "chart-1", className: "bg-chart-1" },
  { token: "chart-2", className: "bg-chart-2" },
  { token: "chart-3", className: "bg-chart-3" },
  { token: "chart-4", className: "bg-chart-4" },
  { token: "chart-5", className: "bg-chart-5" },
  { token: "chart-6", className: "bg-chart-6" },
] as const;

function ChartPalette({ dark = false }: { dark?: boolean }): React.ReactElement {
  return (
    <div className={dark ? "dark rounded-md bg-surface-raised px-3 py-2" : "px-3 py-2"}>
      <ol aria-label={`Chart palette (${dark ? "dark" : "light"})`} className="flex flex-wrap gap-3">
        {CHART_SWATCHES.map((s) => (
          <li key={s.token} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={`size-4 rounded-sm ${s.className}`} aria-hidden />
            <code>{s.token}</code>
          </li>
        ))}
      </ol>
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
  const k = KPIS[period];
  const retry = () => setWidgetMode("Loaded");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          Widgets degrade independently — <strong>Widget states</strong> shows
          the loading/empty/error planes (per docs Layer 7). Widget width is not a
          control: each widget&apos;s <code>span</code> follows the contract&apos;s
          widget-span keying rule (primary trend full width · breakdown wide ·
          everything else one column).
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
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ChartPalette />
        <ChartPalette dark />
      </div>

      <DashboardShell
        title="Revenue Analytics"
        subtitle="Shop · all figures net of refunds"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
        toolbar={
          <>
            <SegmentedControl
              value={period}
              onValueChange={(v) => setPeriod(v as Period)}
              options={PERIODS.map((p) => ({ value: p, label: p }))}
              aria-label="Period"
            />
            <Select value={channel} onValueChange={(v) => setChannel(v)}>
              <SelectTrigger size="sm" className="w-36" aria-label="Channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      >
        {/* KPI row — reuses StatTileRow / StatTile. */}
        <StatTileRow>
          <StatTile label="Revenue" value={k.revenue} hint={`vs last ${period.toLowerCase()}`} />
          <StatTile label="Orders" value={k.orders} hint="paid + fulfilled" />
          <StatTile label="Avg order value" value={k.aov} hint="net of refunds" />
          <StatTile label="Active customers" value={k.customers} hint="bought at least once" />
        </StatTileRow>

        {/* Widget grid — chart bodies are placeholders (consumer brings the chart lib). */}
        <DashboardGrid>
          {/* Primary trend — the series the dashboard is read against: span 3. */}
          <DashboardWidget
            title="Revenue over time"
            description="Trailing 12 months, net of refunds"
            span={3}
          >
            <WidgetBody plane={widgetPlane("revenue", widgetMode)} onRetry={retry}>
              <Sparkline values={k.trend} />
            </WidgetBody>
          </DashboardWidget>
          <DashboardWidget title="Orders by channel" span={1}>
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
          <DashboardWidget title="Top categories" span={1}>
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
          <DashboardWidget title="Conversion funnel" span={2}>
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
      </DashboardShell>
    </div>
  );
}
