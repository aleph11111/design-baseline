import * as React from "react";
import { cn } from "@/lib/utils";

export type BoardShellProps = {
  /** `<BoardColumn>` children, laid out as a horizontally-scrolling row. */
  children: React.ReactNode;
  className?: string;
};

/**
 * BoardShell — the horizontally-scrolling column row for a kanban-board (P)
 * archetype. Presentational only: it owns no drag-and-drop. The baseline ships no
 * DnD library (same stance as charts) — the consumer wires its own (dnd-kit,
 * native HTML5 DnD, …) onto the `<BoardColumn>` / `<BoardCard>` chrome, which
 * forward refs and spread props for exactly that.
 */
export function BoardShell({ children, className }: BoardShellProps): React.ReactElement {
  return (
    <div className={cn("flex items-start gap-4 overflow-x-auto pb-2", className)}>
      {children}
    </div>
  );
}

BoardShell.displayName = "BoardShell";
