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
 *  3. Overlay — the page feed body rendered inside a header-bell Sheet: no
 *     page title, no raised page surface (Layer 1's two surfaces, two exports —
 *     the page shell vs the frameless body).
 *
 * 1 + 2 are both H — distinct from list-with-detail (a sortable table of
 * records); 3 is the same H molecule in the overlay surface.
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
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { FeedShell, FeedBody, FeedItem } from "@/components/archetypes/feed-inbox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StateView } from "@/components/ui/state-view";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

// FeedShell (src/components/archetypes/feed-inbox/FeedShell.tsx) has no
// `isLoading` prop — the loading plane is page-composed inside the shell's
// content slot per docs/archetypes/feed-inbox.md Layer 7 ("a few skeleton
// rows; never a full-page spinner").
function FeedItemSkeleton(): React.ReactElement {
  return (
    <div className="flex items-start gap-3 px-5 py-3" aria-hidden>
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * Overlay surface (Layer 1, second row of the "which export by surface"
 * table): the feed body in a header-bell Sheet. The Sheet owns the header
 * (title + close) — the body export carries the content only, so no page h1
 * and no raised page surface end up inside the drawer.
 */
function OverlayDemo(): React.ReactElement {
  const unread = SEED.filter((n) => n.unread).length;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          <strong>Overlay surface</strong> — a header bell opens a Sheet
          holding the <code>FeedBody</code> (frameless). The page form
          (<code>FeedShell</code>) stays for top-level routes; this one has no
          page title and no raised page surface of its own.
        </p>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
              {unread === 0 ? "Notifications" : `${unread} unread`}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[24rem] sm:max-w-[24rem] overflow-y-auto p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                The sheet owns this header — the feed itself is frameless.
              </SheetDescription>
            </SheetHeader>
            <FeedBody>
              {GROUP_ORDER.map((group) => {
                const groupItems = SEED.filter((n) => n.group === group);
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
                        />
                      ))}
                    </div>
                  </SectionCard>
                );
              })}
            </FeedBody>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}

function InboxDemo(): React.ReactElement {
  const [items, setItems] = React.useState<Notification[]>(SEED);
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [state, setState] = React.useState<"Loaded" | "Loading">("Loaded");

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          <strong>State</strong> — loading renders a few skeleton rows in the
          shell&apos;s content slot; <code>FeedShell</code> has no{" "}
          <code>isLoading</code> prop of its own.
        </p>
        <SegmentedControl
          aria-label="Feed state"
          value={state}
          onValueChange={setState}
          options={[
            { value: "Loaded", label: "Loaded" },
            { value: "Loading", label: "Loading" },
          ]}
        />
      </div>

      {/* One page frame (ADR-0008): title + "Mark all read" in the page
          header, filters + unread count in the toolbar band. */}
      <FeedShell
        title="Notifications"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        }
        count={unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
        toolbar={
          <SegmentedControl
            value={filter}
            onValueChange={(v) => setFilter(v as FilterKey)}
            options={FILTERS.map((f) => ({ value: f.key, label: f.label }))}
            aria-label="Filter notifications"
          />
        }
        empty={
          state === "Loaded" && visible.length === 0 ? (
            <StateView variant="empty" icon={Bell} message="Nothing here." />
          ) : undefined
        }
      >
        {state === "Loading" ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          GROUP_ORDER.map((group) => {
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
          })
        )}
      </FeedShell>
    </section>
  );
}

function TimelineDemo(): React.ReactElement {
  return (
    <section className="space-y-5">
      {/* Timeline sub-shape: no read state, no actions, no toolbar — just the
          title and subtitle. */}
      <FeedShell title="Activity" subtitle="Photos, episodes and events">
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
      <OverlayDemo />
    </div>
  );
}
