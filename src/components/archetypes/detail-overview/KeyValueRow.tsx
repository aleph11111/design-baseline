import * as React from "react";
import { cn } from "@/lib/utils";

export type KeyValueRowProps = {
  /**
   * Field label. Rendered as `<dt>` at `text-sm text-muted-foreground`,
   * anchored left.
   */
  label: React.ReactNode;
  /**
   * Field value. Rendered as `<dd>` at `text-sm font-medium`, anchored right
   * with `tabular-nums`. When the underlying data is unavailable, pass the
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
   * `leading-relaxed`. Use for long free-text fields (notes, reasons) that
   * would fight the right-aligned column.
   */
  block?: boolean;
  className?: string;
};

/**
 * KeyValueRow — one ruled row inside a `<KeyValueList>`.
 *
 * Default layout (single line):
 *   [label (sm muted)]                    [value (sm medium, right, tabular)]
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
        "flex items-baseline justify-between gap-6 px-5 py-2.5",
        className,
      )}
    >
      <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-mono font-medium text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  );
}

KeyValueRow.displayName = "KeyValueRow";
