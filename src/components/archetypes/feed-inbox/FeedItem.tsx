import * as React from "react";
import { IconAvatar } from "@/components/ui/icon-avatar";
import { cn } from "@/lib/utils";

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
        className,
      )}
    >
      {icon !== undefined && (
        <IconAvatar size="sm" className="mt-0.5">
          {icon}
        </IconAvatar>
      )}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-sm text-foreground",
            unread ? "font-medium" : "font-normal",
          )}
        >
          {title}
        </div>
        {meta && (
          <div className="mt-0.5 text-xs text-muted-foreground">{meta}</div>
        )}
      </div>
      {unread && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
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
