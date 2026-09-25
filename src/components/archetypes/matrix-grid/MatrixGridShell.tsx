"use client";
import * as React from "react";
import { SurfaceFrame } from "../../layout/SurfaceFrame";
import type { SurfaceHeaderSlotProps } from "../../layout/SurfaceHeaderSlot";
import { cn } from "../../../lib/utils";
import { MatrixCell } from "./MatrixCell";
import { MatrixGridHead } from "./MatrixGridHead";

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
  /**
   * Renders content for empty cells. Opt-in: without it, empty cells render no
   * content (the default). Pass it when the domain distinguishes a visible
   * empty marker (e.g. `—`) from a filled value. Empty cells never get the
   * filled stamp regardless.
   */
  renderEmptyCell?: (ctx: MatrixCellContext<Cell>) => React.ReactNode;
  /** Per-cell className + optional tooltip. Used by both filled and empty cells. */
  cellStyle?: (ctx: MatrixCellContext<Cell>) => {
    className?: string;
    tooltip?: React.ReactNode;
  };
  /** Click handler. When present, cells receive `cursor-pointer select-none touch-manipulation`. */
  onCellClick?: (ctx: MatrixCellContext<Cell>) => void;

  /**
   * Optional toolbar rendered by the `<SurfaceFrame>` as a ruled band directly
   * under the on-surface header — the home for controls that drive the grid
   * (an as-of date, filters, a scope toggle). Mirrors `ListWithDetailShell`'s
   * `toolbar` slot so a data-driving matrix keeps its controls on the
   * surface, not floating above it.
   */
  toolbar?: React.ReactNode;
  /**
   * Rendered in the body in place of the grid when set — typically an empty-state
   * message. Kept inside the bounded surface so the header and `toolbar` still
   * show (e.g. an as-of control remains usable when the current date has no rows).
   */
  emptyState?: React.ReactNode;
} & SurfaceHeaderSlotProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function defaultIsFilled<Cell>(cell: Cell | undefined): boolean {
  return cell !== undefined && cell !== null;
}

export function MatrixGridShell<Cell>({
  columns,
  rows,
  rowHeaderLabel,
  getRowId,
  isFilled,
  renderCell,
  renderEmptyCell,
  cellStyle,
  onCellClick,
  kicker,
  title,
  headerActions,
  toolbar,
  emptyState,
}: MatrixGridShellProps<Cell>) {
  const isFilledFn = isFilled ?? defaultIsFilled;
  const rowIdOf = getRowId ?? ((r: MatrixRow<Cell>) => r.id);
  const clickable = onCellClick !== undefined;

  // One shared rich-tooltip key across the whole matrix (see MatrixCell for
  // why the matrix must not mount a Tooltip Root per cell).
  const [hoveredCellKey, setHoveredCellKey] = React.useState<string | null>(null);

  const frameProps = { kicker, title, headerActions, toolbar } as const;

  // The frame is the horizontal scroll container (`overflow="auto"`, the frame's
  // named structural mode): the sticky first column pins only while its scroll
  // container is the frame, and the header band + toolbar + table scroll together.
  if (emptyState !== undefined && emptyState !== null) {
    return (
      <SurfaceFrame {...frameProps} overflow="auto">
        {emptyState}
      </SurfaceFrame>
    );
  }

  return (
    <SurfaceFrame {...frameProps} overflow="auto">
      <table className="text-[13px] border-collapse">
        <MatrixGridHead columns={columns} rowHeaderLabel={rowHeaderLabel} />
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
                  const ctx: MatrixCellContext<Cell> = {
                    row,
                    column: col,
                    cell,
                    isFilled: isFilledFn(cell),
                  };
                  const style = cellStyle ? cellStyle(ctx) : undefined;
                  return (
                    <MatrixCell
                      key={col.key}
                      ctx={ctx}
                      content={
                        ctx.isFilled
                          ? renderCell
                            ? renderCell(ctx)
                            : null
                          : renderEmptyCell
                            ? renderEmptyCell(ctx)
                            : null
                      }
                      style={style}
                      activate={clickable ? () => onCellClick!(ctx) : undefined}
                      cellKey={`${rowKey}::${col.key}`}
                      hoveredCellKey={hoveredCellKey}
                      setHoveredCellKey={setHoveredCellKey}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </SurfaceFrame>
  );
}

MatrixGridShell.displayName = "MatrixGridShell";
