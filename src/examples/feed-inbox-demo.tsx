/**
 * feed-inbox-demo.tsx
 *
 * Reference demo for the H (feed-inbox) archetype: a notifications/activity feed
 * — filter chips + a "mark all read" action over a time-grouped stream of events
 * with read state. Distinct from list-with-detail (a sortable table of records).
 */

import * as React from "react";
import { AtSign, Bell, MessageSquare, Settings } from "lucide-react";
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

export function FeedInboxDemo(): React.ReactElement {
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
    <div className="max-w-3xl space-y-6">
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
    </div>
  );
}
