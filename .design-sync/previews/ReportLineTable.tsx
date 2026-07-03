import * as React from "react";
import { ReportLineTable, ReportLineRow } from "design-baseline";

function fmtEUR(amount: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}
function fmtQty(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n);
}

// Default column labels (Position / Qty / Unit / Sum).
export function DefaultColumns() {
  const items = [
    { id: "li-1", name: "Plakate A2, Risodruck (4 Farben)", qty: 120, unitPrice: 3.4 },
    { id: "li-2", name: "Programmhefte, 24 Seiten geheftet", qty: 300, unitPrice: 1.15 },
    { id: "li-3", name: "Eintrittskarten, perforiert", qty: 800, unitPrice: 0.12 },
    { id: "li-4", name: "Einrichtung & Andruck", qty: 1, unitPrice: 85.0 },
  ];
  return (
    <ReportLineTable>
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
  );
}

// Localized column labels — the axis this component varies on.
export function LocalizedColumns() {
  const items = [
    { id: "li-1", name: "Beratung Fördermittelantrag", qty: 4, unitPrice: 95.0 },
    { id: "li-2", name: "Reisekosten", qty: 1, unitPrice: 42.5 },
  ];
  return (
    <ReportLineTable columns={["Leistung", "Mng", "Einzel", "Summe"]}>
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
  );
}
