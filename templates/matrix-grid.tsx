// Scaffolded by `design-baseline new-page matrix-grid __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/matrix-grid.md
// Loading and error belong to the route (README "Layer 7 — canonical state
// treatments": M delegates them to a route-level loading/error boundary):
// render this component only once the matrix data has resolved. The empty
// plane is the shell's `emptyState`.
import {
  MatrixGridShell,
  type MatrixColumn,
  type MatrixRow,
} from "design-baseline/archetypes/matrix-grid";

export type __Name__Cell = { value: string };

export function __Name__Page({
  columns,
  rows,
}: {
  columns: MatrixColumn[];
  rows: MatrixRow<__Name__Cell>[];
}) {
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
