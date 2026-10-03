import * as React from "react";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";

export type FeedShellProps = {
  /**
   * Time-grouped content: a stack of `<SectionCard title="Today" flush>` blocks,
   * each holding `<FeedItem>`s separated by `divide-y`. Omit groups for a flat feed.
   */
  children: React.ReactNode;
  /** Shown (centered, muted) when there are no items — pass for the empty state. */
  empty?: React.ReactNode;
} & Pick<
  PageFrameProps,
  "title" | "subtitle" | "badges" | "actions" | "toolbar" | "count"
>;

/**
 * FeedShell — the container for a feed/inbox (H) surface: a chronological
 * stream of events with read state and filters — distinct from list-with-detail
 * (a sortable table of records). Groups reuse `<SectionCard>` (flattened inside
 * the frame); rows are `<FeedItem>`.
 *
 * Renders through `PageFrame` (ADR-0008): `toolbar` holds the filter chips /
 * tabs, `count` the unread or result count, `actions` the page verbs
 * ("Mark all read").
 */
export function FeedShell({
  children,
  empty,
  title,
  subtitle,
  badges,
  actions,
  toolbar,
  count,
}: FeedShellProps): React.ReactElement {
  return (
    <PageFrame
      title={title}
      subtitle={subtitle}
      badges={badges}
      actions={actions}
      toolbar={toolbar}
      count={count}
    >
      <div className="space-y-5 p-5">{empty ?? children}</div>
    </PageFrame>
  );
}

FeedShell.displayName = "FeedShell";
