import * as React from "react";
import {
  ListWithDetailShell,
  type ListColumn,
  type RowAction,
  type SortDirection,
} from "../list-with-detail";
import { SectionCard } from "@/components/layout/SectionCard";
import { Badge } from "@/components/ui/badge";

export type GroupedListSectionProps<Row> = {
  /** Section title rendered in the group's ruled title bar. Required unless `renderHeader` is provided. */
  title?: React.ReactNode;
  /** Optional description line under the title (`text-sm text-muted-foreground`). */
  description?: React.ReactNode;
  /**
   * Override the default title-bar content. Receives the section's
   * `{ title, description, rowCount }` and returns the header node rendered
   * inside the group's ruled title bar — replacing the default overline +
   * count badge. Use for a sync indicator, status chip, or other dense header.
   */
  renderHeader?: (args: {
    title: React.ReactNode;
    description: React.ReactNode | undefined;
    rowCount: number;
  }) => React.ReactNode;
  /**
   * Hide the default row-count `<Badge>` in the title bar. Ignored when
   * `renderHeader` is provided (the override owns the whole bar).
   */
  hideCount?: boolean;

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
  hideCount,
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
  const customHeader = renderHeader
    ? renderHeader({ title, description, rowCount: rows.length })
    : undefined;

  return (
    <SectionCard
      title={customHeader ? undefined : title}
      description={customHeader ? undefined : description}
      actions={
        customHeader || hideCount ? undefined : (
          <Badge variant="secondary">{rows.length}</Badge>
        )
      }
      header={customHeader}
      flush
      className={className}
    >
      <ListWithDetailShell<Row>
        unstyled
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
    </SectionCard>
  );
}

/**
 * One group within a grouped-list page. Renders as a `<SectionCard>` bounded
 * block: the group title sits in a ruled overline title bar (with a row-count
 * badge) and the group's table renders flush inside the same card via an
 * `unstyled` `<ListWithDetailShell>`. The heading is bound to its content as
 * one block — the same titled-section shape as detail-overview's
 * `<DetailSection>`. Multiple sections share the same `Row` type per page.
 */
export const GroupedListSection = GroupedListSectionInner as <Row>(
  props: GroupedListSectionProps<Row>,
) => React.ReactElement;

(GroupedListSection as { displayName?: string }).displayName =
  "GroupedListSection";
