import * as React from "react";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "@/components/layout/SurfaceHeaderSlot";
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
} & SurfaceHeaderSlotProps;

/**
 * FeedShell — the container for a feed/inbox (H) surface: a toolbar (filter chips
 * + actions) above a time-grouped stack of feed items. A feed is a chronological
 * stream of events with read state and filters — distinct from list-with-detail
 * (a sortable table of records). Groups reuse `<SectionCard>`; rows are `<FeedItem>`.
 *
 * When `title` is set, the shell adopts the Plex Ledger board form: an on-surface
 * `<SurfaceHeader>` at the top of one bounded card, toolbar + content below.
 */
export function FeedShell({
  filters,
  actions,
  children,
  empty,
  kicker,
  title,
  headerActions,
}: FeedShellProps): React.ReactElement {
  return (
    <div
      className={cn(
        title !== undefined && "rounded-lg border bg-card overflow-hidden",
        title === undefined && "space-y-5",
      )}
    >
      <SurfaceHeaderSlot
        kicker={kicker}
        title={title}
        headerActions={headerActions}
      />
      <div className={cn(title !== undefined && "p-5 space-y-5")}>
        {(filters || actions) && (
          <div className="flex flex-wrap items-center gap-3">
            {filters}
            {actions && <div className="ml-auto">{actions}</div>}
          </div>
        )}
        {empty ?? children}
      </div>
    </div>
  );
}

FeedShell.displayName = "FeedShell";
