/**
 * transaction-document (Td) — sandbox demo.
 *
 * Three documents through one shell, switched by the demo control above it:
 * a sales order (nine actions, a long title, a ledger locked to BrickLink, a
 * warning next step, a progress line and a Profit result line), an
 * offer in valuation (editable "Our offer" column, the offer's own columns)
 * and a purchase order (editable Cost with one cell locked to the accepted
 * offer, lines added and removed inside the ledger). Each declares its own ledger columns; the shell
 * places every slot. Demo-only — not shipped in the package.
 *
 * A fourth case — the realistic "shipped, no carrier scan" warning-state order
 * (the form the ledger Total row's laptop fold is measured against) — is not
 * a strip option: it loads from the page hash (`#/a/transaction-document?variant=shipped`)
 * so the default view and its pixel baseline stay the strip's four options.
 * `check:viewports` navigates to it by URL and asserts the Total row ends at
 * most 739px down at the 1133×739 laptop window. The case mirrors the
 * consumer's sales order page (brickshop-manager `/orders/:id` →
 * `SalesOrderDocument.tsx`'s `TransactionDocumentShell`, `title={order.order_number}` —
 * a one-line order number, not a heading-sized marketing line).
 */
import * as React from "react";
import { Copy, FileDown, Mail, Printer, RotateCcw, Tag, Truck, Undo2, XCircle, Gift, Send, PackageCheck } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { formatFigure } from "@/lib/format";
import {
  TransactionDocumentShell,
  type LedgerColumn,
  type LedgerRow,
  type TransactionDocumentShellProps,
  type WorkflowStep,
} from "@/components/archetypes/transaction-document";

type Variant = "order" | "offer" | "purchase" | "shipped" | "compact";
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

/** The order's current workflow step (the work queue's "Shipped" group). */
const SHIPPED_STEP: WorkflowStep = { key: "shipped", label: "Shipped, no delivery scan", phase: "open", tone: "warning" };

const ORDER_COLUMNS: LedgerColumn[] = [
  { key: "charged", label: "Charged", kind: "currency", priority: 1 },
  { key: "cost", label: "Cost", kind: "currency", priority: 2 },
];
const orderLine = (id: string, label: string, detail: string, charged: number, cost: number): LedgerRow => ({
  id,
  label,
  detail,
  values: { charged, cost },
});
const ORDER_ROWS = [
  orderLine("1", "Millennium Falcon (UCS)", "75192-1 · used, complete", 689, 512.4),
  orderLine("2", "Hogwarts Castle", "71043-1 · new, sealed", 429.9, 318),
  orderLine("3", "Shipping DHL Paket", "fee", 14.9, 9.49),
];
const orderTotal = orderLine("total", "Total", "", sum(ORDER_ROWS, "charged"), sum(ORDER_ROWS, "cost"));
const orderProfit = sum(ORDER_ROWS, "charged") - sum(ORDER_ROWS, "cost");
const orderMargin = formatFigure((orderProfit / sum(ORDER_ROWS, "charged")) * 100, "percent", { locale: "de-DE" });

