/**
 * Gallery-local demos for the shared LAYOUT primitives (chrome that isn't a page
 * archetype). Lets the gallery show them for visual-consistency review, the same
 * way archetype demos do. Gallery-only — not part of the shipped baseline.
 */

import * as React from "react";
import { Bell, Box, Inbox, Plus, Settings, User } from "lucide-react";
import {
  AuthCard,
  MetricList,
  MetricRow,
  NestedPageHeading,
  PageFrame,
  PageHeader,
  ProgressTracker,
  SectionCard,
  SectionHeading,
  StatTile,
  StatTileRow,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ToggleField } from "@/components/ui/toggle-field";
import { SelectField } from "@/components/archetypes/raw-select";
import { NativeField } from "@/components/archetypes/raw-input";
import { SearchInput } from "@/components/ui/search-input";
import { Input } from "@/components/ui/input";
import { ControlDensityProvider, JOINED_LABEL_CLASS, JoinedLabelText } from "@/components/ui/toolbar-band";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { StateView } from "@/components/ui/state-view";
import { IconAvatar } from "@/components/ui/icon-avatar";
import { CellInput, CellSelect } from "@/components/ui/cell-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowActionsMenu } from "@/components/archetypes/shared";
import { SectionNavDemo } from "@/examples/section-nav-demo";

export type LayoutPrim = {
  slug: string;
  displayName: string;
  Demo: React.ComponentType;
};

