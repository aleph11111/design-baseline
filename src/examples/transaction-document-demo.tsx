/**
 * transaction-document (Td) — sandbox demo.
 *
 * Three documents through one shell, switched by the demo control above it:
 * a sales order (nine actions, a long title, a ledger locked to BrickLink), an
 * offer in valuation (editable "Our offer" column, the offer's own columns)
 * and a purchase order. Each declares its own ledger columns; the shell
 * places every slot. Demo-only — not shipped in the package.
 */
import * as React from "react";
import { Copy, FileDown, Mail, Printer, RotateCcw, Truck, Undo2, XCircle, Gift, Send, PackageCheck } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  TransactionDocumentShell,
  type LedgerColumn,
  type LedgerRow,
  type TransactionDocumentShellProps,
} from "@/components/archetypes/transaction-document";

type Variant = "order" | "offer" | "purchase";
const noop = () => {};

function HistoryList({ items }: { items: [string, string][] }) {
  return (
    <ol className="space-y-2 text-sm">
      {items.map(([when, what]) => (
        <li key={when + what} className="flex flex-wrap gap-x-3">
          <span className="tabular-nums text-muted-foreground">{when}</span>
          <span>{what}</span>
        </li>
      ))}
    </ol>
  );
}

const sum = (rows: LedgerRow[], key: string) => rows.reduce((t, r) => t + (r.values[key] ?? 0), 0);

// --- Sales order ------------------------------------------------------------

const ORDER_COLUMNS: LedgerColumn[] = [
  { key: "charged", label: "Charged", kind: "currency", priority: 1 },
  { key: "cost", label: "Cost", kind: "currency", priority: 2 },
  { key: "profit", label: "Profit", kind: "currency", priority: 3 },
  { key: "margin", label: "Margin", kind: "percent", priority: 4 },
];
const orderLine = (id: string, label: string, detail: string, charged: number, cost: number): LedgerRow => ({
  id,
  label,
  detail,
  values: { charged, cost, profit: charged - cost, margin: ((charged - cost) / charged) * 100 },
});
const ORDER_ROWS = [
  orderLine("1", "Millennium Falcon (UCS)", "75192-1 · used, complete", 689, 512.4),
  orderLine("2", "Hogwarts Castle", "71043-1 · new, sealed", 429.9, 318),
  orderLine("3", "Shipping DHL Paket", "fee", 14.9, 9.49),
];
const orderTotal = orderLine("total", "Total", "", sum(ORDER_ROWS, "charged"), sum(ORDER_ROWS, "cost"));

