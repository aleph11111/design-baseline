import * as React from "react";
import { SurfaceFrame } from "@/components/layout/SurfaceFrame";
import type { SurfaceHeaderSlotProps } from "@/components/layout/SurfaceHeaderSlot";

export type BoardShellProps = {
  /** `<BoardColumn>` children, laid out as a horizontally-scrolling row. */
  children: React.ReactNode;

  /**
   * Optional filter/search toolbar row, rendered below the on-surface header
   * and above the column area (titled branch only). Same shape as
   * `ListWithDetailShell`'s `toolbar` prop.
   */
  toolbar?: React.ReactNode;
} & SurfaceHeaderSlotProps;

/**
 * BoardShell — the horizontally-scrolling column row for a kanban-board (P)
 * archetype. Presentational only: it owns no drag-and-drop. The baseline ships no
 * DnD library (same stance as charts) — the consumer wires its own (dnd-kit,
 * native HTML5 DnD, …) onto the `<BoardColumn>` / `<BoardCard>` chrome, which
 * forward refs and spread props for exactly that.
 *
 * When `title` is set, the shell adopts the Plex Ledger board form: an on-surface
 * `<SurfaceHeader>` bar spans the top of one bounded card, with the column scroll
 * area below it.
 */
export function BoardShell({
  children,
  kicker,
  title,
  headerActions,
  toolbar,
}: BoardShellProps): React.ReactElement {
  if (title !== undefined) {
    return (
      <SurfaceFrame
        kicker={kicker}
        title={title}
        headerActions={headerActions}
        toolbar={toolbar}
      >
        <div className="flex items-start gap-4 overflow-x-auto p-4 pb-6">
          {children}
        </div>
      </SurfaceFrame>
    );
  }

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-2">
      {children}
    </div>
  );
}

BoardShell.displayName = "BoardShell";
