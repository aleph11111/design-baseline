import { DashboardShell, StatTile, StatTileRow } from "design-baseline";

// DashboardShell is the primary bounded surface for the analytics-dashboard
// archetype — the page header (title + actions) above one raised surface
// holding a KPI strip (ADR-0008). The period selector scopes the body, so it
// sits in the `toolbar`.
export function RevenueOverview() {
  return (
    <div>
      <DashboardShell
        title="Revenue Analytics"
        toolbar={
          <span className="text-sm font-medium text-muted-foreground">
            This month
          </span>
        }
      >
        <StatTileRow>
          <StatTile label="Revenue" value="€58.9k" hint="vs last month" />
          <StatTile label="Orders" value="812" hint="paid + fulfilled" />
          <StatTile label="Avg order value" value="€72" hint="net of refunds" />
          <StatTile label="Active customers" value="603" hint="bought at least once" />
        </StatTileRow>
      </DashboardShell>
    </div>
  );
}

// Fewer KPIs, no actions and no toolbar.
export function CompactNoActions() {
  return (
    <div>
      <DashboardShell title="Store Performance">
        <StatTileRow>
          <StatTile label="Active customers" value="1,512" hint="last 30 days" />
          <StatTile label="Churn" value="2.1%" hint="month over month" />
        </StatTileRow>
      </DashboardShell>
    </div>
  );
}
