"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";
import { useRaisedChrome } from "../../layout/surface";

export type BoardCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Forwards to the root div (DnD consumers attach the draggable here). */
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * BoardCard — one draggable card in a `<BoardColumn>`: the raised object on the
 * canvas (ADR-0015 chrome — hairline border + raised fill, dropped only when
 * the board is nested in another raised surface). Presentational chrome
 * only; it forwards its ref and spreads `...rest` so the consumer attaches its
 * DnD draggable (`draggable`, `onDragStart`, or dnd-kit `attributes`/`listeners`
 * + `ref`). The card never moves itself — moves are the consumer's state change.
 */
export function BoardCard({ className, children, ref, ...rest }: BoardCardProps) {
  const chrome = useRaisedChrome();
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg p-3 text-[13px] text-card-foreground",
        chrome,
        rest.onClick && "cursor-pointer",
        rest.draggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

BoardCard.displayName = "BoardCard";
