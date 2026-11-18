"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

export type SurfaceHeaderBarProps = {
  /** The header's title block — the caller's own element (Radix `SheetTitle` /
   *  `SheetDescription` or `DialogTitle` / `DialogDescription` for the
   *  accessible name + description). The bar never re-types the title. */
  children: React.ReactNode;
  /** Right-aligned actions slot (buttons, icon buttons, an explicit close). */
  actions?: React.ReactNode;
  /** Extra classes on the actions row — structural clearance only (the
   *  list-with-detail mobile sheet insets its actions past the Sheet's
   *  built-in close button). Never for appearance: the row's flex/gap live
   *  in the bar. */
  actionsClassName?: string;
  /** Extra classes on the bar itself (structural only — the fill and the
   *  padding are the bar's; the one exception is close-button clearance, e.g.
   *  the list-with-detail sheet's `pr-13`, which must clear both the title and
   *  a wrapped actions row). */
  className?: string;
};

/**
 * SurfaceHeaderBar — the ONE header bar of a dialog or drawer (crud-dialog,
 * the list-with-detail detail drawer / mobile sheet): canonical padding
 * (`px-5 py-4`), one fixed neutral treatment (raised fill + hairline
 * `border-b`, normal foreground text), and the title-block /
 * right-aligned-actions flex layout. Actions that do not fit beside the
 * title's 12rem basis wrap onto a row beneath it; the title is never squeezed. Pages never mount it — a page is titled
 * by `PageFrame`'s `PageHeader` (ADR-0008). No fill axis, no context read: a
 * change to the treatment is one edit here.
 */
export function SurfaceHeaderBar({
  children,
  actions,
  actionsClassName,
  className,
}: SurfaceHeaderBarProps): React.ReactElement {
  return (
    <div
      data-slot="surface-header"
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-5 gap-y-3 border-b bg-surface-raised px-5 py-4",
        className,
      )}
    >
      {/* The title keeps a 12rem basis: actions that would leave it less wrap
          onto their own row beneath it instead of squeezing it to zero. */}
      <div className="min-w-0 flex-1 basis-48">{children}</div>
      {actions ? (
        <div className={cn("flex flex-wrap items-center gap-2", actionsClassName)}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

SurfaceHeaderBar.displayName = "SurfaceHeaderBar";
