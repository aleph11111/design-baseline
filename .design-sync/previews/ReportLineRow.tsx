import * as React from "react";
import { ReportLineTable, ReportLineRow } from "design-baseline";

// ReportLineRow only renders meaningfully inside a ReportLineTable (the
// hairline dividers + column grid live on the parent), so every cell wraps it.
function fmtEUR(amount: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}

// Plain rows — name + mono qty/unit/sum figures.
export function PlainRows() {
  return (
    <ReportLineTable>
      <ReportLineRow name="Plakate A2, Risodruck (4 Farben)" qty="120" unit={fmtEUR(3.4)} sum={fmtEUR(408)} />
      <ReportLineRow name="Programmhefte, 24 Seiten geheftet" qty="300" unit={fmtEUR(1.15)} sum={fmtEUR(345)} />
    </ReportLineTable>
  );
}

// A row with a secondary meta line under the name.
export function WithMeta() {
  return (
    <ReportLineTable>
      <ReportLineRow
        name="Einrichtung & Andruck"
        meta="Rüstzeit inkl. Probedruck"
        qty="1"
        unit={fmtEUR(85)}
        sum={fmtEUR(85)}
      />
      <ReportLineRow
        name="Eintrittskarten, perforiert"
        meta="inkl. Nummerierung"
        qty="800"
        unit={fmtEUR(0.12)}
        sum={fmtEUR(96)}
      />
    </ReportLineTable>
  );
}
