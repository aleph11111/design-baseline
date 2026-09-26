// Scaffolded by `design-baseline new-page list-with-detail __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/list-with-detail.md
import { useState } from "react";
import {
  ListWithDetailShell,
  type ListColumn,
} from "design-baseline/archetypes/list-with-detail";

type __Name__Row = { id: string; name: string };

// TODO: replace with the page's real data hook.
function use__Name__Rows(): {
  rows: __Name__Row[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { rows: [], isLoading: false, error: null, refetch: () => {} };
}

const columns: ListColumn<__Name__Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, sortable: true },
];

export function __Name__Page() {
  const { rows, isLoading, error, refetch } = use__Name__Rows();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ListWithDetailShell
      title="__Name__"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyStateMessage="No __Name__ yet"
      selectedRowId={selectedId}
      onRowSelect={(row) => setSelectedId(row.id)}
    />
  );
}
