"use client";
/**
 * MetricList / MetricRow — the compact, vertical "figures at a glance" readout.
 *
 * PROMOTED PRIMITIVE (rule-of-2): the Command Rail summary slot needs the
 * headline money rows pinned (Revenue + Gross profit for an order; Gesamtwert +
 * ARR for a deal) with the secondary figures tucked behind a disclosure. That
 * is NOT `StatTileRow` (a horizontal KPI strip that wants full width in the main
 * column) and NOT plain `KeyValueRow` (no value emphasis, no collapse). It is a
 * third, distinct shape — a ruled vertical list with an emphasized tabular value
 * and an optional "show more" tail. Lives in `src/components/layout/`.
 *
 * Visual contract:
 *   [label (sm medium)            value (lg semibold mono tabular)]   ← primary
 *   [hint  (xs muted)]
 *   ──────────────────────────────────────────────
 *   ▸ show 2 more            (disclosure → secondary MetricRows, sm)
 *
 * Composition (mirrors KeyValueList → KeyValueRow):
 *   <MetricList more={<><MetricRow .../><MetricRow .../></>}>
 *     <MetricRow label="Umsatz"   value={fmtEur(rev)} hint="inkl. Versand" emphasis />
 *     <MetricRow label="Rohertrag" value={fmtEur(gp)}  hint="Marge 34,2 %" emphasis />
 *   </MetricList>
 *
 * Key figure: a deal is valued by its ARR, so that one row reads the brand:
 *     <MetricRow label="ARR" value={fmtEur(arr)} emphasis keyFigure />
 *
 * GUTTER: rows and the disclosure trigger own the same `px-5` gutter as
 * `KeyValueRow`, with full-width dividers, so the list sits in a `flush`
 * section (`<DetailSection flush>` / `<SectionCard flush>`) and lines up with a
 * `KeyValueList` stacked below it. Don't add an outer `px-*` around it.
 *
 * IDIOM NOTE: values render `tabular-nums` at regular weight in the house sans,
 * matching the baseline figure style (ADR-0009, see `StatTile`). Keep this
 * primitive's figure treatment in step if that house style ever changes.
 */
import * as React from "react";
import { cn } from "../../lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useLabels } from "../../lib/labels";

export type MetricRowProps = {
  label: React.ReactNode;
  /** Pre-formatted by the consumer (fmtEur/fmtDate); the row never formats. */
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** Headline row: larger value. Secondary rows omit it. */
  emphasis?: boolean;
  /**
   * The entity's key figure — the one metric the entity is valued by (a deal's
   * ARR, an order's revenue). Its value reads the brand accent instead of the
   * foreground. Not a look toggle: the detail-overview contract derives it
   * from the data ("Key figure", compact metric readout), and at most one row
   * per readout carries it.
   */
  keyFigure?: boolean;
  className?: string;
};

export function MetricRow({
  label,
  value,
  hint,
  emphasis,
  keyFigure,
  className,
}: MetricRowProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-2.5",
        className,
      )}
    >
      <div className="min-w-0">
        <div
          className={cn(
            "font-medium text-foreground",
            emphasis ? "text-[13px]" : "text-[13px] text-muted-foreground",
          )}
        >
          {label}
        </div>
        {hint && (
          <div className="mt-0.5 text-[10.5px] text-muted-foreground">{hint}</div>
        )}
      </div>
      <div
        className={cn(
          "shrink-0 tabular-nums",
          keyFigure ? "text-primary" : "text-foreground",
          emphasis ? "text-base" : "text-[13px]",
        )}
      >
        {value}
      </div>
    </div>
  );
}
MetricRow.displayName = "MetricRow";

export type MetricListProps = {
  /** Always-visible headline rows. */
  children: React.ReactNode;
  /** Secondary rows revealed by the disclosure. Omit for no disclosure. */
  more?: React.ReactNode;
  /** Disclosure label. Default "Show more" — override per locale (e.g. "Mehr anzeigen"). */
  moreLabel?: string;
  /** Collapse label. Default "Show less". */
  lessLabel?: string;
  className?: string;
};

export function MetricList({
  children,
  more,
  moreLabel: moreLabelProp,
  lessLabel: lessLabelProp,
  className,
}: MetricListProps): React.ReactElement {
  const L = useLabels();
  const lessLabel = lessLabelProp ?? L.showLess;
  const moreLabel = moreLabelProp ?? L.showMore;
  const [open, setOpen] = React.useState(false);
  return (
    <div className={cn("divide-y divide-border", className)}>
      {children}
      {more && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleContent>
            <div className="divide-y divide-border border-t border-border">
              {more}
            </div>
          </CollapsibleContent>
          <CollapsibleTrigger className="flex items-center gap-1 px-5 pt-2.5 text-xs font-semibold text-primary">
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                open && "rotate-180",
              )}
            />
            {open ? lessLabel : moreLabel}
          </CollapsibleTrigger>
        </Collapsible>
      )}
    </div>
  );
}
MetricList.displayName = "MetricList";
