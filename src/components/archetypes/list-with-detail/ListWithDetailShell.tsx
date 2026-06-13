import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ListWithDetailEmptyState } from "./ListWithDetailEmptyState";

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

export type RowAction<Row> = {
  label: string;
  onSelect: (row: Row) => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
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
  emptyStateMessage?: string;
  filteredEmpty?: boolean;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, sortDirection: SortDirection) => void;
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
    emptyStateMessage,
    filteredEmpty,
    sortBy,
    sortDirection,
    onSortChange,
    unstyled,
    className,
  }: ListWithDetailShellProps<Row>,
  _ref: React.Ref<HTMLDivElement>,
) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = React.useState(false);

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
      if (isMobile && detail !== undefined) {
        setSheetOpen(true);
      }
      onRowSelect?.(row);
    },
    [isMobile, detail, onRowSelect],
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

  const tableBody = showTable ? (
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
                return (
                  <TableCell
                    key={col.key}
                    className={cn(
                      alignClass(col.align),
                      isIdentifier && "text-primary hover:underline",
                      isIdentifier && onRowSelect !== undefined && "cursor-pointer",
                      useMono && "font-mono text-sm font-medium",
                    )}
                    onClick={
                      isIdentifier && onRowSelect !== undefined
                        ? () => handleRowSelect(row)
                        : undefined
                    }
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

  const emptyStateMode = showLoading
    ? "loading"
    : showError
      ? "error"
      : showFilteredEmpty
        ? "filtered-empty"
        : "empty";

  const bodyContent =
    showTable ? (
      tableBody
    ) : (
      <ListWithDetailEmptyState
        mode={emptyStateMode}
        message={emptyStateMessage}
        error={error}
        onRetry={onRetry}
      />
    );

  // Detail panel: desktop = right rail, mobile = Sheet
  const detailPanel =
    detail !== undefined ? (
      isMobile ? (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right">{detail}</SheetContent>
        </Sheet>
      ) : (
        <div className="w-80 shrink-0 border-l bg-card">{detail}</div>
      )
    ) : null;

  return (
    <div
      className={cn(
        !unstyled && "rounded-lg border bg-card shadow-sm overflow-hidden",
        className,
      )}
    >
      {toolbar && <div className="border-b px-4 py-3">{toolbar}</div>}
      <div className="flex">
        <div className="min-w-0 flex-1 overflow-x-auto">{bodyContent}</div>
        {detailPanel}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row actions dropdown
// ---------------------------------------------------------------------------

function RowActionsMenu<Row>({
  row,
  actions,
}: {
  row: Row;
  actions: RowAction<Row>[];
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
              className={action.destructive ? "text-destructive focus:text-destructive" : undefined}
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
