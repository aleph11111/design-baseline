/**
 * detail-overview-demo.tsx
 *
 * Sandbox demo for the C (detail-overview) archetype — the canonical
 * money-dense **Command Rail** order page. Domain: an independent bookshop's
 * customer order — deliberately far from CRM/MSP nouns, and product-shaped so
 * the line items carry real thumbnails.
 *
 * Exercises the full rail vocabulary (mirroring the order reference mockup):
 *   - DetailOverviewShell `layout="rail"` — one bounded, unified frame:
 *     sticky, chromeless, inset-divided rail beside a flattened-carded main
 *     column. Toggle Layout / Width.
 *   - The page header via the shell's `title`/`subtitle`/`badges`/`actions`/
 *     `backHref` props, rendered once above the frame (ADR-0008) — status
 *     lives ONCE, inline next to the title (the gate's "one home for status").
 *   - Nested: the same shell under a parent page frame titles itself as the
 *     nested heading and joins the parent's surface — derived, no prop.
 *   - summary (rail) = status-free stack: MetricList revenue/profit readout
 *     (headline + disclosure) → customer identity → KeyValueList facts.
 *   - content (main) = ProgressTracker activity → a line-item table WITH
 *     thumbnails + subtotal footer → a financial breakdown w/ a profit highlight
 *     → an inline-edit note (the editability axis).
 *   - references (rail foot) = documents.
 *   - House style B: every figure mono/tabular; BrickShop blue `--primary`
 *     scoped to the demo surface (the donor default stays neutral).
 *
 * Types are LOCAL with zero reference to any source project's domain.
 */

import * as React from "react";
import { FileText, MoreHorizontal, PanelLeft, Rows3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageFrame } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { IconAvatar } from "@/components/ui/icon-avatar";
import {
  DetailOverviewShell,
  DetailSection,
  KeyValueList,
  KeyValueRow,
  MetricList,
  MetricRow,
  ProgressTracker,
  type ProgressStep,
} from "@/components/archetypes/detail-overview";

// ---------------------------------------------------------------------------
// Domain — a bookshop customer order
// ---------------------------------------------------------------------------

type LineItem = {
  id: string;
  code: string; // short catalogue code, shown in the thumbnail placeholder
  name: string;
  note: string;
  qty: number;
  unitPrice: number; // EUR
};

type Order = {
  id: string;
  number: string;
  channel: string;
  revenue: number;
  grossProfit: number;
  margin: string;
  costOfGoods: number;
  fees: number;
  shipping: number;
  customer: { name: string; sub: string; initials: string; email: string };
  placedOn: string; // ISO
  reference: string;
  fulfilment: string;
  activity: ProgressStep[];
  lineItems: LineItem[];
  documents: { name: string; kind: string }[];
  note: string;
};

// ---------------------------------------------------------------------------
// Local formatters (pre-format values; primitives never format)
// ---------------------------------------------------------------------------

/** Extra master-data rows for the long-rail demo case. */
const LONG_RAIL_ROWS: [string, string][] = [
  ["Ship to", "Jonas Berger"],
  ["Street", "Lindenstraße 14"],
  ["Carrier", "DHL Paket"],
  ["Tracking", "00340434161094042557"],
  ["Payment", "Card ending 4242"],
];

