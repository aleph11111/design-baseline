"use client";
import * as React from "react";
import { cn } from "../../../lib/utils";
import { useCompactDensity } from "../../ui/toolbar-band";

export type KeyValueListProps = {
  /**
   * `<KeyValueRow>` children. Rows are separated by hairline dividers; long
   * free-text rows set `block` to switch to a stacked layout.
   */
  children: React.ReactNode;
  className?: string;
};

/**
 * KeyValueList — ruled `<dl>` master-data list for the `summary` slot.
 *
 * The ledger idiom: one field per row, label left, value right, hairline
 * dividers between rows. The list renders flush inside a
 * `<DetailSection flush>` — rows own their `px-5` padding.
 *
 * Dense, scannable, and layout-stable regardless of how many fields a domain
 * has — which is what makes it copy-pasteable across applications.
 */
export function KeyValueList({
  children,
  className,
}: KeyValueListProps): React.ReactElement {
  const compact = useCompactDensity();
  return (
    // compact step (ADR-0017): unruled rows; touch keeps the hairlines
    <dl className={cn("@container", !compact && "divide-y divide-border", className)}>{children}</dl>
  );
}

KeyValueList.displayName = "KeyValueList";
