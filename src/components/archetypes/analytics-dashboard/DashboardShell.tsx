"use client";
import * as React from "react";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DashboardShellProps = PageShellFrameProps & {
  /**
   * The dashboard body — a `<StatTileRow>` of KPI tiles, then a
   * `<DashboardGrid>` of widgets. Both render as hairline-divided cells inside
   * the page's one surface; the shell rules a hairline between them.
   */
  children: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DashboardShell — the G (analytics-dashboard) page, built through the one
 * `PageFrame` (ADR-0008): the title on the canvas with export/share as
 * `actions`, then one raised surface whose toolbar band carries the filters
 * (`toolbar`), then the KPI row and the widget grid as hairline-divided cells
 * — no card-in-card, no mat.
 */
export function DashboardShell({
  children,
  ...frame
}: DashboardShellProps): React.ReactElement {
  return (
    <PageFrame {...frame}>
      <div className="divide-y divide-border">{children}</div>
    </PageFrame>
  );
}

DashboardShell.displayName = "DashboardShell";
