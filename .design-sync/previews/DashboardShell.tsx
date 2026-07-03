import * as React from "react";
import { DashboardShell, StatTile, StatTileRow } from "design-baseline";

// DashboardShell is the primary bounded surface for the analytics-dashboard
// archetype — an on-surface header (kicker + title + actions) over a KPI
// strip. Board-form pattern: wrapped in the muted mat, as it ships in the app.
export function RevenueOverview() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <DashboardShell
        kicker="Reporting"
        title="Revenue Analytics"
        headerActions={
          <span className="text-sm font-medium text-muted-foreground">
            This month
          </span>
        }
      >
        <StatTileRow columns={4}>
          <StatTile label="Revenue" value="€58.9k" hint="vs last month" />
          <StatTile label="Orders" value="812" hint="paid + fulfilled" />
          <StatTile label="Avg order value" value="€72" hint="net of refunds" />
          <StatTile label="Active customers" value="603" hint="bought at least once" />
        </StatTileRow>
      </DashboardShell>
    </div>
  );
}

// Fewer KPIs, no header actions — the shell without a filter bar.
export function CompactNoActions() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <DashboardShell kicker="Overview" title="Store Performance">
        <StatTileRow columns={2}>
          <StatTile label="Active customers" value="1,512" hint="last 30 days" />
          <StatTile label="Churn" value="2.1%" hint="month over month" />
        </StatTileRow>
      </DashboardShell>
    </div>
  );
}
