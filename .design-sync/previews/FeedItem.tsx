import * as React from "react";
import { FeedItem, SectionCard, Button } from "design-baseline";
import { AtSign, Image as ImageIcon, Settings, X } from "lucide-react";

// FeedItem — one row in a feed/inbox surface. A sub-part: composed inside a
// SectionCard flush + divide-y group (its real placement), never bare.
// Unread mention row — icon, unread dot, stronger surface tint.
export function UnreadMention() {
  return (
    <SectionCard title="Today" flush>
      <div className="divide-y divide-border">
        <FeedItem
          icon={<AtSign className="h-4 w-4" />}
          title={<><b className="font-semibold">Ada</b> mentioned you on Order #1042</>}
          meta="Ada Reyes · 20m ago"
          unread
          onClick={() => {}}
        />
      </div>
    </SectionCard>
  );
}

// Read system row with a trailing dismiss action — no unread dot, normal
// weight title.
export function ReadWithAction() {
  return (
    <SectionCard title="Today" flush>
      <div className="divide-y divide-border">
        <FeedItem
          icon={<Settings className="h-4 w-4" />}
          title="Nightly import finished — 126 rows added"
          meta="System · 6h ago"
          actions={
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </Button>
          }
        />
      </div>
    </SectionCard>
  );
}

// Media/event timeline row — body excerpt + trailing thumbnail, the shape a
// media/event feed adopts instead of the inbox row.
export function MediaTimelineRow() {
  const thumb =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112"><rect width="112" height="112" fill="hsl(221 83% 53%)"/><text x="56" y="72" font-size="56" text-anchor="middle" fill="white" font-family="system-ui">▦</text></svg>',
    );
  return (
    <SectionCard title="Today" flush>
      <div className="divide-y divide-border">
        <FeedItem
          icon={<ImageIcon className="h-4 w-4" />}
          title={<><b className="font-semibold">Maya</b> added 8 photos to “Launch day”</>}
          meta="Maya Osei · 35m ago"
          body="Behind-the-scenes shots from the morning rehearsal and the floor walkthrough."
          media={<img src={thumb} alt="" />}
        />
      </div>
    </SectionCard>
  );
}
