import * as React from "react";
import { Inbox } from "lucide-react";
import { Button, StateView } from "design-baseline";

// Empty — icon, headline, muted description, and a CTA to resolve it, as it
// renders inside a list panel with no rows yet.
export function EmptyWithAction() {
  return (
    <div className="max-w-sm rounded-md border bg-card">
      <StateView
        variant="empty"
        icon={Inbox}
        title="No messages yet"
        description="New messages from your team will show up here."
        action={<Button size="sm">Compose message</Button>}
      />
    </div>
  );
}

// Error — a destructive alert with a retry action, the way a failed fetch
// renders in a list/table shell.
export function ErrorWithRetry() {
  return (
    <div className="max-w-sm rounded-md border bg-card">
      <StateView
        variant="error"
        title="Couldn't load invoices"
        description="Check your connection and try again."
        onRetry={() => {}}
      />
    </div>
  );
}

// Loading — the centered status line shown while a panel's data is in
// flight.
export function Loading() {
  return (
    <div className="max-w-sm rounded-md border bg-card">
      <StateView variant="loading" />
    </div>
  );
}
