// Scaffolded by `design-baseline new-page report __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/report.md
import {
  ReportShell,
  ReportLineTable,
  ReportLineRow,
  ReportTotalRow,
} from "design-baseline/archetypes/report";
import { StateView } from "@/components/ui/state-view";

type __Name__Line = { id: string; name: string; qty: number; unit: string; sum: string };

// TODO: replace with the page's real data hook.
function use__Name__Report(): {
  lines: __Name__Line[];
  total: string;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { lines: [], total: "", isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { lines, total, isLoading, error, refetch } = use__Name__Report();

  return (
    <ReportShell title="__Name__">
      {isLoading ? (
        <StateView variant="loading" />
      ) : error != null ? (
        <StateView variant="error" error={error} onRetry={refetch} />
      ) : lines.length === 0 ? (
        <StateView variant="empty" message="Nothing to report" />
      ) : (
        <>
          <ReportLineTable>
            {lines.map((line) => (
              <ReportLineRow
                key={line.id}
                name={line.name}
                qty={line.qty}
                unit={line.unit}
                sum={line.sum}
              />
            ))}
          </ReportLineTable>
          <ReportTotalRow label="Total" value={total} total />
        </>
      )}
    </ReportShell>
  );
}
