import * as React from "react";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";

export type FeedBodyProps = {
  /**
   * Time-grouped content: a stack of `<SectionCard title="Today" flush>` blocks,
   * each holding `<FeedItem>`s separated by `divide-y`. Omit groups for a flat feed.
   */
  children: React.ReactNode;
  /** Shown (centered, muted) when there are no items — pass for the empty state. */
  empty?: React.ReactNode;
};

/**
 * The feed body without a page frame: the time-grouped stack (or flat items)
 * and the empty state, in their one content block. For composing the feed
 * inside another surface — a popover / Sheet launched from a header bell —
 * where a page title and a raised page surface would be wrong (ADR-0008: the
 * shell owns the page frame, the body owns the content). Mirrors
 * `ListWithDetailBody` — exported from the archetype barrel.
 */
export function FeedBody({
  children,
  empty,
}: FeedBodyProps): React.ReactElement {
  return <div className="space-y-5 p-5">{empty ?? children}</div>;
}

FeedBody.displayName = "FeedBody";

export type FeedShellProps = FeedBodyProps &
  Pick<
    PageFrameProps,
    "title" | "subtitle" | "badges" | "actions" | "toolbar" | "count"
  >;

/**
 * FeedShell — the page (ADR-0008) for a feed/inbox (H) surface: a chronological
 * stream of events with read state and filters — distinct from list-with-detail
 * (a sortable table of records). `title` is required and renders once, as the
 * page title, through `PageFrame`; `toolbar` holds the filter chips / tabs,
 * `count` the unread or result count, `actions` the page verbs
 * ("Mark all read"). Groups reuse `<SectionCard>` (flattened inside the
 * frame); rows are `<FeedItem>`. The frameless body lives in `FeedBody` for
 * the overlay / popover surface.
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
      <FeedBody empty={empty}>{children}</FeedBody>
    </PageFrame>
  );
}

FeedShell.displayName = "FeedShell";
