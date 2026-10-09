"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";

export type KeyValueRowProps = {
  /**
   * Field label. Rendered as `<dt>` at `text-[13px] text-muted-foreground`
   * (ledger body scale), anchored left.
   */
  label: React.ReactNode;
  /**
   * Field value. Rendered as `<dd>` at `text-[13px]` in the house sans,
   * anchored right with `tabular-nums` (aligned digits for figures; inert on
   * text, so names, badges and sentences render as plain sans — ADR-0009). When the underlying
   * data is unavailable, pass the
   * em-dash string `"—"` — the primitive does NOT auto-render a placeholder
   * for falsy values.
   *
   * Consumers may pre-format the value (e.g. `fmtCurrency(amount)`,
   * `fmtDate(at)`); the row never formats. Chip strips (categorical master
   * data) pass a right-justified flex span:
   * `<span className="flex flex-wrap justify-end gap-1.5">…badges…</span>`.
   */
  value: React.ReactNode;
  /**
   * When `true`, switch to a stacked layout — label on top, value below at
   * `text-sm leading-relaxed` (prose stays at `text-sm` for readability, per
   * the house type scale). Use for long free-text fields (notes, reasons)
   * that would fight the right-aligned column.
   */
  block?: boolean;
  className?: string;
};

/**
 * KeyValueRow — one ruled row inside a `<KeyValueList>`.
 *
 * Default layout (stacked below `md`, label above a left-aligned value; single line from `md` up):
 *   [label (13px muted)]             [value (13px mono medium, right, tabular)]
 *
 * Block layout (`block`):
 *   [label (sm muted)]
 *   [value (sm, leading-relaxed)]
 */
export function KeyValueRow({
  label,
  value,
  block,
  className,
}: KeyValueRowProps): React.ReactElement {
  if (block) {
    return (
      <div className={cn("px-5 py-2.5", className)}>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm leading-relaxed text-foreground">
          {value}
        </dd>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-5 py-2.5 md:flex-row md:items-baseline md:justify-between md:gap-6",
        className,
      )}
    >
      <dt className="md:shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-left text-[13px] break-words md:text-right text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  );
}

KeyValueRow.displayName = "KeyValueRow";
