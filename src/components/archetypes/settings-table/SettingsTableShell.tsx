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
import {
  ListStateView,
  RowActionsMenu,
  alignClass,
  hideBelowClass,
  identifierCell,
  resolveListState,
  type RowAction,
  type TableColumn,
} from "../shared";
import { PageFrame, type PageFrameProps } from "../../layout/PageFrame";
import { cn } from "../../../lib/utils";
import { logger } from "../../../utils/logger";

// Ambient so the donor typechecks without @types/node; consumers bring their own.
declare const process: { env: { NODE_ENV?: string } };

// The row overflow menu + its action shape are shared with list-with-detail.
export type { RowAction };

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
export type SettingsTableLabels<Row = unknown> = {
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
   * row. When omitted, the default is `"Select row: {name}"` where `{name}`
   * is the identifier column's cell value — but only when that cell renders a
   * plain string/number; a JSX identifier cell falls back to the flat
   * `"Select row"` rather than an "[object Object]" label. Pass a function
   * to customise.
   */
  selectRow?: string | ((row: Row) => string);
  /** Bulk-mode selection caption. Default `${n} selected`. */
  selectedCount?: (count: number) => string;
  /** Bulk-delete button. Default `Delete ${n} selected`. */
  deleteSelected?: (count: number) => string;
  /** `sr-only` label of each row's `⋯` trigger when `rowActions` is set. Default "Row actions". */
  rowActions?: string;
};

/**
 * The shell's built-in bulk-select copy — the consumer's `labels` is merged
 * over it per key with `??` (not a spread, which would let an explicit
 * `undefined` override replace a default), so adding a key or changing a
 * default is a one-line edit and an unset override falls back to the
 * built-in string. The row-checkbox name additionally has a row-derived
 * default ("Select row: {identifier cell}") that only yields to a consumer
 * override; a non-primitive identifier cell falls back to the flat
 * `selectRow` default below.
 */
const DEFAULT_SETTINGS_TABLE_LABELS = {
  selectAll: "Select all rows",
  selectRow: "Select row",
  selectedCount: (count: number) => `${count} selected`,
  deleteSelected: (count: number) => `Delete ${count} selected`,
};

export type SettingsTableShellProps<Row> = Pick<
  PageFrameProps,
  "title" | "subtitle" | "badges" | "actions" | "toolbar"
