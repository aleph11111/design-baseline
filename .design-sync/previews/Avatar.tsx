import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "design-baseline";

// A stacked row of avatars — an image src that fails over to its initials
// fallback (no network dependency) alongside plain initials avatars — the
// way a "shared with" row or reviewer stack renders.
export function StackedRow() {
  return (
    <div className="flex -space-x-2">
      <Avatar className="ring-2 ring-background">
        <AvatarImage src="/avatars/priya-natarajan.jpg" alt="Priya Natarajan" />
        <AvatarFallback>PN</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-background">
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-background">
        <AvatarFallback>JK</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-background">
        <AvatarFallback className="bg-muted text-muted-foreground">
          +4
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

// A user row — avatar + name + email, the atomic unit of a member list or
// assignee picker.
export function UserRow() {
  return (
    <div className="flex max-w-sm items-center gap-3 rounded-md border bg-card p-3">
      <Avatar>
        <AvatarImage src="/avatars/marcus-webb.jpg" alt="Marcus Webb" />
        <AvatarFallback>MW</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-none">Marcus Webb</span>
        <span className="text-sm text-muted-foreground">
          marcus.webb@northwind.io
        </span>
      </div>
    </div>
  );
}

// A member list — several user rows separated by dividers, as in a team
// settings page.
export function MemberList() {
  const members = [
    { name: "Priya Natarajan", email: "priya@northwind.io", initials: "PN" },
    { name: "Ada Reyes", email: "ada.reyes@northwind.io", initials: "AR" },
    { name: "Jordan Kim", email: "jordan.kim@northwind.io", initials: "JK" },
  ];
  return (
    <div className="max-w-sm divide-y divide-border rounded-md border bg-card">
      {members.map((m) => (
        <div key={m.email} className="flex items-center gap-3 p-3">
          <Avatar>
            <AvatarFallback>{m.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">{m.name}</span>
            <span className="text-sm text-muted-foreground">{m.email}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
