import * as React from "react";
import { DetailSection, KeyValueList, KeyValueRow } from "design-baseline";

// Standard single-line rows: label left, mono tabular value right — composed
// inside `<KeyValueList>`/`<DetailSection flush>` per the archetype contract.
export function StandardRows() {
  return (
    <DetailSection title="Details" flush>
      <KeyValueList>
        <KeyValueRow label="Placed" value="12 Jun 2026" />
        <KeyValueRow label="Reference" value="WS-9921" />
        <KeyValueRow label="Fulfilment" value="DHL Paket" />
      </KeyValueList>
    </DetailSection>
  );
}

// `block` — stacked layout for a long free-text value that would fight the
// right-aligned column.
export function BlockRow() {
  return (
    <DetailSection title="Order note" flush>
      <KeyValueList>
        <KeyValueRow label="Channel" value="Web shop" />
        <KeyValueRow
          label="Note"
          value="Customer asked for the Earthsea set to be gift-wrapped. Packing in progress — ship via DHL once the SPQR restock lands."
          block
        />
      </KeyValueList>
    </DetailSection>
  );
}

// Missing value — the em-dash placeholder the primitive expects consumers to
// pass explicitly (it never synthesizes one for falsy values).
export function MissingValue() {
  return (
    <DetailSection title="Shipping" flush>
      <KeyValueList>
        <KeyValueRow label="Carrier" value="DHL Paket" />
        <KeyValueRow label="Tracking number" value="—" />
      </KeyValueList>
    </DetailSection>
  );
}
