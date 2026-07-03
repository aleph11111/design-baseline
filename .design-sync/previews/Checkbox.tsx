import * as React from "react";
import { Checkbox, Label, SectionCard } from "design-baseline";

// A realistic checklist — notification preferences, mixed checked/unchecked.
export function NotificationPrefs() {
  return (
    <div className="max-w-sm">
      <SectionCard title="Notification preferences">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="cb-email" defaultChecked />
            <Label htmlFor="cb-email">Email notifications</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-sms" />
            <Label htmlFor="cb-sms">SMS alerts</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-digest" defaultChecked />
            <Label htmlFor="cb-digest">Weekly digest</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-updates" />
            <Label htmlFor="cb-updates">Product updates</Label>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// Default / checked / disabled / disabled-checked, labeled so the axis is
// legible at a glance.
export function States() {
  return (
    <div className="max-w-sm">
      <SectionCard title="States">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="cb-state-unchecked" />
            <Label htmlFor="cb-state-unchecked">Unchecked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-state-checked" defaultChecked />
            <Label htmlFor="cb-state-checked">Checked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-state-disabled" disabled />
            <Label htmlFor="cb-state-disabled" className="opacity-70">
              Disabled
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-state-disabled-checked" defaultChecked disabled />
            <Label htmlFor="cb-state-disabled-checked" className="opacity-70">
              Disabled &amp; checked
            </Label>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