> & {
  /** The current (possibly filtered) rows to display. */
  rows: Row[];
  /** Column definitions. Mark exactly one column `isIdentifier` per table. */
  columns: SettingsColumn<Row>[];
  /** Stable, unique string key for each row. */
  getRowId: (row: Row) => string;
  /**
   * Plain-text name of a row, used for the default row-checkbox label
   * (`"Select row: {name}"`) when the identifier column's cell is not a
   * string/number (e.g. JSX). Skip it and such rows share the flat
   * `"Select row"` label (dev warning).
   */
  getRowLabel?: (row: Row) => string;

  // Callbacks
  /** Called when the identifier cell is clicked — consumer opens the edit dialog. */
  onRowEdit?: (row: Row) => void;
  /**
   * The create action: the shell renders an "Add" button first in the page
   * header `actions` (before the page's own) and as the empty-state CTA.
   */
  onAddNew?: () => void;
  /** Label for the Add-new button. Default: "Add new". */
  addNewLabel?: string;
  /**
   * The noun of the result count (`count` slot): renders
   * `{rows.length} {rowLabel}`. The function form receives the count, for
   * singular/plural nouns. Omitted = no count.
   */
  rowLabel?: string | ((count: number) => string);

  // Per-row secondary actions (dropdown menu)
  /**
   * Per-row secondary actions. Either a static list, or a factory the shell
   * calls with each row — the factory form lets an entry's `disabled` (or the
   * entry set itself) be derived from that row's data, the same per-row
   * capability rule `TableColumn.isClickable` follows.
   */
  rowActions?: RowAction<Row>[] | ((row: Row) => RowAction<Row>[]);

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
   * Write actions on the selection, rendered in the header `actions` while a
   * visible row is selected (the count then reads "{n} selected").
   */
  bulkActions?: React.ReactNode;
  /**
   * Convenience prop for when bulk delete is the only bulk action.
   * When provided and selectedIds.length > 0, renders a "Delete N selected"
   * destructive button alongside whatever `bulkActions` supplies.
   * After calling this callback the primitive clears the selection automatically.
   */
  onBulkDelete?: (rows: Row[]) => void;
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SettingsTableShell<Row>({
  rows,
  columns,
  getRowId,
  getRowLabel,
  onRowEdit,
  onAddNew,
  addNewLabel = "Add new",
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
  actions,
  ...frame
}: SettingsTableShellProps<Row>): React.ReactElement {
  const hasActions =
    typeof rowActions === "function" ||
    (rowActions !== undefined && rowActions.length > 0);
  const hasBulk = bulkSelectable === true;

  // Shell copy: the built-in defaults merged over the consumer's `labels`
  // per key with `??` — a spread would copy an explicit `undefined` onto a
  // default, so a wrapper forwarding an unset prop would make
  // `selectedCount`/`deleteSelected` throw and drop the select-all
  // `aria-label` instead of falling back to the built-in strings.
  const allLabels = {
    selectAll: labels?.selectAll ?? DEFAULT_SETTINGS_TABLE_LABELS.selectAll,
    selectedCount: labels?.selectedCount ?? DEFAULT_SETTINGS_TABLE_LABELS.selectedCount,
    deleteSelected:
      labels?.deleteSelected ?? DEFAULT_SETTINGS_TABLE_LABELS.deleteSelected,
  };

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
  // screen-reader user hears which record each checkbox opens. The label is
  // only rendered from the cell value when it is a primitive (string|number):
  // a JSX cell would interpolate to "Select row: [object Object]", which is
  // worse than the flat default, so the default falls back to "Select row".
  const identifierCol = columns.find((c) => c.isIdentifier);

  function resolveRowSelectLabel(row: Row): string {
    const sel = labels?.selectRow;
    if (sel === undefined) {
      if (identifierCol) {
        const cellVal = identifierCol.cell(row);
        if (typeof cellVal === "string" || typeof cellVal === "number") {
          return `Select row: ${cellVal}`;
        }
      }
      const name = getRowLabel?.(row);
      if (name) return `Select row: ${name}`;
      return DEFAULT_SETTINGS_TABLE_LABELS.selectRow;
    }
    return typeof sel === "function" ? sel(row) : sel;
  }

  // Dev-only: a JSX identifier cell with no getRowLabel / labels.selectRow
  // leaves every row checkbox with the identical flat "Select row" name.
  const firstCell =
    rows[0] && identifierCol ? identifierCol.cell(rows[0]) : undefined;
  const flatLabelFallback =
    hasBulk &&
    labels?.selectRow === undefined &&
    !getRowLabel &&
    rows.length > 1 &&
    !!identifierCol &&
    typeof firstCell !== "string" &&
    typeof firstCell !== "number";
  React.useEffect(() => {
    if (flatLabelFallback && process.env.NODE_ENV !== "production") {
      logger.warn(
        "SettingsTableShell: identifier cell is not text, so every row checkbox is named \"Select row\". Pass `getRowLabel` or `labels.selectRow`.",
      );
    }
  }, [flatLabelFallback]);

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
  const showTable = listState === "content";

  // Slots (ADR-0008): the count slot reads "{n} selected" in bulk mode, else
  // "{n} {rowLabel}"; bulk write actions and the create action merge into the
  // header `actions`, before the page's own. The consumer toolbar (search,
  // filters) stays visible in bulk mode so the list can still be refined.
  const showBulkActions = hasBulkSelection && (bulkActions || onBulkDelete);
  const count = showBulkActions
    ? allLabels.selectedCount(visibleSelected.length)
    : rowLabel !== undefined
      ? `${rows.length} ${typeof rowLabel === "function" ? rowLabel(rows.length) : rowLabel}`
      : undefined;
  const addButton = onAddNew && (
    <Button variant="default" size="sm" onClick={onAddNew}>
      <Plus className="mr-1 h-4 w-4" />
      {addNewLabel}
    </Button>
  );
  const mergedActions =
    showBulkActions || addButton || actions ? (
      <>
        {showBulkActions && bulkActions}
        {showBulkActions && onBulkDelete && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            {allLabels.deleteSelected(visibleSelected.length)}
          </Button>
        )}
        {addButton}
        {actions}
      </>
    ) : undefined;

  // Loading / empty / error planes are owned by the shared <ListStateView>.
  const listStatePlane = (
    <ListStateView
      phase={listState}
      error={error}
      onRetry={onRetry}
      labels={labels}
      emptyMessage={emptyMessage}
      emptyAction={!isFiltered && addButton}
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
                aria-label={allLabels.selectAll}
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
    <PageFrame {...frame} actions={mergedActions} count={count}>
      {/* The table scroll region sits INSIDE the (clipped) frame so the table
          scrolls beneath the toolbar band, not the surface itself. */}
      <div className="relative overflow-x-auto">
        {listStatePlane}
        {tableContent}
      </div>
    </PageFrame>
  );
}

SettingsTableShell.displayName = "SettingsTableShell";
