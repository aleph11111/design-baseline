import * as React from "react";
import { DetailSection, KeyValueList, KeyValueRow } from "design-baseline";

// The ledger idiom: master-data facts, one field per row. Composed inside a
// `<DetailSection flush>` — the list's rows own their own px-5 padding and
// only render meaningfully in that flush context.
export function OrderFacts() {
  return (
    <DetailSection title="Details" flush>
      <KeyValueList>
        <KeyValueRow label="Placed" value="12 Jun 2026" />
        <KeyValueRow label="Channel" value="Web shop" />
        <KeyValueRow label="Reference" value="WS-9921" />
        <KeyValueRow label="Fulfilment" value="DHL Paket" />
      </KeyValueList>
    </DetailSection>
  );
}

// A shorter list mixed with a block (stacked) row for a longer free-text
// field — the note doesn't fight the right-aligned column.
export function CustomerFactsWithNote() {
  return (
    <DetailSection title="Customer" flush>
      <KeyValueList>
        <KeyValueRow label="Email" value="j.berger@example.com" />
        <KeyValueRow label="Segment" value="Private customer" />
        <KeyValueRow
          label="Note"
          value="Prefers gift-wrapped orders; recurring DHL customer."
          block
        />
      </KeyValueList>
    </DetailSection>
  );
}
