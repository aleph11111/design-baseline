import * as React from "react";
import { cn } from "@/lib/utils";
import type { MatrixColumn } from "./MatrixGridShell";

export type MatrixGridHeadProps = {
  columns: MatrixColumn[];
  rowHeaderLabel?: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** The two-row header band: a banded group row (only when any column has a group) plus the per-column row. */
export function MatrixGridHead({ columns, rowHeaderLabel }: MatrixGridHeadProps): React.ReactElement {
  // Merge adjacent columns by group. Empty group => standalone header (no banded row 1).
  const hasAnyGroup = columns.some((c) => c.group !== undefined && c.group !== "");
  const groupSpans: { group: string | undefined; span: number; startIdx: number }[] = [];
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i]!;
    const last = groupSpans[groupSpans.length - 1];
    if (last && last.group === col.group) {
      last.span += 1;
    } else {
      groupSpans.push({ group: col.group, span: 1, startIdx: i });
    }
  }

  return (
    <thead>
      {hasAnyGroup && (
        <tr className="bg-muted/50 border-b border-border">
          <th
            className={cn(
              "sticky left-0 z-10 bg-muted/50 border-r border-border min-w-[180px]",
              "px-4 py-2",
            )}
          />
          {groupSpans.map(({ group, span, startIdx }) => (
            <th
              key={`group-${startIdx}`}
              colSpan={span}
              className={cn(
                "px-2 py-2 text-center font-semibold text-foreground/80",
                "border-r border-border whitespace-nowrap",
              )}
            >
              {group ?? ""}
            </th>
          ))}
        </tr>
      )}
      <tr className="bg-muted/30 border-b border-border">
        <th
          className={cn(
            "sticky left-0 z-10 bg-muted/30 border-r border-border",
            "px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap",
          )}
        >
          {rowHeaderLabel}
        </th>
        {columns.map((col) => (
          <th
            key={col.key}
            className={cn(
              "px-2 py-2 text-center font-medium text-muted-foreground",
              "border-r border-border whitespace-nowrap min-w-[80px]",
            )}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
