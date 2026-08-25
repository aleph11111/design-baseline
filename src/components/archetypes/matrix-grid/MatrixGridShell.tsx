import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SurfaceFrame } from "@/components/layout/SurfaceFrame";
import type { SurfaceHeaderSlotProps } from "@/components/layout/SurfaceHeaderSlot";
import { cn } from "@/lib/utils";
import { getInteractiveRowProps, interactiveRowFocusRing } from "../shared";

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

function MatrixGridShellInner<Cell>({
  columns,
  rows,
  rowHeaderLabel,
  getRowId,
  isFilled,
  renderCell,
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

  // A dense R×C matrix must not mount one Tooltip Root per cell (heavy mount
  // cost, memory, re-render surface for a feature that only ever shows one
  // tooltip at a time). Plain-text tooltips skip Radix entirely via the native
  // `title` attribute; rich content shares a single Tooltip, mounted only for
  // the currently-hovered cell.
  const [hoveredCellKey, setHoveredCellKey] = React.useState<string | null>(null);

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

  // The frame is the horizontal scroll container (`overflow="auto"`, the frame's
  // named structural mode): the sticky first column pins only while its scroll
  // container is the frame, and the header band + toolbar + table scroll together.
  return (
    <SurfaceFrame
      kicker={kicker}
      title={title}
      headerActions={headerActions}
      overflow="auto"
      toolbar={toolbar}
    >
      {emptyState !== undefined && emptyState !== null ? (
        emptyState
      ) : (
      <table className="text-[13px] border-collapse">
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
                  const activate = clickable ? () => onCellClick!(ctx) : undefined;

                  const tooltip = style?.tooltip;
                  const hasTooltip = tooltip !== undefined && tooltip !== null;
                  const isPlainTextTooltip =
                    typeof tooltip === "string" || typeof tooltip === "number";
                  const isRichTooltip = hasTooltip && !isPlainTextTooltip;
                  const cellKey = `${rowKey}::${col.key}`;

                  const td = (
                    <td
                      key={col.key}
                      data-filled={filled ? "" : undefined}
                      className={cn(
                        "px-2 py-2 text-center border-r border-border/60",
                        clickable && "cursor-pointer select-none touch-manipulation",
                        clickable && interactiveRowFocusRing,
                        style?.className,
                      )}
                      title={isPlainTextTooltip ? String(tooltip) : undefined}
                      onClick={activate}
                      onMouseEnter={
                        isRichTooltip ? () => setHoveredCellKey(cellKey) : undefined
                      }
                      onMouseLeave={
                        isRichTooltip
                          ? () => setHoveredCellKey((k) => (k === cellKey ? null : k))
                          : undefined
                      }
                      {...getInteractiveRowProps(activate)}
                    >
                      {content}
                    </td>
                  );

                  if (isRichTooltip && hoveredCellKey === cellKey) {
                    return (
                      <Tooltip key={col.key} defaultOpen>
                        <TooltipTrigger asChild>{td}</TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
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
      )}
    </SurfaceFrame>
  );
}

// Preserve generic across forwardRef wrapping (same pattern as ListWithDetailShell).
export const MatrixGridShell = MatrixGridShellInner as <Cell>(
  props: MatrixGridShellProps<Cell>,
) => React.ReactElement | null;

(MatrixGridShell as { displayName?: string }).displayName = "MatrixGridShell";
