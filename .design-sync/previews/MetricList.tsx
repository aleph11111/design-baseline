import * as React from "react";
import { MetricList, MetricRow, SectionCard } from "design-baseline";

// Headline figures + disclosure — the rail-summary readout this primitive was
// promoted for (revenue/profit pinned, cost breakdown tucked behind "Show more").
export function OrderFinancials() {
  return (
    <div className="max-w-sm">
      <SectionCard title="Revenue & profit" flush>
        <div className="px-5 py-3">
          <MetricList
            more={
              <>
                <MetricRow label="Items subtotal" value="€5,480.00" />
                <MetricRow label="Shipping" value="€212.00" />
                <MetricRow label="Cost of goods" value="€2,840.00" />
                <MetricRow label="Fees & packaging" value="€144.00" />
              </>
            }
          >
            <MetricRow label="Revenue" value="€5,920.00" hint="incl. shipping" emphasis />
            <MetricRow
              label="Gross profit"
              value="€2,228.00"
              hint="margin 37.6%"
              emphasis
              accent
            />
          </MetricList>
        </div>
      </SectionCard>
    </div>
  );
}

// No disclosure — headline rows only, for a deal summary with no secondary tier.
export function DealAtAGlance() {
  return (
    <div className="max-w-sm">
      <SectionCard title="At a glance" flush>
        <div className="px-5 py-3">
          <MetricList>
            <MetricRow label="Gesamtwert" value="€12.500,00" emphasis />
            <MetricRow label="ARR" value="€4.200,00" hint="annualisiert" emphasis accent />
          </MetricList>
        </div>
      </SectionCard>
    </div>
  );
}
