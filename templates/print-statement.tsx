// Scaffolded by `design-baseline new-page print-statement __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/print-statement.md
// Mount this on a route with no app shell (no sidebar, no header).
import { PrintStatementShell } from "design-baseline/archetypes/print-statement";

type __Name__Statement = { title: string; rows: { id: string; label: string; value: string }[] };

// TODO: replace with the page's real data hook.
function use__Name__Statement(): {
  statement: __Name__Statement | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { statement: null, isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { statement, isLoading, error, refetch } = use__Name__Statement();

  return (
    <PrintStatementShell
      title={statement?.title ?? "__Name__"}
      isLoading={isLoading || statement == null}
      error={error}
      onRetry={refetch}
    >
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {statement?.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintStatementShell>
  );
}
