"use client";
import * as React from "react";
import type { ClassValue } from "clsx";
import { RaisedSurfaceContext } from "./surface";
import { cn } from "../../lib/utils";

export type SurfaceFrameProps = {
  children: React.ReactNode;
  /**
   * Ruled toolbar band — the frame's first band, rendered as
   * `border-b px-4 py-3` (the frame owns the band's chrome). Pass `null` for
   * "no toolbar" to skip the band. The shell composes the band's INNER layout
   * (flex rows, gap) — the frame does not prescribe it.
   */
  toolbar?: React.ReactNode;
  /**
   * Frame overflow behaviour — the frame is one bounded surface, so clipping
   * is the frame's job, not a copy the shells re-make in a body div:
   * - `"hidden"` (default): clip inner content to the card's rounding. Rendered
   *   as `overflow: clip`, not `hidden`, so the frame is not a scroll container
   *   and a sticky descendant (the detail-overview rail) sticks to the page.
   * - `"auto"`: the frame itself is the horizontal scroll container, so its
   *   toolbar band scrolls with the content. No donor shell uses it
   *   since matrix-grid v1.5, which keeps its header in view with an inner
   *   table scroller; kept for API compatibility.
   */
  overflow?: "hidden" | "auto";
  /** Passthrough for structural classes — width presets etc. Appearance is
   * NOT a frame prop (ADR-0004): the chrome string is fixed here. */
  className?: ClassValue;
  /** Forwards to the root div. */
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * SurfaceFrame — the canonical bounded surface `PageFrame` mounts (ADR-0008:
 * untitled — the page title lives in `PageHeader`, never on the frame): a flat `overflow-clip rounded-lg bg-surface-raised` card (House
 * style B — no shadow, no border: tone separates it from the canvas, ADR-0007
 * §3) with the ruled `border-b px-4 py-3` toolbar band as its one slot.
 *
 * This is the shell-level peer of `<SectionCard>` (the section-level bounded
 * surface): one frame, one owner of the chrome string — the four
 * independent spellings of "the card" the copy had produced (`shadow-sm` in
 * detail-overview, `overflow-x-auto` in matrix-grid) collapse to named modes
 * here. The shadcn `<Card>` (`ui/card.tsx`) stays a vendored leaf, untouched
 * (ADR-0004 distribution split — leaves are byte-identical across the fleet);
 * the frame does not compose it.
 *
 * Iterating the frame look baseline-wide is one edit in `FRAME_CHROME`.
 */
export function SurfaceFrame({
  children,
  toolbar,
  overflow = "hidden",
  className,
  ref,
}: SurfaceFrameProps): React.ReactElement {
  const nested = React.useContext(RaisedSurfaceContext);
  const body = (
    <>
      {toolbar != null && <div className="border-b px-4 py-3">{toolbar}</div>}
      {children}
    </>
  );

  // Raised surface: tone, not a border, separates it from the canvas; nested
  // in another raised surface it drops the fill too (ADR-0007 §3).
  return (
    <div
      ref={ref}
      className={cn(
        // relative: the frame is the containing block of absolute descendants
        // (sr-only labels), so its overflow clips them instead of them
        // widening the page.
        "relative rounded-lg",
        !nested && "bg-surface-raised",
        overflow === "auto" ? "overflow-x-auto" : "overflow-clip",
        className,
      )}
    >
      <RaisedSurfaceContext.Provider value={true}>{body}</RaisedSurfaceContext.Provider>
    </div>
  );
}

SurfaceFrame.displayName = "SurfaceFrame";
