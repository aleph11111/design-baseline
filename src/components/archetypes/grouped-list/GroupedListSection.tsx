import * as React from "react";
import {
  ListWithDetailShell,
  type ListColumn,
  type RowAction,
  type SortDirection,
} from "../list-with-detail";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { cn } from "@/lib/utils";

export type GroupedListSectionProps<Row> = {
  /** Section title rendered above the inner shell card. Required unless `renderHeader` is provided. */
  title?: React.ReactNode;
  /** Optional description line under the title (`text-sm text-muted-foreground`). */
  description?: React.ReactNode;
  /**
   * Override the default `<h2>` header rendering. Receives the section's
   * `{ title, description, rowCount }` and returns the header node. Use when
   * the page needs a row-count badge, sync indicator, or other dense header.
   */
  renderHeader?: (args: {
    title: React.ReactNode;
    description: React.ReactNode | undefined;
    rowCount: number;
  }) => React.ReactNode;

  // Inner-shell delegation (Archetype A)
  rows: Row[];
  columns: ListColumn<Row>[];
  getRowId: (row: Row) => string;
  onRowSelect?: (row: Row) => void;
  selectedRowId?: string | null;
  rowActions?: RowAction<Row>[];
  emptyStateMessage?: string;
  filteredEmpty?: boolean;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, sortDirection: SortDirection) => void;

  className?: string;
};

function GroupedListSectionInner<Row>({
  title,
  description,
  renderHeader,
  rows,
  columns,
  getRowId,
  onRowSelect,
  selectedRowId,
  rowActions,
  emptyStateMessage,
  filteredEmpty,
  sortBy,
  sortDirection,
  onSortChange,
  className,
}: GroupedListSectionProps<Row>): React.ReactElement {
  const header = renderHeader
    ? renderHeader({ title, description, rowCount: rows.length })
    : title !== undefined ? (
      <SectionHeading
        title={title}
        description={description}
        className="mb-3"
      />
    ) : null;

  return (
    <section className={cn(className)}>
      {header}
      <ListWithDetailShell<Row>
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        onRowSelect={onRowSelect}
        selectedRowId={selectedRowId}
        rowActions={rowActions}
        emptyStateMessage={emptyStateMessage}
        filteredEmpty={filteredEmpty}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
      />
    </section>
  );
}

/**
 * One group within a grouped-list page. Renders a section header outside the
 * inner card chrome and composes `<ListWithDetailShell>` for the group's rows.
 * Multiple sections share the same `Row` type per page.
 */
export const GroupedListSection = GroupedListSectionInner as <Row>(
  props: GroupedListSectionProps<Row>,
) => React.ReactElement;

(GroupedListSection as { displayName?: string }).displayName =
  "GroupedListSection";
