import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  useHeaderFill,
  headerFillClasses,
  type HeaderFill,
} from "@/components/layout/headerFill";
import { SurfaceHeader } from "@/components/layout/SurfaceHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ListWithDetailEmptyState } from "./ListWithDetailEmptyState";
import { RowActionsMenu, getInteractiveRowProps, interactiveRowFocusRing } from "../shared";
import type { RowAction } from "../shared";

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
  /** Header treatment for the drawer/sheet header bar and the master surface header
   *  (House Style B). Default: project context. */
  headerFill?: HeaderFill;

  // On-surface header (Plex Ledger board form). When `title` is set, the shell
  // renders a `SurfaceHeader` at the top of the master list surface — the title +
  // actions sit ON the card, not in a separate PageHeader above it.
  /** Overline kicker above the title (e.g. "Podcasts", "Records"). */
  kicker?: React.ReactNode;
  /** Master surface title. When set, the on-surface header bar renders. */
  title?: React.ReactNode;
  /** Right-aligned actions in the master surface header (e.g. "+ New"). */
  headerActions?: React.ReactNode;

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
};

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
  _ref: React.Ref<HTMLDivElement>,
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

  function handleSortClick(columnKey: string) {
    if (!onSortChange) return;
    if (sortBy === columnKey) {
      onSortChange(columnKey, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSortChange(columnKey, "asc");
    }
  }

  // Determine body content
  const showLoading = isLoading === true;
  const showError = !showLoading && error != null;
  const showFilteredEmpty =
    !showLoading && !showError && rows.length === 0 && filteredEmpty === true;
  const showTable = !showLoading && !showError && rows.length > 0;

  const hasActions = rowActions !== undefined && rowActions.length > 0;
  const clickable = onRowSelect !== undefined;

  const tableBody = showTable && presentation === "table" ? (
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
      <TableBody>
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
                    ? () => handleRowSelect(row)
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
      </TableBody>
    </Table>
  ) : null;

  // Identifier column drives the title/primary field in the non-table presentations.
  const idCol = columns.find((c) => c.isIdentifier === true) ?? columns[0];

  const cardGridBody =
    showTable && presentation === "card-grid" ? (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selectedRowId === rowId;
          const activate = clickable ? () => handleRowSelect(row) : undefined;
          return (
            <div
              key={rowId}
              data-state={isSelected ? "selected" : undefined}
              onClick={activate}
              className={cn(
                "rounded-lg border bg-card p-4 transition-colors",
                clickable && "cursor-pointer hover:bg-accent",
                clickable && interactiveRowFocusRing,
                isSelected && "ring-2 ring-ring",
              )}
              {...getInteractiveRowProps(activate)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={cn("min-w-0 font-medium", clickable && "text-primary")}>
                  {idCol ? idCol.cell(row) : null}
                </div>
                {hasActions && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu row={row} actions={rowActions} />
                  </div>
                )}
              </div>
              <dl className="mt-2 space-y-1">
                {columns
                  .filter((c) => c !== idCol)
                  .map((col) => (
                    <div
                      key={col.key}
                      className="flex items-baseline justify-between gap-3 text-[13px]"
                    >
                      <dt className="shrink-0 text-muted-foreground">{col.header}</dt>
                      <dd className="min-w-0 text-right text-foreground tabular-nums">
                        {col.cell(row)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          );
        })}
      </div>
    ) : null;

  const actionRowBody =
    showTable && presentation === "action-row" ? (
      <div className="divide-y">
        {rows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selectedRowId === rowId;
          const secondary = columns.filter((c) => c !== idCol).slice(0, 2);
          const activate = clickable ? () => handleRowSelect(row) : undefined;
          return (
            <div
              key={rowId}
              data-state={isSelected ? "selected" : undefined}
              onClick={activate}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                clickable && "cursor-pointer hover:bg-muted/50",
                clickable && interactiveRowFocusRing,
                isSelected && "bg-muted",
              )}
              {...getInteractiveRowProps(activate)}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground">
                  {idCol ? idCol.cell(row) : null}
                </div>
                {secondary.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                    {secondary.map((col) => (
                      <span key={col.key} className="truncate">
                        {col.cell(row)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {hasActions ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu row={row} actions={rowActions} />
                </div>
              ) : clickable ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : null}
            </div>
          );
        })}
      </div>
    ) : null;

  const emptyStateMode = showLoading
    ? "loading"
    : showError
      ? "error"
      : showFilteredEmpty
        ? "filtered-empty"
        : "empty";

  const bodyContent =
    showTable ? (
      tableBody ?? cardGridBody ?? actionRowBody
    ) : (
      <ListWithDetailEmptyState
        mode={emptyStateMode}
        message={emptyStateMessage}
        error={error}
        onRetry={onRetry}
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
      className={cn(
        !unstyled && "rounded-lg border bg-card overflow-hidden",
        className,
      )}
    >
      {title !== undefined && (
        <SurfaceHeader
          kicker={kicker}
          title={title}
          actions={headerActions}
          headerFill={headerFill}
        />
      )}
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
