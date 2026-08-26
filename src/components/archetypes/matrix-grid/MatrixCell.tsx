import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getInteractiveRowProps, interactiveRowFocusRing } from "../shared";
import type { MatrixCellContext } from "./MatrixGridShell";

export type MatrixCellProps<Cell> = {
  /** Resolved cell context (row, column, cell payload, isFilled). */
  ctx: MatrixCellContext<Cell>;
  /** Resolved cell content (the shell resolves `renderCell`; null for empty cells). */
  content: React.ReactNode;
  /** Resolved `cellStyle` result — per-cell className + tooltip. */
  style?: { className?: string; tooltip?: React.ReactNode };
  /** Click handler (undefined when the grid is not clickable). */
  activate: (() => void) | undefined;
  /** The composed hover key for this cell (`${rowKey}::${col.key}`). */
  cellKey: string;
  /** The grid-wide hovered-cell key — the single shared rich tooltip. */
  hoveredCellKey: string | null;
  setHoveredCellKey: React.Dispatch<React.SetStateAction<string | null>>;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * One matrix cell. Owns the `td` construction and the tooltip discrimination.
 *
 * A dense R×C matrix must not mount one Tooltip Root per cell (heavy mount
 * cost, memory, re-render surface for a feature that only ever shows one
 * tooltip at a time). Plain-text tooltips skip Radix entirely via the native
 * `title` attribute; rich content shares a single Tooltip, mounted (with
 * `defaultOpen`) only when this cell is the currently hovered one.
 */
export function MatrixCell<Cell>({
  ctx,
  content,
  style,
  activate,
  cellKey,
  hoveredCellKey,
  setHoveredCellKey,
}: MatrixCellProps<Cell>): React.ReactElement {
  const { isFilled: filled } = ctx;
  const clickable = activate !== undefined;

  const tooltip = style?.tooltip;
  const hasTooltip = tooltip !== undefined && tooltip !== null;
  const isPlainTextTooltip =
    typeof tooltip === "string" || typeof tooltip === "number";
  const isRichTooltip = hasTooltip && !isPlainTextTooltip;

  const td = (
    <td
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
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>{td}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return td;
}
