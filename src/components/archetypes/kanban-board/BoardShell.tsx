"use client";
import * as React from "react";
import { PageFrame, type PageFrameProps, type PageShellFrameProps } from "../../layout/PageFrame";
import { useFullBleedClass } from "../../layout/surface";

/** The page header's back-link slot — `BoardShell` opts into the back-link
 *  header chrome that `PageShellFrameProps` omits (a board can sit under a
 *  parent). Same three props, same names as `list-with-detail`,
 *  `detail-overview` and `form-page`. */
export type BoardShellProps = Pick<
  PageFrameProps,
  "backHref" | "backLabel" | "renderBackLink"
> & PageShellFrameProps & {
  /** `<BoardColumn>` children, laid out as a horizontally-scrolling row. */
  children: React.ReactNode;
};

/**
 * BoardShell — the kanban-board (P) page: the page title on the canvas, then
 * one raised surface (toolbar band → horizontally-scrolling column row), per
 * ADR-0008. Presentational only: it owns no drag-and-drop. The baseline ships
 * no DnD library — the consumer wires its own (dnd-kit, native HTML5 DnD, …)
 * onto the `<BoardColumn>` / `<BoardCard>` chrome, which forward refs and
 * spread props for exactly that.
 */
export function BoardShell({
  children,
  ...frame
}: BoardShellProps): React.ReactElement {
  // Full-bleed archetype (ADR-0007 §1): the marker lifts AppShell's column.
  const fullBleed = useFullBleedClass();
  return (
    <PageFrame {...frame} className={fullBleed}>
      <div className="relative flex items-start gap-4 overflow-x-auto p-4 pb-6">
        {children}
      </div>
    </PageFrame>
  );
}

BoardShell.displayName = "BoardShell";