function salesOrder(): TransactionDocumentShellProps {
  return {
    title: "Millennium Falcon UCS 75192, Hogwarts Castle 71043 and shipping for Bricks & Co. Trading GmbH, Hamburg",
    backHref: "#",
    backLabel: "Orders",
    identity: {
      id: "SO-2026-0412",
      status: "Paid",
      attention: "Address unverified",
      summary: "BrickLink order from Bricks & Co., paid on 4 Nov by PayPal, waiting to ship.",
      chain: [{ label: "BrickLink order 2981734", href: "#" }, { label: "Sales order" }, { label: "Invoice RE-2026-0388", href: "#" }],
    },
    actions: {
      secondary: [
        { label: "Print packing slip", icon: Printer, onSelect: noop },
        { label: "Email customer", icon: Mail, onSelect: noop },
        { label: "Download PDF", icon: FileDown, onSelect: noop },
        { label: "Duplicate", icon: Copy, onSelect: noop },
      ],
      menu: [
        { label: "Create return", icon: Undo2, onSelect: noop },
        { label: "Refund", icon: RotateCcw, onSelect: noop },
        { label: "Mark as gift", icon: Gift, onSelect: noop },
        { label: "Cancel order", icon: XCircle, onSelect: noop, destructive: true },
      ],
    },
    nextStep: {
      title: "Ship the order",
      description: "Pack 2 sets, print the DHL label and hand the parcel over.",
      primary: { label: "Mark as shipped", icon: Truck, onSelect: noop },
      sideEffects: [
        { label: "Invoice RE-2026-0388 created on payment", state: "done", link: { label: "Open", href: "#" } },
        { label: "BrickLink status set to Shipped on ship", state: "pending" },
        { label: "Tracking email to the customer", state: "pending" },
      ],
    },
    ledger: { columns: ORDER_COLUMNS, rows: ORDER_ROWS, totals: [orderTotal] },
    locks: { ledger: { reason: "Lines come from BrickLink — change them there.", wayOut: { label: "Open in BrickLink", href: "#" } } },
    facts: [
      { label: "Customer", value: "Bricks & Co. Trading GmbH", change: { label: "Change", href: "#" } },
      { label: "Ordered", value: new Date("2026-11-03T10:12:00"), kind: "date" },
      { label: "Payment", value: "PayPal · paid 4 Nov 2026" },
      {
        label: "Shipping address",
        value: "Speicherstadt 12, 20457 Hamburg, DE",
        lock: { reason: "Address locked — the label is printed.", wayOut: { label: "Create a replacement label", onSelect: noop } },
      },
      { label: "Sets", value: 2, kind: "count" },
      { label: "Sales channel", value: "BrickLink" },
    ],
    history: (
      <HistoryList
        items={[
          ["4 Nov 09:41", "Payment received (PayPal)"],
          ["4 Nov 09:41", "Invoice RE-2026-0388 created"],
          ["3 Nov 10:12", "Order imported from BrickLink"],
        ]}
      />
    ),
  };
}

// --- Offer (valuation) -------------------------------------------------------

const OFFER_COLUMNS: LedgerColumn[] = [
  { key: "ask", label: "Their ask", kind: "currency", priority: 3 },
  { key: "market", label: "Market", kind: "currency", priority: 2 },
  { key: "max", label: "Max", kind: "currency", priority: 4 },
  { key: "ours", label: "Our offer", kind: "currency", priority: 1, editable: true },
  { key: "profit", label: "Profit", kind: "currency", priority: 2 },
];
const OFFER_SEED: LedgerRow[] = [
  { id: "a", label: "Ninjago City", detail: "70620-1 · used", values: { ask: 210, market: 289, max: 220, ours: 195 } },
  { id: "b", label: "Ghostbusters Firehouse", detail: "75827-1 · used, no box", values: { ask: 240, market: 312, max: 235, ours: 225 } },
  { id: "c", label: "Assembly Square", detail: "10255-1 · new", values: { ask: 190, market: 248, max: 190, ours: 180 } },
];
const withProfit = (r: LedgerRow): LedgerRow => ({ ...r, values: { ...r.values, profit: (r.values.market ?? 0) - (r.values.ours ?? 0) } });

function useOffer(): TransactionDocumentShellProps {
  const [rows, setRows] = React.useState(OFFER_SEED);
  const lines = rows.map(withProfit);
  const total: LedgerRow = { id: "total", label: "Total", values: Object.fromEntries(OFFER_COLUMNS.map((c) => [c.key, sum(lines, c.key)])) };
  return {
    title: "Offer to Jana Petersen",
    backHref: "#",
    backLabel: "Offers",
    identity: {
      id: "AN-2026-0077",
      status: "Valuation",
      summary: "Three sets Jana wants to sell; price each one, then send the offer.",
      chain: [{ label: "Lead L-0912", href: "#" }, { label: "Valuation" }, { label: "Offer" }, { label: "Purchase order" }],
    },
    actions: { secondary: [{ label: "Preview offer", icon: FileDown, onSelect: noop }], menu: [{ label: "Discard offer", destructive: true, onSelect: noop }] },
    nextStep: {
      title: "Price every set",
      description: "Our offer stays at or under Max. 3 of 3 sets priced.",
      primary: { label: "Send offer", icon: Send, onSelect: noop },
    },
    ledger: {
      columns: OFFER_COLUMNS,
      rows: lines,
      totals: [total],
      onCellChange: (rowId, key, value) =>
        setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, values: { ...r.values, [key]: value } } : r))),
    },
    facts: [
      { label: "Seller", value: "Jana Petersen", change: { label: "Change", href: "#" } },
      { label: "Received", value: new Date("2026-11-06T15:30:00"), kind: "date" },
      { label: "Offer valid for", value: 14, kind: "count", change: { label: "Change", onSelect: noop } },
      { label: "Pickup", value: "Seller ships, we pay postage" },
    ],
    history: <HistoryList items={[["6 Nov 15:30", "Lead converted to valuation"]]} />,
  };
}

