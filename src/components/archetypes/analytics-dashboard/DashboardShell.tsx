import * as React from "react";
import { SurfaceHeader } from "@/components/layout/SurfaceHeader";
import { type HeaderFill } from "@/components/layout/headerFill";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DashboardShellProps = {
  // On-surface header (Plex Ledger board form). When `title` is set, the shell
  // renders a `SurfaceHeader` at the top of its bounded surface — the title +
  // actions sit ON the card, not in a separate PageHeader above it.
  /** Overline kicker above the title (e.g. "Overview", "Reporting"). */
  kicker?: React.ReactNode;
  /** Surface title. When set, the on-surface header bar renders. */
  title?: React.ReactNode;
  /** Right-aligned actions in the on-surface header (e.g. a period selector, "Export"). */
  headerActions?: React.ReactNode;
  /** Header treatment for the on-surface header (House Style B). */
  headerFill?: HeaderFill;
  /**
   * The primary surface body — typically a `<StatTileRow>` of KPI tiles.
   * Rendered with `px-5 py-4` padding below the header bar.
   */
  children: React.ReactNode;
  className?: string;
};

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
      {title !== undefined && (
        <SurfaceHeader
          kicker={kicker}
          title={title}
          actions={headerActions}
          headerFill={headerFill}
        />
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

DashboardShell.displayName = "DashboardShell";
