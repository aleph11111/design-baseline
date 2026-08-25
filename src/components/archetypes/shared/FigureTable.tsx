import * as React from "react";
import { cn } from "@/lib/utils";
import { COL_HEADER_CLASS } from "@/components/layout/overline";

/**
 * The shared figure-table signature — the hairline-divided line-item table
 * behind the report (R) and statement-with-filters (F) archetypes. The two
 * once shipped their own copies of this grid: the same 9.5px column-header
 * overline, the same `divide-y divide-border/70` body, the same mono tabular
 * figure cells with the terminal column promoted. `FigureTable`/`FigureRow`
 * own that signature once so a single edit to the header treatment or the
 * figure-cell recipe lands in both archetypes.
 *
 * The column grid is the one parameter the archetypes still own: the report
 * passes its fixed four-column template (`1fr_3rem_5.5rem_6rem`), the
 * statement passes its derived N-column form from the static `STMT` grid map
 * below — every emitted class is a static string, so the full set is visible
 * to the Tailwind scanner (the statement's old runtime `repeat(N,5.5rem)`
 * concatenation is gone).
 */

/**
 * The statement column grid as a static template per numeric column count —
 * fluid label column first, then fixed `5.5rem` numeric columns,
 * `items-baseline` aligned. Keyed by numeric column count (1–6) so the
 * N-column form composes from a static lookup instead of a runtime
 * `grid-cols-[…repeat(N,5.5rem)]` concatenation.
 */
const STMT_GRID: Record<number, string> = {
  1: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem]",
  2: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem]",
  3: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem]",
  4: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem_5.5rem]",
  5: "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem_5.5rem_5.5rem]",
  6:
    "grid items-baseline gap-x-3 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem_5.5rem_5.5rem_5.5rem]",
};

/**
 * The grid-template class for a statement table with `count` numeric columns
 * (1–6). Static lookup — throws past the table's realistic column count
 * rather than emitting an un-scanner-visible runtime class.
 */
export function statementGridClass(count: number): string {
  const grid = STMT_GRID[count];
  if (!grid) {
    throw new Error(
      `FigureTable: no static grid template for ${count} numeric columns (supported: 1–6)`,
    );
  }
  return grid;
}

export type FigureTableProps = {
  /**
   * The column grid template (static Tailwind class string) shared by the
   * header row and every data row. Report: its fixed four-column form.
   * Statement: `statementGridClass(count)` for its derived N-column form.
   */
  grid: string;
  /**
   * Column header labels, label column first. The header row is rendered
   * automatically from this.
   */
  columns: readonly React.ReactNode[];
  /**
   * Per-header-cell alignment (index-aligned with `columns`): `"left"`
   * (default for the label column), `"center"`, or `"right"`. Numeric
   * columns default to `"right"` unless overridden — the report's canonical
   * set centers `qty` and right-aligns `unit`/`sum`.
   */
  headerAlign?: readonly ("left" | "center" | "right")[];
  /** `FigureRow` / row-wrapper children. */
  children: React.ReactNode;
  className?: string;
};

/**
 * FigureTable — the hairline-divided figure table. Owns the `COL_HEADER_CLASS`
 * column-header row (the 9.5px overline scale) and the
 * `divide-y divide-border/70` row body with the bottom hairline, so the table
 * signature never drifts between archetypes. Rows share the `grid` template.
 */
export function FigureTable({
  grid,
  columns,
  headerAlign,
  children,
  className,
}: FigureTableProps): React.ReactElement {
  const headerCellClass = (i: number): string => {
    const a = headerAlign?.[i];
    if (a === "center") return "text-center";
    if (a === "right" || (i > 0 && a !== "left")) return "text-right";
    return "";
  };
  return (
    <div className={className}>
      <div className={cn(grid, "border-b border-border py-2", COL_HEADER_CLASS)}>
        {columns.map((col, i) => (
          <div key={i} className={headerCellClass(i)}>
            {col}
          </div>
        ))}
      </div>
      <div className="divide-y divide-border/70">{children}</div>
    </div>
  );
}

FigureTable.displayName = "FigureTable";

export type FigureRowProps = {
  /** The column grid template — the same one the enclosing `<FigureTable>`. */
  grid: string;
  /** The row's label / name cell. Stays sans by default. */
  label: React.ReactNode;
  /** Label-cell class overrides (indentation tiers, borders, truncation). */
  labelClassName?: string;
  /**
   * Value cells, one per numeric column. Pre-formatted by the caller.
   * `text-right font-mono text-[13px] tabular-nums text-muted-foreground`,
   * with the terminal cell promoted to `font-semibold text-foreground`.
   */
  cells: React.ReactNode[];
  /**
   * Per-cell emphasis (index-aligned with `cells`): `"strong"` renders
   * `font-semibold text-foreground` — the totals-row treatment. The terminal
   * cell is emphasized by default.
   */
  emphasis?: Array<Readonly<"default" | "strong">>;
  /**
   * Per-cell horizontal alignment (index-aligned with `cells`); the default
   * is right. The report's `qty` column is centered this way.
   */
  cellAlign?: readonly ("left" | "center" | "right")[];
  /** Row class overrides (padding, background tint). */
  className?: string;
};

/**
 * FigureRow — one hairline-divided row in a `<FigureTable>`. Figure cells
 * compose the shared mono-tabular treatment with terminal-cell promotion;
 * the label cell keeps sans, its indentation/identity composed via
 * `labelClassName`.
 */
export function FigureRow({
  grid,
  label,
  labelClassName,
  cells,
  emphasis,
  cellAlign,
  className,
}: FigureRowProps): React.ReactElement {
  const count = cells.length;
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  } as const;
  return (
    <div className={cn(grid, "py-2.5", className)}>
      <div className={cn("min-w-0", labelClassName)}>{label}</div>
      {cells.map((cell, i) => (
        <div
          key={i}
          className={cn(
            "text-right font-mono text-[13px] tabular-nums text-muted-foreground",
            cellAlign?.[i] && alignClass[cellAlign[i]],
            (emphasis?.[i] === "strong" || i === count - 1) &&
              "font-semibold text-foreground",
          )}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

FigureRow.displayName = "FigureRow";
