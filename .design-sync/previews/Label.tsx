import * as React from "react";
import { Checkbox, Input, Label, SectionCard } from "design-baseline";

// The canonical pairing: Label's htmlFor bound to an Input's id, stacked
// above the field.
export function WithInput() {
  return (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="label-email">Email address</Label>
      <Input id="label-email" type="email" placeholder="you@example.com" />
    </div>
  );
}

// Label sitting beside a Checkbox — the inline-pairing shape, not the
// stacked field shape.
export function WithCheckbox() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="label-terms" defaultChecked />
      <Label htmlFor="label-terms">I agree to the terms of service</Label>
    </div>
  );
}

// A required-field marker — the common asterisk convention layered onto the
// same Label + Input pairing.
export function Required() {
  return (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="label-required">
        Full name <span className="text-destructive">*</span>
      </Label>
      <Input id="label-required" placeholder="Jordan Kessler" />
    </div>
  );
}

// Peer-disabled dimming — Label reacts to a disabled sibling control via
// `peer-disabled:opacity-70`, shown next to its enabled counterpart.
export function DisabledPeer() {
  return (
    <div className="max-w-sm">
      <SectionCard title="Notification channel">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="label-peer-enabled" className="peer" defaultChecked />
            <Label htmlFor="label-peer-enabled">Email</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="label-peer-disabled" className="peer" disabled />
            <Label htmlFor="label-peer-disabled" className="peer-disabled:opacity-70">
              SMS (requires phone verification)
            </Label>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
