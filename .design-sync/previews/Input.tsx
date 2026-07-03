import * as React from "react";
import { Input, Label, SectionCard } from "design-baseline";

// A labeled field stack the way a profile form actually composes it: each
// field is a Label + Input pair, one with helper text underneath.
export function ProfileFields() {
  return (
    <div className="max-w-md">
      <SectionCard title="Profile details">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="input-name">Full name</Label>
            <Input id="input-name" defaultValue="Priya Natarajan" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="input-email">Email address</Label>
            <Input id="input-email" type="email" defaultValue="priya@northwind.io" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="input-site">Company website</Label>
            <Input id="input-site" placeholder="https://example.com" />
            <p className="text-sm text-muted-foreground">Shown on your public profile.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// Default / focused-look / disabled / error, side by side against the same
// field so the state axis is easy to compare.
export function States() {
  return (
    <div className="max-w-md">
      <SectionCard title="Field states">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="input-default">Project name</Label>
            <Input id="input-default" defaultValue="Riverside Renovation" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="input-focused">Client reference</Label>
            <Input
              id="input-focused"
              defaultValue="RVR-2026-014"
              className="outline-none ring-2 ring-ring ring-offset-2"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="input-disabled" className="opacity-70">
              Workspace
            </Label>
            <Input id="input-disabled" defaultValue="Northwind (locked)" disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="input-error" className="text-destructive">
              Billing email
            </Label>
            <Input
              id="input-error"
              defaultValue="priya@northwind"
              className="border-destructive focus-visible:ring-destructive"
            />
            <p className="text-sm font-medium text-destructive">Enter a valid email address.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// Real input `type` variants sitting together in a row, the way a shipment
// form mixes numbers, dates, and currency.
export function FieldTypes() {
  return (
    <div className="max-w-md">
      <SectionCard title="Shipment details">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="input-qty">Quantity</Label>
            <Input id="input-qty" type="number" min={1} defaultValue={12} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="input-date">Ship date</Label>
            <Input id="input-date" type="date" defaultValue="2026-07-10" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="input-price">Unit price</Label>
            <Input id="input-price" type="text" inputMode="decimal" defaultValue="€24.50" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
