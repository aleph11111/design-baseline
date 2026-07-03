import * as React from "react";
import { DetailOverviewHeader, Badge, Button } from "design-baseline";

// Full contract: mono order-id title, subtitle breadcrumb-ish line, inline
// status badges (the archetype's "one home for status"), and a right-aligned
// actions row — ported from the bookshop order demo's standalone header.
export function OrderHeader() {
  return (
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
      actions={
        <>
          <Button variant="outline" size="sm">
            Invoice
          </Button>
          <Button size="sm">Mark as shipped</Button>
        </>
      }
    />
  );
}

// Plain entity title + subtitle, no badges — a record with no status
// dimension worth surfacing (e.g. a customer profile).
export function TitleWithSubtitle() {
  return (
    <DetailOverviewHeader
      title="Jonas Berger"
      subtitle="Customer since Mar 2024 · Köln, DE"
      actions={
        <Button variant="outline" size="sm">
          Edit customer
        </Button>
      }
    />
  );
}

// Title only — the minimal contract, no subtitle/badges/actions.
export function TitleOnly() {
  return <DetailOverviewHeader title="Gödel, Escher, Bach" />;
}
