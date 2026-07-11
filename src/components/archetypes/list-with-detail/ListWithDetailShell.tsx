import * as React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useHeaderFill, headerFillClasses } from "@/components/layout/headerFill";
import {
  SurfaceHeaderSlot,
  type SurfaceHeaderSlotProps,
} from "@/components/layout/SurfaceHeaderSlot";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  ListWithDetailEmptyState,
  type ListEmptyMode,
} from "./ListWithDetailEmptyState";
import { TableBody } from "./presentations/TableBody";
import { CardGridBody } from "./presentations/CardGridBody";
import { ActionRowBody } from "./presentations/ActionRowBody";
import { resolveListState, type RowAction } from "../shared";

// The per-row overflow menu and its action shape are owned by the shared
// primitive (../shared/RowActionsMenu) so list-with-detail and settings-table
// render an identical menu. Re-exported here for back-compat with consumers that
// import `RowAction` from this archetype.
export type { RowAction };

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ListColumn<Row> = {
  key: string;
  header: React.ReactNode;
  cell: (row: Row) => React.ReactNode;
  /**
   * Use text-primary + hover:underline automatically for the cell that
   * uniquely identifies the row.
   */
  isIdentifier?: boolean;
  /**
   * Style the identifier cell with font-mono — omit only for human-readable
   * name identifiers.
   */
  identifierMono?: boolean;
  width?: string | number;
  align?: "left" | "right" | "center";
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
   * How the `detail` surface presents on desktop:
   * - `"rail"` (default): a right rail beside the list (collapses to a Sheet on
   *   mobile, as always).
   * - `"drawer"`: a slide-in Sheet from the right at every width — the
   *   "slide-in details" pattern. The drawer header follows `headerFill`.
   */
  detailPresentation?: "rail" | "drawer";
  /**
   * Optional title for the drawer/sheet header bar (rendered with the house
   * `headerFill` treatment). When omitted, the Sheet renders only `detail`.
   */
  detailTitle?: React.ReactNode;
  /** Optional right-aligned actions in the drawer header (e.g. an Edit button). */
  detailActions?: React.ReactNode;

  // `headerFill` (from SurfaceHeaderSlotProps below) also drives the drawer/sheet
  // header bar, not just the master on-surface header.

  emptyStateMessage?: string;
  filteredEmpty?: boolean;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, sortDirection: SortDirection) => void;
  /**
   * Body presentation — the A archetype's variant axis (see
   * docs/CHOOSING-A-SURFACE.md). Same data + columns + row interaction; only the
   * rendering differs:
   * - `"table"` (default): the sortable data table.
   * - `"card-grid"`: rows as cards in a responsive grid (identifier as title,
   *   remaining columns as label/value pairs). For browse-y, image/summary-led
   *   lists. Sorting headers are table-only; drive sort from the toolbar here.
   * - `"action-row"`: full-width stacked rows (identifier + a couple of fields +
   *   chevron) — the mobile / pick-an-item shape.
   */
  presentation?: "table" | "card-grid" | "action-row";
  /**
   * When true, drop the shell's own card chrome (border, shadow, rounding) so
   * the table renders flush inside a surface the caller already provides — e.g.
   * a `<SectionCard flush>` in a grouped-list group. Defaults to false (the
   * shell draws its own card).
   */
  unstyled?: boolean;
  className?: string;
} & SurfaceHeaderSlotProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ListWithDetailShellInner<Row>(
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
    detailPresentation = "rail",
    detailTitle,
    detailActions,
    headerFill,
    kicker,
    title,
    headerActions,
    emptyStateMessage,
    filteredEmpty,
    sortBy,
    sortDirection,
    onSortChange,
    presentation = "table",
    unstyled,
    className,
  }: ListWithDetailShellProps<Row>,
  ref: React.Ref<HTMLDivElement>,
) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const hfc = headerFillClasses(useHeaderFill(headerFill));
  // The detail presents as a Sheet on mobile always, and on desktop too when
  // `detailPresentation="drawer"` (the slide-in pattern).
  const asSheet = detailPresentation === "drawer" || isMobile;

  // Sync sheet visibility with selectedRowId: if the consumer clears the selection
  // (e.g. after a delete) while on mobile, close the sheet so stale detail is not shown.
  React.useEffect(() => {
    if (!selectedRowId) {
      setSheetOpen(false);
    }
  }, [selectedRowId]);

  // When a row is selected on mobile, open the sheet.
  const handleRowSelect = React.useCallback(
    (row: Row) => {
      if (asSheet && detail !== undefined) {
        setSheetOpen(true);
      }
      onRowSelect?.(row);
    },
    [asSheet, detail, onRowSelect],
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
    // Forward undefined (not the always-defined handleRowSelect wrapper) when
    // the consumer didn't pass onRowSelect, so presentations correctly treat
    // rows as non-interactive rather than always-clickable.
    onRowSelect: onRowSelect !== undefined ? handleRowSelect : undefined,
  };

  const bodyContent = !showTable ? (
    <ListWithDetailEmptyState
      mode={emptyStateMode}
      message={emptyStateMessage}
      error={error}
      onRetry={onRetry}
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

  // Detail panel: rail on desktop (default), or a slide-in Sheet (drawer mode,
  // and always on mobile). The drawer header bar follows the house `headerFill`.
  const detailPanel =
    detail !== undefined ? (
      asSheet ? (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
            {detailTitle !== undefined ? (
              <div
                className={cn(
                  "flex shrink-0 items-center justify-between gap-3 px-5 py-4",
                  hfc.bar,
                )}
              >
                <div className={cn("min-w-0 truncate text-lg font-semibold", hfc.title)}>
                  {detailTitle}
                </div>
                {detailActions ? (
                  <div className="flex shrink-0 items-center gap-2 pr-8">{detailActions}</div>
                ) : null}
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto">{detail}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-80 shrink-0 border-l bg-card">{detail}</div>
      )
    ) : null;

  return (
    <div
      ref={ref}
      className={cn(
        !unstyled && "rounded-lg border bg-card overflow-hidden",
        className,
      )}
    >
      <SurfaceHeaderSlot
        kicker={kicker}
        title={title}
        headerActions={headerActions}
        headerFill={headerFill}
      />
      {toolbar && <div className="border-b px-4 py-3">{toolbar}</div>}
      <div className="flex">
        <div className="min-w-0 flex-1 overflow-x-auto">{bodyContent}</div>
        {detailPanel}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export — use forwardRef wrapper to preserve generic while satisfying
// forwardRef's constraint that the component have a stable identity.
// ---------------------------------------------------------------------------

export const ListWithDetailShell = React.forwardRef(
  ListWithDetailShellInner,
) as <Row>(
  props: ListWithDetailShellProps<Row> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

(ListWithDetailShell as { displayName?: string }).displayName =
  "ListWithDetailShell";
