"use client";
import * as React from "react";
import type { ListColumn, RowAction, SortDirection } from "../list-with-detail";
// The frameless list body — exported from the shell module, not the barrel:
// the section is not a page, so it composes the body, never the page shell.
import { ListWithDetailBody } from "../list-with-detail/ListWithDetailShell";
import { SectionCard } from "../../layout/SectionCard";
import { Badge } from "../../ui/badge";

export type GroupedListSectionProps<Row> = {
  /** Section title rendered in the group's ruled title bar. */
  title?: React.ReactNode;
  /** Optional description line under the title (`text-sm text-muted-foreground`). */
  description?: React.ReactNode;
  /**
   * Right-aligned controls in the group's ruled title bar (a status
   * `<Badge>`, a sync chip, a small count-annotated badge). When provided,
   * they replace the default row-count badge — one right-aligned treatment
   * per bar, not a bespoke override of the bar itself.
   */
  actions?: React.ReactNode;

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

/**
 * One group within a grouped-list page: a `<SectionCard>` whose ruled overline
 * title bar (with a row-count badge) sits over the group's table, rendered
 * flush. Inside the page's one surface the section card flattens (no fill —
 * RaisedSurfaceContext), so groups read as heading-separated sections, never
 * cards in a card (ADR-0008 §3). Multiple sections share the same `Row` type.
 */
export function GroupedListSection<Row>({
  title,
  description,
  actions,
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
  return (
    <SectionCard
      title={title}
      description={description}
      actions={actions ?? <Badge variant="secondary">{rows.length}</Badge>}
      flush
      className={className}
    >
      <ListWithDetailBody<Row>
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

GroupedListSection.displayName = "GroupedListSection";
