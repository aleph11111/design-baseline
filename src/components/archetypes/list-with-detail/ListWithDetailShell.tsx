"use client";
import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../../ui/sheet";
import { SurfaceFrame } from "../../layout/SurfaceFrame";
import { useFullBleedClass } from "../../layout/surface";
import { SurfaceHeaderBar } from "../../layout/SurfaceHeaderBar";
import type { SurfaceHeaderSlotProps } from "../../layout/SurfaceHeaderSlot";
import {
  ListWithDetailEmptyState,
  type ListEmptyMode,
  type ListWithDetailLabels,
} from "./ListWithDetailEmptyState";
import { TableBody } from "./presentations/TableBody";
import { CardGridBody } from "./presentations/CardGridBody";
import { ActionRowBody } from "./presentations/ActionRowBody";
import { resolveListState, type RowAction, type TableColumn } from "../shared";

// The per-row overflow menu and its action shape are owned by the shared
// primitive (../shared/RowActionsMenu) so list-with-detail and settings-table
// render an identical menu. Re-exported here for back-compat with consumers that
// import `RowAction` from this archetype.
export type { RowAction };

// The shell draws its own bounded-card chrome (border + surface) by default.
// A composing archetype that already supplies the surrounding surface (e.g.
// grouped-list's section card) declares chrome-suppression with this context;
// the shell then drops its own card chrome and renders flush. This is the
// list-with-detail analogue of detail-overview's `UnifiedSurfaceContext` — an
// internal context the *composing* shell supplies, not a per-page appearance
// prop. Exported from this module (not the barrel) so a composing archetype can
// import it without it becoming documented per-page API.
export const ListChromeContext = React.createContext(false);

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

// The six shared column-descriptor fields (incl. the identifier-cell recipe and
// the align keying rule) are owned by `TableColumn` under `../shared` so A and D2
// derive one identical identifier cell; A adds its sort/width extensions on top.
export type ListColumn<Row> = TableColumn<Row> & {
  width?: string | number;
  sortable?: boolean;
  /** Primitive does NOT call this; pass through to consumer. */
  sortFn?: (a: Row, b: Row) => number;
};

export type SortDirection = "asc" | "desc";

