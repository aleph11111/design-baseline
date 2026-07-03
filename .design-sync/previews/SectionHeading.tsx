import * as React from "react";
import { Button, SectionHeading } from "design-baseline";

// Bare overline in a bordered surface — title only, no chrome of its own.
export function TitleOnly() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <SectionHeading title="Shipping address" />
      <p className="mt-3 text-sm text-muted-foreground">
        142 Elm Street, Suite 4, Portland, OR 97205
      </p>
    </div>
  );
}

// Title + clarifier line, still bare above real content.
export function WithDescription() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <SectionHeading
        title="Recent activity"
        description="Across all channels this week."
      />
      <ul className="mt-3 space-y-1.5 text-sm text-foreground">
        <li>Invoice #4821 sent to Acme Corp</li>
        <li>Payment received — €1,240.00</li>
      </ul>
    </div>
  );
}

// Title + right-aligned action — sized to the heading per the API contract.
export function WithActions() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <SectionHeading
        title="Team members"
        actions={
          <Button variant="ghost" size="sm" className="-my-1.5 h-7 text-xs">
            Invite
          </Button>
        }
      />
      <p className="mt-3 text-sm text-muted-foreground">4 people have access.</p>
    </div>
  );
}
