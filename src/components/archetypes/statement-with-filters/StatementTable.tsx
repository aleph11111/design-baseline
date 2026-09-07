import * as React from "react";
import { cn } from "../../../lib/utils";
import {
  FigureTable,
  FigureRow,
  statementGridClass,
} from "../shared";

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
 * `StatementWithFiltersShell` body. Thin wrapper over the shared figure-table
 * (`FigureTable`): the statement owns the derived N-column grid (label column
 * fluid; numeric columns right-aligned, fixed 5.5rem — the static
 * `statementGridClass` lookup, derived once from the column count so the
 * header row and every data row always share a layout), while the 9.5px
 * column-header overlines and the hairline row dividers are the shared
 * signature, so every statement (BWA/GuV, cashflow, liquidity, variance)
 * shares one table signature.
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
  const grid = statementGridClass(columns.length - 1);
  return (
    <FigureTable grid={grid} columns={columns} className={className}>
      {children}
    </FigureTable>
  );
}

StatementTable.displayName = "StatementTable";

export type StatementRowProps = {
  /** Row label. Stays sans; right-alignment of figures is the grid's job. */
  label: React.ReactNode;
  /** Value cells, one per numeric column. Pre-formatted by the caller. */
  cells: Array<React.ReactNode>;
  /**
   * Indent step for a tree statement. Each step adds one tier of horizontal
   * padding to the label only. Not a per-call-site choice: it is keyed to the
   * row's own depth in the statement's `group -> children` data, capped at 2
   * (statement-with-filters.md Layer 6, indent keying rule) — `0` a top-level
   * row (no parent group), `1` a child of a top-level group, `2` a grandchild
   * or deeper (the terminal step; depth >= 2 stops indenting).
   */
  indent?: 0 | 1 | 2;
  /** Group/section rows render this muted, non-figure label instead of cells. */
  section?: boolean;
  className?: string;
};

/**
 * StatementRow — one hairline-divided row in a `<StatementTable>`. Numeric
 * cells are `font-mono tabular-nums`, right-aligned per house style B (the
 * terminal column is `font-semibold`) via the shared `FigureRow`; the label
 * stays sans. `section` rows render a spanning muted overline label (a
 * group/section header of a tree statement) with no figures.
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
  return (
    <FigureRow
      grid={statementGridClass(cells.length)}
      label={label}
      labelClassName={cn(
        "truncate text-[13px] text-foreground",
        indent > 0 && "pl-4",
        indent === 2 && "border-l border-border/40",
      )}
      cells={cells}
      className={className}
    />
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
 * summary line (the `FigureRow` "strong" emphasis across all cells).
 */
export function StatementTotalRow({
  label,
  cells,
  className,
}: StatementTotalRowProps): React.ReactElement {
  return (
    <FigureRow
      grid={statementGridClass(cells.length)}
      label={label}
      labelClassName="truncate text-[13px] font-semibold text-foreground"
      cells={cells}
      emphasis={cells.map(() => "strong" as const)}
      className={cn("bg-muted/40 border-t border-border", className)}
    />
  );
}

StatementTotalRow.displayName = "StatementTotalRow";
