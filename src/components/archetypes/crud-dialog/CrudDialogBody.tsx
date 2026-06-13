import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CrudDialogBodyProps = {
  children: React.ReactNode;
  /**
   * When true, renders a loading skeleton instead of children.
   * Use while the entity fetch is in-flight (enabled: open && !!entityId).
   */
  isLoading?: boolean;
  /**
   * Body presentation — the dialog's graded "richness" axis (see
   * docs/CHOOSING-A-SURFACE.md). This is a variant, NOT a separate component:
   * - `"flat"` (default): a single `space-y-4` stack — simple entities (5–8 fields).
   * - `"two-column"`: a responsive paired-field grid (`grid-cols-1 sm:grid-cols-2`,
   *   `gap-4`) with the mandated mobile collapse baked in.
   * - `undefined`: no wrapper — for **mixed** bodies (full-width fields beside a
   *   2-col section) and the **tabbed** shape (compose shadcn `<Tabs>`), where
   *   the consumer structures the layout itself.
   */
  layout?: "flat" | "two-column";
  className?: string;
};

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function BodySkeleton(): React.ReactElement {
  return (
    <div className="space-y-4 px-6 py-4 animate-pulse" aria-hidden>
      {/* Simulate a two-column field section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
        </div>
      </div>
      {/* Simulate a full-width field */}
      <div className="space-y-1.5">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-9 rounded bg-muted" />
      </div>
      {/* Simulate another field group */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="h-3 w-14 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-18 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
        </div>
      </div>
      {/* Simulate a textarea field */}
      <div className="space-y-1.5">
        <div className="h-3 w-12 rounded bg-muted" />
        <div className="h-24 rounded bg-muted" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CrudDialogBody — the scrollable content region of a J (crud-dialog) dialog.
 *
 * Provides:
 *   - flex-1 so it fills available height between header and footer
 *   - ScrollArea (Radix) for cross-browser consistent scroll behavior
 *   - Consistent padding: px-6 py-4 (applied inside the viewport)
 *   - Loading skeleton rendered when isLoading={true}; children suppressed
 *
 * Do NOT add extra py-* padding inside the immediate children of CrudDialogBody.
 * The body already supplies px-6 py-4 — adding more creates double-inset.
 */
const LAYOUT_CLASS: Record<"flat" | "two-column", string> = {
  flat: "space-y-4",
  "two-column": "grid grid-cols-1 gap-4 sm:grid-cols-2",
};

export function CrudDialogBody({
  children,
  isLoading = false,
  layout,
  className,
}: CrudDialogBodyProps): React.ReactElement {
  return (
    <ScrollArea className={cn("flex-1 overflow-hidden", className)}>
      {isLoading ? (
        <BodySkeleton />
      ) : (
        <div className="px-6 py-4">
          {layout ? <div className={LAYOUT_CLASS[layout]}>{children}</div> : children}
        </div>
      )}
    </ScrollArea>
  );
}

CrudDialogBody.displayName = "CrudDialogBody";
