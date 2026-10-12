"use client";
import * as React from "react";
import { PageFrame, type PageShellFrameProps } from "../../layout/PageFrame";
import { useFullBleedClass } from "../../layout/surface";

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
 * Full-bleed (ADR-0007 §1): a period matrix is a working surface, so it takes
 * the whole desk instead of the reading column.
 */
export function StatementWithFiltersShell({
  children,
  ...frame
}: StatementWithFiltersShellProps): React.ReactElement {
  const fullBleed = useFullBleedClass();
  return (
    <PageFrame {...frame} className={fullBleed}>
      <div className="relative overflow-x-auto p-4">{children}</div>
    </PageFrame>
  );
}

StatementWithFiltersShell.displayName = "StatementWithFiltersShell";
