/**
 * report-demo.tsx
 *
 * Sandbox demo for the R (report) archetype — a formal document / invoice /
 * Beleg rendered as one bounded document card. Domain: a small letterpress &
 * print shop's customer invoice — deliberately far from CRM/catalogue nouns,
 * and line-item-shaped so the mono figure column carries its weight.
 *
 * Composes the full report vocabulary:
 *   - ReportShell — the bounded document surface: a kicker + title header bar
 *     (with secondary "PDF" + primary "Senden" actions) over a padded body.
 *   - body: a parties row (Von / An identity blocks + a right-aligned mono
 *     dates block) → a `<ReportLineTable>` of `<ReportLineRow>`s → a
 *     right-aligned totals stack of `<ReportTotalRow>`s with a tinted Gesamt.
 *   - House style B: every figure (money / qty / dates / IDs) mono +
 *     tabular-nums; the accent stays the donor neutral default (no baked brand).
 *
 * Types are LOCAL with zero reference to any source project's domain.
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ReportShell,
  ReportLineTable,
  ReportLineRow,
  ReportTotalRow,
} from "@/components/archetypes/report";

// ---------------------------------------------------------------------------
// Domain — a print shop invoice
// ---------------------------------------------------------------------------

type LineItem = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number; // EUR
};

type Party = {
  name: string;
  lines: string[];
};

type Invoice = {
  number: string;
  from: Party;
  to: Party;
  issuedOn: string; // ISO
  dueOn: string; // ISO
  items: LineItem[];
  taxRate: number; // e.g. 0.19
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

function fmtQty(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const INVOICE: Invoice = {
  number: "RE-2025-0417",
  from: {
    name: "Falkenberg Letterpress",
    lines: ["Gerberstraße 14", "70178 Stuttgart"],
  },
  to: {
    name: "Theaterhaus Stuttgart",
    lines: ["Siemensstraße 11", "70469 Stuttgart"],
  },
  issuedOn: "2026-06-12",
  dueOn: "2026-06-26",
  items: [
    { id: "li-1", name: "Plakate A2, Risodruck (4 Farben)", qty: 120, unitPrice: 3.4 },
    { id: "li-2", name: "Programmhefte, 24 Seiten geheftet", qty: 300, unitPrice: 1.15 },
    { id: "li-3", name: "Eintrittskarten, perforiert", qty: 800, unitPrice: 0.12 },
    { id: "li-4", name: "Einrichtung & Andruck", qty: 1, unitPrice: 85.0 },
  ],
  taxRate: 0.19,
};

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

export function ReportDemo(): React.ReactElement {
  const inv = INVOICE;
  const net = inv.items.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);
  const tax = net * inv.taxRate;
  const gross = net + tax;
  const taxPct = new Intl.NumberFormat("de-DE", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(inv.taxRate);

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-sm text-muted-foreground">
        The formal-document archetype — one bounded card holding a complete
        invoice. A <strong>kicker + title</strong> header bar carries the
        document class and its mono ID with PDF / Senden actions; the body
        stacks a <strong>parties row</strong>, a line-item table, and a
        right-aligned totals stack with a tinted <strong>Gesamt</strong>. Every
        figure is mono &amp; tabular.
      </p>

      <ReportShell
        kicker="Beleg"
        title={
          <>
            Rechnung <span className="font-mono">{inv.number}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              PDF
            </Button>
            <Button size="sm">Senden</Button>
          </>
        }
      >
        {/* Parties row — Von / An identity blocks + right-aligned mono dates */}
        <div className="mb-6 flex justify-between gap-6">
          <PartyBlock label="Von" party={inv.from} />
          <PartyBlock label="An" party={inv.to} />
          <div className="space-y-1 text-right text-[13px] text-muted-foreground">
            <div>
              Datum{" "}
              <span className="ml-1 font-mono tabular-nums text-foreground">
                {fmtDate(inv.issuedOn)}
              </span>
            </div>
            <div>
              Fällig{" "}
              <span className="ml-1 font-mono tabular-nums text-foreground">
                {fmtDate(inv.dueOn)}
              </span>
            </div>
          </div>
        </div>

        {/* Line-item table */}
        <ReportLineTable columns={["Position", "Mng", "Einzel", "Summe"]}>
          {inv.items.map((li) => (
            <ReportLineRow
              key={li.id}
              name={li.name}
              qty={fmtQty(li.qty)}
              unit={fmtEUR(li.unitPrice)}
              sum={fmtEUR(li.qty * li.unitPrice)}
            />
          ))}
        </ReportLineTable>

        {/* Totals stack */}
        <div className="mt-4 flex justify-end">
          <div className="flex w-60 flex-col gap-1.5">
            <ReportTotalRow label="Zwischensumme" value={fmtEUR(net)} />
            <ReportTotalRow label={`MwSt. ${taxPct}`} value={fmtEUR(tax)} />
            <ReportTotalRow label="Gesamt" value={fmtEUR(gross)} total />
          </div>
        </div>
      </ReportShell>
    </div>
  );
}

ReportDemo.displayName = "ReportDemo";

/** One party identity block — overline label, bold name, address lines. */
function PartyBlock({
  label,
  party,
}: {
  label: string;
  party: Party;
}): React.ReactElement {
  return (
    <div className="text-[13px] leading-relaxed text-muted-foreground">
      <div className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </div>
      <div className="font-semibold text-foreground">{party.name}</div>
      {party.lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
