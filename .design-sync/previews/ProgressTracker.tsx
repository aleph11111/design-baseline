import * as React from "react";
import { ProgressTracker } from "design-baseline";

// Order lifecycle — done/done/current/pending, the canonical fulfilment flow.
export function OrderLifecycle() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <ProgressTracker
        steps={[
          { label: "Placed", meta: "2 Jun", state: "done" },
          { label: "Paid", meta: "2 Jun", state: "done" },
          { label: "Packed", meta: "In progress", state: "current" },
          { label: "Shipped", meta: "Pending", state: "pending" },
        ]}
      />
    </div>
  );
}

// Checkout process — a different domain, still reads --primary automatically.
export function CheckoutSteps() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <ProgressTracker
        steps={[
          { label: "Cart", state: "done" },
          { label: "Details", state: "done" },
          { label: "Payment", state: "current" },
          { label: "Review", state: "pending" },
        ]}
      />
    </div>
  );
}

// Early in the flow — only the first step done, so most connectors are muted.
export function JustStarted() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <ProgressTracker
        steps={[
          { label: "Application", meta: "12 Jun", state: "done" },
          { label: "Screening", meta: "Scheduled", state: "current" },
          { label: "Interview", state: "pending" },
          { label: "Offer", state: "pending" },
        ]}
      />
    </div>
  );
}
