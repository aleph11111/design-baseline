import * as React from "react";
import { Settings2 } from "lucide-react";
import {
  SettingsPageShell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from "design-baseline";

// SettingsPageHeader only renders when `<SettingsPageShell>` is in classic
// mode (no `kicker`/`headerActions`) — every cell mounts it that way, with a
// tabbed body below so the header reads in its real page context.

// Title only — the minimal classic header.
export function TitleOnly() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell title="Workspace">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="pt-4">
            <p className="text-sm text-muted-foreground">The Long Echo · studio@thelongecho.fm</p>
          </TabsContent>
          <TabsContent value="team" className="pt-4">
            <p className="text-sm text-muted-foreground">3 members · Ada Reyes (Owner)</p>
          </TabsContent>
        </Tabs>
      </SettingsPageShell>
    </div>
  );
}

// Subtitle + decorative icon.
export function WithSubtitleAndIcon() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell
        title="Workspace"
        subtitle="Studio-wide defaults for The Long Echo"
        icon={Settings2}
      >
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="pt-4">
            <p className="text-sm text-muted-foreground">The Long Echo · studio@thelongecho.fm</p>
          </TabsContent>
          <TabsContent value="team" className="pt-4">
            <p className="text-sm text-muted-foreground">3 members · Ada Reyes (Owner)</p>
          </TabsContent>
        </Tabs>
      </SettingsPageShell>
    </div>
  );
}

// `actions` slot — retained for the shared settings-form (D1) consumer, where
// a single-entity form surfaces a Save button beside the title.
export function WithActions() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell title="Billing" actions={<Button size="sm">Save changes</Button>}>
        <p className="text-sm text-muted-foreground">
          Plan: <span className="font-medium text-foreground">Studio Pro</span> · renews 1 Aug 2026
        </p>
      </SettingsPageShell>
    </div>
  );
}
