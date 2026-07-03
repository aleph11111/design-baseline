import * as React from "react";
import { Badge } from "design-baseline";

// Every variant, side by side.
export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  );
}

// A status column — the variant carries meaning across rows, as in an
// order list.
export function StatusColumn() {
  const orders = [
    { id: "#4821", customer: "Acme Corp", status: "Fulfilled", variant: "success" as const },
    { id: "#4790", customer: "Northwind", status: "Pending", variant: "warning" as const },
    { id: "#4712", customer: "Globex", status: "Cancelled", variant: "destructive" as const },
    { id: "#4699", customer: "Initech", status: "Draft", variant: "secondary" as const },
  ];
  return (
    <div className="max-w-sm divide-y divide-border rounded-md border bg-card">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">{order.id}</span>
            <span className="text-sm text-muted-foreground">{order.customer}</span>
          </div>
          <Badge variant={order.variant}>{order.status}</Badge>
        </div>
      ))}
    </div>
  );
}

// A count badge next to a section heading — unread items on an inbox tab.
export function CountInHeading() {
  return (
    <div className="flex max-w-sm items-center justify-between rounded-md border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Inbox</span>
        <Badge className="px-1.5">12</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Archived</span>
        <Badge variant="outline" className="px-1.5">3</Badge>
      </div>
    </div>
  );
}