/** Small labelled wrapper so several variants of one primitive stack clearly. */
function Variant({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function PageHeaderDemo() {
  return (
    <div className="space-y-8">
      <Variant label="Title + subtitle">
        <PageHeader title="Customers" subtitle="Everyone who's bought at least once." />
      </Variant>
      <Variant label="Icon + subtitle + actions">
        <PageHeader
          title="Order #1042"
          subtitle="Acme Corp · 8 Nov 2024"
          icon={Box}
          actions={
            <>
              <Button variant="outline">Export</Button>
              <Button>Edit</Button>
            </>
          }
        />
      </Variant>
      <Variant label="Long title + actions (stacks below sm; resize to 430px)">
        <PageHeader
          title="Quarterly capacity planning for the regional operations team"
          subtitle="Covers staffing, budget and open requisitions across every site."
          actions={
            <>
              <Button variant="outline">Export</Button>
              <Button>Edit</Button>
            </>
          }
        />
      </Variant>
      <Variant label="With back link">
        <PageHeader title="New contact" backHref="#" backLabel="Back to contacts" />
      </Variant>
    </div>
  );
}

/**
 * The nested page heading — the run in the heading ladder that sits
 * between PageHeader (h1) and SectionHeading (the overline h2). A tabbed
 * sub-route whose parent owns the <h1> titles its own sub-area with this, at a
 * single fixed scale (no size/weight prop).
 */
function NestedPageHeadingDemo() {
  return (
    <div className="space-y-8">
      <Variant label="Title only">
        <NestedPageHeading title="Devices" />
      </Variant>
      <Variant label="Title + subtitle">
        <NestedPageHeading title="Devices" subtitle="12 connected · 2 offline" />
      </Variant>
      <Variant label="Title + badges + actions">
        <NestedPageHeading
          title="Devices"
          badges={<Badge variant="secondary">2 offline</Badge>}
          actions={<Button variant="ghost" size="sm" className="-my-1.5 h-7 text-xs">Manage</Button>}
        />
      </Variant>
    </div>
  );
}

/**
 * The heading-scale ladder, end to end, so the scale relationship between the
 * three rungs is visible at a glance: page title (h1) > nested page title (h2)
 * > section overline (h2).
 */
function HeadingLadderDemo() {
  return (
    <div className="max-w-2xl space-y-8">
      <Variant label="Rung 1 · PageHeader — page title (h1)">
        <PageHeader title="Order #1042" subtitle="Acme Corp · 8 Nov 2024" />
      </Variant>
      <Variant label="Rung 2 · NestedPageHeading — nested page title (h2)">
        <NestedPageHeading title="Devices" />
      </Variant>
      <Variant label="Rung 3 · SectionHeading — section overline (h2)">
        <SectionHeading title="Details" />
      </Variant>
    </div>
  );
}

function SectionHeadingDemo() {
  return (
    <div className="space-y-8">
      <Variant label="Title only">
        <SectionHeading title="Details" />
      </Variant>
      <Variant label="Title + description">
        <SectionHeading title="Recent activity" description="Across all channels this week." />
      </Variant>
      <Variant label="Title + actions">
        <SectionHeading
          title="Resources"
          actions={<Button variant="ghost" size="sm" className="-my-1.5 h-7 text-xs">Add</Button>}
        />
      </Variant>
    </div>
  );
}

function SectionCardDemo() {
  return (
    <div className="max-w-2xl space-y-8">
      <Variant label="Default tone · padded body">
        <SectionCard title="Summary">
          <p className="text-sm text-muted-foreground">
            Free-form padded content lives here.
          </p>
        </SectionCard>
      </Variant>
      <Variant label="Flush body · ruled rows">
        <SectionCard title="Attributes" flush>
          <div className="divide-y divide-border text-sm">
            <div className="flex justify-between px-5 py-2.5"><span className="text-muted-foreground">Status</span><span className="font-medium">Active</span></div>
            <div className="flex justify-between px-5 py-2.5"><span className="text-muted-foreground">Owner</span><span className="font-medium">Ada Reyes</span></div>
          </div>
        </SectionCard>
      </Variant>
      <Variant label="Muted tone + actions">
        <SectionCard
          title="Links"
          tone="muted"
          actions={<Badge variant="secondary">2</Badge>}
        >
          <p className="text-sm text-muted-foreground">Lightest surface — for reference panels.</p>
        </SectionCard>
      </Variant>
    </div>
  );
}

function StatTilesDemo() {
  return (
    <div className="max-w-3xl space-y-8">
      <Variant label="3 tiles">
        <StatTileRow>
          <StatTile label="Revenue" value="€58.9k" hint="vs last month" />
          <StatTile label="Orders" value="812" hint="paid + fulfilled" />
          <StatTile label="Avg order" value="€72" />
        </StatTileRow>
      </Variant>
      <Variant label="4 tiles">
        <StatTileRow>
          <StatTile label="Plays" value="142" />
          <StatTile label="Mean session" value="2h 35m" />
          <StatTile label="Rating" value="5" />
          <StatTile label="Weight" value="3.9" hint="/ 5" />
        </StatTileRow>
      </Variant>
    </div>
  );
}

function AuthCardDemo() {
  return (
    <AuthCard
      title="Sign in"
      description="Welcome back — enter your credentials."
      icon={Settings}
      footer={
        <span className="text-muted-foreground">
          No account?{" "}
          <a className="font-medium text-primary hover:underline" href="#">
            Register
          </a>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="auth-email">Email</Label>
          <Input id="auth-email" type="email" placeholder="name@company.com" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="auth-pw">Password</Label>
            <a
              className="text-xs text-muted-foreground hover:text-foreground"
              href="#"
            >
              Forgot?
            </a>
          </div>
          <Input id="auth-pw" type="password" placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}

// ---------------------------------------------------------------------------
// Shared content molecules — the single owners of recurring sub-page patterns.
// Shown here side-by-side precisely so a reviewer can confirm they render
// identically wherever they're used (see STYLE.md "Shared content molecules").
// ---------------------------------------------------------------------------

function SegmentedControlDemo() {
  const [filter, setFilter] = React.useState("all");
  const [view, setView] = React.useState("table");
  return (
    <div className="space-y-8">
      <Variant label="Filter (All · Unread · Mentions)">
        <SegmentedControl
          aria-label="Filter"
          value={filter}
          onValueChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
            { value: "mentions", label: "Mentions" },
          ]}
        />
      </Variant>
      <Variant label="View mode (same molecule, different content)">
        <SegmentedControl
          aria-label="View"
          value={view}
          onValueChange={setView}
          options={[
            { value: "table", label: "Table" },
            { value: "cards", label: "Cards" },
            { value: "rows", label: "Rows" },
          ]}
        />
      </Variant>
    </div>
  );
}

function ToggleFieldDemo() {
  const [on, setOn] = React.useState(true);
  return (
    <div className="space-y-8">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Variant key={size} label={`${size} — one band, one step: the toggle is the same height as its neighbours`}>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              size={size}
              aria-label="Ansicht"
              value="a"
              onValueChange={() => {}}
              options={[
                { value: "a", label: "Alle" },
                { value: "b", label: "Offen" },
              ]}
            />
            <ToggleField size={size} checked={on} onCheckedChange={setOn}>
              Show inactive
            </ToggleField>
            <ToggleField size={size} label="Status" checked={on} onCheckedChange={setOn}>
              Active only
            </ToggleField>
          </div>
        </Variant>
      ))}
      <Variant label="in a PageFrame band — the label joins the box; outside a band it stacks above">
        <PageFrame
          title="Quellen"
          toolbar={
            <ToggleField label="Status" checked={on} onCheckedChange={setOn}>
              Active only
            </ToggleField>
          }
        >
          <p className="text-sm text-muted-foreground">Rows</p>
        </PageFrame>
      </Variant>
      <Variant label="outside a band — stacked label">
        <ToggleField label="Status" checked={on} onCheckedChange={setOn}>
          Active only
        </ToggleField>
      </Variant>
    </div>
  );
}

