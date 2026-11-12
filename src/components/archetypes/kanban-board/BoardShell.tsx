"use client";
import * as React from "react";
import { PageFrame, type PageFrameProps, type PageShellFrameProps } from "../../layout/PageFrame";
import { useFullBleedClass } from "../../layout/surface";
import { SurfaceFrame } from "../../layout/SurfaceFrame";
import { has } from "../../layout/ToolbarBand";

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
 * BoardShell — the kanban-board (P) page: a `PageFrame` stack body (ADR-0015).
 * The toolbar band, when set, sits on a band-only first card; the
 * horizontally-scrolling lane row follows on the canvas, not in a card, so
 * every `<BoardCard>` is a raised card of its own. Presentational only: it owns no drag-and-drop. The baseline ships
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
  // Same band condition as PageFrame: a band-only first card only when there
  // is a band to carry (spec rule 5).
  const hasBand = has(frame.toolbar) || has(frame.viewSwitch) || has(frame.count) || has(frame.viewOptions);
  return (
    <PageFrame {...frame} body="stack" className={fullBleed}>
      {hasBand && <SurfaceFrame>{null}</SurfaceFrame>}
      <div data-slot="board-lanes" className="relative flex items-start gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </PageFrame>
  );
}

BoardShell.displayName = "BoardShell";