export type ListWithDetailShellProps<Row> = {
  rows: Row[];
  columns: ListColumn<Row>[];
  getRowId: (row: Row) => string;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onRowSelect?: (row: Row) => void;
  selectedRowId?: string | null;
  rowActions?: RowAction<Row>[];
  toolbar?: React.ReactNode;
  detail?: React.ReactNode;
  /**
   * Optional title for the detail surface's header bar (rendered with the house
   * `headerFill` treatment). When omitted, the detail surface renders only
   * `detail`.
   */
  detailTitle?: React.ReactNode;
  /** Optional right-aligned actions in the detail surface's header (e.g. an Edit button). */
  detailActions?: React.ReactNode;
  /**
   * Called when the detail overlay (the Sheet — the only detail surface, on
   * every width) closes — Esc, backdrop click, or
   * the close button. The shell already tracks its own open/close state; wire
   * this to clear the consumer's selection so it doesn't go stale once the
   * Sheet is gone.
   */
  onDetailClose?: () => void;

  // The drawer/sheet header bar (below) reads `HeaderFillContext` set once at
  // `<AppShell headerFill=…>` — the same treatment as the master on-surface
  // header; there is no per-shell override.

  emptyStateMessage?: string;
  /** Overrides for the shell's built-in copy (see `ListWithDetailLabels`). */
  labels?: ListWithDetailLabels;
  /**
   * CTA inside the empty / filtered-empty panel (e.g. "Add {entity}") — a
   * composition slot, the same shape as settings-table's empty-state action.
   */
  emptyStateAction?: React.ReactNode;
  filteredEmpty?: boolean;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, sortDirection: SortDirection) => void;
  /**
   * Body presentation — the A archetype's variant axis, keyed to the row's data
   * shape (see the contract's decision table). Same rows + columns + row
   * interaction; only the rendering differs:
   * - `"table"`: the sortable data table. Dense, multi-column rows.
   * - `"card-grid"`: rows as cards in a responsive grid (identifier as title,
   *   remaining columns as label/value pairs). For browse-y, image/summary-led
   *   lists with 2–3 data columns. Sorting headers are table-only; drive sort
   *   from the toolbar here.
   * - `"action-row"`: full-width stacked rows (identifier + a couple of fields +
   *   chevron) — the mobile / pick-an-item shape for single-data-column rows.
   */
  presentation?: "table" | "card-grid" | "action-row";
  /**
   * A band inside the card below the body (hairline top rule), for list-level
   * controls that follow the rows — e.g. a "Load more" row. A composition slot:
   * the band's chrome is fixed here; the slot varies content only.
   */
  footer?: React.ReactNode;
  /** Forwards to the root `<SurfaceFrame>` div. */
  ref?: React.Ref<HTMLDivElement>;
} & SurfaceHeaderSlotProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ListWithDetailShell<Row>(
  {
    rows,
    columns,
    getRowId,
    isLoading,
    error,
    onRetry,
    onRowSelect,
    selectedRowId,
    rowActions,
    toolbar,
    detail,
    detailTitle,
    detailActions,
    onDetailClose,
    kicker,
    title,
    headerActions,
    emptyStateMessage,
    labels,
    emptyStateAction,
    filteredEmpty,
    sortBy,
    sortDirection,
    onSortChange,
    presentation = "table",
    footer,
    ref,
  }: ListWithDetailShellProps<Row>,
) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  // A composing archetype (grouped-list's section card) declares chrome-suppression
  // through `ListChromeContext` so the frame renders chromeless (`chrome={false}`)
  // flush inside an already-bounded surface; the chrome decision belongs to the
  // compose-into archetype, not to the per-page caller.
  const chromeless = React.useContext(ListChromeContext);
  const fullBleed = useFullBleedClass();
  // Sync sheet visibility with selectedRowId: if the consumer clears the selection
  // (e.g. after a delete), close the sheet so stale detail is not shown.
  React.useEffect(() => {
    if (!selectedRowId) {
      setSheetOpen(false);
    }
  }, [selectedRowId]);

  // Selecting a row opens the sheet. Opened unconditionally: a consumer that
  // only builds `detail` once a row is selected passes it on the next render.
  // A consumer that navigates instead never passes `detail`, so nothing shows.
  const handleRowSelect = React.useCallback(
    (row: Row) => {
      setSheetOpen(true);
      onRowSelect?.(row);
    },
    [onRowSelect],
  );

  // Determine body content
  const listState = resolveListState({ isLoading, error, isEmpty: rows.length === 0 });
  const showTable = listState === "content";

  // "filtered-empty" is list-with-detail's own sub-mode of the shared "empty"
  // phase — a thin wrapper the helper doesn't need to know about.
  const showFilteredEmpty = listState === "empty" && filteredEmpty === true;
  const emptyStateMode: ListEmptyMode = showFilteredEmpty
    ? "filtered-empty"
    : listState === "loading" || listState === "error"
      ? listState
      : "empty";

  const presentationProps = {
    rows,
    columns,
    getRowId,
    selectedRowId,
    rowActions,
    rowActionsLabel: labels?.rowActions,
    // Forward undefined (not the always-defined handleRowSelect wrapper) when
    // the consumer didn't pass onRowSelect, so presentations correctly treat
    // rows as non-interactive rather than always-clickable.
    onRowSelect: onRowSelect !== undefined ? handleRowSelect : undefined,
  };

  const bodyContent = !showTable ? (
    <ListWithDetailEmptyState
      mode={emptyStateMode}
      message={emptyStateMessage}
      labels={labels}
      error={error}
      onRetry={onRetry}
      action={emptyStateAction}
    />
  ) : presentation === "card-grid" ? (
    <CardGridBody {...presentationProps} />
  ) : presentation === "action-row" ? (
    <ActionRowBody {...presentationProps} />
  ) : (
    <TableBody
      {...presentationProps}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSortChange={onSortChange}
    />
  );

  // Detail panel: always the overlay Sheet, on every width. An in-flow rail is
  // forbidden (v3.0): it sits at the top of the list, so selecting a row far
  // down a long list renders the detail off-screen. The Sheet's header bar
  // reads `HeaderFillContext`.
  const detailPanel =
    detail !== undefined ? (
        <Sheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) onDetailClose?.();
          }}
        >
          <SheetContent
            side="right"
            closeLabel={labels?.close}
            className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
          >
            {detailTitle !== undefined ? (
              // The shared bar chrome (padding + header-fill) with the Radix
              // SheetTitle as its title element. The built-in Sheet close button
              // (absolute, top-4 right-4) floats over the bar's right edge, so
              // the actions row clears it (structural, not appearance).
              <SurfaceHeaderBar
                actionsClassName="pr-8"
                actions={
                  detailActions ? (
                    <div className="flex shrink-0 items-center gap-2">{detailActions}</div>
                  ) : undefined
                }
              >
                {/* SheetTitle so Radix Dialog gets an accessible name (aria-labelledby).
                    SheetDescription is screen-reader-only fallback so Content never
                    renders without a description — matching the J archetype fix. */}
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate">{detailTitle}</SheetTitle>
                  <SheetDescription className="sr-only" />
                </div>
              </SurfaceHeaderBar>
            ) : (
              <>
                {/* No title — inject sr-only SheetTitle + SheetDescription so
                     Radix doesn't warn about a missing accessible name or description. */}
                <SheetTitle className="sr-only" />
                <SheetDescription className="sr-only" />
              </>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{detail}</div>
          </SheetContent>
        </Sheet>
      </Sheet>
    ) : null;

  return (
    <SurfaceFrame
      ref={ref}
      kicker={kicker}
      title={title}
      headerActions={headerActions}
      toolbar={toolbar}
      chrome={!chromeless}
      // Full-bleed archetype (ADR-0007 §1) — only as the page's own surface; a
      // shell composed into another surface leaves the column alone.
      className={chromeless ? undefined : fullBleed}
    >
      <div className="relative overflow-x-auto">{bodyContent}</div>
      {footer !== undefined && <div className="border-t px-4 py-3">{footer}</div>}
      {detailPanel}
    </SurfaceFrame>
  );
}

ListWithDetailShell.displayName = "ListWithDetailShell";
