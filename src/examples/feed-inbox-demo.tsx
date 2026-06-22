/**
 * feed-inbox-demo.tsx
 *
 * Reference demo for the H (feed-inbox) archetype, showing BOTH sub-shapes that
 * share the same primitives (FeedShell + FeedItem + time-group SectionCard):
 *
 *  1. Inbox — a notifications/activity feed: filter chips + "mark all read" over
 *     a time-grouped stream with unread state (triage).
 *  2. Timeline — a chronological media/event feed: each row carries a body
 *     excerpt + a trailing media thumbnail, no read state (skim). This is the
 *     shape a downstream media/event `<ul>` feed adopts instead of hand-rolling.
 *
 * Both are H — distinct from list-with-detail (a sortable table of records).
 */

import * as React from "react";
import {
  AtSign,
  Bell,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  Settings,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { FeedShell, FeedItem } from "@/components/archetypes/feed-inbox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StateView } from "@/components/ui/state-view";

type FeedType = "mention" | "comment" | "system";
type Group = "Today" | "Yesterday" | "Earlier";

type Notification = {
  id: string;
  type: FeedType;
  title: React.ReactNode;
  meta: string;
  group: Group;
  unread: boolean;
};

const ICON: Record<FeedType, React.ReactNode> = {
  mention: <AtSign className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
};

const SEED: Notification[] = [
  { id: "n1", type: "mention", title: <><b className="font-semibold">Ada</b> mentioned you on Order #1042</>, meta: "Ada Reyes · 20m ago", group: "Today", unread: true },
  { id: "n2", type: "comment", title: <><b className="font-semibold">Théo</b> commented on “Q3 forecast”</>, meta: "Théo Marchand · 2h ago", group: "Today", unread: true },
  { id: "n3", type: "system", title: "Nightly import finished — 126 rows added", meta: "System · 6h ago", group: "Today", unread: false },
  { id: "n4", type: "mention", title: <><b className="font-semibold">Priya</b> assigned you a review</>, meta: "Priya Anand · yesterday", group: "Yesterday", unread: true },
  { id: "n5", type: "system", title: "Backup completed", meta: "System · yesterday", group: "Yesterday", unread: false },
  { id: "n6", type: "comment", title: <><b className="font-semibold">Bo</b> replied in “Pricing thread”</>, meta: "Bo Chen · 3d ago", group: "Earlier", unread: false },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "mentions", label: "Mentions" },
  { key: "system", label: "System" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const GROUP_ORDER: Group[] = ["Today", "Yesterday", "Earlier"];

/**
 * Offline-safe thumbnail — an inline SVG data-URI so the gallery renders without
 * a network. A real media feed passes `<img src={url} alt="" />`; the FeedItem
 * `media` holder applies `object-cover` regardless of source.
 */
function thumb(hsl: string, glyph: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112"><rect width="112" height="112" fill="hsl(${hsl})"/><text x="56" y="72" font-size="56" text-anchor="middle" fill="white" font-family="system-ui">${glyph}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type MediaType = "photo" | "event";
type MediaEvent = {
  id: string;
  type: MediaType;
  title: React.ReactNode;
  meta: string;
  body: string;
  group: Group;
  thumb: string;
};

const MEDIA_ICON: Record<MediaType, React.ReactNode> = {
  photo: <ImageIcon className="h-4 w-4" />,
  event: <CalendarDays className="h-4 w-4" />,
};

const MEDIA_SEED: MediaEvent[] = [
  { id: "m1", type: "photo", title: <><b className="font-semibold">Maya</b> added 8 photos to “Launch day”</>, meta: "Maya Osei · 35m ago", body: "Behind-the-scenes shots from the morning rehearsal and the floor walkthrough.", group: "Today", thumb: thumb("221 83% 53%", "▦") },
  { id: "m2", type: "event", title: "Launch party — RSVP open", meta: "Events · 3h ago", body: "Thursday 18:00 at the Riverside studio. 42 going, 9 maybe. Doors close at 19:30.", group: "Today", thumb: thumb("142 71% 45%", "◷") },
  { id: "m3", type: "photo", title: <><b className="font-semibold">Lex</b> published a new episode</>, meta: "Lex Fournier · yesterday", body: "“Shipping the design baseline” — 24 min. Covers tokens, archetypes, and drift.", group: "Yesterday", thumb: thumb("280 65% 60%", "▶") },
  { id: "m4", type: "event", title: "Quarterly review recap posted", meta: "Events · 4d ago", body: "Slides and the recording are attached. Next planning round opens Monday.", group: "Earlier", thumb: thumb("24 95% 53%", "★") },
];

function InboxDemo(): React.ReactElement {
  const [items, setItems] = React.useState<Notification[]>(SEED);
  const [filter, setFilter] = React.useState<FilterKey>("all");

  const visible = items.filter((n) => {
    if (filter === "unread") return n.unread;
    if (filter === "mentions") return n.type === "mention";
    if (filter === "system") return n.type === "system";
    return true;
  });
  const unreadCount = items.filter((n) => n.unread).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }
  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
      />

      <FeedShell
        filters={
          <SegmentedControl
            value={filter}
            onValueChange={(v) => setFilter(v as FilterKey)}
            options={FILTERS.map((f) => ({ value: f.key, label: f.label }))}
            aria-label="Filter notifications"
          />
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        }
        empty={
          visible.length === 0 ? (
            <StateView variant="empty" icon={Bell} message="Nothing here." />
          ) : undefined
        }
      >
        {GROUP_ORDER.map((group) => {
          const groupItems = visible.filter((n) => n.group === group);
          if (groupItems.length === 0) return null;
          return (
            <SectionCard key={group} title={group} flush>
              <div className="divide-y divide-border">
                {groupItems.map((n) => (
                  <FeedItem
                    key={n.id}
                    icon={ICON[n.type]}
                    title={n.title}
                    meta={n.meta}
                    unread={n.unread}
                    onClick={() => markRead(n.id)}
                  />
                ))}
              </div>
            </SectionCard>
          );
        })}
      </FeedShell>
    </section>
  );
}

function TimelineDemo(): React.ReactElement {
  return (
    <section className="space-y-5">
      <PageHeader
        title="Activity"
        subtitle="A chronological media & event feed — body excerpt + trailing thumbnail, no read state."
      />

      <FeedShell>
        {GROUP_ORDER.map((group) => {
          const groupItems = MEDIA_SEED.filter((m) => m.group === group);
          if (groupItems.length === 0) return null;
          return (
            <SectionCard key={group} title={group} flush>
              <div className="divide-y divide-border">
                {groupItems.map((m) => (
                  <FeedItem
                    key={m.id}
                    icon={MEDIA_ICON[m.type]}
                    title={m.title}
                    meta={m.meta}
                    body={m.body}
                    media={<img src={m.thumb} alt="" />}
                  />
                ))}
              </div>
            </SectionCard>
          );
        })}
      </FeedShell>
    </section>
  );
}

export function FeedInboxDemo(): React.ReactElement {
  return (
    <div className="max-w-3xl space-y-12">
      <InboxDemo />
      <TimelineDemo />
    </div>
  );
}
