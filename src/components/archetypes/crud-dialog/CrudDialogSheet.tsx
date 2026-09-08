"use client";
import * as React from "react";
import { Sheet, SheetContent } from "../../ui/sheet";
import { cn } from "../../../lib/utils";
import { useIsMobile } from "../../../hooks/use-mobile";

// ---------------------------------------------------------------------------
// Width variant map
// ---------------------------------------------------------------------------

const WIDTH_MAP: Record<"sm" | "md" | "lg", string> = {
  sm: "22rem",   // ~352px — minimal forms (3–4 fields)
  md: "30rem",   // ~480px — standard entity dialogs
  lg: "40rem",   // ~640px — tabbed or complex entities
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CrudDialogSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Desktop width preset. Defaults to "md" (~480px).
   * On mobile the sheet is always full-viewport regardless of this setting.
   */
  width?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CrudDialogSheet — the outermost shell for every J (crud-dialog) archetype
 * instance.
 *
 * Desktop: right-side slide-in at the chosen `width` preset.
 * Mobile: full-viewport sheet (useIsMobile detects < 768px).
 *
 * Children should be arranged as:
 *   <CrudDialogHeader … />
 *   <CrudDialogBody … />
 *   <CrudDialogFooter … />
 */
export function CrudDialogSheet({
  open,
  onOpenChange,
  width = "md",
  children,
}: CrudDialogSheetProps): React.ReactElement {
  const isMobile = useIsMobile();

  // On mobile we let the sheet be full-width (no inline width constraint).
  const inlineWidth = isMobile ? undefined : WIDTH_MAP[width];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        style={inlineWidth ? { width: inlineWidth, maxWidth: "100vw" } : undefined}
        className={cn(
          // Remove the default SheetContent padding so we can control padding
          // per-zone (header / body / footer each supply their own spacing).
          "flex flex-col p-0",
          // Override the default sm:max-w-sm that ships with the sheet variant.
          isMobile ? "w-full" : "sm:max-w-none",
        )}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}

CrudDialogSheet.displayName = "CrudDialogSheet";
