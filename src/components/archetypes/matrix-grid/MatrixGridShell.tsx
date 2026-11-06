"use client";
import * as React from "react";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";
import { useFullBleedClass } from "../../layout/surface";
import { useIsMobile } from "../../../hooks/use-mobile";
import { cn } from "../../../lib/utils";
import { MatrixCell } from "./MatrixCell";
import { MatrixGridHead } from "./MatrixGridHead";
import {
  MatrixInspectorDock,
  MatrixInspectorSheet,
  type MatrixInspectorProps,
  type MatrixSelection,
} from "./MatrixInspector";

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
   * Selection-driven, non-modal inspector (contract Layer 6). When set, a cell
   * click asks `onBeforeSelect` and selects that cell's row/column instead of
   * calling `onCellClick`. Docked beside the narrowed, still-live grid from
   * `md`; the full-screen overlay on phone. Layout and navigation only — the
   * body owns its save model.
   */
  inspector?: MatrixInspectorProps;

  /**
   * Rendered in the body in place of the grid when set — typically an empty-state
   * message. Kept inside the page frame so the title and `toolbar` still
   * show (e.g. an as-of control remains usable when the current date has no rows).
   */
  emptyState?: React.ReactNode;
} & PageShellFrameProps;
// `actions` = verbs on the whole grid (export CSV, bulk actions);
// `toolbar` = what scopes it (an as-of date / period, filters); `count` = rows.

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
  inspector,
  emptyState,
  ...header
}: MatrixGridShellProps<Cell>) {
  const fullBleed = useFullBleedClass();
  const isMobile = useIsMobile();
  const isFilledFn = isFilled ?? defaultIsFilled;
  const rowIdOf = getRowId ?? ((r: MatrixRow<Cell>) => r.id);
  const clickable = onCellClick !== undefined || inspector !== undefined;
  const selection = inspector?.selection ?? null;

  // Every switch (grid click, prev / next, close, Escape) goes through the
  // body's guard; a blocked switch leaves selection and inspector unchanged.
  async function requestSelect(next: MatrixSelection | null) {
    if (!inspector) return;
    if (next && selection && next.rowId === selection.rowId && next.columnKey === selection.columnKey) return;
    if (inspector.onBeforeSelect && !(await inspector.onBeforeSelect(next, selection))) return;
    inspector.onSelectionChange(next);
  }
  // prev / next step the rows (lines), keeping the column.
  const at = selection ? rows.findIndex((r) => rowIdOf(r) === selection.rowId) : -1;
  const step = (d: -1 | 1) => {
    const row = at >= 0 ? rows[at + d] : undefined;
    return row && selection
      ? () => void requestSelect({ rowId: rowIdOf(row), columnKey: selection.columnKey })
      : undefined;
  };

  // One shared rich-tooltip key across the whole matrix (see MatrixCell for
  // why the matrix must not mount a Tooltip Root per cell).
  const [hoveredCellKey, setHoveredCellKey] = React.useState<string | null>(null);

  // Full-bleed archetype (ADR-0007 §1): the marker lifts AppShell's column
  // (page root only; nested in a surface it leaves the column alone).
  const frameProps = { ...header, className: fullBleed };

  // Only the table scrolls sideways: the frame clips (default mode) and an
  // inner `relative overflow-x-auto` box is the scroll container. The header
  // toolbar band stays full-width and in view, the sticky first column pins
  // against the inner box, and `relative` keeps absolutely positioned
  // descendants (sr-only labels) inside the clip.
  if (emptyState !== undefined && emptyState !== null) {
    return <PageFrame {...frameProps}>{emptyState}</PageFrame>;
  }

  const grid = (
      <div data-slot="matrix-scroll" className="relative min-w-0 flex-1 overflow-x-auto">
        <table className="text-[13px] border-collapse">
          <MatrixGridHead columns={columns} rowHeaderLabel={rowHeaderLabel} />
          <tbody>
            {rows.map((row) => {
              const rowKey = rowIdOf(row);
              const rowSelected = selection?.rowId === rowKey;
              return (
                <tr
                  key={rowKey}
                  data-selected={rowSelected ? "" : undefined}
                  className={cn("border-b border-border/60 hover:bg-muted/50", rowSelected && "bg-muted/60")}
                >
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
                        activate={
                          inspector
                            ? () => void requestSelect({ rowId: rowKey, columnKey: col.key })
                            : clickable
                              ? () => onCellClick!(ctx)
                              : undefined
                        }
                        selected={rowSelected && selection?.columnKey === col.key}
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
      </div>
  );

  if (!inspector || !selection) return <PageFrame {...frameProps}>{grid}</PageFrame>;

  const { selection: _s, onSelectionChange: _c, onBeforeSelect: _g, ...panel } = inspector;
  const nav = { onClose: () => void requestSelect(null), onPrev: step(-1), onNext: step(1) };
  return (
    <PageFrame {...frameProps}>
      {isMobile ? (
        <>
          {grid}
          <MatrixInspectorSheet {...panel} {...nav} />
        </>
      ) : (
        <div className="flex items-start gap-4">
          {grid}
          <MatrixInspectorDock {...panel} {...nav} />
        </div>
      )}
    </PageFrame>
  );
}

MatrixGridShell.displayName = "MatrixGridShell";
