import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared 4-column grid: name (fluid) · qty · unit · sum. */
const GRID = "grid grid-cols-[1fr_3rem_5.5rem_6rem] gap-x-3";
/** The tiny table-column-header overline (9.5px, per house style B). */
const COL_HEAD = "text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground";

export type ReportLineTableProps = {
  /**
   * Column header labels. Defaults to the canonical invoice set
   * (Position / Qty / Unit / Sum). Override for localized or non-invoice
   * documents (e.g. `["Leistung", "Mng", "Einzel", "Summe"]`).
   */
  columns?: [
    item: React.ReactNode,
    qty: React.ReactNode,
    unit: React.ReactNode,
    sum: React.ReactNode,
  ];
  /** `<ReportLineRow>` children. */
  children: React.ReactNode;
  className?: string;
};

/**
 * ReportLineTable — the hairline-divided line-item table inside a report body.
 *
 * Owns the 4-column grid and the 9.5px column-header overlines so every report
 * (invoice, quote, statement) shares one table signature. Rows are
 * `<ReportLineRow>`; the header row is rendered automatically from `columns`.
 */
export function ReportLineTable({
  columns = ["Position", "Qty", "Unit", "Sum"],
  children,
  className,
}: ReportLineTableProps): React.ReactElement {
  const [item, qty, unit, sum] = columns;
  return (
    <div className={className}>
      <div className={cn(GRID, "border-b border-border py-2", COL_HEAD)}>
        <div>{item}</div>
        <div className="text-center">{qty}</div>
        <div className="text-right">{unit}</div>
        <div className="text-right">{sum}</div>
      </div>
      <div className="divide-y divide-border/70">{children}</div>
    </div>
  );
}

ReportLineTable.displayName = "ReportLineTable";

export type ReportLineRowProps = {
  /** Line name / description. Stays sans. Optional `meta` sub-line below. */
  name: React.ReactNode;
  /** Optional secondary line under the name (`text-[11px]` muted). */
  meta?: React.ReactNode;
  /** Quantity figure (centered, mono). Pre-formatted by the caller. */
  qty: React.ReactNode;
  /** Unit-price figure (right, mono). Pre-formatted by the caller. */
  unit: React.ReactNode;
  /** Line sum figure (right, mono, semibold). Pre-formatted by the caller. */
  sum: React.ReactNode;
  className?: string;
};

/**
 * ReportLineRow — one hairline-divided row in a `<ReportLineTable>`. Figures
 * (qty / unit / sum) are `font-mono tabular-nums`, right-aligned per house
 * style B; the name stays sans.
 */
export function ReportLineRow({
  name,
  meta,
  qty,
  unit,
  sum,
  className,
}: ReportLineRowProps): React.ReactElement {
  return (
    <div className={cn(GRID, "items-center py-2.5", className)}>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium text-foreground">
          {name}
        </div>
        {meta ? (
          <div className="text-[11px] text-muted-foreground">{meta}</div>
        ) : null}
      </div>
      <div className="text-center font-mono text-[13px] tabular-nums text-muted-foreground">
        {qty}
      </div>
      <div className="text-right font-mono text-[13px] tabular-nums text-muted-foreground">
        {unit}
      </div>
      <div className="text-right font-mono text-[13px] font-semibold tabular-nums text-foreground">
        {sum}
      </div>
    </div>
  );
}

ReportLineRow.displayName = "ReportLineRow";
