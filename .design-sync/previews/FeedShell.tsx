import * as React from "react";
import {
  FeedShell,
  FeedItem,
  SectionCard,
  Button,
  SegmentedControl,
  StateView,
} from "design-baseline";
import { AtSign, Bell, CalendarDays, Image as ImageIcon, MessageSquare, Settings } from "lucide-react";

// FeedShell — the H (feed-inbox) container: toolbar (filters + actions) over
// a time-grouped stack of feed rows. Ported from feed-inbox-demo.tsx.
// Sub-shape 1: Inbox — filter chips + "mark all read", unread triage state.
export function InboxWithFilters() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FeedShell
        kicker="Inbox"
        title="Notifications"
        headerActions={
          <Button variant="outline" size="sm">
            Mark all read
          </Button>
        }
        filters={
          <SegmentedControl
            value="all"
            onValueChange={() => {}}
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
              { value: "mentions", label: "Mentions" },
              { value: "system", label: "System" },
            ]}
            aria-label="Filter notifications"
          />
        }
      >
        <SectionCard title="Today" flush>
          <div className="divide-y divide-border">
            <FeedItem
              icon={<AtSign className="h-4 w-4" />}
              title={<><b className="font-semibold">Ada</b> mentioned you on Order #1042</>}
              meta="Ada Reyes · 20m ago"
              unread
            />
            <FeedItem
              icon={<MessageSquare className="h-4 w-4" />}
              title={<><b className="font-semibold">Théo</b> commented on “Q3 forecast”</>}
              meta="Théo Marchand · 2h ago"
              unread
            />
            <FeedItem
              icon={<Settings className="h-4 w-4" />}
              title="Nightly import finished — 126 rows added"
              meta="System · 6h ago"
            />
          </div>
        </SectionCard>
        <SectionCard title="Yesterday" flush>
          <div className="divide-y divide-border">
            <FeedItem
              icon={<AtSign className="h-4 w-4" />}
              title={<><b className="font-semibold">Priya</b> assigned you a review</>}
              meta="Priya Anand · yesterday"
              unread
            />
          </div>
        </SectionCard>
      </FeedShell>
    </div>
  );
}

// Sub-shape 2: Timeline — chronological media/event feed, no read state, no
// header actions. Rows carry a body excerpt + trailing media thumbnail.
export function TimelineNoActions() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FeedShell kicker="Feed" title="Activity">
        <SectionCard title="Today" flush>
          <div className="divide-y divide-border">
            <FeedItem
              icon={<ImageIcon className="h-4 w-4" />}
              title={<><b className="font-semibold">Maya</b> added 8 photos to “Launch day”</>}
              meta="Maya Osei · 35m ago"
              body="Behind-the-scenes shots from the morning rehearsal and the floor walkthrough."
            />
            <FeedItem
              icon={<CalendarDays className="h-4 w-4" />}
              title="Launch party — RSVP open"
              meta="Events · 3h ago"
              body="Thursday 18:00 at the Riverside studio. 42 going, 9 maybe."
            />
          </div>
        </SectionCard>
      </FeedShell>
    </div>
  );
}

// Empty state — the shell's `empty` slot, centered and muted, filters left in
// place so the user can see why the stream reads as empty.
export function EmptyState() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <FeedShell
        kicker="Inbox"
        title="Notifications"
        filters={
          <SegmentedControl
            value="unread"
            onValueChange={() => {}}
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
            ]}
            aria-label="Filter notifications"
          />
        }
        empty={<StateView variant="empty" icon={Bell} message="Nothing here." />}
      >
        <div />
      </FeedShell>
    </div>
  );
}
