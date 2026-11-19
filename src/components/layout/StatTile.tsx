"use client";
import * as React from "react";
import { cn } from "../../lib/utils";
import { OVERLINE_CLASS } from "./overline";
import { useCompactDensity } from "../ui/toolbar-band";

export type StatTileProps = {
  /**
   * Short label. Rendered as the muted 12px sentence-case label above the value via `OVERLINE_CLASS`
   * — matching the section-title signature.
   */
  label: React.ReactNode;
  /**
   * Display value. Rendered at `text-display-stat` (34px, ADR-0007 §2) —
   * the headline-figure step — `tabular-nums` at regular weight (ADR-0009).
   * When the underlying data is unavailable, pass the em-dash string `"—"` —
   * the primitive does NOT auto-render a placeholder for falsy values; the
   * consumer is in control.
   *
   * Consumers may pre-format the value (e.g. `fmtCurrency(amount)`); the tile
   * never formats. Values with an inline icon pass a span:
   * `<span className="inline-flex items-center gap-1">…</span>`.
   */
  value: React.ReactNode;
  /**
   * The context line: a comparison, period, or delta under the value (e.g.
   * "+4% vs last quarter") — a KPI value never stands alone (ADR-0007 §6).
   * Reads `text-xs text-muted-foreground`. Optional because whether a given
   * tile *has* context is data, not appearance — the tile renders no
   * placeholder when omitted.
   */
  hint?: React.ReactNode;
  className?: string;
};

/**
 * StatTile — one cell inside a `<StatTileRow>` KPI strip.
 *
 * Shared layout primitive (used by detail-overview's `stats` slot and the
 * analytics-dashboard KPI row). Visual contract:
 *   [Label (12px medium muted)]
 *   [value (display-stat mono semibold tabular)]
 *   [hint — the context line (xs muted, optional)]
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
  // compact step (ADR-0017): ~60px tile; touch keeps the roomy one
  const compact = useCompactDensity();
  return (
    <div className={cn(compact ? "px-4 py-2" : "px-5 py-4", className)}>
      <div className={OVERLINE_CLASS}>{label}</div>
      <div className={cn(compact ? "mt-1 text-2xl" : "mt-1.5 text-display-stat", "leading-none text-foreground tabular-nums")}>
        {value}
      </div>
      {hint && (
        <div className={cn(compact ? "mt-1" : "mt-2", "text-xs text-muted-foreground")}>{hint}</div>
      )}
    </div>
  );
}

StatTile.displayName = "StatTile";