function SearchInputDemo() {
  const [q, setQ] = React.useState("");
  const [clearable, setClearable] = React.useState("acme");
  const [counted, setCounted] = React.useState("inv");
  const matches = counted ? (counted.length * 3) % 41 : 0;
  return (
    <div className="max-w-xl space-y-8">
      <Variant label="Default (max-w-sm, flex-1)">
        <SearchInput value={q} onChange={setQ} placeholder="Search records…" />
      </Variant>
      <Variant label="In a toolbar row (with a trailing action)">
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search…" />
          <Button className="shrink-0">
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
      </Variant>
      <Variant label="Sizes (sm · default · lg — same widget, different density)">
        <div className="space-y-2">
          <SearchInput inputSize="sm" value={q} onChange={setQ} placeholder="Compact search…" />
          <SearchInput inputSize="default" value={q} onChange={setQ} placeholder="Default search…" />
          <SearchInput inputSize="lg" value={q} onChange={setQ} placeholder="Mobile search…" />
        </div>
      </Variant>
      <Variant label="Clearable (trailing X appears once there's a value)">
        <SearchInput
          clearable
          value={clearable}
          onChange={setClearable}
          placeholder="Type, then clear…"
        />
      </Variant>
      <Variant label="Match counter + clearable (counter slot, molecule-owned styling)">
        <SearchInput
          clearable
          count={`${matches}/40`}
          value={counted}
          onChange={setCounted}
          placeholder="Filter…"
          inputMode="search"
        />
      </Variant>
    </div>
  );
}

function StateViewDemo() {
  return (
    <div className="max-w-xl space-y-8">
      <Variant label="Loading">
        <div className="rounded-lg border bg-card">
          <StateView variant="loading" />
        </div>
      </Variant>
      <Variant label="Empty — single line (back-compat)">
        <div className="rounded-lg border bg-card">
          <StateView variant="empty" message="No records yet." />
        </div>
      </Variant>
      <Variant label="Empty — rich (icon + title + description + CTA)">
        <div className="rounded-lg border bg-card">
          <StateView
            variant="empty"
            icon={Inbox}
            title="No invoices yet"
            description="Invoices you create will appear here."
            action={
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New invoice
              </Button>
            }
          />
        </div>
      </Variant>
      <Variant label="Error — default title (with retry)">
        <StateView
          variant="error"
          error={new Error("Could not reach the server.")}
          onRetry={() => {}}
        />
      </Variant>
      <Variant label="Error — custom title + description (action-less)">
        <StateView
          variant="error"
          title="Couldn't load invoices"
          description="We hit a network error. Check your connection and try again."
        />
      </Variant>
    </div>
  );
}

function IconAvatarDemo() {
  return (
    <div className="space-y-8">
      <Variant label="Sizes (xs · sm · md)">
        <div className="flex items-center gap-4">
          <IconAvatar size="xs">AR</IconAvatar>
          <IconAvatar size="sm">
            <Bell className="h-4 w-4" />
          </IconAvatar>
          <IconAvatar size="md">
            <User className="h-5 w-5" />
          </IconAvatar>
        </div>
      </Variant>
      <Variant label="Initials vs icon (same shape)">
        <div className="flex items-center gap-4">
          <IconAvatar size="sm">TM</IconAvatar>
          <IconAvatar size="sm">PA</IconAvatar>
          <IconAvatar size="sm">
            <Settings className="h-4 w-4" />
          </IconAvatar>
        </div>
      </Variant>
    </div>
  );
}