function salesOrder(): TransactionDocumentShellProps {
  return {
    title: "Millennium Falcon UCS 75192, Hogwarts Castle 71043 and shipping for Bricks & Co. Trading GmbH, Hamburg",
    backHref: "#",
    backLabel: "Orders",
    identity: {
      id: "SO-2026-0412",
      status: "Shipped",
      attention: "Address unverified",
      summary: "BrickLink order from Bricks & Co.: two sets plus shipping.",
      chain: [{ label: "BrickLink order 2981734", href: "#" }, { label: "Sales order", current: true }, { label: "Invoice RE-2026-0388", href: "#" }],
      progress: [
        // A step's date lives here once — the facts don't repeat it.
        { label: "Placed", state: "done", date: new Date("2026-11-03T10:12:00") },
        { label: "Paid", state: "done", date: new Date("2026-11-04T09:41:00") },
        { label: "Packed", state: "done", date: new Date("2026-11-04T14:20:00") },
        { label: "Label created", state: "current", date: new Date("2026-11-05T16:25:00") },
        { label: "Carrier scan", state: "pending" },
        { label: "Delivered", state: "pending" },
      ],
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
      // Keyed to the order's workflow step — the same WorkflowStep the
      // grouped-list work queue groups orders by, so tone and step match.
      step: SHIPPED_STEP,
      title: "No carrier scan 8 days after the label was created",
      description: "DHL Paket 2 kg · 358086789302 · tracking last checked: never. Either the parcel was never handed over, or tracking is not being polled.",
      primary: { label: "Refresh tracking", icon: Truck, onSelect: noop },
      secondary: [{ label: "Replacement label", icon: Tag, onSelect: noop }],
      sideEffects: [
        { label: "Invoice RE-2026-0388 created on payment", state: "done", link: { label: "Open", href: "#" } },
        { label: "Stock lots booked out on packing", state: "done" },
        { label: "BrickLink status set to Shipped on carrier scan", state: "pending" },
        { label: "Tracking email to the customer", state: "pending" },
      ],
    },
    ledger: {
      columns: ORDER_COLUMNS,
      rows: ORDER_ROWS,
      totals: [orderTotal],
      result: { label: "Profit", value: orderProfit, kind: "currency", detail: `${orderMargin} margin · target 20 %` },
    },
    locks: { ledger: { reason: "Lines come from BrickLink — change them there.", wayOut: { label: "Open in BrickLink", href: "#" } } },
    // Three grouped blocks (Ship to · Payment · Documents); the order and
    // payment dates live in the progress line, not here.
    facts: [
      {
        title: "Ship to",
        items: ["Bricks & Co. Trading GmbH", "Speicherstadt 12, 20457 Hamburg, DE"],
        subline: "orders@bricks-co.example · BrickLink",
        lock: { reason: "Address locked — the label is printed.", wayOut: { label: "Create a replacement label", onSelect: noop } },
      },
      { title: "Payment", items: ["PayPal, EUR"], subline: "received in full" },
      { title: "Documents", items: [<a key="inv" href="#" className="text-primary hover:underline">RE-2026-0388.pdf</a>], subline: "created on payment" },
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

// --- Shipped, no carrier scan ------------------------------------------------

/**
 * The realistic warning-state order: a shipped, no-carrier-scan sales order on
 * the laptop window (1133x739). Two ledger lines, the ledger compact (a locked
 * column rides the ledger's header line, not a note row), a warning next step
 * with its one failed side effect inline with the shipment line. This is the
 * shape the Total-row fold is measured against.
 */
function shippedOrder(): TransactionDocumentShellProps {
  const rows: LedgerRow[] = [
    { id: "1", label: "Millennium Falcon (UCS)", detail: "75192-1 · used, complete", values: { charged: 689, cost: 512.4 } },
    { id: "2", label: "Hogwarts Castle", detail: "71043-1 · new, sealed", values: { charged: 429.9, cost: 318 } },
  ];
  const total = { id: "total", label: "Total", values: { charged: sum(rows, "charged"), cost: sum(rows, "cost") } };
  const margin = formatFigure(((sum(rows, "charged") - sum(rows, "cost")) / sum(rows, "charged")) * 100, "percent", { locale: "de-DE" });
  const lock = { reason: "Prices come from BrickLink — change them there.", wayOut: { label: "Open in BrickLink", href: "#" } };
  return {
    // The consumer's /orders/:id titles the page with the order number (a short
    // single line), the sets living in the summary — not a long marketing title.
    title: "SO-2026-00053",
    backHref: "#",
    backLabel: "Orders",
    identity: {
      id: "SO-2026-00053",
      status: "Shipped",
      attention: "No carrier scan",
      summary: "Millennium Falcon UCS 75192 and Hogwarts Castle 71043 for Bricks & Co. Trading GmbH, Hamburg.",
      chain: [{ label: "BrickLink order 2981734", href: "#" }, { label: "Sales order", current: true }],
      progress: [
        { label: "Placed", state: "done", date: new Date("2026-11-03T10:12:00") },
        { label: "Paid", state: "done", date: new Date("2026-11-04T09:41:00") },
        { label: "Packed", state: "done", date: new Date("2026-11-04T14:20:00") },
        { label: "Label created", state: "current", date: new Date("2026-11-05T16:25:00") },
        { label: "Carrier scan", state: "pending" },
        { label: "Delivered", state: "pending" },
      ],
    },
    actions: {
      secondary: [{ label: "Print packing slip", icon: Printer, onSelect: noop }],
      menu: [{ label: "Create return", icon: Undo2, onSelect: noop }],
    },
    nextStep: {
      // A warning step; with only a failed effect left, the panel keeps the
      // failure inline with the shipment line (not a block of its own).
      step: { key: "shipped", label: "Shipped", phase: "open", tone: "warning" },
      title: "No carrier scan 8 days after the label was created",
      description: "DHL Paket 2 kg · 358086789302 · tracking last checked: never.",
      primary: { label: "Refresh tracking", icon: Truck, onSelect: noop },
      secondary: [{ label: "Replacement label", icon: Tag, onSelect: noop }],
      sideEffects: [{ label: "BrickLink status set to Shipped on carrier scan", state: "failed" }],
    },
    ledger: {
      // The locked charged column rides the ledger's header line (a lock icon),
      // not a note row above the table. No full-slot lock, so the ledger body
      // takes the compact slot offset.
      columns: ORDER_COLUMNS.map((c) => (c.key === "charged" ? { ...c, lock } : c)),
      rows,
      totals: [total],
      result: { label: "Profit", value: sum(rows, "charged") - sum(rows, "cost"), kind: "currency", detail: `${margin} margin · target 20 %` },
      compactRowLocks: true,
    },
    facts: [
      { title: "Ship to", items: ["Bricks & Co. Trading GmbH", "Speicherstadt 12, 20457 Hamburg, DE"] },
      { title: "Payment", items: ["PayPal, EUR"], subline: "received in full" },
    ],
    history: <HistoryList items={[["4 Nov 09:41", "Payment received (PayPal)"], ["3 Nov 10:12", "Order imported from BrickLink"]]} />,
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
      summary: "Our offer for three used and new sets Jana wants to sell.",
      chain: [{ label: "Lead L-0912", href: "#" }, { label: "Valuation", current: true }, { label: "Offer" }, { label: "Purchase order" }],
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
  { key: "cost", label: "Cost", kind: "currency", priority: 1, editable: true },
  { key: "market", label: "Expected market value", kind: "currency", priority: 2 },
  { key: "margin", label: "Expected margin", kind: "percent", priority: 3 },
];
const poLine = (id: string, label: string, detail: string, cost: number | null, market: number | null): LedgerRow => ({
  id,
  label,
  detail,
  values: { cost, market, margin: cost != null && market ? ((market - cost) / market) * 100 : null },
});
const PO_SEED: LedgerRow[] = [
  poLine("a", "Ninjago City", "70620-1 · used", 195, 289),
  poLine("b", "Ghostbusters Firehouse", "75827-1 · used, no box", 225, 312),
  {
    ...poLine("c", "Assembly Square", "10255-1 · new", 180, 248),
    // One cell locked, not the column: this price was agreed in the accepted offer.
    locks: { cost: { reason: "Price agreed in the accepted offer.", wayOut: { label: "Open offer AN-2026-0077", href: "#" } } },
    removable: false,
    actions: [{ label: "Open in catalog", href: "#" }],
  },
];

function usePurchaseOrder(): TransactionDocumentShellProps {
  const [rows, setRows] = React.useState(PO_SEED);
  const [added, setAdded] = React.useState(0);
  const PO_ROWS = rows.map((r) => ({ ...r, ...poLine(r.id, r.label, r.detail ?? "", r.values.cost ?? null, r.values.market ?? null) }));
  return {
    title: "Purchase from Jana Petersen",
    backHref: "#",
    backLabel: "Purchase orders",
    identity: {
      id: "PO-2026-0031",
      status: "Awaiting parcel",
      summary: "Three sets we buy from Jana, shipped to us by the seller.",
      chain: [{ label: "Lead L-0912", href: "#" }, { label: "Offer AN-2026-0077", href: "#" }, { label: "Purchase order", current: true }],
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
    ledger: {
      columns: PO_COLUMNS,
      rows: PO_ROWS,
      totals: [poLine("total", "Total", "", sum(PO_ROWS, "cost"), sum(PO_ROWS, "market"))],
      onCellChange: (rowId, key, value) =>
        setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, values: { ...r.values, [key]: value } } : r))),
      addRowLabel: "Add cost",
      onAddRow: () => {
        setAdded((n) => n + 1);
        setRows((rs) => [...rs, poLine(`extra-${added + 1}`, "Extra cost", "postage, cleaning", 0, null)]);
      },
      onRemoveRow: (rowId) => setRows((rs) => rs.filter((r) => r.id !== rowId)),
    },
    facts: [
      { label: "Seller", value: "Jana Petersen" },
      { label: "Accepted", value: new Date("2026-11-07T11:02:00"), kind: "date" },
      { label: "Payout", value: "Bank transfer on receipt", change: { label: "Change", href: "#" } },
      { label: "Tracking", value: "DHL 00340434161094042557" },
    ],
    history: <HistoryList items={[["7 Nov 11:02", "Offer accepted"], ["6 Nov 15:30", "Offer sent"]]} />,
  };
}

// --- Compact cell locks -------------------------------------------------------

/** A two-line purchase with locked Cost cells. Compact: the lock is an icon in the cell. Full: the sentence under each line (the default), for comparison. */
function compactLocks(compact: boolean): TransactionDocumentShellProps {
  const lock = { reason: "Price agreed in the accepted offer.", wayOut: { label: "Open offer AN-2026-0077", href: "#" } };
  const rows: LedgerRow[] = [
    { ...poLine("a", "Ninjago City", "70620-1 · used", 195, 289), locks: { cost: lock }, removable: false },
    { ...poLine("b", "Assembly Square", "10255-1 · new", 180, 248), locks: { cost: lock }, removable: false },
  ];
  return {
    title: "Purchase from Jana Petersen",
    backHref: "#",
    backLabel: "Purchase orders",
    identity: { id: "PO-2026-0032", status: "Awaiting parcel" },
    // Header cluster: two secondary actions + the overflow menu stay on one row from a wide column.
    actions: { secondary: [{ label: "Send email", icon: Mail, onSelect: noop }, { label: "Sync", icon: RotateCcw, onSelect: noop }], menu: [{ label: "Cancel purchase", destructive: true, onSelect: noop }] },
    nextStep: { title: "Receive the parcel", description: "Check each set against the offer, then book it into stock.", primary: { label: "Receive goods", icon: PackageCheck, onSelect: noop } },
    ledger: {
      // One locked column too: compact, its lock is an icon on the ledger's header line, not a note row above the table.
      columns: PO_COLUMNS.map((c) => (c.key === "market" ? { ...c, editable: true, lock: { reason: "Market values come from BrickLink — change them there.", wayOut: { label: "Open in BrickLink", href: "#" } } } : c)),
      rows,
      totals: [poLine("total", "Total", "", sum(rows, "cost"), sum(rows, "market"))],
      onCellChange: noop,
      compactRowLocks: compact, // lock icons: beside the locked figure and in the header for the locked column; reason and way out open from them
    },
    facts: [{ label: "Seller", value: "Jana Petersen" }],
    history: <HistoryList items={[["7 Nov 11:02", "Offer accepted"]]} />,
  };
}

// The "shipped, no scan" case arrives through the page hash (the gallery's
// HashRouter keeps it there: `#/a/transaction-document?variant=shipped`), never
// through the strip: the default view is the strip's four options, and its
// pixel baseline must not move.
const initialVariant: Variant =
  typeof window !== "undefined" && window.location.hash.includes("variant=shipped") ? "shipped" : "order";

export function TransactionDocumentDemo() {
  const [variant, setVariant] = React.useState<Variant>(initialVariant);
  const offer = useOffer();
  const purchase = usePurchaseOrder();
  const [compact, setCompact] = React.useState(true);
  const props =
    variant === "order" ? salesOrder()
      : variant === "offer" ? offer
        : variant === "shipped" ? shippedOrder()
          : variant === "compact" ? compactLocks(compact) : purchase;
  return (
    <div className="space-y-5">
      {/* Demo control, not page chrome: switches between the three consumers and the compact-locks case. */}
      <SegmentedControl
        value={variant}
        onValueChange={(v) => setVariant(v as Variant)}
        options={[
          { value: "order", label: "Sales order" },
          { value: "offer", label: "Offer" },
          { value: "purchase", label: "Purchase order" },
          { value: "compact", label: "Compact locks" },
        ]}
        aria-label="Document type"
      />
      {variant === "compact" ? (
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={compact} onCheckedChange={setCompact} aria-label="Compact locks" />
          Compact row locks (off: the default sentence under each line)
        </label>
      ) : null}
      <TransactionDocumentShell key={variant} {...props} />
    </div>
  );
}
