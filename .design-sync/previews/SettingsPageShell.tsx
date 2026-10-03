import {
  SettingsPageShell,
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

function ChannelTable() {
  return (
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
  );
}

const GENERAL_FORM = (
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
    <Button size="sm">Save changes</Button>
  </div>
);

const TABS = [
  { value: "general", label: "General", content: GENERAL_FORM },
  { value: "distribution", label: "Distribution", content: <ChannelTable /> },
  {
    value: "team",
    label: "Team",
    content: <p className="text-sm text-muted-foreground">3 members · Ada Reyes (Owner)</p>,
  },
];

// The title renders once, as the page header; the tab strip is the frame's
// toolbar band and the selected tab is the body (ADR-0008). Per-tab actions
// (Save) live in the tab body — the page header carries none.
export function TabbedSettings() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell title="Workspace" tabs={TABS} defaultTab="distribution" />
    </div>
  );
}

// A breadcrumb trail rides the page header's subtitle position.
export function WithBreadcrumbs() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <SettingsPageShell
        title="Distribution"
        subtitle={
          <nav aria-label="Breadcrumb">
            Settings <span className="px-1">/</span>{" "}
            <span className="text-foreground">Distribution</span>
          </nav>
        }
        tabs={TABS}
        defaultTab="general"
      />
    </div>
  );
}
