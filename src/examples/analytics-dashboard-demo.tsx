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
 *
 * Edit mode (ADR-0011): "Edit layout" swaps the header for an inline title
 * editor + "Add tile" / "Done", gives every widget its move / configure /
 * remove controls (keyboard-operable; drag-and-drop on top), opens a tile
 * config dialog that sets what a tile *is* (its span is derived from that),
 * and shows the assignment checklist after the grid.
 *
 * Paired periods: "Gross revenue" and "Gross profit" are <DashboardPeriodPair>s —
 * one cell each, month left and YTD right, so a pair never splits across rows.
 */

import * as React from "react";
import { StatTile, StatTileRow } from "@/components/layout";
import { Check, Download, LayoutGrid, Plus, Share2 } from "lucide-react";
import {
  DashboardAssignmentList,
  DashboardGrid,
  DashboardPeriodPair,
  DashboardShell,
  DashboardTitleEditor,
  DashboardWidget,
  type DashboardAssignmentTarget,
} from "@/components/archetypes/analytics-dashboard";
import { NativeField } from "@/components/archetypes/raw-input";
import { SelectField } from "@/components/archetypes/raw-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type WidgetKey = "revenue" | "channel" | "categories" | "funnel" | "figure";
type WidgetPlane = "loaded" | "loading" | "empty" | "error";
type WidgetMode = "Loaded" | "Loading" | "Mixed";

