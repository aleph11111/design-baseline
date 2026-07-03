import * as React from "react";
import {
  ReportShell,
  ReportLineTable,
  ReportLineRow,
  ReportTotalRow,
  Button,
} from "design-baseline";

// Local formatters — primitives never format; the caller pre-formats via Intl.
function fmtEUR(amount: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}
function fmtQty(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n);
}

function PartyBlock({ label, name, lines }: { label: string; name: string; lines: string[] }) {
  return (
    <div className="text-[13px] leading-relaxed text-muted-foreground">
      <div className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </div>
      <div className="font-semibold text-foreground">{name}</div>
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}

// The full document — kicker + title + PDF/Senden actions, parties row, a
// line-item table, and a right-aligned totals stack with a tinted Gesamt.
export function Invoice() {
  const items = [
    { id: "li-1", name: "Plakate A2, Risodruck (4 Farben)", qty: 120, unitPrice: 3.4 },
    { id: "li-2", name: "Programmhefte, 24 Seiten geheftet", qty: 300, unitPrice: 1.15 },
    { id: "li-3", name: "Eintrittskarten, perforiert", qty: 800, unitPrice: 0.12 },
  ];
  const net = items.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);
  const tax = net * 0.19;
  const gross = net + tax;

  return (
    <ReportShell
      kicker="Beleg"
      title={<>Rechnung <span className="font-mono">RE-2025-0417</span></>}
      actions={
        <>
          <Button variant="outline" size="sm">PDF</Button>
          <Button size="sm">Senden</Button>
        </>
      }
    >
      <div className="mb-6 flex justify-between gap-6">
        <PartyBlock label="Von" name="Falkenberg Letterpress" lines={["Gerberstraße 14", "70178 Stuttgart"]} />
        <PartyBlock label="An" name="Theaterhaus Stuttgart" lines={["Siemensstraße 11", "70469 Stuttgart"]} />
        <div className="space-y-1 text-right text-[13px] text-muted-foreground">
          <div>Datum <span className="ml-1 font-mono tabular-nums text-foreground">12.06.2026</span></div>
          <div>Fällig <span className="ml-1 font-mono tabular-nums text-foreground">26.06.2026</span></div>
        </div>
      </div>

      <ReportLineTable columns={["Position", "Mng", "Einzel", "Summe"]}>
        {items.map((li) => (
          <ReportLineRow
            key={li.id}
            name={li.name}
            qty={fmtQty(li.qty)}
            unit={fmtEUR(li.unitPrice)}
            sum={fmtEUR(li.qty * li.unitPrice)}
          />
        ))}
      </ReportLineTable>

      <div className="mt-4 flex justify-end">
        <div className="flex w-60 flex-col gap-1.5">
          <ReportTotalRow label="Zwischensumme" value={fmtEUR(net)} />
          <ReportTotalRow label="MwSt. 19 %" value={fmtEUR(tax)} />
          <ReportTotalRow label="Gesamt" value={fmtEUR(gross)} total />
        </div>
      </div>
    </ReportShell>
  );
}

// A compact receipt at the narrow `sm` width — fewer line items, no dates row.
export function CompactReceipt() {
  const items = [
    { id: "li-1", name: "Espresso", qty: 2, unitPrice: 2.8 },
    { id: "li-2", name: "Croissant", qty: 1, unitPrice: 3.2 },
  ];
  const net = items.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);

  return (
    <ReportShell kicker="Beleg" title="Quittung Nr. 118" width="sm">
      <ReportLineTable columns={["Position", "Mng", "Einzel", "Summe"]}>
        {items.map((li) => (
          <ReportLineRow
            key={li.id}
            name={li.name}
            qty={fmtQty(li.qty)}
            unit={fmtEUR(li.unitPrice)}
            sum={fmtEUR(li.qty * li.unitPrice)}
          />
        ))}
      </ReportLineTable>
      <div className="mt-4 flex justify-end">
        <div className="flex w-60 flex-col gap-1.5">
          <ReportTotalRow label="Gesamt" value={fmtEUR(net)} total />
        </div>
      </div>
    </ReportShell>
  );
}
