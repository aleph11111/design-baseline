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

/**
 * The frameless settings table — everything a D2 page renders below its own
 * heading: the flush control band (toolbar / count caption / create + bulk
 * write actions), the loading / empty / error planes, the table (with its
 * leading checkbox column when `bulkSelectable`), the per-row actions menu,
 * and the identifier-cell click-to-edit gate.
 *
 * No page header of its own. This is the form for tab content whose own tab
 * trigger owns the heading (the `SettingsPageShell` F2 archetype): the
 * frameless counterpart to `ListWithDetailBody`, so a settings table placed
 * inside a `SettingsPageShell` tab renders no second nested heading that
 * repeats the tab label.
 *
 * A `SettingsPageShell` tab has no page header to hold actions (`SettingsPageShell` has no
 * per-tab actions slot), so the `toolbar`, the `onAddNew` create action, and the bulk-write
 * actions (`bulkActions` / `onBulkDelete`) — the controls that a standalone page routes to its
 * `PageFrame` slots — render in this body's own flush band instead: the toolbar on the left,
 * the create + bulk actions and the count caption on the right, above the table. The count
 * caption reads "{n} selected" while a visible row is selected and the body has a bulk action,
 * otherwise "{n} {rowLabel}". `SettingsTableShell` routes the same props to the `PageFrame`
 * slots of its page frame rather than to the body, so a standalone page renders exactly one
 * band.
 */
