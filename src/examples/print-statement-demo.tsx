/**
 * print-statement-demo.tsx
 *
 * Sandbox demo for the Pr (print-statement) archetype — a print-only statement
 * route. Domain: an orchard cooperative's monthly cash statement, twelve month
 * columns plus a year total, so the body is wider than any reading column.
 *
 * The shell owns the screen-only toolbar (hint + print button), the document
 * header, the `@page` rule (A4 landscape, 12 mm) and repeating table header
 * rows. `autoPrint={false}` keeps the gallery from opening the print dialog;
 * a real print route leaves it on. Toggle State for the loading / error planes.
 *
 * Mode "Slide deck" is the second variant: a fixed 1280x720 deck, one slide
 * per printed page. `pageSize="none"` hands the page rule to the deck's own
 * `@page`, and `hideHeader` keeps the title for assistive tech only, so the
 * cover slide (the deck's visible title) starts page 1.
 */

import * as React from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { COL_HEADER_CLASS } from "@/components/layout/overline";
import { cn } from "@/lib/utils";
import { formatFigure } from "@/lib/format";
import { PrintStatementShell } from "@/components/archetypes/print-statement";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Line = { id: string; label: string; indent?: boolean; total?: boolean; base: number; swing: number };

const LINES: Line[] = [
  { id: "sales", label: "Obstverkauf Hofladen", indent: true, base: 18400, swing: 9200 },
  { id: "market", label: "Wochenmarkt", indent: true, base: 6200, swing: 3100 },
  { id: "juice", label: "Saftpresse Lohnmost", indent: true, base: 2100, swing: 4800 },
  { id: "in", label: "Einzahlungen", total: true, base: 0, swing: 0 },
  { id: "wages", label: "Saisonkräfte", indent: true, base: -7400, swing: -5200 },
  { id: "fuel", label: "Treibstoff & Geräte", indent: true, base: -1900, swing: -600 },
  { id: "trees", label: "Jungbäume & Pflege", indent: true, base: -2300, swing: -1400 },
  { id: "out", label: "Auszahlungen", total: true, base: 0, swing: 0 },
  { id: "net", label: "Netto-Cashflow", total: true, base: 0, swing: 0 },
];

/** Deterministic seasonal figure per line and month (peak in autumn). */
function amount(line: Line, month: number): number {
  const season = Math.max(0, Math.sin(((month - 3) / 12) * 2 * Math.PI));
  return Math.round(line.base + line.swing * season);
}

function row(id: string): number[] {
  const sum = (ids: string[]) => MONTHS.map((_, m) => ids.reduce((s, i) => s + (row(i)[m] ?? 0), 0));
  if (id === "in") return sum(["sales", "market", "juice"]);
  if (id === "out") return sum(["wages", "fuel", "trees"]);
  if (id === "net") return sum(["in", "out"]);
  const line = LINES.find((l) => l.id === id)!;
  return MONTHS.map((_, m) => amount(line, m));
}

const money = (v: number) => formatFigure(v, "currency", { decimals: 0 });

function CashStatementTable() {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-foreground">
          <th className={cn(COL_HEADER_CLASS, "min-w-48 px-2 py-1.5 text-left")}>Position</th>
          {MONTHS.map((m) => (
            <th key={m} className={cn(COL_HEADER_CLASS, "whitespace-nowrap px-2 py-1.5 text-right")}>
              {m}
            </th>
          ))}
          <th className={cn(COL_HEADER_CLASS, "whitespace-nowrap px-2 py-1.5 text-right")}>Jahr</th>
        </tr>
      </thead>
      <tbody>
        {LINES.map((line) => {
          const values = row(line.id);
          const year = values.reduce((s, v) => s + v, 0);
          return (
            <tr
              key={line.id}
              className={cn("border-b border-border", line.total && "font-semibold")}
            >
              <td className={cn("whitespace-nowrap px-2 py-1", line.indent && "pl-6")}>{line.label}</td>
              {[...values, year].map((v, i) => (
                <td key={i} className="whitespace-nowrap px-2 py-1 text-right tabular-nums">
                  {money(v)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const SLIDES = [
  { id: "cover", heading: "Bankenreporting Q3 2026", text: "Obsthof Talgrund eG · Ist · Juli–September" },
  { id: "cash", heading: "Liquidität", text: "Netto-Cashflow im Quartal positiv; die Ernte trägt das Herbstquartal." },
  { id: "outlook", heading: "Ausblick", text: "Saisonkräfte und Jungbäume binden Liquidität im Frühjahr." },
];

/** A body that owns its printed page: fixed 1280x720 slides, one per sheet.
 *  The cover is the deck's visible title, so it is not a heading (one h1). */
export function SlideDeck() {
  return (
    <div>
      <style>
        {`@media print {
  @page { size: 1280px 720px; margin: 0; }
  .demo-slide { break-after: page; }
  .demo-slide:last-child { break-after: auto; }
}`}
      </style>
      {SLIDES.map((slide, i) => (
        <section
          key={slide.id}
          className="demo-slide flex h-[720px] w-[1280px] flex-col justify-center gap-4 border border-border bg-card px-24 print:border-0"
        >
          <p className={cn("font-semibold tracking-tight", i === 0 ? "text-5xl" : "text-3xl")}>{slide.heading}</p>
          <p className="text-xl text-muted-foreground">{slide.text}</p>
        </section>
      ))}
    </div>
  );
}

const STATES = ["loaded", "loading", "error"] as const;
const MODES = ["statement", "deck"] as const;

export function PrintStatementDemo() {
  const [state, setState] = React.useState<(typeof STATES)[number]>("loaded");
  const [mode, setMode] = React.useState<(typeof MODES)[number]>("statement");
  const deck = mode === "deck";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          A print-only statement route: the toolbar shows on screen and is hidden in print;
          the page prints A4 landscape with 12&nbsp;mm margins and repeats the table header on
          every sheet. Loading and error replace the document, so nothing partial is printed.
          Slide deck: the deck owns its 1280×720 page rule and the title is for screen readers only.
        </p>
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            value={mode}
            onValueChange={(v) => setMode(v as (typeof MODES)[number])}
            options={[
              { value: "statement", label: "Statement" },
              { value: "deck", label: "Slide deck" },
            ]}
            aria-label="Mode"
          />
          <SegmentedControl
            value={state}
            onValueChange={(v) => setState(v as (typeof STATES)[number])}
            options={[
              { value: "loaded", label: "Loaded" },
              { value: "loading", label: "Loading" },
              { value: "error", label: "Error" },
            ]}
            aria-label="State"
          />
        </div>
      </div>

      <PrintStatementShell
        title={deck ? "Bankenreporting Q3 2026" : "Kapitalflussrechnung"}
        subtitle={deck ? undefined : "Obsthof Talgrund eG · Szenario: Ist · Geschäftsjahr 2026 · Monatlich"}
        meta={deck ? undefined : "Erstellt am 4. Nov. 2026, 09:12"}
        pageSize={deck ? "none" : "a4-landscape"}
        hideHeader={deck}
        isLoading={state === "loading"}
        error={state === "error" ? new Error("Der Bericht konnte nicht geladen werden.") : null}
        onRetry={() => setState("loaded")}
        autoPrint={false}
      >
        {deck ? <SlideDeck /> : <CashStatementTable />}
      </PrintStatementShell>
    </div>
  );
}
