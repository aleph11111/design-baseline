import * as React from "react";
import { cn } from "@/lib/utils";
import { OVERLINE_CLASS } from "@/components/layout/overline";

export type BoardColumnProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Column heading (e.g. "To do"). Rendered as the overline signature. */
  title: React.ReactNode;
  /** Optional card count shown next to the title. */
  count?: number;
  /** Optional trailing controls in the column header (an add-card button, a menu). */
  actions?: React.ReactNode;
  /** Forwards to the root div (DnD consumers attach the droppable here). */
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * BoardColumn — one column in a `<BoardShell>`: an overline header (title + count
 * + actions) over a vertical stack of `<BoardCard>`s. Drag-agnostic: the outer
 * div forwards its ref and spreads `...rest`, so the consumer attaches its DnD
 * droppable (`ref`, `onDragOver`/`onDrop`, dnd-kit listeners) here.
 */
export function BoardColumn({
  title,
  count,
  actions,
  children,
  className,
  ref,
  ...rest
}: BoardColumnProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-muted/40",
        className,
      )}
      {...rest}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h3 className={OVERLINE_CLASS}>{title}</h3>
        {count !== undefined && (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
        )}
        {actions && <div className="ml-auto flex items-center">{actions}</div>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">{children}</div>
    </div>
  );
}

BoardColumn.displayName = "BoardColumn";