// --- Purchase order ----------------------------------------------------------

const PO_COLUMNS: LedgerColumn[] = [
  { key: "cost", label: "Cost", kind: "currency", priority: 1 },
  { key: "market", label: "Expected market value", kind: "currency", priority: 2 },
  { key: "margin", label: "Expected margin", kind: "percent", priority: 3 },
];
const poLine = (id: string, label: string, detail: string, cost: number, market: number): LedgerRow => ({
  id,
  label,
  detail,
  values: { cost, market, margin: ((market - cost) / market) * 100 },
});
const PO_ROWS = [
  poLine("a", "Ninjago City", "70620-1 · used", 195, 289),
  poLine("b", "Ghostbusters Firehouse", "75827-1 · used, no box", 225, 312),
  poLine("c", "Assembly Square", "10255-1 · new", 180, 248),
];

function purchaseOrder(): TransactionDocumentShellProps {
  return {
    title: "Purchase from Jana Petersen",
    backHref: "#",
    backLabel: "Purchase orders",
    identity: {
      id: "PO-2026-0031",
      status: "Awaiting parcel",
      summary: "Offer accepted on 7 Nov; the seller ships three sets to us.",
      chain: [{ label: "Lead L-0912", href: "#" }, { label: "Offer AN-2026-0077", href: "#" }, { label: "Purchase order" }],
    },
    actions: { secondary: [{ label: "Print", icon: Printer, onSelect: noop }] },
    nextStep: {
      title: "Receive the parcel",
      description: "Check each set against the offer, then book it into stock.",
      primary: { label: "Receive goods", icon: PackageCheck, onSelect: noop },
      sideEffects: [
        { label: "Payment to seller on receipt", state: "pending" },
        { label: "Postage label sent to the seller", state: "done" },
        { label: "Stock lots created on receipt", state: "failed", link: { label: "Retry", onSelect: noop } },
      ],
    },
    ledger: { columns: PO_COLUMNS, rows: PO_ROWS, totals: [poLine("total", "Total", "", sum(PO_ROWS, "cost"), sum(PO_ROWS, "market"))] },
    facts: [
      { label: "Seller", value: "Jana Petersen" },
      { label: "Accepted", value: new Date("2026-11-07T11:02:00"), kind: "date" },
      { label: "Payout", value: "Bank transfer on receipt", change: { label: "Change", href: "#" } },
      { label: "Tracking", value: "DHL 00340434161094042557" },
    ],
    history: <HistoryList items={[["7 Nov 11:02", "Offer accepted"], ["6 Nov 15:30", "Offer sent"]]} />,
  };
}

export function TransactionDocumentDemo() {
  const [variant, setVariant] = React.useState<Variant>("order");
  const offer = useOffer();
  const props = variant === "order" ? salesOrder() : variant === "offer" ? offer : purchaseOrder();
  return (
    <div className="space-y-5">
      {/* Demo control, not page chrome: switches between the three consumers. */}
      <SegmentedControl
        value={variant}
        onValueChange={(v) => setVariant(v as Variant)}
        options={[
          { value: "order", label: "Sales order" },
          { value: "offer", label: "Offer" },
          { value: "purchase", label: "Purchase order" },
        ]}
        aria-label="Document type"
      />
      <TransactionDocumentShell key={variant} {...props} />
    </div>
  );
}
