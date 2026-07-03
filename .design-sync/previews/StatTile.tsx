import * as React from "react";
import { StatTile, StatTileRow } from "design-baseline";

// The KPI strip — StatTile only renders meaningfully inside StatTileRow (one
// bounded surface with hairline dividers), so the primary story composes it.
export function KpiStrip() {
  return (
    <StatTileRow columns={4}>
      <StatTile label="Revenue" value="€58.9k" hint="vs last month +12%" />
      <StatTile label="Orders" value="812" hint="603 customers" />
      <StatTile label="Avg. order" value="€72" hint="+€4 QoQ" />
      <StatTile label="Refunds" value="1.4%" hint="of gross revenue" />
    </StatTileRow>
  );
}

export function ThreeUp() {
  return (
    <StatTileRow columns={3}>
      <StatTile label="Open invoices" value="24" />
      <StatTile label="Overdue" value="€3,120" hint="6 accounts" />
      <StatTile label="Collected" value="€41,880" hint="this quarter" />
    </StatTileRow>
  );
}

export function WithMissingValue() {
  return (
    <StatTileRow columns={2}>
      <StatTile label="Active users" value="1,512" hint="last 30 days" />
      <StatTile label="Churn" value="—" hint="not enough data yet" />
    </StatTileRow>
  );
}