function fmtEUR(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const ORDER: Order = {
  id: "order-0417",
  number: "SO-2025-00417",
  channel: "Web shop",
  revenue: 162.0,
  grossProfit: 55.08,
  margin: "34.0%",
  costOfGoods: 98.0,
  fees: 8.92,
  shipping: 9.0,
  customer: {
    name: "Jonas Berger",
    sub: "Private customer · Köln, DE",
    initials: "JB",
    email: "j.berger@example.com",
  },
  placedOn: "2026-06-12",
  reference: "WS-9921",
  fulfilment: "DHL Paket",
  activity: [
    { label: "Placed", meta: "12 Jun", state: "done" },
    { label: "Paid", meta: "12 Jun", state: "done" },
    { label: "Packed", meta: "In progress", state: "current" },
    // One long single-word label: it must wrap inside its column.
    { label: "Consolidation/Customs", state: "pending" },
    { label: "Shipped", meta: "Pending", state: "pending" },
    { label: "Out for delivery", state: "pending" },
    { label: "Delivered", state: "pending" },
  ],
  lineItems: [
    { id: "li-1", code: "GEB", name: "Gödel, Escher, Bach", note: "Hardcover · new", qty: 1, unitPrice: 42 },
    { id: "li-2", code: "LHD", name: "The Left Hand of Darkness", note: "Paperback", qty: 2, unitPrice: 16 },
    { id: "li-3", code: "SPQR", name: "SPQR: A History of Ancient Rome", note: "Hardcover", qty: 1, unitPrice: 34 },
    { id: "li-4", code: "TFE", name: "Tales from Earthsea", note: "Paperback", qty: 3, unitPrice: 15 },
  ],
  documents: [
    { name: "Invoice 2025-0417.pdf", kind: "PDF" },
    { name: "Packing slip.pdf", kind: "PDF" },
  ],
  note:
    "Customer asked for the Earthsea set to be gift-wrapped. Packing in " +
    "progress — ship via DHL once the SPQR restock lands (expected tomorrow).",
};

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

export function DetailOverviewDemo(): React.ReactElement {
  const o = ORDER;
  const [layout, setLayout] = React.useState<"vertical" | "rail">("rail");
  const [width, setWidth] = React.useState<"none" | "md" | "lg" | "xl">("md");
  const [railLength, setRailLength] = React.useState<"standard" | "long">("standard");
  const [editingNote, setEditingNote] = React.useState(false);
  const [note, setNote] = React.useState(ORDER.note);

  const subtotal = o.lineItems.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          The canonical money-dense record page. Status lives once, inline in the
          header (`badges` data prop); the rail pins figures + identity; the main
          column stacks activity, line items with thumbnails, and the financial
          breakdown. One bounded container model — the unified frame. Toggle{" "}
          <strong>Layout</strong> (rail keeps the sticky identity rail) and{" "}
          <strong>Width</strong> (Width only bounds the <em>vertical</em> layout —
          the rail is sticky-full and ignores it). <strong>Rail</strong> → Long
          makes the rail taller than a laptop viewport: it scrolls with the page
          until its foot (Documents) is in view, then pins there.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Detail-overview layout"
            value={layout}
            onValueChange={setLayout}
            options={[
              { value: "rail", label: "Command rail", icon: PanelLeft },
              { value: "vertical", label: "Vertical", icon: Rows3 },
            ]}
          />
          <SegmentedControl
            aria-label="Detail-overview width"
            value={width}
            onValueChange={setWidth}
            options={[
              { value: "none", label: "None" },
              { value: "md", label: "Md" },
              { value: "lg", label: "Lg" },
              { value: "xl", label: "Xl" },
            ]}
          />
          <SegmentedControl
            aria-label="Detail-overview rail length"
            value={railLength}
            onValueChange={setRailLength}
            options={[
              { value: "standard", label: "Standard rail" },
              { value: "long", label: "Long rail" },
            ]}
          />
        </div>
      </div>

      {/* The blue `--primary` override is BrickShop's brand, scoped to this
          page: the donor default stays neutral slate; each app brings its own
          accent. One token re-skins every primary action, badge, and
          ProgressTracker dot. (Not the metric figures — those always render
          `text-foreground`; the brand-tint flag was per-call-site discretion no
          contract keyed, so it is gone.) */}
      <div
        style={
          {
            "--primary": "223 87% 29%",
            "--primary-foreground": "0 0% 100%",
            "--ring": "223 87% 29%",
          } as React.CSSProperties
        }
      >
        <DetailOverviewShell
          layout={layout}
          width={width}
          title={o.number}
          backHref="#"
          backLabel="Orders"
          subtitle={
            <>
              <span>Orders</span>
              <span className="mx-2 text-border">·</span>
              <span>{o.channel}</span>
            </>
          }
          badges={
            <>
              <Badge variant="success">Paid</Badge>
              <Badge variant="warning">Packing</Badge>
            </>
          }
          actions={
            <>
              <Button variant="outline">
                Invoice
              </Button>
              <Button
                variant="ghost"
                className="px-2"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button>Mark as shipped</Button>
            </>
          }
          summary={
            <>
              {/* Revenue & profit at a glance — MetricList with a disclosure */}
              <DetailSection title="Revenue & profit" flush>
                <MetricList
                  more={
                    <>
                      <MetricRow label="Items subtotal" value={fmtEUR(subtotal)} />
                      <MetricRow label="Shipping" value={fmtEUR(o.shipping)} />
                      <MetricRow label="Cost of goods" value={fmtEUR(o.costOfGoods)} />
                      <MetricRow label="Fees & packaging" value={fmtEUR(o.fees)} />
                    </>
                  }
                >
                  <MetricRow
                    label="Revenue"
                    value={fmtEUR(o.revenue)}
                    hint="incl. shipping"
                    emphasis
                  />
                  <MetricRow
                    label="Gross profit"
                    value={fmtEUR(o.grossProfit)}
                    hint={`margin ${o.margin}`}
                    emphasis
                  />
                </MetricList>
              </DetailSection>

              {/* Customer identity */}
              <DetailSection title="Customer">
                <div className="flex items-center gap-3">
                  <IconAvatar size="md">{o.customer.initials}</IconAvatar>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground">
                      {o.customer.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {o.customer.sub}
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Master-data facts */}
              <DetailSection title="Details" flush>
                <KeyValueList>
                  <KeyValueRow label="Placed" value={fmtDate(o.placedOn)} />
                  <KeyValueRow label="Channel" value={o.channel} />
                  <KeyValueRow label="Reference" value={o.reference} />
                  <KeyValueRow label="Fulfilment" value={o.fulfilment} />
                </KeyValueList>
              </DetailSection>

              {/* Long-rail case: enough master data to outgrow a laptop viewport */}
              {railLength === "long" && (
                <DetailSection title="Shipping & billing" flush>
                  <KeyValueList>
                    {LONG_RAIL_ROWS.map(([label, value]) => (
                      <KeyValueRow key={label} label={label} value={value} />
                    ))}
                  </KeyValueList>
                </DetailSection>
              )}
            </>
          }
          content={
            <>
              {/* Activity lifecycle */}
              <DetailSection title="Activity">
                <ProgressTracker steps={o.activity} />
              </DetailSection>

              {/* Line items WITH thumbnails + a subtotal footer */}
              <DetailSection
                title="Line items"
                actions={<Badge variant="secondary">{o.lineItems.length}</Badge>}
              >
                <div className="grid grid-cols-[1fr_2.5rem_5rem_5.5rem] gap-x-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                  <div>Item</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Unit</div>
                  <div className="text-right">Total</div>
                </div>
                <div className="divide-y divide-border/70">
                  {o.lineItems.map((li) => (
                    <div
                      key={li.id}
                      className="grid grid-cols-[1fr_2.5rem_5rem_5.5rem] items-center gap-x-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Thumbnail — a product image stands here; the placeholder
                            is the catalogue code, ≥40px per the acceptance gate. */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[8px] text-muted-foreground">
                          {li.code}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-foreground">
                            {li.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {li.note}
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-[13px] tabular-nums text-muted-foreground">
                        {li.qty}
                      </div>
                      <div className="text-right text-[13px] tabular-nums text-muted-foreground">
                        {fmtEUR(li.unitPrice)}
                      </div>
                      <div className="text-right text-[13px] tabular-nums text-foreground">
                        {fmtEUR(li.qty * li.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t-2 border-border pt-3">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                    Items subtotal
                  </span>
                  <span className="text-sm tabular-nums text-foreground">
                    {fmtEUR(subtotal)}
                  </span>
                </div>
              </DetailSection>

              {/* Financial breakdown with a profit highlight */}
              <DetailSection title="Financial breakdown">
                <div className="divide-y divide-border/70">
                  <BreakdownRow k="Items subtotal" v={fmtEUR(subtotal)} />
                  <BreakdownRow k="Shipping" v={fmtEUR(o.shipping)} />
                  <BreakdownRow k="Cost of goods" v={`− ${fmtEUR(o.costOfGoods)}`} muted />
                  <BreakdownRow k="Fees & packaging" v={`− ${fmtEUR(o.fees)}`} muted />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2.5">
                  <span className="text-[13px] font-semibold text-foreground">
                    Gross profit
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-base tabular-nums text-primary">
                      {fmtEUR(o.grossProfit)}
                    </span>
                    <Badge variant="secondary">{o.margin}</Badge>
                  </span>
                </div>
              </DetailSection>

              {/* Editability variant — inline-edit (read-only value ↔ in-place editor) */}
              <DetailSection
                title="Order note"
                actions={
                  editingNote ? (
                    <Button
                      size="sm"
                      className="-my-1.5 h-7 text-xs"
                      onClick={() => setEditingNote(false)}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-my-1.5 h-7 text-xs"
                      onClick={() => setEditingNote(true)}
                    >
                      Edit
                    </Button>
                  )
                }
              >
                {editingNote ? (
                  <Textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-foreground">{note}</p>
                )}
              </DetailSection>
            </>
          }
          references={
            <DetailSection title="Documents">
              <ul className="space-y-2">
                {o.documents.map((d) => (
                  <li key={d.name}>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 rounded-md border border-border bg-card px-2.5 py-2 hover:bg-accent"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-[11.5px] font-medium text-foreground">
                        {d.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {d.kind}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </DetailSection>
          }
        />
      </div>

      {/* Nested — the shell under a parent page frame (an entity tab under a
          layout that owns the page): it titles itself as the nested heading
          and joins the parent's surface, derived from where it renders. Also
          the vertical layout with the typed `stats` strip (slot 3, aggregates)
          and a collapsible section. */}
      <div>
        <PageFrame title={o.customer.name} subtitle="Customer · parent layout owns the page">
          <DetailOverviewShell
            layout="vertical"
            title={o.number}
            subtitle="Nested — vertical, aggregates as a stat strip"
            stats={[
              { label: "Revenue", value: fmtEUR(o.revenue), hint: "incl. shipping" },
              { label: "Gross profit", value: fmtEUR(o.grossProfit), hint: `margin ${o.margin}` },
              { label: "Items", value: String(o.lineItems.reduce((n, li) => n + li.qty, 0)) },
            ]}
            content={
              <>
                <DetailSection title="Details" flush>
                  <KeyValueList>
                    <KeyValueRow label="Customer" value={o.customer.name} />
                    <KeyValueRow label="Placed on" value={fmtDate(o.placedOn)} />
                  </KeyValueList>
                </DetailSection>
                <DetailSection title="Raw payload" collapsible>
                  <pre className="overflow-x-auto font-mono text-[11px] text-muted-foreground">
                    {JSON.stringify({ id: o.id, number: o.number, channel: o.channel }, null, 2)}
                  </pre>
                </DetailSection>
              </>
            }
          />
        </PageFrame>
      </div>
    </div>
  );
}

DetailOverviewDemo.displayName = "DetailOverviewDemo";

/** One ruled row in the financial breakdown — label left, mono value right. */
function BreakdownRow({
  k,
  v,
  muted,
}: {
  k: string;
  v: string;
  muted?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between py-1.5 text-[13px]">
      <span className="text-muted-foreground">{k}</span>
      <span
        className={
          muted
            ? "tabular-nums text-muted-foreground"
            : "tabular-nums text-foreground"
        }
      >
        {v}
      </span>
    </div>
  );
}