// "Mixed" puts each of the three non-loaded planes on a different widget so
// loading/empty/error are all visible at once, with the rest loaded.
const MIXED_PLANES: Record<WidgetKey, WidgetPlane> = {
  revenue: "loading",
  channel: "empty",
  categories: "error",
  funnel: "loaded",
  figure: "loaded",
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

// --- tiles: the layout the edit mode changes -----------------------------------

// What a tile *is* decides its span (contract Layer 6 keying rule) — the config
// dialog picks the kind, never a width.
// A "pair" tile renders as <DashboardPeriodPair>, which fixes its own (full) width.
type TileKind = "pair" | "trend" | "breakdown" | "figure";
const SPAN: Record<Exclude<TileKind, "pair">, 1 | 2 | 3> = { trend: 3, breakdown: 2, figure: 1 };
const KIND_OPTIONS = [
  { value: "pair", label: "Month + YTD pair (full width)" },
  { value: "trend", label: "Primary trend (full width)" },
  { value: "breakdown", label: "Comparison / breakdown (wide)" },
  { value: "figure", label: "Figure or short list (one column)" },
];

type Tile = {
  id: string;
  title: string;
  kind: TileKind;
  body: WidgetKey;
  description?: string;
  /** Month and YTD values of a "pair" tile. */
  pair?: { month: string; ytd: string };
};

const INITIAL_TILES: Tile[] = [
  { id: "gross", title: "Gross revenue", kind: "pair", body: "figure", pair: { month: "€58.9k", ytd: "€612k" } },
  { id: "margin", title: "Gross profit", kind: "pair", body: "figure", pair: { month: "€21.3k", ytd: "€224k" } },
  { id: "revenue", title: "Revenue over time", kind: "trend", body: "revenue", description: "Trailing 12 months, net of refunds" },
  { id: "channel", title: "Orders by channel", kind: "figure", body: "channel" },
  { id: "categories", title: "Top categories", kind: "figure", body: "categories" },
  { id: "funnel", title: "Conversion funnel", kind: "breakdown", body: "funnel" },
];

const INITIAL_SHOPS: DashboardAssignmentTarget[] = [
  { id: "north", label: "North shop", assigned: true },
  { id: "harbour", label: "Harbour shop", assigned: true },
  { id: "online", label: "Online store", assigned: false },
  { id: "outlet", label: "Outlet", assigned: false },
];

function TileChart({ body, trend }: { body: WidgetKey; trend: number[] }): React.ReactElement {
  switch (body) {
    case "revenue":
      return <Sparkline values={trend} />;
    case "channel":
      return <HBars data={[{ label: "Web", value: 540 }, { label: "Retail", value: 210 }, { label: "Wholesale", value: 62 }]} />;
    case "categories":
      return (
        <Bars
          data={[
            { label: "Sets", value: 38 },
            { label: "Parts", value: 27 },
            { label: "Minifigs", value: 19 },
            { label: "Books", value: 9 },
            { label: "Other", value: 7 },
          ]}
        />
      );
    case "funnel":
      return (
        <HBars
          data={[
            { label: "Visits", value: 100 },
            { label: "Added to cart", value: 42 },
            { label: "Checkout", value: 28 },
            { label: "Purchased", value: 21 },
          ]}
        />
      );
    default:
      return <p className="text-2xl font-semibold tabular-nums">—</p>;
  }
}

/** The consumer-owned tile config dialog: it sets what the tile is. */
function TileConfigDialog({
  tile,
  onClose,
  onSave,
}: {
  tile: Tile | "new" | null;
  onClose: () => void;
  onSave: (title: string, kind: TileKind) => void;
}): React.ReactElement {
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState<TileKind>("figure");
  React.useEffect(() => {
    if (tile === null) return;
    setTitle(tile === "new" ? "" : tile.title);
    setKind(tile === "new" ? "figure" : tile.kind);
  }, [tile]);
  return (
    <Dialog open={tile !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tile === "new" ? "Add tile" : "Configure tile"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <NativeField label="Title" value={title} onChange={setTitle} required />
          <SelectField
            label="Kind"
            value={kind}
            onChange={(v) => setKind(v as TileKind)}
            options={KIND_OPTIONS}
            hint="The kind decides the tile's width."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!title.trim()} onClick={() => onSave(title.trim(), kind)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------------------------

export function AnalyticsDashboardDemo(): React.ReactElement {
  const [period, setPeriod] = React.useState<Period>("Month");
  const [channel, setChannel] = React.useState("all");
  const [widgetMode, setWidgetMode] = React.useState<WidgetMode>("Loaded");
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState("Revenue Analytics");
  const [tiles, setTiles] = React.useState(INITIAL_TILES);
  const [configuring, setConfiguring] = React.useState<Tile | "new" | null>(null);
  const [shops, setShops] = React.useState(INITIAL_SHOPS);
  const k = KPIS[period];
  const retry = () => setWidgetMode("Loaded");

  const move = (from: number, to: number) =>
    setTiles((ts) => {
      const next = [...ts];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  const saveTile = (title: string, kind: TileKind) => {
    setTiles((ts) =>
      configuring === "new"
        ? [...ts, { id: `tile-${Date.now()}`, title, kind, body: "figure" }]
        : ts.map((t) => (configuring && t.id === configuring.id ? { ...t, title, kind } : t)),
    );
    setConfiguring(null);
  };
  const toggleShop = (id: string) =>
    setShops((ss) => ss.map((s) => (s.id === id ? { ...s, assigned: !s.assigned } : s)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          Widgets degrade independently — <strong>Widget states</strong> shows
          the loading/empty/error planes (per docs Layer 7). Widget width is not a
          control: each widget&apos;s <code>span</code> follows the contract&apos;s
          widget-span keying rule (month + YTD pair full width · primary trend
          full width · breakdown wide · everything else one column). <strong>Edit layout</strong> shows the
          edit mode (ADR-0011).
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
        title={editing ? <DashboardTitleEditor value={name} onRename={setName} /> : name}
        subtitle="Shop · all figures net of refunds"
        actions={
          editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <Check className="h-4 w-4" />
                Done
              </Button>
              <Button onClick={() => setConfiguring("new")}>
                <Plus className="h-4 w-4" />
                Add tile
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <LayoutGrid className="h-4 w-4" />
                Edit layout
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )
        }
        // adherence-ok: page-tabs-in-toolbar — the period selector scopes the dashboard data, it does not switch pages
        toolbar={
          <>
            <SegmentedControl
              value={period}
              onValueChange={(v) => setPeriod(v as Period)}
              options={PERIODS.map((p) => ({ value: p, label: p }))}
              label="Period"
            />
            <Select value={channel} onValueChange={(v) => setChannel(v)}>
              <SelectTrigger label="Channel" className="w-56">
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

        {/* Widget grid — chart bodies are placeholders (consumer brings the chart lib).
            Span is derived from the tile's kind (primary trend 3 · breakdown 2 · else 1). */}
        {tiles.length === 0 ? (
          <StateView
            variant="empty"
            message="No tiles yet."
            action={
              <Button onClick={() => setConfiguring("new")}>
                <Plus className="h-4 w-4" />
                Add tile
              </Button>
            }
          />
        ) : (
          <DashboardGrid>
            {tiles.map((tile, index) => {
              const edit = editing
                ? {
                    name: tile.title,
                    index,
                    count: tiles.length,
                    onMove: move,
                    onConfigure: () => setConfiguring(tile),
                    onRemove: () => setTiles((ts) => ts.filter((t) => t.id !== tile.id)),
                  }
                : undefined;
              return tile.kind === "pair" ? (
                <DashboardPeriodPair
                  key={tile.id}
                  title={tile.title}
                  month={{ label: "Month", value: tile.pair?.month ?? "—", hint: "October" }}
                  ytd={{ label: "YTD", value: tile.pair?.ytd ?? "—", hint: "Jan – Oct" }}
                  edit={edit}
                />
              ) : (
                <DashboardWidget
                  key={tile.id}
                  title={tile.title}
                  description={tile.description}
                  span={SPAN[tile.kind]}
                  edit={edit}
                >
                  <WidgetBody plane={widgetPlane(tile.body, widgetMode)} onRetry={retry}>
                    <TileChart body={tile.body} trend={k.trend} />
                  </WidgetBody>
                </DashboardWidget>
              );
            })}
          </DashboardGrid>
        )}

        {editing && (
          <DashboardAssignmentList title="Shown in shops" targets={shops} onToggle={toggleShop} />
        )}
      </DashboardShell>

      <TileConfigDialog tile={configuring} onClose={() => setConfiguring(null)} onSave={saveTile} />
    </div>
  );
}
