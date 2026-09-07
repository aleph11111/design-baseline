import * as React from "react";
import { cn } from "../../../lib/utils";
import { FigureTable, FigureRow } from "../shared";

/**
 * The report's fixed line-item grid: name (fluid) · qty (3rem) · unit (5.5rem)
 * · sum (6rem). Static — visible to the Tailwind scanner. `items-center` is a
 * row-level concern (header cells are single-line) and composes on `FigureRow`.
 */
const REPORT_GRID = "grid grid-cols-[1fr_3rem_5.5rem_6rem] gap-x-3";

/** Name / qty centered / unit right / sum right — the report's canonical header set. */
const REPORT_HEADER_ALIGN: readonly ("left" | "center" | "right")[] = [
  "left",
  "center",
  "right",
  "right",
];

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
 * Thin wrapper over the shared figure-table (`FigureTable`): the report owns
 * its fixed four-column grid and the 9.5px column-header overlines so every
 * report (invoice, quote, statement) shares one table signature. Rows are
 * `<ReportLineRow>`; the header row is rendered automatically from `columns`.
 */
export function ReportLineTable({
  columns = ["Position", "Qty", "Unit", "Sum"],
  children,
  className,
}: ReportLineTableProps): React.ReactElement {
  return (
    <FigureTable
      grid={REPORT_GRID}
      columns={columns}
      headerAlign={REPORT_HEADER_ALIGN}
      className={className}
    >
      {children}
    </FigureTable>
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
 * style B; the name stays sans. Thin wrapper over the shared `FigureRow` —
 * the report's only row-specific shape is the optional `meta` sub-line below
 * the name.
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
    <FigureRow
      grid={REPORT_GRID}
      label={
        <>
          <div className="truncate text-[13px] font-medium text-foreground">
            {name}
          </div>
          {meta ? (
            <div className="text-[11px] text-muted-foreground">{meta}</div>
          ) : null}
        </>
      }
      cells={[qty, unit, sum]}
      cellAlign={["center"]}
      className={cn("items-center", className)}
    />
  );
}

ReportLineRow.displayName = "ReportLineRow";
