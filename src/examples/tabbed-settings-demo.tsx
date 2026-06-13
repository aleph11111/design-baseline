/**
 * tabbed-settings-demo.tsx
 *
 * Sandbox second consumer for the F2 (tabbed-settings) archetype.
 * Domain: a podcast studio's workspace settings — deliberately far from the
 * brickshop source nouns (no inventory / orders / lots / items).
 *
 * Types are defined FIRST, with zero reference to the source spec, then plugged
 * into <SettingsPageShell> + shadcn <Tabs>. If a type didn't fit the primitive,
 * the primitive would carry a source-specific assumption — it does not.
 *
 * Exercises:
 *   - <SettingsPageShell> chrome: breadcrumb slot + header (no page-level actions)
 *   - Tab strip as navigation across three categories
 *   - Per-tab body delegation: a form body (General), a table body
 *     (Distribution), a list body (Team) — one per allowed delegate
 *   - Persistent below-tab section separated by <Separator> (allowed variation)
 */

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { SettingsPageShell } from "@/components/archetypes/tabbed-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Domain types (defined first — no primitive coupling)
// ---------------------------------------------------------------------------

type WorkspaceGeneral = {
  showName: string;
  contactEmail: string;
  explicitByDefault: boolean;
};

type ChannelStatus = "live" | "pending" | "paused";

type DistributionChannel = {
  id: string;
  name: string;
  status: ChannelStatus;
  episodes: number;
};

type TeamRole = "owner" | "editor" | "guest";

type TeamMember = {
  id: string;
  name: string;
  role: TeamRole;
};

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_GENERAL: WorkspaceGeneral = {
  showName: "The Long Echo",
  contactEmail: "studio@thelongecho.fm",
  explicitByDefault: false,
};

const SEED_CHANNELS: DistributionChannel[] = [
  { id: "c1", name: "Apple Podcasts", status: "live", episodes: 142 },
  { id: "c2", name: "Spotify", status: "live", episodes: 142 },
  { id: "c3", name: "YouTube Music", status: "pending", episodes: 0 },
  { id: "c4", name: "Overcast", status: "paused", episodes: 98 },
];

const SEED_TEAM: TeamMember[] = [
  { id: "m1", name: "Ada Reyes", role: "owner" },
  { id: "m2", name: "Théo Marchand", role: "editor" },
  { id: "m3", name: "Priya Anand", role: "guest" },
];

const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  editor: "Editor",
  guest: "Guest",
};

const STATUS_VARIANT: Record<ChannelStatus, "default" | "secondary" | "outline"> = {
  live: "default",
  pending: "outline",
  paused: "secondary",
};

// ---------------------------------------------------------------------------
// Demo component
// ---------------------------------------------------------------------------

export function TabbedSettingsDemo() {
  const [general, setGeneral] = React.useState<WorkspaceGeneral>(SEED_GENERAL);
  const [channels] = React.useState<DistributionChannel[]>(SEED_CHANNELS);
  const [team] = React.useState<TeamMember[]>(SEED_TEAM);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const breadcrumbs = (
    <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
      Settings <span className="px-1">/</span>{" "}
      <span className="text-foreground">Workspace</span>
    </nav>
  );

  return (
    <div className="container mx-auto px-6 py-6">
      <SettingsPageShell
        title="Workspace"
        subtitle="Configure your podcast studio's general, distribution, and team settings."
        icon={SlidersHorizontal}
        breadcrumbs={breadcrumbs}
        /* No `actions` — F2 has no page-level actions; per-tab actions live in each body. */
      >
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Tab body 1 — delegates to a settings-form (D1) shape */}
          <TabsContent value="general" className="pt-4">
            <div className="max-w-lg space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="showName">Show name</Label>
                <Input
                  id="showName"
                  value={general.showName}
                  onChange={(e) =>
                    setGeneral((g) => ({ ...g, showName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={general.contactEmail}
                  onChange={(e) =>
                    setGeneral((g) => ({ ...g, contactEmail: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Mark new episodes explicit</p>
                  <p className="text-xs text-muted-foreground">
                    Applied to every newly published episode by default.
                  </p>
                </div>
                <Switch
                  checked={general.explicitByDefault}
                  onCheckedChange={(v) =>
                    setGeneral((g) => ({ ...g, explicitByDefault: v }))
                  }
                />
              </div>
              {/* Per-tab action — NOT in the page header */}
              <div className="flex justify-end">
                <Button onClick={() => setLastAction("General settings saved")}>
                  Save changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab body 2 — delegates to a settings-table (D2) shape */}
          <TabsContent value="distribution" className="pt-4">
            <div className="flex justify-end pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLastAction("Add distribution channel")}
              >
                Add channel
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Episodes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium">{channel.name}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[channel.status]}>
                        {channel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{channel.episodes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Tab body 3 — delegates to a list-with-detail (A) shape */}
          <TabsContent value="team" className="pt-4">
            <ul className="divide-y rounded-md border">
              {team.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm font-medium">{member.name}</span>
                  <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>

        {/* Persistent below-tab section (allowed variation) — applies to all tabs */}
        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {lastAction ? (
              <>
                Last action:{" "}
                <span className="font-medium text-foreground">{lastAction}</span>
              </>
            ) : (
              "No unsaved changes across tabs."
            )}
          </span>
          <span>Workspace ID: ws_8f21</span>
        </div>
      </SettingsPageShell>
    </div>
  );
}
