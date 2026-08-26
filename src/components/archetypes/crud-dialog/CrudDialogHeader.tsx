import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { SurfaceHeaderBar } from "@/components/layout/SurfaceHeaderBar";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CrudDialogHeaderProps = {
  /**
   * Entity name or entity type + name.
   * e.g. "Customer · Acme Corp", "Workout #42", "New Workout"
   * Never a static type-only string like "Customer Details".
   */
  title: React.ReactNode;
  /**
   * Optional secondary line — created date, status string, or short identifier.
   */
  subtitle?: React.ReactNode;
  /**
   * Right-aligned slot for mode-toggle affordances or secondary icon buttons.
   * Primary CRUD actions (Save, Edit, Delete) belong in the footer, not here.
   */
  actions?: React.ReactNode;
  /**
   * When provided, renders an explicit X close button in the header alongside
   * the actions slot. Use when the Sheet's built-in close button is hidden or
   * when a labeled close button is required by the design.
   */
  onClose?: () => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CrudDialogHeader — renders the sticky top band of a J (crud-dialog) dialog.
 *
 * Layout:
 *   [title + subtitle] ... [actions slot] [close button (optional)]
 *
 * The band chrome (padding + header-fill) is the shared on-surface bar
 * (`<SurfaceHeaderBar>`) — the same one implementation every framed shell
 * mounts. The title + subtitle are `SheetTitle` / `SheetDescription` because
 * the Sheet (Radix Dialog.Content) needs a real accessible name + description:
 * without a `Title` descendant Radix logs an error and exposes no
 * aria-labelledby. On a solid header the bar's fill inverts both (its
 * `[&_h1,h2]` / `[&_p]` descendant selectors reach the Radix `h2` / `p`), so
 * this header reads no header-fill classes of its own.
 *
 * The Sheet's built-in X close button (from SheetContent) is always in the
 * tree at position absolute top-4 right-4. If `onClose` is also provided here,
 * an additional explicit X button is rendered inside this header — use only
 * when the design calls for it (e.g. to position the close button relative to
 * the header chrome rather than the Sheet overlay).
 */
export function CrudDialogHeader({
  title,
  subtitle,
  actions,
  onClose,
}: CrudDialogHeaderProps): React.ReactElement {
  return (
    <SurfaceHeaderBar
      className="shrink-0"
      actions={
        actions !== undefined || onClose !== undefined ? (
          <div className="flex shrink-0 items-center gap-1">
            {actions}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {/* Title + subtitle — rendered via SheetTitle/SheetDescription so the
          Sheet (Radix Dialog.Content) gets a real accessible name + description.
          Without a Title descendant Radix logs an error and exposes no
          aria-labelledby. When no subtitle is supplied we still render an
          empty, screen-reader-only SheetDescription so Content's
          aria-describedby never dangles (Radix's missing-description warning). */}
      <div className="min-w-0 flex-1">
        <SheetTitle className="leading-tight truncate">{title}</SheetTitle>
        {subtitle ? (
          <SheetDescription className="mt-0.5 truncate">{subtitle}</SheetDescription>
        ) : (
          <SheetDescription className="sr-only" />
        )}
      </div>
    </SurfaceHeaderBar>
  );
}

CrudDialogHeader.displayName = "CrudDialogHeader";
