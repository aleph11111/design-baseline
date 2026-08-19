import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The governed statement's column grid. The label column is fluid; numeric
 * columns are right-aligned, fixed 5.5rem. Derived once from the column count
 * so the header row and every data row always share a layout.
 */
function statementGrid(columnCount: number) {
  return cn(
    "grid items-baseline gap-x-3",
    "grid-cols-[minmax(0,1fr)_repeat(" +
      columnCount +
      ",5.5rem)]",
  );
}

/** The tiny table-column-header overline (9.5px, per house style B). */
const COL_HEAD =
  "text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground";

export type StatementTableProps = {
  /**
   * Column header labels, label column first. The header row is rendered
   * automatically from this; each string after the first is a numeric column
   * (right-aligned, mono tabular figures).
   */
  columns: readonly string[];
  /** `<StatementRow>` / `<StatementTotalRow>` children. */
  children: React.ReactNode;
  className?: string;
};

/**
 * StatementTable — the read-only governed statement inside a
 * `StatementWithFiltersShell` body. Owns the column grid, the 9.5px
 * column-header overlines, and the hairline row dividers so every statement
 * (BWA/GuV, cashflow, liquidity, variance) shares one table signature.
 *
 * Rows are caller-composed `<StatementRow>`s (a tree of group → children is
 * expressed as indented rows, not expandable ones — the statement is
 * read-only by construction: there is no cell-editing prop anywhere).
 */
export function StatementTable({
  columns,
  children,
  className,
}: StatementTableProps): React.ReactElement {
  // `columns` is label-first: the numeric grid count is the rest.
  const grid = statementGrid(columns.length - 1);
  return (
    <div className={className}>
      <div className={cn(grid, "border-b border-border py-2", COL_HEAD)}>
        {columns.map((col, i) => (
          <div key={col} className={cn(i > 0 && "text-right")}>
            {col}
          </div>
        ))}
      </div>
      <div className="divide-y divide-border/70">{children}</div>
    </div>
  );
}

StatementTable.displayName = "StatementTable";

export type StatementRowProps = {
  /** Row label. Stays sans; right-alignment of figures is the grid's job. */
  label: React.ReactNode;
  /** Value cells, one per numeric column. Pre-formatted by the caller. */
  cells: Array<React.ReactNode>;
  /**
   * Indent level for a tree statement (0 = top level). Each level adds one
   * tier of horizontal padding to the label only.
   */
  indent?: 0 | 1 | 2;
  /** Group/section rows render this muted, non-figure label instead of cells. */
  section?: boolean;
  className?: string;
};

/**
 * StatementRow — one hairline-divided row in a `<StatementTable>`. Numeric
 * cells are `font-mono tabular-nums`, right-aligned per house style B (the
 * terminal column is `font-semibold`); the label stays sans. `section` rows
 * render a spanning muted overline label (group/section header of a tree
 * statement) with no figures.
 */
export function StatementRow({
  label,
  cells,
  indent = 0,
  section = false,
  className,
}: StatementRowProps): React.ReactElement {
  if (section) {
    // Section rows span the full grid width with a muted overline label.
    return (
      <div
        className={cn(
          "flex items-baseline py-2.5",
          "border-b border-border/40",
          "text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
          className,
        )}
      >
        <div>{label}</div>
      </div>
    );
  }
  const grid = statementGrid(cells.length);
  return (
    <div className={cn(grid, "py-2.5", className)}>
      <div
        className={cn(
          "min-w-0 truncate text-[13px] text-foreground",
          indent > 0 && "pl-4",
          indent === 2 && "border-l border-border/40",
        )}
      >
        {label}
      </div>
      {cells.map((cell, i) => (
        <div
          key={i}
          className={cn(
            "text-right font-mono text-[13px] tabular-nums",
            "text-muted-foreground",
            // Terminal column carries the per-row headline figure.
            i === cells.length - 1 && "font-semibold text-foreground",
          )}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

StatementRow.displayName = "StatementRow";

export type StatementTotalRowProps = {
  /** Total label. */
  label: React.ReactNode;
  /** Value cells, one per numeric column. Pre-formatted by the caller. */
  cells: Array<React.ReactNode>;
  className?: string;
};

/**
 * StatementTotalRow — a tinted totals row pinned at the statement's foot.
 * Same grid as a data row; the row background gets the muted tint and every
 * numeric cell is semibold foreground so the totals read as the statement's
 * summary line.
 */
export function StatementTotalRow({
  label,
  cells,
  className,
}: StatementTotalRowProps): React.ReactElement {
  const grid = statementGrid(cells.length);
  return (
    <div
      className={cn(
        grid,
        "bg-muted/40 py-2.5 border-t border-border",
        className,
      )}
    >
      <div className="min-w-0 truncate text-[13px] font-semibold text-foreground">
        {label}
      </div>
      {cells.map((cell, i) => (
        <div
          key={i}
          className="text-right font-mono text-[13px] font-semibold tabular-nums text-foreground"
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

StatementTotalRow.displayName = "StatementTotalRow";
