import * as React from "react";
import { cn } from "@/lib/utils";
import { OVERLINE_CLASS } from "./overline";

export type StatTileProps = {
  /**
   * Short label. Rendered as an overline above the value:
   * `text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground`
   * — matching the section-title signature.
   */
  label: React.ReactNode;
  /**
   * Display value. Rendered at `text-2xl font-semibold tabular-nums`. When
   * the underlying data is unavailable, pass the em-dash string `"—"` — the
   * primitive does NOT auto-render a placeholder for falsy values; the
   * consumer is in control.
   *
   * Consumers may pre-format the value (e.g. `fmtCurrency(amount)`); the tile
   * never formats. Values with an inline icon pass a span:
   * `<span className="inline-flex items-center gap-1">…</span>`.
   */
  value: React.ReactNode;
  /**
   * Optional small caption rendered below the value (e.g. "vs last quarter").
   * Reads `text-xs text-muted-foreground`.
   */
  hint?: React.ReactNode;
  className?: string;
};

/**
 * StatTile — one cell inside a `<StatTileRow>` KPI strip.
 *
 * Shared layout primitive (used by detail-overview's `stats` slot and the
 * analytics-dashboard KPI row). Visual contract:
 *   [LABEL (overline xs)]
 *   [value (2xl semibold tabular)]
 *   [hint (xs muted, optional)]
 *
 * The cell carries no border of its own — the strip draws the outer boundary
 * and the hairline dividers between cells.
 */
export function StatTile({
  label,
  value,
  hint,
  className,
}: StatTileProps): React.ReactElement {
  return (
    <div className={cn("px-5 py-4", className)}>
      <div className={OVERLINE_CLASS}>{label}</div>
      <div className="mt-1.5 text-2xl font-semibold leading-none text-foreground tabular-nums">
        {value}
      </div>
      {hint && (
        <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

StatTile.displayName = "StatTile";
