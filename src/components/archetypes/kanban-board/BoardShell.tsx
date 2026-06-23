import * as React from "react";
import { SurfaceHeader } from "@/components/layout/SurfaceHeader";
import { type HeaderFill } from "@/components/layout/headerFill";
import { cn } from "@/lib/utils";

export type BoardShellProps = {
  /** `<BoardColumn>` children, laid out as a horizontally-scrolling row. */
  children: React.ReactNode;

  // On-surface header (Plex Ledger board form). When `title` is set, the shell
  // renders a `SurfaceHeader` at the top of its bounded surface — the title +
  // actions sit ON the card, not in a separate PageHeader above it.
  /** Overline kicker above the title (e.g. "Board", "Backlog"). */
  kicker?: React.ReactNode;
  /** Surface title. When set, the on-surface header bar renders. */
  title?: React.ReactNode;
  /** Right-aligned actions in the on-surface header (e.g. "+ Add card" / filter). */
  headerActions?: React.ReactNode;
  /** Header treatment for the on-surface header (House Style B). */
  headerFill?: HeaderFill;

  className?: string;
};

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
  headerFill,
  className,
}: BoardShellProps): React.ReactElement {
  if (title !== undefined) {
    return (
      <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
        <SurfaceHeader
          kicker={kicker}
          title={title}
          actions={headerActions}
          headerFill={headerFill}
        />
        <div className="flex items-start gap-4 overflow-x-auto p-4 pb-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-4 overflow-x-auto pb-2", className)}>
      {children}
    </div>
  );
}

BoardShell.displayName = "BoardShell";
