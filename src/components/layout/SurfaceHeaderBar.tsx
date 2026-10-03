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
  /** Extra classes on the bar itself (structural only — the padding and the
   *  fill are the bar's, never overridable at the call site). */
  className?: string;
};

/**
 * SurfaceHeaderBar — the ONE header bar of a dialog or drawer (crud-dialog,
 * the list-with-detail detail drawer / mobile sheet): canonical padding
 * (`px-5 py-4`), one fixed neutral treatment (raised fill + hairline
 * `border-b`, normal foreground text), and the title-block /
 * right-aligned-actions flex layout. Pages never mount it — a page is titled
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
        "flex items-start justify-between gap-5 border-b bg-surface-raised px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">{children}</div>
      {actions ? (
        <div className={cn("flex shrink-0 items-center gap-2", actionsClassName)}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

SurfaceHeaderBar.displayName = "SurfaceHeaderBar";
