"use client";
import * as React from "react";
import { Button } from "../../ui/button";
import type { BaselineLabels } from "../../../lib/labels";

/**
 * The bulk-selection derivation shared by every archetype with a checkbox column
 * (settings-table, list-with-detail): one visible-only selection, one count caption,
 * one bulk-actions node — so the shells cannot disagree on what is selected.
 */

/** The built-in bulk copy a shell's `labels` may override. */
export type BulkLabels = {
  selectedCount?: (count: number) => string;
  deleteSelected?: (count: number) => string;
};

/**
 * The selection state both the body (select-all + row checkboxes + bulk band) and the shell
 * (the "{n} selected" count, the bulk-write actions) derive from. Pure over (rows, getRowId,
 * selectedIds, bulkSelectable) — the same inputs feed both, so the body's checkboxes, the band
 * actions, and the frame's count can never disagree about how many rows are selected and
 * visible.
 */
export type BulkSelection = {
  selectedSet: ReadonlySet<string>;
  allIds: string[];
  visibleSelected: string[];
  allSelected: boolean;
  hasBulkSelection: boolean;
  someSelected: boolean;
};

export function computeBulkSelection<Row>(
  rows: Row[],
  getRowId: (row: Row) => string,
  selectedIds: string[],
  bulkSelectable: boolean,
): BulkSelection {
  const selectedSet = new Set(selectedIds);
  const allIds = rows.map(getRowId);
  // On every bulk path, only the ids of the rows currently shown are acted on: the caption, the
  // bulk actions, and the select-all checkbox all operate on the visible set, never on the raw
  // `selectedIds`. When a filter hides a ticked row its id stays in the consumer's state but
  // drops out of `visibleSelected` — the selection outlives the filter in the consumer, the UI
  // never acts on the hidden part.
  const visibleSelected = allIds.filter((id) => selectedSet.has(id));
  const hasBulkSelection = bulkSelectable && visibleSelected.length > 0;
  const allSelected =
    bulkSelectable && allIds.length > 0 && visibleSelected.length === allIds.length;
  const someSelected = hasBulkSelection && !allSelected;
  return { selectedSet, allIds, visibleSelected, allSelected, hasBulkSelection, someSelected };
}

/**
 * The count caption: "{n} selected" while a visible row is selected AND a bulk action exists
 * (a selection with no bulk action is visually indistinguishable from "no selection"),
 * otherwise "{n} {rowLabel}" — or `undefined` when no `rowLabel` is set. One derivation the
 * body's band and the shell's `PageFrame` `count` slot both route through, over the caller's
 * own `computeBulkSelection` result — so the caption's selection is byte-identical to the
 * caller's checkboxes/bulk actions.
 */
export function resolveCountLabel<Row>({
  L,
  rows,
  selection,
  rowLabel,
  labels,
  bulkActions,
  onBulkDelete,
}: {
  L: BaselineLabels;
  rows: Row[];
  selection: BulkSelection;
  rowLabel?: string | ((count: number) => string);
  labels?: BulkLabels;
  bulkActions?: React.ReactNode;
  onBulkDelete?: (rows: Row[]) => void;
}): string | undefined {
  const { visibleSelected, hasBulkSelection } = selection;
  const showBulkActions = hasBulkSelection && (Boolean(bulkActions) || onBulkDelete != null);
  if (showBulkActions) {
    return (labels?.selectedCount ?? L.selectedCount)(
      visibleSelected.length,
    );
  }
  if (rowLabel !== undefined) {
    return `${rows.length} ${typeof rowLabel === "function" ? rowLabel(rows.length) : rowLabel}`;
  }
  return undefined;
}

/**
 * The bulk-write actions for a selection — the consumer's `bulkActions` plus the convenience
 * "Delete N selected" button (built-in copy from `labels.deleteSelected`, selection cleared
 * after the callback) — shown while a visible row is selected and a bulk action exists. One
 * node the body's band and the shell's header `actions` both route through, so both read the
 * same "{N} selected" count and clear identically.
 */
export function resolveBulkActions<Row>({
  L,
  selection,
  rows,
  getRowId,
  labels,
  bulkActions,
  onBulkDelete,
  onBulkSelectChange,
}: {
  L: BaselineLabels;
  selection: BulkSelection;
  rows: Row[];
  getRowId: (row: Row) => string;
  labels?: BulkLabels;
  bulkActions?: React.ReactNode;
  onBulkDelete?: (rows: Row[]) => void;
  onBulkSelectChange?: (selectedIds: string[]) => void;
}): { show: boolean; node: React.ReactNode } {
  const show = selection.hasBulkSelection && (Boolean(bulkActions) || onBulkDelete != null);
  if (!show) return { show: false, node: null };
  const deleteSelected = labels?.deleteSelected ?? L.deleteSelected;
  const handleBulkDelete = () => {
    if (!onBulkDelete) return;
    const selectedRows = rows.filter((row) => selection.selectedSet.has(getRowId(row)));
    onBulkDelete(selectedRows);
    onBulkSelectChange?.([]);
  };
  return {
    show: true,
    node: (
      <>
        {bulkActions}
        {onBulkDelete != null && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            {deleteSelected(selection.visibleSelected.length)}
          </Button>
        )}
      </>
    ),
  };
}

