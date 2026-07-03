import * as React from "react";
import {
  SettingsPageShell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Input,
  Label,
  Switch,
} from "design-baseline";

// Domain: a podcast studio's workspace settings.
const CHANNELS = [
  { id: "c1", name: "Apple Podcasts", status: "live" as const, episodes: 142 },
  { id: "c2", name: "Spotify", status: "live" as const, episodes: 142 },
  { id: "c3", name: "YouTube Music", status: "pending" as const, episodes: 0 },
];
const STATUS_VARIANT = { live: "default", pending: "outline" } as const;

// F2 board form — kicker sets the on-surface header; a <Tabs> body shares the
// shell across categories (General / Distribution / Team).
export function TabbedSettings() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell title="Workspace" kicker="Settings">
        <Tabs defaultValue="distribution">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="pt-4">
            <p className="text-sm text-muted-foreground">The Long Echo · studio@thelongecho.fm</p>
          </TabsContent>
          <TabsContent value="distribution" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Episodes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CHANNELS.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{c.episodes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="team" className="pt-4">
            <p className="text-sm text-muted-foreground">3 members · Ada Reyes (Owner)</p>
          </TabsContent>
        </Tabs>
      </SettingsPageShell>
    </div>
  );
}

// D1 settings-form reuse — board form with `headerActions` (a Save button
// on the surface bar itself), children is a plain form body.
export function SettingsFormWithHeaderAction() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell
        title="General"
        kicker="Settings"
        headerActions={<Button size="sm">Save changes</Button>}
      >
        <div className="max-w-lg space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sps-show-name">Show name</Label>
            <Input id="sps-show-name" defaultValue="The Long Echo" />
          </div>
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Mark new episodes explicit</p>
              <p className="text-[11px] text-muted-foreground">
                Applied to every newly published episode by default.
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </div>
      </SettingsPageShell>
    </div>
  );
}

// Classic layout — no kicker/headerActions, so `<SettingsPageHeader>` renders
// above the body instead of the on-surface bar; a breadcrumb trail sits above it.
export function ClassicWithBreadcrumbs() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell
        title="Distribution"
        subtitle="Where The Long Echo is published"
        breadcrumbs={
          <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
            Settings <span className="px-1">/</span>{" "}
            <span className="text-foreground">Distribution</span>
          </nav>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Episodes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CHANNELS.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{c.episodes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SettingsPageShell>
    </div>
  );
}
