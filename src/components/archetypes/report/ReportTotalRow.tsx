import * as React from "react";
import { cn } from "@/lib/utils";

export type ReportTotalRowProps = {
  /** Row label (e.g. "Zwischensumme", "MwSt. 19 %", "Gesamt"). Stays sans. */
  label: React.ReactNode;
  /**
   * Pre-formatted figure (e.g. `fmtEUR(total)`). Rendered `font-mono
   * tabular-nums` — the row never formats. The caller pre-formats via Intl.
   */
  value: React.ReactNode;
  /**
   * The grand-total row. Tints the row (`bg-muted/50 rounded-md`), bolds the
   * label, and enlarges the figure. At most one per totals stack.
   */
  total?: boolean;
  className?: string;
};

/**
 * ReportTotalRow — one row in a report's right-aligned totals stack.
 *
 * Default: a quiet label/figure pair (subtotal, tax) — muted label, mono
 * value. `total`: the highlighted grand-total — tinted, bolder, larger figure.
 *
 * Compose inside a right-aligned `~w-60` column:
 *   <div className="ml-auto flex w-60 flex-col gap-1.5">
 *     <ReportTotalRow label="Zwischensumme" value={fmtEUR(net)} />
 *     <ReportTotalRow label="MwSt. 19 %" value={fmtEUR(tax)} />
 *     <ReportTotalRow label="Gesamt" value={fmtEUR(gross)} total />
 *   </div>
 */
export function ReportTotalRow({
  label,
  value,
  total = false,
  className,
}: ReportTotalRowProps): React.ReactElement {
  if (total) {
    return (
      <div
        className={cn(
          "mt-1.5 flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2.5",
          className,
        )}
      >
        <span className="text-[13px] font-semibold text-foreground">
          {label}
        </span>
        <span className="font-mono text-base font-semibold tabular-nums text-foreground">
          {value}
        </span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-3 text-[13px] text-muted-foreground",
        className,
      )}
    >
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

ReportTotalRow.displayName = "ReportTotalRow";
