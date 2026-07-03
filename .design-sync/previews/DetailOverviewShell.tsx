import * as React from "react";
import {
  DetailOverviewShell,
  DetailOverviewHeader,
  DetailSection,
  KeyValueList,
  KeyValueRow,
  MetricList,
  MetricRow,
  ProgressTracker,
  Badge,
  Button,
  IconAvatar,
} from "design-baseline";

// The canonical Command Rail pairing: layout="rail" surface="unified" — one
// bounded frame holds a chromeless, sticky rail (figures + identity + facts)
// beside a flattened main column (activity + note). Ported from the bookshop
// order demo. Needs the muted mat behind it for the unified frame to read.
export function CommandRailUnified() {
  return (
    <div className="rounded-xl bg-muted/50 p-4 sm:p-6">
      <DetailOverviewShell
        layout="rail"
        surface="unified"
        header={
          <DetailOverviewHeader
            title={<span className="font-mono">SO-2025-00417</span>}
            subtitle={
              <>
                <span>Orders</span>
                <span className="mx-2 text-border">·</span>
                <span>Web shop</span>
              </>
            }
            badges={
              <>
                <Badge variant="success">Paid</Badge>
                <Badge variant="warning">Packing</Badge>
              </>
            }
            actions={<Button size="sm">Mark as shipped</Button>}
          />
        }
        summary={
          <>
            <DetailSection title="Revenue & profit">
              <MetricList>
                <MetricRow label="Revenue" value="€162.00" hint="incl. shipping" emphasis />
                <MetricRow label="Gross profit" value="€55.08" hint="margin 34.0%" emphasis accent />
              </MetricList>
            </DetailSection>
            <DetailSection title="Customer">
              <div className="flex items-center gap-3">
                <IconAvatar size="md">JB</IconAvatar>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-foreground">Jonas Berger</div>
                  <div className="text-[11px] text-muted-foreground">Private customer · Köln, DE</div>
                </div>
              </div>
            </DetailSection>
            <DetailSection title="Details" flush>
              <KeyValueList>
                <KeyValueRow label="Placed" value="12 Jun 2026" />
                <KeyValueRow label="Reference" value="WS-9921" />
                <KeyValueRow label="Fulfilment" value="DHL Paket" />
              </KeyValueList>
            </DetailSection>
          </>
        }
        content={
          <>
            <DetailSection title="Activity">
              <ProgressTracker
                steps={[
                  { label: "Placed", meta: "12 Jun", state: "done" },
                  { label: "Paid", meta: "12 Jun", state: "done" },
                  { label: "Packed", meta: "In progress", state: "current" },
                  { label: "Shipped", meta: "Pending", state: "pending" },
                ]}
              />
            </DetailSection>
            <DetailSection title="Order note">
              <p className="text-sm leading-relaxed text-foreground">
                Customer asked for the Earthsea set to be gift-wrapped. Packing
                in progress — ship via DHL once the SPQR restock lands.
              </p>
            </DetailSection>
          </>
        }
        references={
          <DetailSection title="Documents">
            <ul className="space-y-2">
              <li className="rounded-md border border-border bg-card px-2.5 py-2 text-[11.5px] font-medium text-foreground">
                Invoice 2025-0417.pdf
              </li>
              <li className="rounded-md border border-border bg-card px-2.5 py-2 text-[11.5px] font-medium text-foreground">
                Packing slip.pdf
              </li>
            </ul>
          </DetailSection>
        }
      />
    </div>
  );
}

// Vertical + separated — the zero-churn default: bordered SectionCards stacked
// top to bottom, no rail, no unified frame. Bounded width via `width="md"`.
export function VerticalSeparated() {
  return (
    <DetailOverviewShell
      layout="vertical"
      surface="separated"
      width="md"
      header={
        <DetailOverviewHeader
          title="Jonas Berger"
          subtitle="Customer since Mar 2024"
          badges={<Badge variant="secondary">Active</Badge>}
          actions={<Button size="sm">Edit customer</Button>}
        />
      }
      summary={
        <DetailSection title="Contact" flush>
          <KeyValueList>
            <KeyValueRow label="Email" value="j.berger@example.com" />
            <KeyValueRow label="City" value="Köln, DE" />
            <KeyValueRow label="Segment" value="Private customer" />
          </KeyValueList>
        </DetailSection>
      }
      content={
        <DetailSection title="Recent orders">
          <p className="text-sm leading-relaxed text-foreground">
            4 orders in the last 12 months, most recently SO-2025-00417 (12
            Jun) — currently being packed for DHL dispatch.
          </p>
        </DetailSection>
      }
    />
  );
}
