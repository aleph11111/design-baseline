import * as React from "react";
import { Badge, Button, SurfaceHeader } from "design-baseline";
import { Plus } from "lucide-react";

// House Style B default — solid accent fill, inverted actions, semantic badge
// stays semantic even on the inverted bar.
export function Solid() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <SurfaceHeader
        kicker="Orders"
        title={<span className="font-mono">#1042</span>}
        headerFill="solid"
        actions={
          <>
            <Badge variant="success">Paid</Badge>
            <Button variant="outline" size="sm">
              Invoice
            </Button>
            <Button size="sm">
              <Plus /> Fulfil
            </Button>
          </>
        }
      />
      <div className="px-5 py-4 text-[13px] text-muted-foreground">
        Acme Corp · placed 2 Jun 2024 · 4 line items
      </div>
    </div>
  );
}

// Softer tint fill — normal-weight text, still on the bounded surface.
export function Tint() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <SurfaceHeader
        kicker="Aufträge"
        title="Auftrag #1042"
        headerFill="tint"
        actions={
          <Button variant="outline" size="sm">
            Bearbeiten
          </Button>
        }
      />
      <div className="px-5 py-4 text-[13px] text-muted-foreground">
        Erfasst am 2. Juni 2024
      </div>
    </div>
  );
}

// Quietest step — plain white, hairline border only.
export function White() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <SurfaceHeader
        kicker="Customers"
        title="Priya Natarajan"
        headerFill="white"
        actions={
          <Button variant="outline" size="sm">
            Edit
          </Button>
        }
      />
      <div className="px-5 py-4 text-[13px] text-muted-foreground">
        Customer since Mar 2022 · 18 orders
      </div>
    </div>
  );
}
