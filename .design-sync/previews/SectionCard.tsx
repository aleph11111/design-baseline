import * as React from "react";
import { Badge, SectionCard } from "design-baseline";

// Default tone, padded body — a free-form key fact block.
export function Summary() {
  return (
    <div className="max-w-md">
      <SectionCard title="Summary">
        <p className="text-sm text-muted-foreground">
          Acme Corp has been a customer since March 2022, with 18 completed orders
          totalling €12,480.00.
        </p>
      </SectionCard>
    </div>
  );
}

// Flush body — a ruled key-value table that manages its own dividers.
export function Attributes() {
  return (
    <div className="max-w-md">
      <SectionCard title="Attributes" flush>
        <div className="divide-y divide-border text-sm">
          <div className="flex justify-between px-5 py-2.5">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">Active</span>
          </div>
          <div className="flex justify-between px-5 py-2.5">
            <span className="text-muted-foreground">Owner</span>
            <span className="font-medium">Ada Reyes</span>
          </div>
          <div className="flex justify-between px-5 py-2.5">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">Growth</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// Muted tone + actions slot — the lightest surface, for reference panels.
export function MutedWithActions() {
  return (
    <div className="max-w-md">
      <SectionCard title="Linked invoices" tone="muted" actions={<Badge variant="secondary">3</Badge>}>
        <p className="text-sm text-muted-foreground">
          #4821, #4790, and #4712 are linked to this order.
        </p>
      </SectionCard>
    </div>
  );
}

// Chromeless — dropped border/shadow, kept the ruled title bar + gutters, for
// embedding inside an already-bounded surface (a unified detail rail).
export function Chromeless() {
  return (
    <div className="max-w-md rounded-lg border bg-card">
      <SectionCard title="Customer" chrome={false}>
        <p className="text-sm text-muted-foreground">
          Priya Natarajan · priya@northwind.io
        </p>
      </SectionCard>
      <div className="border-t border-border" />
      <SectionCard title="Shipping" chrome={false}>
        <p className="text-sm text-muted-foreground">
          142 Elm Street, Suite 4, Portland, OR 97205
        </p>
      </SectionCard>
    </div>
  );
}
