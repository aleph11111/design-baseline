"use client";
import * as React from "react";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";

export type StatementWithFiltersShellProps = PageShellFrameProps & {
  /**
   * The governed statement body — the read-only comparison/report table. The
   * shell pads it and wraps it in a horizontal scroll region so wide
   * statements scroll internally, not the page.
   */
  children: React.ReactNode;
};

/**
 * StatementWithFiltersShell — the F (statement-with-filters) page, built
 * through the one `PageFrame` (ADR-0008): the title on the canvas with the
 * document verbs (`actions`: export, print), then one raised surface whose
 * toolbar band carries the scoping selectors (`toolbar`) and the display
 * toggles (`viewOptions`), then the padded, horizontally scrolling statement.
 */
export function StatementWithFiltersShell({
  children,
  ...frame
}: StatementWithFiltersShellProps): React.ReactElement {
  return (
    <PageFrame {...frame}>
      <div className="relative overflow-x-auto p-4">{children}</div>
    </PageFrame>
  );
}

StatementWithFiltersShell.displayName = "StatementWithFiltersShell";
