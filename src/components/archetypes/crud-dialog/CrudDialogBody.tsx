"use client";
import * as React from "react";
import { ScrollArea } from "../../ui/scroll-area";
import { Skeleton } from "../../ui/skeleton";
import { cn } from "../../../lib/utils";

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
};

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

// One skeleton field: label bar over control bar, matching the real field
// stack's `space-y-1.5`. Composed from the shared `<Skeleton>` atom — the
// contract forbids hand-rolled pulsing blocks (crud-dialog.md, Layer 5
// Forbidden), and `<Skeleton>` already carries `animate-pulse rounded-md
// bg-muted` so no wrapper animation is needed.
function SkeletonField({
  labelWidth,
  controlHeight = "h-9",
}: {
  labelWidth: string;
  controlHeight?: string;
}): React.ReactElement {
  return (
    <div className="space-y-1.5">
      <Skeleton className={cn("h-3", labelWidth)} />
      <Skeleton className={controlHeight} />
    </div>
  );
}

// The body's padding box, shared by the loading skeleton and the loaded
// content so a fetch finishing mid-viewport can't shift the layout.
const BODY_INSET = "px-6 py-4";

// Decorative loading shape. The visible skeleton stays aria-hidden — the
// announcement lives in the body's persistent status region (below), not on
// this node; mirroring ListSkeleton's `role="status"` wrapper here would put
// a live region behind a busy region of its own. It is keyed to the body's
// `layout` prop so skeleton and loaded body share the same structural shape:
// the two-column paired sections reuse the loaded layout class (so the
// skeleton collapses at the same breakpoint the body does), and flat /
// no-layout render a single stacked column — no paired section — so a fetch
// finishing mid-viewport reflows nothing.
function BodySkeleton({
  layout,
}: {
  layout?: "flat" | "two-column";
}): React.ReactElement {
  // Same six-field rhythm as the two-column shape, without the pairing.
  const fields = (
    <>
      <SkeletonField labelWidth="w-16" />
      <SkeletonField labelWidth="w-20" />
      <SkeletonField labelWidth="w-24" />
      <SkeletonField labelWidth="w-14" />
      <SkeletonField labelWidth="w-20" />
      <SkeletonField labelWidth="w-12" controlHeight="h-24" />
    </>
  );
  // The no / flat-layout shapes: a plain stack. Flat carries the loaded flat
  // body's LAYOUT_CLASS["flat"] wrapper; no-layout (mixed / tabbed bodies)
  // has the fields straight under the padding box — the consumer structures
  // the layout, so no wrapper the loaded body doesn't have is invented.
  if (layout !== "two-column") {
    return (
      <div className={cn("space-y-4", BODY_INSET)} aria-hidden>
        {layout === "flat" ? <div className={LAYOUT_CLASS["flat"]}>{fields}</div> : fields}
      </div>
    );
  }
  return (
    <div className={cn("space-y-4", BODY_INSET)} aria-hidden>
      {/* Simulate a two-column field section */}
      <div className={LAYOUT_CLASS["two-column"]}>
        <SkeletonField labelWidth="w-16" />
        <SkeletonField labelWidth="w-20" />
      </div>
      {/* Simulate a full-width field */}
      <SkeletonField labelWidth="w-24" />
      {/* Simulate another field group */}
      <div className={LAYOUT_CLASS["two-column"]}>
        <SkeletonField labelWidth="w-14" />
        <SkeletonField labelWidth="w-20" />
      </div>
      {/* Simulate a textarea field */}
      <SkeletonField labelWidth="w-12" controlHeight="h-24" />
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
}: CrudDialogBodyProps): React.ReactElement {
  // The loading text enters the status region only AFTER the region is in
  // the DOM: screen readers announce changes to an *existing* live region,
  // not content present at first mount — and the normal open path mounts
  // the body with isLoading already true (entity fetch in-flight). The
  // effect guarantees the empty → "Loading…" change lands post-mount for
  // both the initial-render-already-loading case and a later transition
  // into loading, and clears when the fields arrive.
  const [loadingAnnounced, setLoadingAnnounced] = React.useState(false);
  React.useEffect(() => {
    setLoadingAnnounced(isLoading);
  }, [isLoading]);

  return (
    <ScrollArea className="flex-1 overflow-hidden">
      {/* The aria-busy hold sits on the persistent content container
          (present in both states; the hold releases when the flag
          disappears). It is an ANCESTOR only of the content, never of the
          status region below: aria-busy applies to the whole subtree, and
          a live region inside a busy subtree holds its own announcements —
          the exact symptom this ticket fixes. */}
      <div aria-busy={isLoading ? "true" : undefined}>
        {isLoading ? <BodySkeleton layout={layout} /> : (
          <div className={BODY_INSET}>
            {layout ? <div className={LAYOUT_CLASS[layout]}>{children}</div> : children}
          </div>
        )}
      </div>
      {/* Persistent live region: mounted in both states; its text toggles
          empty ↔ "Loading…" as the announcement. Sibling of the busy
          container, so it is never inside the busy subtree. */}
      <span role="status" aria-live="polite" className="sr-only">
        {loadingAnnounced ? "Loading…" : ""}
      </span>
    </ScrollArea>
  );
}

CrudDialogBody.displayName = "CrudDialogBody";
