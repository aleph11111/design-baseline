"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";

/**
 * The one first-column width rule for archetype tables at phone width: a label
 * (first) column never narrower than ~8ch, never wider than ~40% of the table's
 * scroll box. Put it on the column's inner content (not the cell — table cells
 * ignore `max-width`); the cap subtracts 2rem for the cell's own padding and
 * border (`px-3`/`px-4` + `border-r`), so the COLUMN, not just its text, stays
 * within ~40%. `cqw` resolves against the
 * nearest `@container` (e.g. a {@link ScrollCue} scroller) and falls back to the
 * viewport without one.
 */
export const FIRST_COLUMN_CLASS = "block min-w-[8ch] max-w-[calc(40cqw-2rem)] truncate";

export type ScrollCueProps = {
  /** Classes on the outer, `relative` positioning box (layout in the parent: `flex-1`, `min-w-0`). */
  className?: string;
  /** Classes on the horizontal scroller itself (`overflow-x-auto` is always set). */
  scrollClassName?: string;
  /** Background the fade runs into — default the raised surface (`from-card`); pass `from-surface-canvas` for a scroller on the page canvas. */
  cueClassName?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">;

/**
 * The shared horizontal-overflow cue: a scroller that shows a right-edge fade
 * (`data-slot="scroll-cue"`) while content lies past its right edge, and none
 * once scrolled to the end or when content fits — overlay scrollbars hide the
 * overflow otherwise. Every horizontally scrolling archetype table or strip
 * renders through it; `checkPageInvariants` fails a clipped scroller without it.
 * Extra props (e.g. `data-slot`) land on the scroller. Screen-only.
 */
export function ScrollCue({
  className,
  scrollClassName,
  cueClassName = "from-card",
  children,
  ...scrollerProps
}: ScrollCueProps): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  const [more, setMore] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    update();
    el.addEventListener("scroll", update, { passive: true });
    // Absent in jsdom (consumer tests): the cue just stays off there.
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    ro?.observe(el);
    if (ro) Array.from(el.children).forEach((c) => ro.observe(c));
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
    };
  }, [children]);
  return (
    <div className={cn("relative isolate", className)}>
      {/* data-scroll-region: this scroller is an INTENDED horizontal region (a wide
          table / matrix / board / stepper), so `nestedOverflow` in checkPageInvariants
          does not flag it for scrolling sideways — `scrollCue` (the right-edge cue)
          still governs it. Every table/board/matrix in the donor renders through here. */}
      <div
        ref={ref}
        {...scrollerProps}
        data-scroll-region
        className={cn("overflow-x-auto print:overflow-visible", scrollClassName)}
      >
        {children}
      </div>
      {more ? (
        <div
          data-slot="scroll-cue"
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l to-transparent print:hidden",
            cueClassName,
          )}
        />
      ) : null}
    </div>
  );
}

ScrollCue.displayName = "ScrollCue";
