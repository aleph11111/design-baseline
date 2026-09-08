"use client";
import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { RowActionsMenu, getInteractiveRowProps, interactiveRowFocusRing } from "../../shared";
import type { RowAction } from "../../shared";
import type { ListColumn } from "../ListWithDetailShell";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ActionRowBodyProps<Row> = {
  rows: Row[];
  columns: ListColumn<Row>[];
  getRowId: (row: Row) => string;
  selectedRowId?: string | null;
  rowActions?: RowAction<Row>[];
  onRowSelect?: (row: Row) => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * The `presentation="action-row"` body of ListWithDetailShell — full-width
 * stacked rows (identifier + a couple of fields + chevron), the mobile /
 * pick-an-item shape.
 */
export function ActionRowBody<Row>({
  rows,
  columns,
  getRowId,
  selectedRowId,
  rowActions,
  onRowSelect,
}: ActionRowBodyProps<Row>): React.ReactElement {
  const hasActions = rowActions !== undefined && rowActions.length > 0;
  const clickable = onRowSelect !== undefined;

  const idCol = columns.find((c) => c.isIdentifier === true) ?? columns[0];
  const secondaryColumns = columns.filter((c) => c !== idCol).slice(0, 2);

  return (
    <div className="divide-y">
      {rows.map((row) => {
        const rowId = getRowId(row);
        const isSelected = selectedRowId === rowId;
        const activate = clickable ? () => onRowSelect(row) : undefined;
        return (
          <div
            key={rowId}
            data-state={isSelected ? "selected" : undefined}
            onClick={activate}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              clickable && "cursor-pointer hover:bg-muted/50",
              clickable && interactiveRowFocusRing,
              isSelected && "bg-muted",
            )}
            {...getInteractiveRowProps(activate)}
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-foreground">
                {idCol ? idCol.cell(row) : null}
              </div>
              {secondaryColumns.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                  {secondaryColumns.map((col) => (
                    <span key={col.key} className="truncate">
                      {col.cell(row)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {hasActions ? (
              <div onClick={(e) => e.stopPropagation()}>
                <RowActionsMenu row={row} actions={rowActions} />
              </div>
            ) : clickable ? (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
