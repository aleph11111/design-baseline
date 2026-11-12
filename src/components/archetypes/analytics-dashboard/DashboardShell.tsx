"use client";
import * as React from "react";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";
import { SurfaceFrame } from "../../layout/SurfaceFrame";
import { has } from "../../layout/ToolbarBand";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DashboardShellProps = PageShellFrameProps & {
  /**
   * The dashboard body — a `<StatTileRow>` of KPI tiles, then a
   * `<DashboardGrid>` of widgets. The KPI row is one raised card and each
   * widget is its own raised card, on the canvas (ADR-0015).
   */
  children: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DashboardShell — the G (analytics-dashboard) page, built through the one
 * `PageFrame` (ADR-0008) as a section-card stack (ADR-0015): the title on the
 * canvas with export/share as `actions`, then a band-only first card holding
 * the filters (`toolbar`) when any are set, then the KPI row as one raised card
 * and one raised card per widget, a canvas gap between them.
 */
export function DashboardShell({
  children,
  ...frame
}: DashboardShellProps): React.ReactElement {
  const hasBand = has(frame.toolbar) || has(frame.viewSwitch) || has(frame.count) || has(frame.viewOptions);
  return (
    <PageFrame {...frame} body="stack">
      {/* First child is not a card: the band rides on an empty one (ADR-0015 rule 5). */}
      {hasBand && <SurfaceFrame>{null}</SurfaceFrame>}
      {children}
    </PageFrame>
  );
}

DashboardShell.displayName = "DashboardShell";
