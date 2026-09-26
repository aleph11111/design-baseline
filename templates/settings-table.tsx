// Scaffolded by `design-baseline new-page settings-table __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/settings-table.md
import {
  SettingsTableShell,
  type SettingsColumn,
} from "design-baseline/archetypes/settings-table";

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

const columns: SettingsColumn<__Name__Row>[] = [
  { key: "name", header: "Name", cell: (row) => row.name },
];

export function __Name__Page() {
  const { rows, isLoading, error, refetch } = use__Name__Rows();

  return (
    <SettingsTableShell
      title="__Name__"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyMessage="No __Name__ yet"
      // TODO: onAddNew / onRowEdit open the page's crud dialog.
    />
  );
}
