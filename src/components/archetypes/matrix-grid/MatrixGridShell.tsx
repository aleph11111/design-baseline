import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** One column descriptor. Adjacent columns sharing a `group` render under one merged header. */
export type MatrixColumn = {
  /** Unique key. Used for cell lookup against `MatrixRow.cells`. */
  key: string;
  /** Display label shown in the per-column header (row 2 of thead). */
  label: React.ReactNode;
  /** Optional group label shown in the banded header above the per-column header (row 1). */
  group?: string;
};

/** One row descriptor. Cells are looked up by `column.key`. Missing entries are treated as empty. */
export type MatrixRow<Cell> = {
  /** Unique row id. */
  id: string;
  /** Display label for the sticky first column. */
  label: React.ReactNode;
  /** Cell payload map keyed by `column.key`. */
  cells: Record<string, Cell>;
};

/** Context object passed to render-props (`renderCell`, `cellStyle`, `onCellClick`). */
export type MatrixCellContext<Cell> = {
  row: MatrixRow<Cell>;
  column: MatrixColumn;
  cell: Cell | undefined;
  /** True when `isFilled(cell)` returns true (default: `cell != null`). */
  isFilled: boolean;
};

export type MatrixGridShellProps<Cell> = {
  /** Column descriptors in display order. Adjacent columns with the same `group` are merged in the banded header. */
  columns: MatrixColumn[];
  /** Row descriptors in display order. */
  rows: MatrixRow<Cell>[];
  /** Heading for the sticky first column (e.g. "Customer", "Student"). */
  rowHeaderLabel?: React.ReactNode;
  /** Override the row identifier. Defaults to `row.id`. */
  getRowId?: (row: MatrixRow<Cell>) => string;
  /** Determines whether a cell is "filled". Default: `cell != null`. */
  isFilled?: (cell: Cell | undefined) => boolean;
  /** Renders content for filled cells. Empty cells render no content by default. */
  renderCell?: (ctx: MatrixCellContext<Cell>) => React.ReactNode;
  /** Per-cell className + optional tooltip. Used by both filled and empty cells. */
  cellStyle?: (ctx: MatrixCellContext<Cell>) => {
    className?: string;
    tooltip?: React.ReactNode;
  };
  /** Click handler. When present, cells receive `cursor-pointer select-none touch-manipulation`. */
  onCellClick?: (ctx: MatrixCellContext<Cell>) => void;
  /** Outer wrapper className override. */
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function defaultIsFilled<Cell>(cell: Cell | undefined): boolean {
  return cell !== undefined && cell !== null;
}

function MatrixGridShellInner<Cell>({
  columns,
  rows,
  rowHeaderLabel,
  getRowId,
  isFilled,
  renderCell,
  cellStyle,
  onCellClick,
  className,
}: MatrixGridShellProps<Cell>) {
  const isFilledFn = isFilled ?? defaultIsFilled;
  const rowIdOf = getRowId ?? ((r: MatrixRow<Cell>) => r.id);
  const clickable = onCellClick !== undefined;

  // Merge adjacent columns by group. Empty group => standalone header (no banded row 1).
  const hasAnyGroup = columns.some((c) => c.group !== undefined && c.group !== "");
  const groupSpans: { group: string | undefined; span: number; startIdx: number }[] = [];
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i]!;
    const last = groupSpans[groupSpans.length - 1];
    if (last && last.group === col.group) {
      last.span += 1;
    } else {
      groupSpans.push({ group: col.group, span: 1, startIdx: i });
    }
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border bg-card",
        className,
      )}
    >
      <table className="text-sm border-collapse">
        <thead>
          {hasAnyGroup && (
            <tr className="bg-muted/50 border-b border-border">
              <th
                className={cn(
                  "sticky left-0 z-10 bg-muted/50 border-r border-border min-w-[180px]",
                  "px-4 py-2",
                )}
              />
              {groupSpans.map(({ group, span, startIdx }) => (
                <th
                  key={`group-${startIdx}`}
                  colSpan={span}
                  className={cn(
                    "px-2 py-2 text-center font-semibold text-foreground/80",
                    "border-r border-border whitespace-nowrap",
                  )}
                >
                  {group ?? ""}
                </th>
              ))}
            </tr>
          )}
          <tr className="bg-muted/30 border-b border-border">
            <th
              className={cn(
                "sticky left-0 z-10 bg-muted/30 border-r border-border",
                "px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap",
              )}
            >
              {rowHeaderLabel}
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-2 py-2 text-center font-medium text-muted-foreground",
                  "border-r border-border whitespace-nowrap min-w-[80px]",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowKey = rowIdOf(row);
            return (
              <tr key={rowKey} className="border-b border-border/60 hover:bg-muted/50">
                <th
                  scope="row"
                  className={cn(
                    "sticky left-0 z-10 bg-card border-r border-border",
                    "px-4 py-2 text-left font-medium text-foreground whitespace-nowrap",
                    "hover:bg-muted/50",
                  )}
                >
                  {row.label}
                </th>
                {columns.map((col) => {
                  const cell = row.cells[col.key];
                  const filled = isFilledFn(cell);
                  const ctx: MatrixCellContext<Cell> = {
                    row,
                    column: col,
                    cell,
                    isFilled: filled,
                  };
                  const style = cellStyle ? cellStyle(ctx) : undefined;
                  const content = filled && renderCell ? renderCell(ctx) : null;

                  const td = (
                    <td
                      key={col.key}
                      className={cn(
                        "px-2 py-2 text-center border-r border-border/60",
                        clickable && "cursor-pointer select-none touch-manipulation",
                        style?.className,
                      )}
                      onClick={
                        clickable ? () => onCellClick!(ctx) : undefined
                      }
                    >
                      {content}
                    </td>
                  );

                  if (style?.tooltip !== undefined && style.tooltip !== null) {
                    return (
                      <Tooltip key={col.key}>
                        <TooltipTrigger asChild>{td}</TooltipTrigger>
                        <TooltipContent>{style.tooltip}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return td;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Preserve generic across forwardRef wrapping (same pattern as ListWithDetailShell).
export const MatrixGridShell = MatrixGridShellInner as <Cell>(
  props: MatrixGridShellProps<Cell>,
) => React.ReactElement | null;

(MatrixGridShell as { displayName?: string }).displayName = "MatrixGridShell";
