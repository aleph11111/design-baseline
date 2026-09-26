// Scaffolded by `design-baseline new-page matrix-grid __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/matrix-grid.md
import {
  MatrixGridShell,
  type MatrixColumn,
  type MatrixRow,
} from "design-baseline/archetypes/matrix-grid";

type __Name__Cell = { value: string };

// TODO: replace with the page's real data hook.
function use__Name__Matrix(): {
  columns: MatrixColumn[];
  rows: MatrixRow<__Name__Cell>[];
} {
  return { columns: [], rows: [] };
}

export function __Name__Page() {
  const { columns, rows } = use__Name__Matrix();

  return (
    <MatrixGridShell<__Name__Cell>
      title="__Name__"
      columns={columns}
      rows={rows}
      renderCell={({ cell }) => cell?.value}
      emptyState="No __Name__ yet"
    />
  );
}
