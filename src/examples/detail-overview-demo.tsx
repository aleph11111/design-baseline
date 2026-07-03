/**
 * detail-overview-demo.tsx
 *
 * Sandbox demo for the C (detail-overview) archetype — the canonical
 * money-dense **Command Rail** order page. Domain: an independent bookshop's
 * customer order — deliberately far from CRM/MSP nouns, and product-shaped so
 * the line items carry real thumbnails.
 *
 * Exercises the full rail vocabulary (mirroring the order reference mockup):
 *   - DetailOverviewShell `layout="rail"` + `surface="unified"` — sticky,
 *     chromeless, inset-divided rail beside a carded main column. Toggle both.
 *   - DetailOverviewHeader with the `badges` slot — status lives ONCE, inline
 *     in the header (the gate's "one home for status"), next to a mono order #.
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { IconAvatar } from "@/components/ui/icon-avatar";
import {
  DetailOverviewShell,
  DetailOverviewHeader,
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
    { label: "Shipped", meta: "Pending", state: "pending" },
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
  const [surface, setSurface] = React.useState<"separated" | "unified">("unified");
  const [width, setWidth] = React.useState<"none" | "md" | "lg" | "xl">("md");
  const [editingNote, setEditingNote] = React.useState(false);
  const [note, setNote] = React.useState(ORDER.note);

  const subtotal = o.lineItems.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          The canonical money-dense record page. Status lives once, inline in the
          header (`badges` slot); the rail pins figures + identity; the main
          column stacks activity, line items with thumbnails, and the financial
          breakdown. Toggle <strong>Layout</strong> / <strong>Surface</strong> /{" "}
          <strong>Width</strong> (Width only bounds the <em>vertical</em> layout —
          the rail is sticky-full and ignores it).
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
            aria-label="Detail-overview surface"
            value={surface}
            onValueChange={setSurface}
            options={[
              { value: "unified", label: "Unified" },
              { value: "separated", label: "Separated" },
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
        </div>
      </div>

      {/* Muted mat — `surface="unified"` reads as one framed surface only when the
          page behind it is muted (the app does this via AppShell's `<main>` on
          bg-muted/30; the gallery has no AppShell, so the demo supplies it).
          The blue `--primary` override is BrickShop's brand, scoped to this
          surface: the donor default stays neutral slate; each app brings its own
          accent. One token re-skins every primary action, accent figure, badge,
          and ProgressTracker dot. */}
      <div
        className="rounded-xl bg-muted/50 p-4 sm:p-6"
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
          surface={surface}
          width={width}
          header={
            <DetailOverviewHeader
              title={<span className="font-mono">{o.number}</span>}
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
                  <Button variant="outline" size="sm">
                    Invoice
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Button size="sm">Mark as shipped</Button>
                </>
              }
            />
          }
          summary={
            <>
              {/* Revenue & profit at a glance — MetricList with a disclosure */}
              <DetailSection title="Revenue & profit">
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
                    accent
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
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[8px] font-mono text-muted-foreground">
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
                      <div className="text-center font-mono text-[13px] tabular-nums text-muted-foreground">
                        {li.qty}
                      </div>
                      <div className="text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {fmtEUR(li.unitPrice)}
                      </div>
                      <div className="text-right font-mono text-[13px] font-semibold tabular-nums text-foreground">
                        {fmtEUR(li.qty * li.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t-2 border-border pt-3">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                    Items subtotal
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
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
                    <span className="font-mono text-base font-semibold tabular-nums text-primary">
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
                      <span className="font-mono text-[10px] text-muted-foreground">
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
            ? "font-mono tabular-nums text-muted-foreground"
            : "font-mono tabular-nums text-foreground"
        }
      >
        {v}
      </span>
    </div>
  );
}