function RowActionsMenuDemo() {
  const row = { id: "r1", name: "Ada Reyes" };
  return (
    <div className="space-y-8">
      <Variant label="Flat (Edit · Delete)">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Row actions →</span>
          <RowActionsMenu
            row={row}
            actions={[
              { label: "Edit", onSelect: () => {} },
              { label: "Delete", onSelect: () => {}, destructive: true },
            ]}
          />
        </div>
      </Variant>
      <Variant label="Grouped (heading + separators + disabled + destructive)">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Row actions →</span>
          <RowActionsMenu
            row={row}
            actions={[
              { label: "Manage", heading: true },
              { label: "Open detail", onSelect: () => {} },
              { label: "Merge into…", onSelect: () => {} },
              { separator: true },
              { label: "Duplicate", onSelect: () => {} },
              { label: "Archive", onSelect: () => {}, disabled: true },
              { separator: true },
              { label: "Delete", onSelect: () => {}, destructive: true },
            ]}
          />
        </div>
      </Variant>
    </div>
  );
}

/**
 * The status chip tier `Badge`/`Alert` key off — one AA-verified bg/fg pair
 * per tier (`--status-{tier}-{bg,fg}` pairs in tokens.css, the `--color-status-*`
 * roles in the donor layer), the soft-chip look that replaced the solid brand
 * roles on the status variants. Every tier is shown so the axis is visible,
 * not just a prop value; `default` stays on the solid primary fill (a filled
 * surface, not a chip) while `destructive` rides the soft danger tier like the
 * rest — a tinted callout that reads in light and dark. The last variant
 * proves the `whitespace-nowrap shrink-0` base: a badge beside a long title in
 * a `justify-between` row holds one line instead of wrapping and collapsing.
 */
function StatusChipTierDemo() {
  const badgeTiers: Array<[string, "default" | "secondary" | "success" | "warning" | "destructive" | "info"]> = [
    ["default", "default"],
    ["neutral", "secondary"],
    ["success", "success"],
    ["warning", "warning"],
    ["danger", "destructive"],
    ["info", "info"],
  ];
  return (
    <div className="max-w-2xl space-y-8">
      <Variant label="Badge — status chip tier (bg-status-{tier}-bg / text-status-{tier}-fg)">
        <div className="flex flex-wrap items-center gap-2">
          {badgeTiers.map(([tier, variant]) => (
            <Badge key={variant} variant={variant}>
              {tier}
            </Badge>
          ))}
          <Badge variant="outline">outline</Badge>
        </div>
      </Variant>
      <Variant label="Alert — status chip tier (soft bg + tinted border, the same pairs)">
        <div className="space-y-3">
          <Alert variant="warning">
            <AlertTitle>Almost at the limit</AlertTitle>
            <AlertDescription>
              Seat usage is at 90% — a warning stays a warm hue, not brand red.
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle>Shipped</AlertTitle>
            <AlertDescription>The build finished and the canary passed its checks.</AlertDescription>
          </Alert>
          <Alert variant="info">
            <AlertTitle>New in baseline</AlertTitle>
            <AlertDescription>
              The chip tier landed in the donor — an info variant exists for both.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Something failed</AlertTitle>
            <AlertDescription>
              A light danger tint with a readable foreground — legible on the
              dark canvas, not dark red on dark.
            </AlertDescription>
          </Alert>
        </div>
      </Variant>
      <Variant label="Badge — one line beside a long title (whitespace-nowrap shrink-0 base)">
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            Portfolio — 2024 year to date performance and allocation snapshot
          </span>
          <Badge variant="success">22 YTD</Badge>
        </div>
      </Variant>
      <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
        The pairs live in the project-owned <code>tokens.css</code> (<code>:root</code> +{" "}
        <code>.dark</code>); the <code>--color-status-*</code> roles live in the donor-owned layer —
        re-skin the chip tier by editing the brand file, never the layer.
      </p>
    </div>
  );
}

function CellFieldDemo() {
  const [rows, setRows] = React.useState([
    { id: 1, name: "Mapo Tofu", qty: 35, grade: "A" },
    { id: 2, name: "Dan Dan Noodles", qty: 30, grade: "B" },
  ]);
  const set = (i: number, patch: Partial<(typeof rows)[number]>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="max-w-xl space-y-8">
      <Variant label="Editable grid — controls sit flush inside each cell">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-right">
                  <CellInput
                    type="number"
                    value={r.qty}
                    onChange={(e) => set(i, { qty: Number(e.target.value) })}
                    className="text-right"
                  />
                </TableCell>
                <TableCell>
                  <CellSelect
                    value={r.grade}
                    onChange={(e) => set(i, { grade: e.target.value })}
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </CellSelect>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Variant>
    </div>
  );
}

