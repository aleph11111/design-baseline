import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ListSkeletonProps {
  /** Number of placeholder rows to render. Default 5. */
  rows?: number;
  /** Cells per row. 1 (default) = stacked bars; >1 = a table-shaped grid, first cell widest. */
  columns?: number;
  /** Render a wider placeholder bar (or header cells, when `columns > 1`) above the rows. */
  showHeader?: boolean;
  /** Prefix each row with a circular avatar placeholder. Ignored when `columns > 1`. */
  avatar?: boolean;
  /** Screen-reader label announced while the skeleton is shown. Default "Loading…". */
  label?: string;
  /** Extra classes on the outer wrapper. */
  className?: string;
}

/**
 * ListSkeleton — a route/list-shaped loading placeholder: greyed `animate-pulse`
 * rows shaped like the content that's about to arrive, instead of a spinner over
 * blank space. Composes the shadcn `Skeleton` atom; carries its own
 * `role="status"` / `aria-busy` and an sr-only label so the wait is announced.
 *
 * Use where the row shape is known ahead of the fetch. For detail-driven lists
 * whose row shape is unknown, prefer the text loader (`<StateView variant="loading">`).
 */
export function ListSkeleton({
  rows = 5,
  columns = 1,
  showHeader = false,
  avatar = false,
  label = "Loading…",
  className,
}: ListSkeletonProps): React.ReactElement {
  const isGrid = columns > 1;
  const gridStyle: React.CSSProperties | undefined = isGrid
    ? { display: "grid", gap: "0.75rem", gridTemplateColumns: `1.6fr repeat(${columns - 1}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("space-y-2", className)}
    >
      <span className="sr-only">{label}</span>

      {showHeader &&
        (isGrid ? (
          <div style={gridStyle} className="pb-1">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-3" />
            ))}
          </div>
        ) : (
          <Skeleton className="h-5 w-40" />
        ))}

      {Array.from({ length: rows }).map((_, r) =>
        isGrid ? (
          <div key={r} style={gridStyle} className="py-1.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4" />
            ))}
          </div>
        ) : avatar ? (
          <div key={r} className="flex items-center gap-3 py-1.5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ) : (
          <Skeleton key={r} className="h-4 w-full" />
        ),
      )}
    </div>
  );
}

ListSkeleton.displayName = "ListSkeleton";
