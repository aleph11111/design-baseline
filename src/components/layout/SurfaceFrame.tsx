"use client";
import * as React from "react";
import type { ClassValue } from "clsx";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "./SurfaceHeaderSlot";
import { RaisedSurfaceContext } from "./surface";
import { cn } from "../../lib/utils";

type SurfaceFrameSlotProps = Omit<SurfaceHeaderSlotProps, "className">;

export type SurfaceFrameProps = {
  children: React.ReactNode;
  /**
   * Ruled toolbar band — rendered directly under the on-surface header as
   * `border-b px-4 py-3` (the frame owns the band's chrome). Pass `null` for
   * "no toolbar" to skip the band. The shell composes the band's INNER layout
   * (flex rows, gap) — the frame does not prescribe it.
   */
  toolbar?: React.ReactNode;
  /**
   * Frame overflow behaviour — the frame is one bounded surface, so clipping
   * is the frame's job, not a copy the shells re-make in a body div:
   * - `"hidden"` (default): clip inner content to the card's rounding.
   * - `"auto"`: the frame is the horizontal scroll container. Named structural
   *   mode for frames that hold a horizontally-scrolling table with a sticky
   *   first column (matrix-grid — a sticky cell is only pinned while its
   *   scroll container is the frame, not a body div inside it).
   */
  overflow?: "hidden" | "auto";
  /**
   * Card chrome. `false` = chromeless — the frame drops its bounded card
   * (rounding / raised fill / overflow) and renders its header + body
   * in a plain layout div, keeping its slots' layout intact. For a shell
   * rendered flush inside an already-bounded surface that owns separation
   * (grouped-list's `<SectionCard flush>` supplies it via `ListChromeContext`);
   * mirrors `<SectionCard chrome={false}>` one level down.
   */
  chrome?: boolean;
  /** Passthrough for structural classes — width presets etc. Appearance is
   * NOT a frame prop (ADR-0004): the chrome string is fixed here. */
  className?: ClassValue;
  /** Forwards to the root div (both chrome modes). */
  ref?: React.Ref<HTMLDivElement>;
} & SurfaceFrameSlotProps;

/**
 * SurfaceFrame — the canonical bounded surface every framed archetype shell
 * mounts: a flat `overflow-hidden rounded-lg bg-surface-raised` card (House
 * style B — no shadow, no border: tone separates it from the canvas, ADR-0007
 * §3; see the report / statement-with-filters contracts) with the
 * on-surface `<SurfaceHeader>` and the ruled `border-b px-4 py-3` toolbar band
 * as slots.
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
  chrome = true,
  className,
  ref,
  kicker,
  title,
  subtitle,
  icon,
  headerActions,
}: SurfaceFrameProps): React.ReactElement {
  const nested = React.useContext(RaisedSurfaceContext);
  const body = (
    <>
      <SurfaceHeaderSlot
        kicker={kicker}
        title={title}
        subtitle={subtitle}
        icon={icon}
        headerActions={headerActions}
      />
      {toolbar != null && <div className="border-b px-4 py-3">{toolbar}</div>}
      {children}
    </>
  );

  if (chrome === false) {
    return (
      <div ref={ref} className={cn("flex flex-col", className)}>
        {body}
      </div>
    );
  }

  // Raised surface: tone, not a border, separates it from the canvas; nested
  // in another raised surface it drops the fill too (ADR-0007 §3).
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg",
        !nested && "bg-surface-raised",
        overflow === "auto" ? "overflow-x-auto" : "overflow-hidden",
        className,
      )}
    >
      <RaisedSurfaceContext.Provider value={true}>{body}</RaisedSurfaceContext.Provider>
    </div>
  );
}

SurfaceFrame.displayName = "SurfaceFrame";
