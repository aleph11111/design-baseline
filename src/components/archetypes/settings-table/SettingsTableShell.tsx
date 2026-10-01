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
  hideBelowClass,
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

/**
 * The shell's built-in copy — every string it renders on its own. English
 * defaults; a non-English app overrides per call site (the fleet's i18n rule:
 * English defaults, overridable, never a baked-in language).
 */
export type SettingsTableLabels<Row> = {
  /** Loading-plane text. Default "Loading…". */
  loading?: string;
  /** Error-plane title. Default "Something went wrong". */
  errorTitle?: string;
  /** Error-plane retry button. Default "Try again". */
  retry?: string;
  /** Bulk-select header checkbox. Default "Select all rows". */
  selectAll?: string;
  /**
   * Bulk-select row checkbox. Either a fixed string applied to every row
   * (the localisable default stays overridable), or a function receiving the
   * row — the default is `"Select row: {name}"` where `{name}` is the
   * identifier column's cell value, so a screen-reader user hears which
   * record a checkbox opens. Pass a function to customise.
   */
  selectRow?: string | ((row: Row) => string);
  /** Bulk-mode selection caption. Default `${n} selected`. */
  selectedCount?: (count: number) => string;
  /** Bulk-delete button. Default `Delete ${n} selected`. */
  deleteSelected?: (count: number) => string;
  /** `sr-only` label of each row's `⋯` trigger when `rowActions` is set. Default "Row actions". */
  rowActions?: string;
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
  /**
   * The noun of the toolbar's result-count line (Layer 4): renders
   * `{rows.length} {rowLabel}`, right-aligned in the muted small-text style.
   * The function form receives the count, for singular/plural nouns. Omitted =
   * no count line.
   */
  rowLabel?: string | ((count: number) => string);

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
  /**
   * True when a search/filter produced the empty rows. The empty state then
   * shows only `emptyMessage` — the "Add" CTA is for the no-items-at-all case.
   */
  isFiltered?: boolean;
  /** Overrides for the shell's built-in copy (see `SettingsTableLabels`). */
  labels?: SettingsTableLabels<Row>;

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
  rowLabel,
  rowActions,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  isFiltered,
  labels,
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

  // Bulk select helpers. The selection is consumer-owned (selectedIds), but on
  // every bulk path the shell only ever emits ids of the rows it is showing:
  // the caption, the bulk actions, and toggleAll/toggleRow all operate on the
  // visible set, never on the raw prop. When the consumer filters a row out
  // its id silently drops on the next interaction — the selection outlives the
  // filter in the consumer's state, but the shell's UI never acts on the
  // invisible part.
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const allIds = rows.map(getRowId);
  const visibleSelected = allIds.filter((id) => selectedSet.has(id));
  const hasBulkSelection = hasBulk && visibleSelected.length > 0;
  const allSelected =
    hasBulk && allIds.length > 0 && visibleSelected.length === allIds.length;
  const someSelected =
    hasBulk && visibleSelected.length > 0 && !allSelected;

  // Identifier column — used for the default row-checkbox aria-label so a
  // screen-reader user hears which record each checkbox opens.
  const identifierCol = columns.find((c) => c.isIdentifier);
  // Default row-checkbox label: "Select row: {identifier cell value}". The
  // localisable default stays overridable through labels.selectRow as a fixed
  // string or as a function of the row.
  const defaultRowSelectLabel: (row: Row) => string = identifierCol
    ? (row) => `Select row: ${identifierCol.cell(row)}`
    : () => "Select row";

  function resolveRowSelectLabel(row: Row): string {
    const sel = labels?.selectRow;
    if (sel === undefined) return defaultRowSelectLabel(row);
    if (typeof sel === "function") return sel(row);
    return sel;
  }

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
    const base = visibleSelected;
    if (selectedSet.has(rowId)) {
      onBulkSelectChange(base.filter((id) => id !== rowId));
    } else {
      onBulkSelectChange([...base, rowId]);
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
  // Top row: consumer toolbar slot + selection caption / result count + Add new.
  // In bulk mode the consumer toolbar (search, filters, …) stays visible so the
  // user can still refine the list while rows are ticked; only the count line
  // swaps from `{n} {rowLabel}` to `{n} selected` + the bulk actions.
  // gap-3 matches the toolbar gap used by list-with-detail / feed.
  const showBulkActions = hasBulkSelection && (bulkActions || onBulkDelete);
  const countSpan = showBulkActions ? (
    <span className="text-sm text-muted-foreground">
      {labels?.selectedCount?.(visibleSelected.length) ??
        `${visibleSelected.length} selected`}
    </span>
  ) : rowLabel !== undefined ? (
    <span className="shrink-0 text-sm text-muted-foreground">
      {rows.length}{" "}
      {typeof rowLabel === "function" ? rowLabel(rows.length) : rowLabel}
    </span>
  ) : null;
  const toolbarRow = (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 items-center gap-2">{toolbar}</div>
      {showBulkActions && (
        <>
          {countSpan}
          {bulkActions}
          {onBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              {labels?.deleteSelected?.(visibleSelected.length) ??
                `Delete ${visibleSelected.length} selected`}
            </Button>
          )}
        </>
      )}
      {!showBulkActions && countSpan}
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
        onAddNew && !isFiltered && (
          <Button variant="default" size="sm" onClick={onAddNew}>
            <Plus className="mr-1 h-4 w-4" />
            {addNewLabel}
          </Button>
        )
      }
    />
  );
  const loadingState = <StateView variant="loading" message={labels?.loading} />;
  const errorState = (
    <StateView
      variant="error"
      title={labels?.errorTitle}
      error={error}
      onRetry={onRetry}
      retryLabel={labels?.retry}
    />
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
                aria-label={labels?.selectAll ?? "Select all rows"}
              />
            </TableHead>
          )}
          {columns.map((col) => (
            <TableHead key={col.key} className={cn(alignClass(col.align), hideBelowClass(col))}>
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
                    aria-label={resolveRowSelectLabel(row)}
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
                <TableCell className="w-10">
                  <RowActionsMenu
                    row={row}
                    triggerLabel={labels?.rowActions}
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
      <div className="relative overflow-x-auto">
        {showLoading && loadingState}
        {showError && errorState}
        {showEmpty && emptyState}
        {tableContent}
      </div>
    </SurfaceFrame>
  );
}

SettingsTableShell.displayName = "SettingsTableShell";
