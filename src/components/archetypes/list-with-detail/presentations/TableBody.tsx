"use client";
import { useLabels } from "../../../../lib/labels";
import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody as UiTableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { cn } from "../../../../lib/utils";
import { useTouchTarget } from "../../../ui/toolbar-band";
import { Checkbox } from "../../../ui/checkbox";
import { RowActionsMenu, alignClass, hideBelowClass, identifierCell } from "../../shared";
import type { RowAction } from "../../shared";
import type { ListColumn, SortDirection } from "../ListWithDetailShell";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SortIcon({
  columnKey,
  sortBy,
  sortDirection,
}: {
  columnKey: string;
  sortBy: string | undefined;
  sortDirection: SortDirection | undefined;
}) {
  const isActive = sortBy === columnKey;
  if (!isActive) {
    return <ArrowUpDown className="h-4 w-4 opacity-30" />;
  }
  if (sortDirection === "asc") {
    return <ArrowUp className="h-4 w-4" />;
  }
  return <ArrowDown className="h-4 w-4" />;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type TableBodyProps<Row> = {
  rows: Row[];
  columns: ListColumn<Row>[];
  getRowId: (row: Row) => string;
  selectedRowId?: string | null;
  rowActions?: RowAction<Row>[];
  /** Accessible name of each row's `⋯` trigger (`labels.rowActions`). */
  rowActionsLabel?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, sortDirection: SortDirection) => void;
  onRowSelect?: (row: Row) => void;
  /** Bulk mode: the leading checkbox column (absent = no column). */
  bulk?: TableBulk<Row>;
};

/** The leading checkbox column's state and handlers, derived by the shell. */
export type TableBulk<Row> = {
  selected: ReadonlySet<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onToggleRow: (rowId: string) => void;
  selectAllLabel: string;
  rowLabel: (row: Row) => string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** The `presentation="table"` body of ListWithDetailShell — the sortable data table. */
export function TableBody<Row>({
  rows,
  columns,
  getRowId,
  selectedRowId,
  rowActions,
  rowActionsLabel,
  sortBy,
  sortDirection,
  onSortChange,
  onRowSelect,
  bulk,
}: TableBodyProps<Row>): React.ReactElement {
  const L = useLabels();
  const touchTarget = useTouchTarget();
  const hasActions = rowActions !== undefined && rowActions.length > 0;

  function handleSortClick(columnKey: string) {
    if (!onSortChange) return;
    if (sortBy === columnKey) {
      onSortChange(columnKey, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSortChange(columnKey, "asc");
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {bulk && (
            <TableHead className="w-10">
              <Checkbox
                checked={bulk.allSelected ? true : bulk.someSelected ? "indeterminate" : false}
                onCheckedChange={bulk.onToggleAll}
                aria-label={bulk.selectAllLabel}
              />
            </TableHead>
          )}
          {columns.map((col) => {
            const canSort = col.sortable === true && onSortChange !== undefined;
            return (
              <TableHead
                key={col.key}
                style={
                  col.width !== undefined
                    ? { width: col.width }
                    : undefined
                }
                className={cn(alignClass(col.align), hideBelowClass(col))}
                aria-sort={
                  canSort
                    ? sortBy === col.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
              >
                {canSort ? (
                  // A real button, so the sort is reachable and operable from
                  // the keyboard (Tab + Enter/Space); `aria-sort` stays on the
                  // header cell, where assistive tech reads it.
                  <button
                    type="button"
                    className={cn("flex cursor-pointer select-none items-center gap-2 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", touchTarget)}
                    onClick={() => handleSortClick(col.key)}
                  >
                    {col.header}
                    <SortIcon
                      columnKey={col.key}
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                    />
                  </button>
                ) : (
                  col.header
                )}
              </TableHead>
            );
          })}
          {hasActions && (
            <TableHead className="w-12">
              <span className="sr-only">{rowActionsLabel || L.rowActions}</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <UiTableBody>
        {rows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selectedRowId === rowId;
          const isTicked = bulk?.selected.has(rowId) ?? false;
          return (
            <TableRow
              key={rowId}
              data-state={isSelected || isTicked ? "selected" : undefined}
              aria-selected={onRowSelect ? isSelected : undefined}
            >
              {bulk && (
                <TableCell className="w-10">
                  <Checkbox
                    checked={isTicked}
                    onCheckedChange={() => bulk.onToggleRow(rowId)}
                    aria-label={bulk.rowLabel(row)}
                  />
                </TableCell>
              )}
              {columns.map((col) => {
                const activate =
                  col.isIdentifier === true && onRowSelect !== undefined
                    ? () => onRowSelect(row)
                    : undefined;
                const cellProps = activate ? identifierCell(col, activate, row) : null;
                return (
                  <TableCell
                    key={col.key}
                    className={cn(
                      alignClass(col.align),
                      hideBelowClass(col),
                      cellProps?.className,
                    )}
                    {...cellProps}
                  >
                    {col.cell(row)}
                  </TableCell>
                );
              })}
              {hasActions && (
                <TableCell className="w-12">
                  <RowActionsMenu row={row} actions={rowActions} triggerLabel={rowActionsLabel} />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </UiTableBody>
    </Table>
  );
}
