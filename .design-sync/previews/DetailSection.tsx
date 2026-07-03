import * as React from "react";
import { DetailSection, KeyValueList, KeyValueRow, Badge, Button } from "design-baseline";

// Default padded surface with a title-bar action — the common data-section
// shape (padded free-form content, a right-aligned control sized to the bar).
export function WithActions() {
  return (
    <DetailSection
      title="Order note"
      actions={
        <Button variant="ghost" size="sm" className="-my-1.5 h-7 text-xs">
          Edit
        </Button>
      }
    >
      <p className="text-sm leading-relaxed text-foreground">
        Customer asked for the Earthsea set to be gift-wrapped. Packing in
        progress — ship via DHL once the SPQR restock lands.
      </p>
    </DetailSection>
  );
}

// flush + a count badge in the actions slot — the ruled-list shape, composed
// with KeyValueList/KeyValueRow so the flush contract renders meaningfully.
export function FlushWithBadgeCount() {
  return (
    <DetailSection title="Details" actions={<Badge variant="secondary">4</Badge>} flush>
      <KeyValueList>
        <KeyValueRow label="Placed" value="12 Jun 2026" />
        <KeyValueRow label="Channel" value="Web shop" />
        <KeyValueRow label="Reference" value="WS-9921" />
        <KeyValueRow label="Fulfilment" value="DHL Paket" />
      </KeyValueList>
    </DetailSection>
  );
}

// tone="muted" — the page's lightest surface, for reference-style panels
// (e.g. a rail-foot "Documents" section).
export function MutedTone() {
  return (
    <DetailSection title="Documents" tone="muted">
      <ul className="space-y-2">
        <li className="rounded-md border border-border bg-card px-2.5 py-2 text-[11.5px] font-medium text-foreground">
          Invoice 2025-0417.pdf
        </li>
        <li className="rounded-md border border-border bg-card px-2.5 py-2 text-[11.5px] font-medium text-foreground">
          Packing slip.pdf
        </li>
      </ul>
    </DetailSection>
  );
}