function ProgressTrackerDemo() {
  return (
    <div className="max-w-3xl space-y-8">
      <Variant label="Order lifecycle (one current marker)">
        <div className="rounded-lg border bg-card p-5">
          <ProgressTracker
            steps={[
              { label: "Placed", meta: "2 Jun", state: "done" },
              { label: "Paid", meta: "2 Jun", state: "done" },
              { label: "Packed", meta: "In progress", state: "current" },
              { label: "Shipped", meta: "Pending", state: "pending" },
            ]}
          />
        </div>
      </Variant>
      <Variant label="Deal pipeline (token-pure — reads --primary)">
        <div className="rounded-lg border bg-card p-5">
          <ProgressTracker
            steps={[
              { label: "Qualified", state: "done" },
              { label: "Proposal", state: "done" },
              { label: "Negotiation", state: "current" },
              { label: "Closed", state: "pending" },
            ]}
          />
        </div>
      </Variant>
    </div>
  );
}

function MetricListDemo() {
  return (
    <div className="max-w-sm space-y-8">
      <Variant label="Headline figures + disclosure (rail summary readout)">
        <SectionCard title="Financials" flush>
          <div className="py-3">
            <MetricList
              more={
                <>
                  <MetricRow label="COGS" value="€3,480" />
                  <MetricRow label="Fees" value="€212" />
                </>
              }
            >
              <MetricRow label="Revenue" value="€5,920" hint="incl. shipping" emphasis />
              <MetricRow label="Gross profit" value="€2,228" hint="margin 37.6%" emphasis />
            </MetricList>
          </div>
        </SectionCard>
      </Variant>
      <Variant label="No disclosure (headline rows only; ARR is the key figure)">
        <SectionCard title="At a glance" flush>
          <div className="py-3">
            <MetricList>
              <MetricRow label="Gesamtwert" value="€12.500,00" emphasis />
              <MetricRow label="ARR" value="€4.200,00" hint="annualisiert" emphasis keyFigure />
            </MetricList>
          </div>
        </SectionCard>
      </Variant>
    </div>
  );
}

