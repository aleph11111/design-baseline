/**
 * tabbed-settings-demo.tsx
 *
 * Sandbox second consumer for the F2 (tabbed-settings) archetype.
 * Domain: a podcast studio's workspace settings — deliberately far from the
 * brickshop source nouns (no inventory / orders / lots / items).
 *
 * Types are defined FIRST, with zero reference to the source spec, then plugged
 * into <SettingsPageShell>'s typed `tabs`. If a type didn't fit the primitive,
 * the primitive would carry a source-specific assumption — it does not.
 *
 * Exercises:
 *   - <SettingsPageShell> page frame (ADR-0008): breadcrumb slot + the title
 *     once above the frame (no page-level actions); the tab strip is the
 *     frame's toolbar band
 *   - Tab strip as navigation across the categories
 *   - Per-tab body delegation: a form body (General), a frameless table body
 *     (Distribution, via <SettingsTableBody> v3.2 — the tab label owns the
 *     heading, so the body renders no page frame; the body's own flush band
 *     carries the tab's create action and count caption), a list body
 *     (Team) — one per allowed delegate
 *   - Persistent below-tab section (`belowTabs`, allowed variation)
 *   - Nested: the shell under a parent page frame titles itself as the nested
 *     heading and joins the parent's surface — derived, no prop
 */

import * as React from "react";
import {
  SettingsPageShell,
  type SettingsTab,
} from "@/components/archetypes/tabbed-settings";
import {
  DetailSection,
  KeyValueList,
  KeyValueRow,
} from "@/components/archetypes/detail-overview";
import {
  SettingsTableBody,
  type SettingsColumn,
} from "@/components/archetypes/settings-table";
import { PageFrame } from "@/components/layout";
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

// The Distribution tab renders through <SettingsTableBody> (the frameless D2
// export, v3.2) — the tab trigger label owns the heading, so the body renders
// no second nested heading; its flush control band carries the create action
// and the result count caption.
const CHANNEL_COLUMNS: SettingsColumn<DistributionChannel>[] = [
  {
    key: "name",
    header: "Channel",
    isIdentifier: true,
    cell: (c) => c.name,
  },
  {
    key: "status",
    header: "Status",
    cell: (c) => <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>,
  },
  {
    key: "episodes",
    header: "Episodes",
    align: "right",
    cell: (c) => <span className="tabular-nums">{c.episodes}</span>,
  },
];

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

  const tabs: SettingsTab[] = [
    // Tabbed-detail composition (F2 shell over a C body): this tab body is a
    // detail-overview <DetailSection> rather than a settings body.
    {
      value: "overview",
      label: "Overview",
      content: (
        <DetailSection title="Workspace" flush>
          <KeyValueList>
            <KeyValueRow label="Show name" value={general.showName} />
            <KeyValueRow label="Contact" value={general.contactEmail} />
            <KeyValueRow
              label="Channels live"
              value={channels.filter((c) => c.status === "live").length}
            />
            <KeyValueRow label="Team size" value={team.length} />
            <KeyValueRow
              label="Explicit by default"
              value={general.explicitByDefault ? "Yes" : "No"}
            />
          </KeyValueList>
        </DetailSection>
      ),
    },
    // Tab body 1 — delegates to a settings-form (D1) shape
    {
      value: "general",
      label: "General",
      content: (
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mark new episodes explicit</p>
              <p className="text-[11px] text-muted-foreground">
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
      ),
    },
    // Tab body 2 — delegates to a settings-table (D2) body, frameless (v3.2).
    // The tab-trigger label is the only heading for this tab; the body renders
    // no page frame, so there is no second nested heading repeating
    // "Distribution". A tab has no page header to hold the create action and
    // the result count, so the body's own flush band carries them: the
    // "Add channel" create button (from onAddNew, right side of the band) and
    // the "{n} channels" count caption.
    {
      value: "distribution",
      label: "Distribution",
      content: (
        <SettingsTableBody
          rows={channels}
          columns={CHANNEL_COLUMNS}
          getRowId={(c) => c.id}
          rowLabel="channels"
          onAddNew={() => setLastAction("Add distribution channel")}
          addNewLabel="Add channel"
        />
      ),
    },
    // Tab body 3 — a list of records → the shared <Table> (same molecule
    // as list-with-detail / settings-table), NOT a hand-rolled <ul>, so it
    // reads visually identical to every other record list.
    {
      value: "team",
      label: "Team",
      content: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SettingsPageShell
          title="Workspace"
          subtitle={breadcrumbs}
          tabs={tabs}
          /* Persistent below-tab section (allowed variation) — applies to all tabs */
          belowTabs={
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
              <span>Workspace ID: <span className="tabular-nums">ws_8f21</span></span>
            </div>
          }
        />
      </div>

      {/* Nested — a settings sub-route under a layout that owns the page: the
          shell titles itself as the nested heading and joins the parent's
          surface, derived from where it renders. */}
      <div>
        <PageFrame title="Settings" subtitle="Parent layout owns the page">
          <SettingsPageShell
            title="Notifications"
            tabs={[
              {
                value: "email",
                label: "Email",
                content: (
                  <p className="text-sm text-muted-foreground">
                    Weekly digest to {general.contactEmail}.
                  </p>
                ),
              },
              {
                value: "push",
                label: "Push",
                content: (
                  <p className="text-sm text-muted-foreground">
                    Push alerts are off for this workspace.
                  </p>
                ),
              },
            ]}
          />
        </PageFrame>
      </div>
    </div>
  );
}
