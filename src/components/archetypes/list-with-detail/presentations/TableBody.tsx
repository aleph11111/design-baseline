import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody as UiTableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { RowActionsMenu, getInteractiveRowProps, interactiveRowFocusRing } from "../../shared";
import type { RowAction } from "../../shared";
import type { ListColumn, SortDirection } from "../ListWithDetailShell";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function alignClass(align: ListColumn<unknown>["align"]): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

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
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, sortDirection: SortDirection) => void;
  onRowSelect?: (row: Row) => void;
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
  sortBy,
  sortDirection,
  onSortChange,
  onRowSelect,
}: TableBodyProps<Row>): React.ReactElement {
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
                className={cn(
                  alignClass(col.align),
                  canSort && "cursor-pointer select-none hover:bg-muted/50",
                )}
                aria-sort={
                  canSort
                    ? sortBy === col.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
                onClick={canSort ? () => handleSortClick(col.key) : undefined}
              >
                {canSort ? (
                  <div className="flex items-center gap-2">
                    {col.header}
                    <SortIcon
                      columnKey={col.key}
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                    />
                  </div>
                ) : (
                  col.header
                )}
              </TableHead>
            );
          })}
          {hasActions && <TableHead className="w-12" />}
        </TableRow>
      </TableHeader>
      <UiTableBody>
        {rows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selectedRowId === rowId;
          return (
            <TableRow
              key={rowId}
              data-state={isSelected ? "selected" : undefined}
            >
              {columns.map((col) => {
                const isIdentifier = col.isIdentifier === true;
                const useMono = isIdentifier && col.identifierMono !== false;
                const activate =
                  isIdentifier && onRowSelect !== undefined
                    ? () => onRowSelect(row)
                    : undefined;
                return (
                  <TableCell
                    key={col.key}
                    className={cn(
                      alignClass(col.align),
                      isIdentifier && "text-primary hover:underline",
                      activate && "cursor-pointer",
                      activate && interactiveRowFocusRing,
                      useMono && "font-mono text-[13px] font-medium",
                    )}
                    onClick={activate}
                    {...getInteractiveRowProps(activate)}
                  >
                    {col.cell(row)}
                  </TableCell>
                );
              })}
              {hasActions && (
                <TableCell className="w-12">
                  <RowActionsMenu row={row} actions={rowActions} />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </UiTableBody>
    </Table>
  );
}