export type SettingsTableBodyProps<Row> = {
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

  // Scoping + result count (the frame's toolbar band, ADR-0008 slot map)
  /**
   * The scoping controls — search, filters — for the body's flush band (left). `SettingsTableShell`
   * routes this to its page frame's `toolbar` slot and suppresses the body's band instead.
   */
  toolbar?: React.ReactNode;
  /**
   * The noun of the result count: renders `{rows.length} {rowLabel}` in the band's count caption (or
   * the page frame's `count` slot in `SettingsTableShell`), unless a selection with a bulk action
   * switches it to "{n} selected". The function form receives the count, for singular/plural nouns.
   * Omitted = no count.
   */
  rowLabel?: string | ((count: number) => string);

  // Callbacks
  /** Called when the identifier cell is clicked — consumer opens the edit dialog. */
  onRowEdit?: (row: Row) => void;
  /**
   * The create action: the owning form renders an "Add" button — the page header `actions` in
   * `SettingsTableShell`, the body's own flush band standalone — and the body renders the same
   * button as its empty-state CTA. One pair of props (`onAddNew` + `addNewLabel`) drives all three,
   * so they cannot drift.
   */
  onAddNew?: () => void;
  /** Label for the Add-new button. Default: "Add new". */
  addNewLabel?: string;
  /**
   * Write actions on the selection, rendered alongside the create action while a visible row is
   * selected — in the page header `actions` in `SettingsTableShell`, in the body's flush band
   * standalone (the count caption then reads "{n} selected").
   */
  bulkActions?: React.ReactNode;
  /**
   * Convenience prop for when bulk delete is the only bulk action.
   * When provided and a visible row is selected, renders a "Delete N selected" destructive
   * button alongside whatever `bulkActions` supplies. After calling this callback the primitive
   * clears the selection automatically.
   */
  onBulkDelete?: (rows: Row[]) => void;
  /**
   * Render the body's own flush control band (default `true` — the tab-level home for the
   * `toolbar` / count / create / bulk-write controls). `SettingsTableShell` passes `false`,
   * routing those props to the page frame's slots instead, so a standalone page keeps exactly
   * one band.
   */
  band?: boolean;
  /**
   * Run the body's chrome at the container's edge (default `true` — direct
   * tab-content placement): the body's flush band and the table row wrapper
   * (the flex row holding the table and, with `editPane`, the pane) negate the
   * surrounding container's horizontal inset (`-mx-5` against the
   * `SettingsPageShell` F2 tab panel's `p-5`), and the body's outer wrapper
   * negates its top inset (`-mt-5`), so the band's ruled line, the
   * table's edges, and the pane's outer edge sit at the surface edge exactly
   * where a standalone page's do — the panel keeps its pad for every other
   * body, and only this body bleeds out of it. The bleed never goes on the
   * table scroll region itself: that is a `flex-1` sibling of the `editPane`,
   * and a negative margin on a flex item adds free space the item absorbs (the
   * table would grow 40px and paint over the pane's hairline). Pass `false`
   * when the body sits inside a frame that owns the page's edges without
   * horizontal padding (a `PageFrame` surface / `SurfaceFrame` never pads its
   * body, so there is no inset to bleed from and the no-op is explicit) or
   * inside an outer element carrying a different horizontal inset.
   */
  flush?: boolean;
  /**
   * Split-pane editing (Layer 5, ADR-0008 §3): the consumer's persistent edit
   * form joins the page frame's right pane, hairline-divided from the table
   * (never a second raised surface). The row-click contract (Layer 6) drives
   * the selection the pane edits. On viewports below `md` the pane is out of
   * the frame and the consumer's mobile edit-dialog overlay takes over
   * (Layer 11). The slot is owned by `SettingsTableShell` (rendered through
   * the shared body) and also applies to the frameless body.
   */
  editPane?: React.ReactNode;

  // Per-row secondary actions (dropdown menu)
  /**
   * Per-row secondary actions. Either a static list, or a factory the body calls with each row
   * — the factory form lets an entry's `disabled` (or the entry set itself) be derived from
   * that row's data, the same per-row capability rule `TableColumn.isClickable` follows.
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
};

/**
 * The page-shell form: the `PageFrame` slots (title / subtitle / badges / actions) plus the body
 * (which owns the toolbar, count, create, and bulk-write actions — routed to the frame's `toolbar`
 * / `count` slots and header `actions` here, not to the body's own band). Composes
 * `SettingsTableBody` as its frame body, so the frame owns the heading and the one raised surface
 * while the body owns the table, its rows, and the selection planes.
 *
 * The frame's `count` slot is derived internally from the same inputs the body uses to derive its
 * band caption and checkboxes (`computeBulkSelection`), so the two cannot disagree.
 *
 * `band` and `flush` are excluded — the shell fixes both (`band={false}` by
 * routing to the frame, `flush={false}` because the frame's surface never pads
 * its body), so there is nothing to configure. `editPane` is the one
 * body-scoped prop the shell does forward.
 *
 * Use `SettingsTableBody` directly for tab content inside a `SettingsPageShell` (the
 * tab trigger label owns the heading, so the body renders no second nested heading). The default
 * `flush` assumes that tab placement — in any other frame that already owns the heading, pass
 * `flush={false}` (the frame surface never pads its body, so the default bleed would push the
 * chrome past the edge). `SettingsTableShell` renders a page frame with a `title`, so in a
 * nested frame it is a second nested heading repeating the tab label.
 */
export type SettingsTableShellProps<Row> = Pick<
  PageFrameProps,
  "title" | "subtitle" | "badges" | "actions"
> &
  Omit<SettingsTableBodyProps<Row>, "band" | "flush">;

// ---------------------------------------------------------------------------
// Shared, frameless derivation
// ---------------------------------------------------------------------------

/**
 * The selection state both the body (select-all + row checkboxes + bulk band) and the shell
 * (the "{n} selected" count, the bulk-write actions) derive from. Pure over (rows, getRowId,
 * selectedIds, bulkSelectable) — the same inputs feed both, so the body's checkboxes, the band
 * actions, and the frame's count can never disagree about how many rows are selected and
 * visible.
 */
type BulkSelection = {
  selectedSet: ReadonlySet<string>;
  allIds: string[];
  visibleSelected: string[];
  allSelected: boolean;
  hasBulkSelection: boolean;
  someSelected: boolean;
};

function computeBulkSelection<Row>(
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
function resolveCountLabel<Row>({
  rows,
  selection,
  rowLabel,
  labels,
  bulkActions,
  onBulkDelete,
}: {
  rows: Row[];
  selection: BulkSelection;
  rowLabel?: string | ((count: number) => string);
  labels?: SettingsTableLabels<Row>;
  bulkActions?: React.ReactNode;
  onBulkDelete?: (rows: Row[]) => void;
}): string | undefined {
  const { visibleSelected, hasBulkSelection } = selection;
  const showBulkActions = hasBulkSelection && (Boolean(bulkActions) || onBulkDelete != null);
  if (showBulkActions) {
    return (labels?.selectedCount ?? DEFAULT_SETTINGS_TABLE_LABELS.selectedCount)(
      visibleSelected.length,
    );
  }
  if (rowLabel !== undefined) {
    return `${rows.length} ${typeof rowLabel === "function" ? rowLabel(rows.length) : rowLabel}`;
  }
  return undefined;
}

/**
 * The create-action button — one component so the page header `actions` (via
 * `SettingsTableShell`), the body's flush band, and the empty-state CTA render it identically
 * from the same `onAddNew` / `addNewLabel` pair. Returns `null` when no `onAddNew` is set.
 */
function SettingsTableAddButton({
  onAddNew,
  label = "Add new",
}: {
  onAddNew?: () => void;
  label?: string;
}): React.ReactElement | null {
  if (!onAddNew) return null;
  return (
    <Button variant="default" size="sm" onClick={onAddNew}>
      <Plus className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
}

/**
 * The bulk-write actions for a selection — the consumer's `bulkActions` plus the convenience
 * "Delete N selected" button (built-in copy from `labels.deleteSelected`, selection cleared
 * after the callback) — shown while a visible row is selected and a bulk action exists. One
 * node the body's band and the shell's header `actions` both route through, so both read the
 * same "{N} selected" count and clear identically.
 */
function resolveBulkActions<Row>({
  selection,
  rows,
  getRowId,
  labels,
  bulkActions,
  onBulkDelete,
  onBulkSelectChange,
}: {
  selection: BulkSelection;
  rows: Row[];
  getRowId: (row: Row) => string;
  labels?: SettingsTableLabels<Row>;
  bulkActions?: React.ReactNode;
  onBulkDelete?: (rows: Row[]) => void;
  onBulkSelectChange?: (selectedIds: string[]) => void;
}): { show: boolean; node: React.ReactNode } {
  const show = selection.hasBulkSelection && (Boolean(bulkActions) || onBulkDelete != null);
  if (!show) return { show: false, node: null };
  const deleteSelected = labels?.deleteSelected ?? DEFAULT_SETTINGS_TABLE_LABELS.deleteSelected;
  const handleBulkDelete = () => {
    if (!onBulkDelete || !onBulkSelectChange) return;
    const selectedRows = rows.filter((row) => selection.selectedSet.has(getRowId(row)));
    onBulkDelete(selectedRows);
    onBulkSelectChange([]);
  };
  return {
    show: true,
    node: (
      <>
        {bulkActions}
        {onBulkDelete != null && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            {deleteSelected(selection.visibleSelected.length)}
          </Button>
        )}
      </>
    ),
  };
}

// ---------------------------------------------------------------------------
// Body component (frameless)
// ---------------------------------------------------------------------------

/**
 * The frameless settings table — D2's table content, no page header, no second raised surface.
 * Exported for tab content inside a `SettingsPageShell` (F2 archetype), mirroring the
 * `ListWithDetailBody` precedent: there the tab trigger label is the only heading, so the body
 * renders no second nested heading that repeats the tab label.
 *
 * The default `flush` assumes that one placement — the body is the direct content of a
 * `SettingsPageShell` tab. It bleeds the body's chrome out of the tab panel's `p-5` pad so the
 * band and table sit at the surface edge, exactly as on a standalone D2 page. Any other frame
 * that already owns the heading (a `PageFrame` body, a detail pane, …) does not pad that inset
 * the same way — pass `flush={false}` there so the chrome holds. `SettingsTableShell` (the
 * standalone page) fixes `flush={false}` itself.
 *
 * Renders a flush control band (toolbar left; create + bulk-write actions and the count caption
 * right) when any of those controls are present — the tab-level home for the scoping/write
 * controls a `SettingsPageShell` tab cannot route to a page header. `SettingsTableShell` routes
 * those props to its `PageFrame` slots and suppresses the body's band (`band={false}` — only the
 * frame owns the page's single band), so a standalone page renders exactly one band; it still
 * forwards `onAddNew` (plus `addNewLabel`) so the body's empty state offers the same CTA the
 * header action does.
 */
export function SettingsTableBody<Row>({
  rows,
  columns,
  getRowId,
  getRowLabel,
  onRowEdit,
  onAddNew,
  addNewLabel = "Add new",
  toolbar,
  rowLabel,
  bulkActions,
  onBulkDelete,
  band: bandEnabled = true,
  flush: flushEnabled = true,
  editPane,
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
}: SettingsTableBodyProps<Row>): React.ReactElement {
  const hasActions =
    typeof rowActions === "function" ||
    (rowActions !== undefined && rowActions.length > 0);
  const hasBulk = bulkSelectable === true;

  const selection = computeBulkSelection(rows, getRowId, selectedIds, hasBulk);
  const { selectedSet, allIds, visibleSelected, allSelected, someSelected } = selection;

  // The body's built-in select-all checkbox label — the consumer's `labels` merged over the
  // default with `??` (a spread would let an explicit `undefined` replace a default).
  // `ListStateView` handles its own loading/error/retry defaults from the raw `labels`.
  const selectAllLabel = labels?.selectAll ?? DEFAULT_SETTINGS_TABLE_LABELS.selectAll;

  // Identifier column — the default row-checkbox aria-label source.
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

  // Dev-only: a JSX identifier cell with no getRowLabel / labels.selectRow leaves every row
  // checkbox with the identical flat "Select row" name.
  const firstCell = rows[0] && identifierCol ? identifierCol.cell(rows[0]) : undefined;
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
        "SettingsTableBody: identifier cell is not text, so every row checkbox is named \"Select row\". Pass `getRowLabel` or `labels.selectRow`.",
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

  // Body content resolution
  const listState = resolveListState({ isLoading, error, isEmpty: rows.length === 0 });
  const showTable = listState === "content";

  // The create action doubles as the empty-state CTA (hidden when the empty rows are
  // filter-caused — that has no "add" to offer). `null` when no `onAddNew` — an always-present
  // element would flip the StateView's `{action && …}` gate and render an empty CTA wrapper.
  const addButton = onAddNew ? <SettingsTableAddButton onAddNew={onAddNew} label={addNewLabel} /> : null;

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
                aria-label={selectAllLabel}
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

  // Flush control band (the frame's band, minus the frame). The chrome string is the same
  // ruled band the page frame owns (`border-b px-4 py-3`); the inner layout mirrors the
  // frame's band (flex row, wrapped, count in the muted treatment) because a tab has no page
  // header to hold these controls. The table's scroll region sits BELOW the band so the band
  // stays in view while the table scrolls.
  const countLabel = resolveCountLabel({
    rows,
    selection,
    rowLabel,
    labels,
    bulkActions,
    onBulkDelete,
  });
  const bulkNode = resolveBulkActions({
    selection,
    rows,
    getRowId,
    labels,
    bulkActions,
    onBulkDelete,
    onBulkSelectChange,
  });
  const hasBandControls =
    Boolean(toolbar) ||
    onAddNew != null ||
    bulkNode.show ||
    countLabel != null;
  // The explicit `-mx-5` literal is the bleed: it negates the `SettingsPageShell`
  // tab panel's `p-5` so the body's chrome runs at the surface edge. A dynamic
  // `${flush ? "-mx-5" : ""}` would not be greppable (lint requires the class to
  // exist in source), so the literal stays and the prop only switches whether
  // a container carries it. It goes on the band and on the flex wrapper —
  // never on the table region, which is a `flex-1` SIBLING of the `editPane`:
  // a negative margin on a flex item adds free space that item absorbs, so
  // the table would grow 40px wide and paint over the pane's hairline — the
  // wrapper has no siblings, so the bleed lands exactly on the surface edge.
  const bleed = flushEnabled ? "-mx-5" : "";
  const band = bandEnabled && hasBandControls ? (
    <div data-slot="settings-table-band" className={cn("border-b px-4 py-3", bleed)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">{toolbar}</div>
        {(onAddNew != null || bulkNode.show || countLabel != null) && (
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {countLabel != null && (
              <span className="text-sm text-muted-foreground">{countLabel}</span>
            )}
            {bulkNode.show && bulkNode.node}
            {onAddNew != null && <SettingsTableAddButton onAddNew={onAddNew} label={addNewLabel} />}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    // `-mt-5` pulls the body's first child (the band, or the table when there
    // is no band) up through the panel's top `p-5`, so the tab body starts at
    // the tab strip's ruled line — the vertical half of the same bleed.
    <div className={flushEnabled ? "-mt-5" : undefined}>
      {band}
      {/* One surface, always. With `editPane` the body splits into two panes
          (Layer 5, ADR-0008 §3): the table and the consumer's persistent edit
          form, divided by the frame's hairline at `md` and up — never a second
          raised surface. Below `md` the pane is out of the frame and the
          click-contract edit dialog (Layer 11) is the mobile editing surface. */}
      <div className={cn("flex", bleed)}>
        {/* The table scroll region below (clipped) the band so the table scrolls
            beneath the band, not the surface itself. No bleed here: this is a
            flex-1 ITEM beside the `editPane`, and a negative margin on an item
            adds free space that item absorbs (the table would grow 40px and
            paint over the pane's hairline) — the wrapper carries the bleed. */}
        <div className="relative min-w-0 flex-1 overflow-x-auto">
          {listStatePlane}
          {tableContent}
        </div>
        {editPane != null && editPane !== false && (
          <div className="hidden w-1/2 md:block md:border-l">{editPane}</div>
        )}
      </div>
    </div>
  );
}

SettingsTableBody.displayName = "SettingsTableBody";

// ---------------------------------------------------------------------------
// Shell (page form)
// ---------------------------------------------------------------------------

/**
 * The page-archetype shell (D2) — `SettingsTableBody` inside a `PageFrame`. The frame owns the
 * heading, the one raised surface, the toolbar band (search / filters, and the result count — or
 * "{n} selected" while a row is selected), and the create + bulk-write actions; the body owns the
 * table, its rows, and the selection planes. The `toolbar` / `rowLabel` / `bulkActions` /
 * `onBulkDelete` props are routed to the frame's `toolbar` / `count` slots and header `actions`
 * — not forwarded to the body — so the frame is the page's only band and the body's own band
 * stays out of a standalone page.
 *
 * Use `SettingsTableBody` directly for tab content inside a `SettingsPageShell` (the
 * tab trigger label owns the heading, so the body renders no second nested heading). The default
 * `flush` assumes that tab placement — in any other frame that already owns the heading, pass
 * `flush={false}` (the frame surface never pads its body, so the default bleed would push the
 * chrome past the edge). `SettingsTableShell` renders a page frame with a `title`, so in a
 * nested frame it is a second nested heading repeating the tab label.
 */
export function SettingsTableShell<Row>({
  title,
  subtitle,
  badges,
  actions,
  rows,
  columns,
  getRowId,
  getRowLabel,
  onRowEdit,
  onAddNew,
  addNewLabel = "Add new",
  toolbar,
  rowLabel,
  bulkActions,
  onBulkDelete,
  editPane,
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
}: SettingsTableShellProps<Row>): React.ReactElement {
  const hasBulk = bulkSelectable === true;

  // Derive the same selection state the body derives (a pure function of the shared props); the
  // shell uses it for the frame's `count` slot and its bulk-write actions.
  const selection = computeBulkSelection(rows, getRowId, selectedIds, hasBulk);

  // Frame's count slot (ADR-0008 slot map): "{n} selected" in bulk mode, else "{n} {rowLabel}" —
  // the same derivation the body's band caption uses.
  const count = resolveCountLabel({
    rows,
    selection,
    rowLabel,
    labels,
    bulkActions,
    onBulkDelete,
  });

  const bulkNode = resolveBulkActions({
    selection,
    rows,
    getRowId,
    labels,
    bulkActions,
    onBulkDelete,
    onBulkSelectChange,
  });

  const addButton = onAddNew ? <SettingsTableAddButton onAddNew={onAddNew} label={addNewLabel} /> : null;
  const mergedActions =
    bulkNode.show || addButton || actions ? (
      <>
        {bulkNode.show && bulkNode.node}
        {addButton}
        {actions}
      </>
    ) : undefined;

  return (
    <PageFrame
      title={title}
      subtitle={subtitle}
      badges={badges}
      toolbar={toolbar}
      actions={mergedActions}
      count={count}
    >
      <SettingsTableBody
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        getRowLabel={getRowLabel}
        onRowEdit={onRowEdit}
        onAddNew={onAddNew}
        addNewLabel={addNewLabel}
        // The frame above owns the page's toolbar/count/bulk-write actions; the
        // body's own band is suppressed so the page has exactly one band. `onAddNew`
        // still drives the body's empty-state CTA (and, in the body used directly,
        // the band's create button). The `editPane` slot flows through to the
        // body's split-pane wrapper (Layer 5). The surface this body renders
        // inside never pads it, so there is no horizontal inset to bleed from —
        // the explicit `false` keeps the standalone page's edges unpadded.
        band={false}
        flush={false}
        editPane={editPane}
        rowActions={rowActions}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyMessage={emptyMessage}
        isFiltered={isFiltered}
        labels={labels}
        bulkSelectable={bulkSelectable}
        selectedIds={selectedIds}
        onBulkSelectChange={onBulkSelectChange}
      />
    </PageFrame>
  );
}

SettingsTableShell.displayName = "SettingsTableShell";
