import * as React from "react";
import { cn } from "@/lib/utils";

export type BoardCardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * BoardCard — one draggable card in a `<BoardColumn>`. Presentational chrome
 * only; it forwards its ref and spreads `...rest` so the consumer attaches its
 * DnD draggable (`draggable`, `onDragStart`, or dnd-kit `attributes`/`listeners`
 * + `ref`). The card never moves itself — moves are the consumer's state change.
 */
export const BoardCard = React.forwardRef<HTMLDivElement, BoardCardProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-md border bg-card p-3 text-[13px]",
        rest.onClick && "cursor-pointer",
        rest.draggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);

BoardCard.displayName = "BoardCard";
