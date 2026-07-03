import * as React from "react";
import { Bell, Check, MessageSquare, UserPlus } from "lucide-react";
import { IconAvatar } from "design-baseline";

// The three sizes side by side, each holding an icon glyph.
export function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <IconAvatar size="xs">
          <Bell className="h-3 w-3" />
        </IconAvatar>
        <span className="text-xs text-muted-foreground">xs</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <IconAvatar size="sm">
          <Bell className="h-4 w-4" />
        </IconAvatar>
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <IconAvatar size="md">
          <Bell className="h-5 w-5" />
        </IconAvatar>
        <span className="text-xs text-muted-foreground">md</span>
      </div>
    </div>
  );
}

// Icon or initials — the two content shapes the molecule holds.
export function IconOrInitials() {
  return (
    <div className="flex items-center gap-3">
      <IconAvatar size="sm">
        <UserPlus className="h-4 w-4" />
      </IconAvatar>
      <IconAvatar size="sm">JK</IconAvatar>
      <IconAvatar size="sm">
        <Check className="h-4 w-4" />
      </IconAvatar>
    </div>
  );
}

// In a feed row — the glyph leading a notification line, its native context.
export function FeedRows() {
  const items = [
    { icon: MessageSquare, text: "Ada Reyes commented on Invoice #4821", time: "2m ago" },
    { icon: UserPlus, text: "Jordan Kim was added to Growth plan", time: "1h ago" },
    { icon: Check, text: "Order #4790 marked as fulfilled", time: "3h ago" },
  ];
  return (
    <div className="max-w-sm divide-y divide-border rounded-md border bg-card">
      {items.map((item) => (
        <div key={item.text} className="flex items-start gap-3 p-3">
          <IconAvatar size="sm">
            <item.icon className="h-4 w-4" />
          </IconAvatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm">{item.text}</span>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
