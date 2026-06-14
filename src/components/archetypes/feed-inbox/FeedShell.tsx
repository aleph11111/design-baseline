import * as React from "react";
import { cn } from "@/lib/utils";

export type FeedShellProps = {
  /**
   * Filter chips / segmented control (All · Unread · Mentions · …). Consumer-owned
   * filter state; the shell just lays them out at the start of the toolbar.
   */
  filters?: React.ReactNode;
  /** Trailing toolbar controls — typically a "Mark all read" button. */
  actions?: React.ReactNode;
  /**
   * Time-grouped content: a stack of `<SectionCard title="Today" flush>` blocks,
   * each holding `<FeedItem>`s separated by `divide-y`. Omit groups for a flat feed.
   */
  children: React.ReactNode;
  /** Shown (centered, muted) when there are no items — pass for the empty state. */
  empty?: React.ReactNode;
  className?: string;
};

/**
 * FeedShell — the container for a feed/inbox (H) surface: a toolbar (filter chips
 * + actions) above a time-grouped stack of feed items. A feed is a chronological
 * stream of events with read state and filters — distinct from list-with-detail
 * (a sortable table of records). Groups reuse `<SectionCard>`; rows are `<FeedItem>`.
 */
export function FeedShell({
  filters,
  actions,
  children,
  empty,
  className,
}: FeedShellProps): React.ReactElement {
  return (
    <div className={cn("space-y-5", className)}>
      {(filters || actions) && (
        <div className="flex flex-wrap items-center gap-3">
          {filters}
          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      )}
      {empty ?? children}
    </div>
  );
}

FeedShell.displayName = "FeedShell";
