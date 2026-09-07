/**
 * Gallery-local demos for the shared LAYOUT primitives (chrome that isn't a page
 * archetype). Lets the gallery show them for visual-consistency review, the same
 * way archetype demos do. Gallery-only — not part of the shipped baseline.
 */

import * as React from "react";
import { Bell, Box, CreditCard, Inbox, Plus, Settings, User } from "lucide-react";
import {
  AuthCard,
  HeaderFillContext,
  MetricList,
  MetricRow,
  NestedPageHeading,
  PageHeader,
  ProgressTracker,
  SectionCard,
  SectionHeading,
  StatTile,
  StatTileRow,
  SurfaceHeader,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SearchInput } from "@/components/ui/search-input";
import { Input } from "@/components/ui/input";
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
              <Button variant="outline" size="sm">Export</Button>
              <Button size="sm">Edit</Button>
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
 * The Mode B nested page heading — the run in the heading ladder that sits
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
          <Button size="sm" className="shrink-0">
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
              <Button size="sm">
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
          <div className="px-5 py-3">
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
      <Variant label="No disclosure (headline rows only)">
        <SectionCard title="At a glance" flush>
          <div className="px-5 py-3">
            <MetricList>
              <MetricRow label="Gesamtwert" value="€12.500,00" emphasis />
              <MetricRow label="ARR" value="€4.200,00" hint="annualisiert" emphasis />
            </MetricList>
          </div>
        </SectionCard>
      </Variant>
    </div>
  );
}

function SurfaceHeaderDemo() {
  const body = (
    <div className="px-5 py-4 text-[13px] text-muted-foreground">
      Surface body — the framed content the header bar belongs to.
    </div>
  );
  const actions = (
    <>
      <Badge variant="success">Aktiv</Badge>
      <Button variant="outline" size="sm" asChild>
        <a href="#surface-header">Bearbeiten</a>
      </Button>
      <Button size="sm">
        <Plus /> Anlegen
      </Button>
    </>
  );
  return (
    <div className="max-w-3xl space-y-8">
      <Variant label='--header-fill: solid (the per-project default — accent bar, inverted actions; the semantic Badge and the asChild link both keep their contract)'>
        <div className="overflow-hidden rounded-lg border bg-card">
          <HeaderFillContext.Provider value="solid">
            <SurfaceHeader kicker="Aufträge" title="Order #1042" actions={actions} />
          </HeaderFillContext.Provider>
          {body}
        </div>
      </Variant>
      <Variant label="--header-fill: tint (soft bg-muted bar, normal text)">
        <div className="overflow-hidden rounded-lg border bg-card">
          <HeaderFillContext.Provider value="tint">
            <SurfaceHeader kicker="Aufträge" title="Order #1042" actions={actions} />
          </HeaderFillContext.Provider>
          {body}
        </div>
      </Variant>
      <Variant label="--header-fill: white (hairline border only — the quietest)">
        <div className="overflow-hidden rounded-lg border bg-card">
          <HeaderFillContext.Provider value="white">
            <SurfaceHeader kicker="Aufträge" title="Order #1042" actions={actions} />
          </HeaderFillContext.Provider>
          {body}
        </div>
      </Variant>
      <Variant label="subtitle + icon (compact metadata at text-xs, matching PageHeader — dimmed automatically on a solid fill)">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border bg-card">
            <HeaderFillContext.Provider value="solid">
              <SurfaceHeader
                kicker="Einstellungen"
                title="Abrechnung"
                subtitle="Zuletzt geändert vor 2 Tagen"
                icon={CreditCard}
                actions={actions}
              />
            </HeaderFillContext.Provider>
            {body}
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <HeaderFillContext.Provider value="white">
              <SurfaceHeader
                kicker="Einstellungen"
                title="Abrechnung"
                subtitle="Zuletzt geändert vor 2 Tagen"
                icon={CreditCard}
                actions={actions}
              />
            </HeaderFillContext.Provider>
            {body}
          </div>
        </div>
      </Variant>
      <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
        Set once per project via <code>{"<AppShell headerFill=\"…\">"}</code>; every framed
        shell (detail-overview unified, report, calendar, the list drawer, the crud-dialog
        header) reads the same context, so the treatment never diverges within an app.
      </p>
      <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
        The <code>subtitle</code> / <code>icon</code> slots exist so a shell needing a
        secondary line no longer has to fall back to the classic{" "}
        <code>{"<PageHeader>"}</code> and lose the on-surface treatment — that fallback
        was the only reason tabbed-settings kept two header paths. Subtitle is compact{" "}
        <em>metadata</em> at <code>text-xs</code>; prose descriptions stay on{" "}
        <code>text-sm</code> via <code>SectionHeading</code>.
      </p>
    </div>
  );
}

export const LAYOUT_PRIMS: LayoutPrim[] = [
  { slug: "surface-header", displayName: "SurfaceHeader / header fill", Demo: SurfaceHeaderDemo },
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
  { slug: "search-input", displayName: "SearchInput", Demo: SearchInputDemo },
  { slug: "state-view", displayName: "StateView", Demo: StateViewDemo },
  { slug: "icon-avatar", displayName: "IconAvatar", Demo: IconAvatarDemo },
  { slug: "row-actions-menu", displayName: "RowActionsMenu", Demo: RowActionsMenuDemo },
  { slug: "cell-field", displayName: "CellInput / CellSelect", Demo: CellFieldDemo },
  { slug: "section-nav", displayName: "SectionNavShell", Demo: SectionNavDemo },
];

export function findLayoutPrim(slug: string | undefined): LayoutPrim | undefined {
  return LAYOUT_PRIMS.find((p) => p.slug === slug);
}
