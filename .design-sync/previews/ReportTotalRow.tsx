import * as React from "react";
import { ReportTotalRow } from "design-baseline";

function fmtEUR(amount: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}

// The canonical totals stack — quiet subtotal/tax rows + a tinted Gesamt.
export function TotalsStack() {
  const net = 618.4;
  const tax = net * 0.19;
  const gross = net + tax;
  return (
    <div className="flex w-60 flex-col gap-1.5">
      <ReportTotalRow label="Zwischensumme" value={fmtEUR(net)} />
      <ReportTotalRow label="MwSt. 19 %" value={fmtEUR(tax)} />
      <ReportTotalRow label="Gesamt" value={fmtEUR(gross)} total />
    </div>
  );
}

// A single quiet row on its own — the default, non-total treatment.
export function QuietRow() {
  return (
    <div className="w-60">
      <ReportTotalRow label="Skonto (2%, 10 Tage)" value={`− ${fmtEUR(12.37)}`} />
    </div>
  );
}
