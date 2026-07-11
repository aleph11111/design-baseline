import * as React from "react";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "@/components/layout/SurfaceHeaderSlot";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DashboardShellProps = {
  /**
   * The primary surface body — typically a `<StatTileRow>` of KPI tiles.
   * Rendered with `px-5 py-4` padding below the header bar.
   */
  children: React.ReactNode;
  className?: string;
} & SurfaceHeaderSlotProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DashboardShell — the primary bounded surface for the analytics-dashboard (G)
 * archetype. Hosts the on-surface `<SurfaceHeader>` (kicker + title + actions)
 * at the top of the card, and the KPI / stat tile row in the body below.
 *
 * Widget cards (`<DashboardWidget>` / `<DashboardGrid>`) sit as sibling cards
 * in the same muted mat outside this shell.
 *
 * Board form pattern: wrap `<DashboardShell>` + `<DashboardGrid>` in a
 * `<div className="rounded-xl bg-muted/30 p-4 sm:p-6 space-y-4">` mat.
 */
export function DashboardShell({
  kicker,
  title,
  headerActions,
  headerFill,
  children,
  className,
}: DashboardShellProps): React.ReactElement {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card overflow-hidden",
        className,
      )}
    >
      <SurfaceHeaderSlot
        kicker={kicker}
        title={title}
        headerActions={headerActions}
        headerFill={headerFill}
      />
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

DashboardShell.displayName = "DashboardShell";
