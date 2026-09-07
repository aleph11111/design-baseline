import * as React from "react";
import { IconAvatar } from "../../ui/icon-avatar";
import { cn } from "../../../lib/utils";
import { getInteractiveRowProps, interactiveRowFocusRing } from "../shared";

export type FeedItemProps = {
  /**
   * Leading visual — a lucide icon element (`<Bell className="h-4 w-4" />`) or a
   * small avatar. Rendered in a muted circle. Omit for a text-only feed.
   */
  icon?: React.ReactNode;
  /** The event/message text. Keep it one or two lines. */
  title: React.ReactNode;
  /** Secondary line — actor, source, relative time ("Ada · 2h ago"). */
  meta?: React.ReactNode;
  /**
   * Optional multi-line excerpt below title + meta — an event/media body. Inbox
   * notifications leave this unset (one-line title only); the media/event
   * timeline variant uses it for a short description.
   */
  body?: React.ReactNode;
  /**
   * Optional trailing thumbnail / preview — an `<img>`, video poster, or any
   * media node. Rendered in a fixed-size rounded holder at the row's trailing
   * edge (the icon column stays aligned with the inbox variant). The defining
   * slot of the media/event timeline variant of this archetype.
   */
  media?: React.ReactNode;
  /** Unread items get a dot and a slightly stronger surface. */
  unread?: boolean;
  /** Optional trailing controls (a small action button, a dismiss). */
  actions?: React.ReactNode;
  /** When set, the whole row is clickable (open the source / mark read). */
  onClick?: () => void;
  className?: string;
};

/**
 * FeedItem — one row in a feed/inbox (H) surface. A compact, scannable event row
 * (leading icon, title + meta, unread dot, optional trailing action) — NOT a
 * data-table cell row (that's list-with-detail). Place inside a time-group
 * `<SectionCard flush>` with `divide-y`.
 */
export function FeedItem({
  icon,
  title,
  meta,
  body,
  media,
  unread,
  actions,
  onClick,
  className,
}: FeedItemProps): React.ReactElement {
  return (
    <div
      onClick={onClick}
      data-state={unread ? "unread" : undefined}
      className={cn(
        "flex items-start gap-3 px-5 py-3",
        unread && "bg-primary/[0.03]",
        onClick && "cursor-pointer hover:bg-muted/50",
        onClick && interactiveRowFocusRing,
        className,
      )}
      {...getInteractiveRowProps(onClick)}
    >
      {icon !== undefined && (
        <IconAvatar size="sm" className="mt-0.5">
          {icon}
        </IconAvatar>
      )}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-[13px] text-foreground",
            unread ? "font-medium" : "font-normal",
          )}
        >
          {title}
        </div>
        {meta && (
          <div className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">{meta}</div>
        )}
        {body && (
          <div className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
            {body}
          </div>
        )}
      </div>
      {unread && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}
      {media !== undefined && (
        <div className="mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted [&>img]:h-full [&>img]:w-full [&>img]:object-cover">
          {media}
        </div>
      )}
      {actions && (
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

FeedItem.displayName = "FeedItem";
