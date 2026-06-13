import * as React from "react";
import { MoreHorizontal, Plus, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SettingsColumn<Row> = {
  key: string;
  header: React.ReactNode;
  cell: (row: Row) => React.ReactNode;
  align?: "left" | "right" | "center";
  /**
   * Marks the identifier cell. Gets `text-primary hover:underline cursor-pointer`
   * and calls `onRowEdit` on click. This is D2's core click contract.
   */
  isIdentifier?: boolean;
  /**
   * Style the identifier cell with `font-mono text-sm font-medium`.
   * Defaults to false — settings entities are typically human-readable names.
   * Set to true for code-based identifiers (slugs, IDs, keys).
   */
  identifierMono?: boolean;
};

export type SettingsRowAction<Row> = {
  label: string;
  onSelect: (row: Row) => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
};

export type SettingsTableShellProps<Row> = {
  /** The current (possibly filtered) rows to display. */
  rows: Row[];
  /** Column definitions. Mark exactly one column `isIdentifier` per table. */
  columns: SettingsColumn<Row>[];
  /** Stable, unique string key for each row. */
  getRowId: (row: Row) => string;

  // Callbacks
  /** Called when the identifier cell is clicked — consumer opens the edit dialog. */
  onRowEdit?: (row: Row) => void;
  /** Called by the Add-new toolbar button and the empty-state CTA. */
  onAddNew?: () => void;

  // Toolbar
  /** Label for the Add-new button. Default: "Add new". */
  addNewLabel?: string;
  /** Rendered inside the toolbar before the Add-new button. */
  toolbar?: React.ReactNode;

  // Per-row secondary actions (dropdown menu)
  rowActions?: SettingsRowAction<Row>[];

  // States
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Shown in the empty state when rows is empty and not loading/erroring. */
  emptyMessage?: string;

  // Bulk select
  /** When true, renders a leading checkbox column. */
  bulkSelectable?: boolean;
  /** Currently selected row ids. Consumer-owned. */
  selectedIds?: string[];
  /** Called when the selection changes. Consumer updates `selectedIds`. */
  onBulkSelectChange?: (selectedIds: string[]) => void;
  /**
   * Rendered in the toolbar row when selectedIds.length > 0.
   * Typically a "Delete selected" button.
   */
  bulkActions?: React.ReactNode;
  /**
   * Convenience prop for when bulk delete is the only bulk action.
   * When provided and selectedIds.length > 0, renders a "Delete N selected"
   * destructive button alongside whatever `bulkActions` supplies.
   * After calling this callback the primitive clears the selection automatically.
   */
  onBulkDelete?: (rows: Row[]) => void;

  className?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function alignClass(align: SettingsColumn<unknown>["align"]): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
}

// ---------------------------------------------------------------------------
// Row actions dropdown
// ---------------------------------------------------------------------------

function RowActionsDropdown<Row>({
  row,
  actions,
}: {
  row: Row;
  actions: SettingsRowAction<Row>[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Row actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onSelect={() => action.onSelect(row)}
              className={
                action.destructive
                  ? "text-destructive focus:text-destructive"
                  : undefined
              }
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SettingsTableShell<Row>({
  rows,
  columns,
  getRowId,
  onRowEdit,
  onAddNew,
  addNewLabel = "Add new",
  toolbar,
  rowActions,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  bulkSelectable,
  selectedIds = [],
  onBulkSelectChange,
  bulkActions,
  onBulkDelete,
  className,
}: SettingsTableShellProps<Row>): React.ReactElement {
  const hasActions =
    rowActions !== undefined && rowActions.length > 0;
  const hasBulk = bulkSelectable === true;
  const hasBulkSelection = hasBulk && selectedIds.length > 0;

  // Bulk select helpers
  const allIds = rows.map(getRowId);
  const allSelected =
    hasBulk && allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected =
    hasBulk && selectedIds.length > 0 && !allSelected;

  function toggleAll() {
    if (!onBulkSelectChange) return;
    if (allSelected) {
      onBulkSelectChange([]);
    } else {
      onBulkSelectChange(allIds);
    }
  }

  function toggleRow(rowId: string) {
    if (!onBulkSelectChange) return;
    if (selectedIds.includes(rowId)) {
      onBulkSelectChange(selectedIds.filter((id) => id !== rowId));
    } else {
      onBulkSelectChange([...selectedIds, rowId]);
    }
  }

  function handleBulkDelete() {
    if (!onBulkDelete || !onBulkSelectChange) return;
    const selectedRows = rows.filter((row) => selectedIds.includes(getRowId(row)));
    onBulkDelete(selectedRows);
    onBulkSelectChange([]);
  }

  // Body content resolution
  const showLoading = isLoading === true;
  const showError = !showLoading && error != null;
  const showTable = !showLoading && !showError && rows.length > 0;
  const showEmpty = !showLoading && !showError && rows.length === 0;

  // Toolbar bar — rendered above the table (below the separator)
  const toolbarRow = (
    <div className="border-b px-4 py-3">
      {/* Top row: custom slot + bulk actions (when active) + Add new */}
      <div className="flex items-center gap-2">
        {hasBulkSelection && (bulkActions || onBulkDelete) ? (
          // Bulk mode: show bulk actions, suppress regular toolbar
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            {bulkActions}
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete {selectedIds.length} selected
              </Button>
            )}
          </div>
        ) : (
          // Normal mode: show consumer toolbar slot
          <div className="flex flex-1 items-center gap-2">{toolbar}</div>
        )}
        {onAddNew && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddNew}
            className="shrink-0"
          >
            <Plus className="mr-1 h-4 w-4" />
            {addNewLabel}
          </Button>
        )}
      </div>
    </div>
  );

  // Empty state
  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center text-sm text-muted-foreground">
      <span>{emptyMessage ?? "No items yet."}</span>
      {onAddNew && (
        <Button variant="default" size="sm" onClick={onAddNew}>
          <Plus className="mr-1 h-4 w-4" />
          {addNewLabel}
        </Button>
      )}
    </div>
  );

  // Loading state
  const loadingState = (
    <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
      Loading…
    </div>
  );

  // Error state
  const errorState = (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <span>{errorMessage(error)}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={onRetry}
            >
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );

  // Table
  const tableContent = showTable ? (
    <Table>
      <TableHeader>
        <TableRow>
          {hasBulk && (
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
                aria-label="Select all rows"
              />
            </TableHead>
          )}
          {columns.map((col) => (
            <TableHead key={col.key} className={alignClass(col.align)}>
              {col.header}
            </TableHead>
          ))}
          {hasActions && <TableHead className="w-10" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = hasBulk && selectedIds.includes(rowId);
          return (
            <TableRow
              key={rowId}
              data-state={isSelected ? "selected" : undefined}
              className="hover:bg-muted/50"
            >
              {hasBulk && (
                <TableCell className="w-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleRow(rowId)}
                    aria-label="Select row"
                  />
                </TableCell>
              )}
              {columns.map((col) => {
                const isIdentifier = col.isIdentifier === true;
                const useMono = isIdentifier && col.identifierMono === true;
                return (
                  <TableCell
                    key={col.key}
                    className={cn(
                      alignClass(col.align),
                      isIdentifier &&
                        "text-primary hover:underline cursor-pointer font-medium",
                      useMono && "font-mono text-sm",
                    )}
                    onClick={
                      isIdentifier && onRowEdit
                        ? () => onRowEdit(row)
                        : undefined
                    }
                  >
                    {col.cell(row)}
                  </TableCell>
                );
              })}
              {hasActions && (
                <TableCell className="w-10">
                  <RowActionsDropdown row={row} actions={rowActions!} />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  ) : null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card shadow-sm overflow-hidden",
        className,
      )}
    >
      {toolbarRow}
      <div className="overflow-x-auto">
        {showLoading && loadingState}
        {showError && errorState}
        {showEmpty && emptyState}
        {tableContent}
      </div>
    </div>
  );
}

SettingsTableShell.displayName = "SettingsTableShell";
