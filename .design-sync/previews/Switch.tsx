import * as React from "react";
import { Label, SectionCard, Switch } from "design-baseline";

// The canonical settings-row shape: title + description on the left, Switch
// on the right, several rows stacked in a titled section.
export function SettingsRows() {
  return (
    <div className="max-w-md">
      <SectionCard title="Account settings">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="sw-2fa">Two-factor authentication</Label>
              <p className="text-sm text-muted-foreground">Require a code at every sign-in.</p>
            </div>
            <Switch id="sw-2fa" defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="sw-marketing">Marketing emails</Label>
              <p className="text-sm text-muted-foreground">Product news and occasional offers.</p>
            </div>
            <Switch id="sw-marketing" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="sw-dark">Dark mode</Label>
              <p className="text-sm text-muted-foreground">Match the system appearance.</p>
            </div>
            <Switch id="sw-dark" defaultChecked />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// On / off / disabled-on / disabled-off, each labeled.
export function States() {
  return (
    <div className="max-w-sm">
      <SectionCard title="States">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sw-state-off">Off</Label>
            <Switch id="sw-state-off" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sw-state-on">On</Label>
            <Switch id="sw-state-on" defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sw-state-disabled-off" className="opacity-70">
              Disabled off
            </Label>
            <Switch id="sw-state-disabled-off" disabled />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sw-state-disabled-on" className="opacity-70">
              Disabled on
            </Label>
            <Switch id="sw-state-disabled-on" defaultChecked disabled />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
