import * as React from "react";
import { MetricList, MetricRow, SectionCard } from "design-baseline";

// Emphasis + accent contrast — the headline money row (emphasis, accent) next
// to a plain secondary row, composed inside MetricList so the ruling and
// tabular-nums alignment read correctly (MetricRow has no meaning bare).
export function EmphasisVsSecondary() {
  return (
    <div className="max-w-sm">
      <SectionCard title="Invoice #4821" flush>
        <div className="px-5 py-3">
          <MetricList>
            <MetricRow label="Amount due" value="€1,240.00" hint="due 14 Jul" emphasis accent />
            <MetricRow label="Tax (19%)" value="€198.06" />
          </MetricList>
        </div>
      </SectionCard>
    </div>
  );
}

// Three plain rows with hints — a subscription line-item readout.
export function LineItemsWithHints() {
  return (
    <div className="max-w-sm">
      <SectionCard title="Subscription" flush>
        <div className="px-5 py-3">
          <MetricList>
            <MetricRow label="Seats" value="24" hint="+3 this quarter" />
            <MetricRow label="Rate" value="€19.00" hint="per seat / month" />
            <MetricRow label="Monthly total" value="€456.00" emphasis />
          </MetricList>
        </div>
      </SectionCard>
    </div>
  );
}
