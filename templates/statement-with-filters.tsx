// Scaffolded by `design-baseline new-page statement-with-filters __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/statement-with-filters.md
// Loading lives in the page, not a route-level loading boundary (contract).
import {
  StatementWithFiltersShell,
  StatementTable,
  StatementRow,
  StatementTotalRow,
} from "design-baseline/archetypes/statement-with-filters";
import { StateView } from "@/components/ui/state-view";

type __Name__Line = { id: string; label: string; cells: string[] };

// TODO: replace with the page's real data hook; filters drive its arguments.
function use__Name__Statement(): {
  columns: string[];
  lines: __Name__Line[];
  totals: string[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { columns: [], lines: [], totals: [], isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { columns, lines, totals, isLoading, error, refetch } = use__Name__Statement();

  return (
    <StatementWithFiltersShell title="__Name__">
      {/* TODO: the filter bar (period, scope) */}
      {isLoading ? (
        <StateView variant="loading" />
      ) : error != null ? (
        <StateView variant="error" error={error} onRetry={refetch} />
      ) : lines.length === 0 ? (
        <StateView variant="empty" message="No entries for this period" />
      ) : (
        <StatementTable columns={columns}>
          {lines.map((line) => (
            <StatementRow key={line.id} label={line.label} cells={line.cells} />
          ))}
          <StatementTotalRow label="Total" cells={totals} />
        </StatementTable>
      )}
    </StatementWithFiltersShell>
  );
}
