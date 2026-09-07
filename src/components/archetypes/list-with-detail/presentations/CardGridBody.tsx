import * as React from "react";
import { cn } from "../../../../lib/utils";
import { RowActionsMenu, getInteractiveRowProps, interactiveRowFocusRing } from "../../shared";
import type { RowAction } from "../../shared";
import type { ListColumn } from "../ListWithDetailShell";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CardGridBodyProps<Row> = {
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
 * The `presentation="card-grid"` body of ListWithDetailShell — rows as cards
 * in a responsive grid (identifier as title, remaining columns as
 * label/value pairs).
 */
export function CardGridBody<Row>({
  rows,
  columns,
  getRowId,
  selectedRowId,
  rowActions,
  onRowSelect,
}: CardGridBodyProps<Row>): React.ReactElement {
  const hasActions = rowActions !== undefined && rowActions.length > 0;
  const clickable = onRowSelect !== undefined;

  // Identifier column drives the card title; the rest render as label/value pairs.
  const idCol = columns.find((c) => c.isIdentifier === true) ?? columns[0];
  const secondaryColumns = columns.filter((c) => c !== idCol);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
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
              "rounded-lg border bg-card p-4 transition-colors",
              clickable && "cursor-pointer hover:bg-accent",
              clickable && interactiveRowFocusRing,
              isSelected && "ring-2 ring-ring",
            )}
            {...getInteractiveRowProps(activate)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className={cn("min-w-0 font-medium", clickable && "text-primary")}>
                {idCol ? idCol.cell(row) : null}
              </div>
              {hasActions && (
                <div onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu row={row} actions={rowActions} />
                </div>
              )}
            </div>
            <dl className="mt-2 space-y-1">
              {secondaryColumns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-baseline justify-between gap-3 text-[13px]"
                >
                  <dt className="shrink-0 text-muted-foreground">{col.header}</dt>
                  <dd className="min-w-0 text-right text-foreground tabular-nums">
                    {col.cell(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
