"use client";
import * as React from "react";
import { cn } from "../../lib/utils";
import { useHeaderFill, headerFillClasses } from "./headerFill";

export type SurfaceHeaderBarProps = {
  /** The header's title block — the caller's own element (a plain title div,
   *  `<NestedPageHeading>` for a Mode B nested page, or Radix `SheetTitle` /
   *  `SheetDescription` for a dialog's accessible name + description). The bar
   *  never re-types the title; on a solid header its inversion comes from the
   *  bar's fill (the title must render a heading element so `hfc.bar`'s
   *  `[&_h1,h2]` selector reaches it). */
  children: React.ReactNode;
  /** Right-aligned actions slot (buttons, icon buttons, an explicit close). */
  actions?: React.ReactNode;
  /** Extra classes on the actions row — structural clearance only (the
   *  list-with-detail mobile sheet insets its actions past the Sheet's
   *  built-in close button). Never for appearance: the row's flex/gap live
   *  in the bar. */
  actionsClassName?: string;
  /** Extra classes on the bar itself (structural only — the padding and the
   *  `hfc.bar` fill are the bar's, never overridable at the call site). */
  className?: string;
};

/**
 * SurfaceHeaderBar — ONE implementation of the header bar every framed shell
 * mounts on a bounded surface: the canonical padding (`px-5 py-4`), the single
 * `headerFillClasses(fill).bar` application, and the title-block /
 * right-aligned-actions flex layout, driven by `HeaderFillContext` (set once
 * at `<AppShell headerFill=…>`).
 *
 * `<SurfaceHeader>` composes the plain-div treatment on top of this (a full
 * kicker/title/subtitle stack); the Radix- and heading-constrained shells
 * (detail-overview's Mode B `<NestedPageHeading>`, the crud-dialog and
 * list-with-detail mobile-sheet `SheetTitle` / `SheetDescription`) compose
 * their own title element as `children` instead of a plain div. A change to
 * the header-fill treatment is one edit here and in `headerFill.ts`, and it
 * shows up in every shell's bar — no shell reads the class table directly.
 */
export function SurfaceHeaderBar({
  children,
  actions,
  actionsClassName,
  className,
}: SurfaceHeaderBarProps): React.ReactElement {
  const hfc = headerFillClasses(useHeaderFill());
  return (
    <div
      data-slot="surface-header"
      className={cn(
        "flex items-start justify-between gap-5 px-5 py-4",
        hfc.bar,
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
