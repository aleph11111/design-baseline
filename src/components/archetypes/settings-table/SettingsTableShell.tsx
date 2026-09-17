"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { StateView } from "../../ui/state-view";
import {
  RowActionsMenu,
  alignClass,
  identifierCell,
  resolveListState,
  type RowAction,
  type TableColumn,
} from "../shared";
import { SurfaceFrame } from "../../layout/SurfaceFrame";
import type { SurfaceHeaderSlotProps } from "../../layout/SurfaceHeaderSlot";
import { cn } from "../../../lib/utils";

// The row overflow menu + its action shape are shared with list-with-detail.
// `SettingsRowAction` stays exported as an alias for back-compat.
export type SettingsRowAction<Row> = RowAction<Row>;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

// The shared column-descriptor fields (incl. the identifier-cell recipe and
// the Layer-6 align keying rule) are owned by `TableColumn` under
// `archetypes/shared`; D2 adds no extensions on top of the base.
export type SettingsColumn<Row> = TableColumn<Row>;

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
  /**
   * Per-row secondary actions. Either a static list, or a factory the shell
   * calls with each row — the factory form lets an entry's `disabled` (or the
   * entry set itself) be derived from that row's data, the same per-row
   * capability rule `TableColumn.isClickable` follows.
   */
  rowActions?: SettingsRowAction<Row>[] | ((row: Row) => SettingsRowAction<Row>[]);

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
} & SurfaceHeaderSlotProps;

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
  kicker,
  title,
  headerActions,
}: SettingsTableShellProps<Row>): React.ReactElement {
  const hasActions =
    typeof rowActions === "function" ||
    (rowActions !== undefined && rowActions.length > 0);
  const hasBulk = bulkSelectable === true;
  const hasBulkSelection = hasBulk && selectedIds.length > 0;

  // Bulk select helpers
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const allIds = rows.map(getRowId);
  const allSelected =
    hasBulk && allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
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
    if (selectedSet.has(rowId)) {
      onBulkSelectChange(selectedIds.filter((id) => id !== rowId));
    } else {
      onBulkSelectChange([...selectedIds, rowId]);
    }
  }

  function handleBulkDelete() {
    if (!onBulkDelete || !onBulkSelectChange) return;
    const selectedRows = rows.filter((row) => selectedSet.has(getRowId(row)));
    onBulkDelete(selectedRows);
    onBulkSelectChange([]);
  }

  // Body content resolution
  const listState = resolveListState({ isLoading, error, isEmpty: rows.length === 0 });
  const showLoading = listState === "loading";
  const showError = listState === "error";
  const showTable = listState === "content";
  const showEmpty = listState === "empty";

  // Toolbar row content — the ruled band chrome is owned by the <SurfaceFrame>
  // `toolbar` slot below; the shell composes only the row's INNER layout.
  // Top row: custom slot + bulk actions (when active) + Add new.
  // gap-3 matches the toolbar gap used by list-with-detail / feed.
  const toolbarRow = (
    <div className="flex items-center gap-3">
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
  );

  // Loading / empty / error planes are owned by the shared <StateView>.
  const emptyState = (
    <StateView
      variant="empty"
      message={emptyMessage ?? "No items yet."}
      action={
        onAddNew && (
          <Button variant="default" size="sm" onClick={onAddNew}>
            <Plus className="mr-1 h-4 w-4" />
            {addNewLabel}
          </Button>
        )
      }
    />
  );
  const loadingState = <StateView variant="loading" />;
  const errorState = <StateView variant="error" error={error} onRetry={onRetry} />;

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
          const isSelected = hasBulk && selectedSet.has(rowId);
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
                const cellProps =
                  isIdentifier && onRowEdit
                    ? identifierCell(col, () => onRowEdit(row), row)
                    : null;
                return (
                  <TableCell
                    key={col.key}
                    className={cn(
                      alignClass(col.align),
                      cellProps?.className,
                    )}
                    {...cellProps}
                  >
                    {col.cell(row)}
                  </TableCell>
                );
              })}
              {hasActions && (
                <TableCell className="w-10">
                  <RowActionsMenu
                    row={row}
                    actions={
                      typeof rowActions === "function" ? rowActions(row) : rowActions!
                    }
                  />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  ) : null;

  return (
    <SurfaceFrame
      kicker={kicker}
      title={title}
      headerActions={headerActions}
      toolbar={toolbarRow}
    >
      {/* The table scroll region sits INSIDE the (clipped) frame so the table
          scrolls beneath a fixed header + toolbar band, not the surface itself. */}
      <div className="overflow-x-auto">
        {showLoading && loadingState}
        {showError && errorState}
        {showEmpty && emptyState}
        {tableContent}
      </div>
    </SurfaceFrame>
  );
}

SettingsTableShell.displayName = "SettingsTableShell";