function PageFrameDemo() {
  const [decimals, setDecimals] = React.useState(true);
  const [density, setDensity] = React.useState("comfortable");
  const rows = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Auftrag</TableHead>
          <TableHead className="text-right">Betrag</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          ["#1042", 1250.5],
          ["#1043", 980],
        ].map(([id, amount]) => (
          <TableRow key={id}>
            <TableCell>{id}</TableCell>
            <TableCell className="text-right tabular-nums">
              {Number(amount).toFixed(decimals ? 2 : 0)} €
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  return (
    <div className="max-w-4xl space-y-8">
      <Variant label="title + actions · toolbar (scoping) · count · View menu (display options) — every control has one home (ADR-0008)">
        <PageFrame
          title="Aufträge"
          subtitle="Q3 2026"
          badges={<Badge variant="success">Aktiv</Badge>}
          actions={
            <>
              <Button variant="outline">Exportieren</Button>
              <Button>
                <Plus /> Anlegen
              </Button>
            </>
          }
          toolbar={<SearchInput placeholder="Aufträge suchen…" className="w-64" />}
          count="2 Ergebnisse"
          viewOptions={
            <>
              <DropdownMenuCheckboxItem
                checked={decimals}
                onCheckedChange={(v) => setDecimals(v === true)}
              >
                Nachkommastellen
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                <DropdownMenuRadioItem value="comfortable">Komfortabel</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">Kompakt</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </>
          }
        >
          {rows}
        </PageFrame>
      </Variant>
      <Variant label="toolbar wrapped in the app's own flex div — in the mobile filter sheet the three selects still stack one per row">
        <PageFrame
          title="Buchungen"
          filterCount={3}
          toolbar={
            <div className="flex">
              {["Jahr", "Monat", "Szenario"].map((label) => (
                <SelectField
                  key={label}
                  label={label}
                  value="a"
                  onChange={() => {}}
                  options={[{ value: "a", label: `${label} A` }]}
                />
              ))}
            </div>
          }
        >
          {rows}
        </PageFrame>
      </Variant>
      <Variant label="crowded toolbar — max 4 scoping fields inline (search counts); the rest collapse into the Filter sheet, never a second row">
        <PageFrame
          title="Trefferliste"
          toolbar={
            <>
              <SearchInput placeholder="Suchen…" className="w-48" />
              {["Status", "Segment", "Region"].map((l) => (
                <SelectField key={l} label={l} value="all" onChange={() => {}} options={[{ value: "all", label: "Alle" }]} />
              ))}
              {["Quelle", "Owner"].map((l) => (
                <SelectField key={l} label={l} value="all" onChange={() => {}} options={[{ value: "all", label: "Alle" }]} />
              ))}
            </>
          }
          count="2 Ergebnisse"
        >
          {rows}
        </PageFrame>
      </Variant>
      <Variant label="crowded band — joined labels give way (ellipsis) before the value truncates; checked by `npm run check:joined-label` at 1440px and 430px">
        <div data-testid="crowded-band">
          <PageFrame
            title="Kostenstellen"
            filterCount={4}
            toolbar={
              <>
                {["Verantwortliche Abteilung", "Kostenstellengruppe"].map((l) => (
                  <SelectField key={l} label={l} value="all" onChange={() => {}} options={[{ value: "all", label: "Alle Werte (ungefiltert)" }]} />
                ))}
                <SegmentedControl
                  label="Genehmigungsstatus"
                  value="a"
                  onValueChange={() => {}}
                  options={[{ value: "a", label: "Alle" }, { value: "b", label: "Offen" }]}
                />
                <NativeField label="Buchungsperiode Geschäftsjahr" type="number" value={2026} onChange={() => {}} />
              </>
            }
          >
            {rows}
          </PageFrame>
          {/* a custom flex consumer of the shared class: its label must yield before its value */}
          <div data-flex-consumer="" className="mt-3 flex h-9 w-56 overflow-hidden rounded-md border">
            <span data-joined-label="" className={`${JOINED_LABEL_CLASS} border-r`}>
              <JoinedLabelText>Verantwortliche Abteilung</JoinedLabelText>
            </span>
            <span className="flex shrink-0 items-center px-3 text-sm">Alle Werte (ungefiltert)</span>
          </div>
        </div>
      </Variant>
      <Variant label="explicit width sets the whole joined box (label + control): the label yields first, then the value truncates; nothing overflows — checked by `npm run check:joined-label`">
        <div data-testid="fixed-width-band">
          <PageFrame
            title="Feste Breite"
            filterCount={4}
            toolbar={
              <>
                <NativeField label="Wochen" type="number" className="w-28" value={12} onChange={() => {}} />
                <NativeField label="Suche" type="number" className="w-80" value={12} onChange={() => {}} />
                <SelectField
                  label="Jahr"
                  className="w-64"
                  value="all"
                  onChange={() => {}}
                  options={[{ value: "all", label: "2026" }]}
                />
                <SelectField
                  label="Verantwortliche Abteilung"
                  className="w-40"
                  value="all"
                  onChange={() => {}}
                  options={[{ value: "all", label: "Alle Werte (ungefiltert)" }]}
                />
              </>
            }
          >
            {rows}
          </PageFrame>
        </div>
      </Variant>
      <Variant label="crowded band — SearchInput holds its 14rem floor (placeholder never clipped); the band scrolls instead. minWidth overrides it">
        <div className="w-[34rem] max-w-full">
          <PageFrame
            title="Aufgaben"
            toolbar={
              <>
                <SearchInput placeholder="Aufgabe" />
                <SelectField
                  label="Status"
                  value="a"
                  onChange={() => {}}
                  options={[{ value: "a", label: "Alle Status" }]}
                />
                <SelectField
                  label="Bearbeiter"
                  value="a"
                  onChange={() => {}}
                  options={[{ value: "a", label: "Alle Bearbeiter" }]}
                />
                <SearchInput placeholder="Wide floor (minWidth=20rem)" minWidth="20rem" />
              </>
            }
          >
            <p className="text-sm text-muted-foreground">Rows</p>
          </PageFrame>
        </div>
      </Variant>
      <Variant label="nested PageFrame (derived, no prop) — titles itself with NestedPageHeading and joins the parent's surface">
        <PageFrame
          title="Einstellungen"
          toolbar={
            <SegmentedControl
              aria-label="Bereich"
              value="a"
              onValueChange={() => {}}
              options={[
                { value: "a", label: "Abrechnung" },
                { value: "b", label: "Team" },
              ]}
            />
          }
        >
          <PageFrame title="Abrechnung" subtitle="Zuletzt geändert vor 2 Tagen" count="2 Ergebnisse">
            {rows}
          </PageFrame>
        </PageFrame>
      </Variant>
    </div>
  );
}

function ButtonSizesDemo() {
  return (
    <div className="space-y-6">
      <Variant label="Ladder · sm h-8 · default h-9 · lg h-11">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </Variant>
      <Variant label="Icon · icon h-9 w-9 · icon-sm h-8 w-8 (dense rows)">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" aria-label="Settings"><Settings /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Settings"><Settings /></Button>
        </div>
      </Variant>
      <Variant label="Inline · content-sized, no h-auto override">
        <div className="flex flex-wrap items-center gap-6">
          <Button variant="link" size="inline">Order #1042</Button>
          <Button variant="outline" size="inline" className="p-3 text-left">
            <span className="block">
              <span className="block font-medium">Multi-line content</span>
              <span className="block text-xs text-muted-foreground">Second line sizes the button</span>
            </span>
          </Button>
        </div>
      </Variant>
    </div>
  );
}

/** `AppShell density="touch"` (same provider) beside the default: unsized controls resolve to `lg`. */
function ControlDensityDemo(): React.ReactElement {
  const row = (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Save</Button>
      <Input className="w-40" placeholder="Name" />
      <SearchInput clearable defaultValue="abc" />
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Open</TabsTrigger>
          <TabsTrigger value="b">Done</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">density="default"</p>
        {row}
      </div>
      <ControlDensityProvider density="touch">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">density="touch"</p>
          {row}
        </div>
      </ControlDensityProvider>
    </div>
  );
}

export const LAYOUT_PRIMS: LayoutPrim[] = [
  { slug: "button-sizes", displayName: "Button sizes", Demo: ButtonSizesDemo },
  { slug: "page-frame", displayName: "PageFrame", Demo: PageFrameDemo },
  { slug: "page-header", displayName: "PageHeader", Demo: PageHeaderDemo },
  { slug: "nested-page-heading", displayName: "NestedPageHeading", Demo: NestedPageHeadingDemo },
  { slug: "heading-ladder", displayName: "Heading ladder (page · nested · section)", Demo: HeadingLadderDemo },
  { slug: "section-heading", displayName: "SectionHeading", Demo: SectionHeadingDemo },
  { slug: "section-card", displayName: "SectionCard", Demo: SectionCardDemo },
  { slug: "stat-tiles", displayName: "StatTileRow / StatTile", Demo: StatTilesDemo },
  { slug: "progress-tracker", displayName: "ProgressTracker", Demo: ProgressTrackerDemo },
  { slug: "metric-list", displayName: "MetricList / MetricRow", Demo: MetricListDemo },
  { slug: "auth-card", displayName: "AuthCard", Demo: AuthCardDemo },
  { slug: "segmented-control", displayName: "SegmentedControl", Demo: SegmentedControlDemo },
  { slug: "toggle-field", displayName: "ToggleField", Demo: ToggleFieldDemo },
  { slug: "search-input", displayName: "SearchInput", Demo: SearchInputDemo },
  { slug: "state-view", displayName: "StateView", Demo: StateViewDemo },
  { slug: "icon-avatar", displayName: "IconAvatar", Demo: IconAvatarDemo },
  { slug: "row-actions-menu", displayName: "RowActionsMenu", Demo: RowActionsMenuDemo },
  { slug: "status-chip-tier", displayName: "Status chip tier (Badge / Alert)", Demo: StatusChipTierDemo },
  { slug: "cell-field", displayName: "CellInput / CellSelect", Demo: CellFieldDemo },
  { slug: "section-nav", displayName: "SectionNavShell", Demo: SectionNavDemo },
  { slug: "control-density", displayName: "Control density (AppShell density)", Demo: ControlDensityDemo },
];

export function findLayoutPrim(slug: string | undefined): LayoutPrim | undefined {
  return LAYOUT_PRIMS.find((p) => p.slug === slug);
}
