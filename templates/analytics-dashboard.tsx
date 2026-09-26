// Scaffolded by `design-baseline new-page analytics-dashboard __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/analytics-dashboard.md
// Loading, empty and error are per widget: each widget fetches on its own and
// degrades inline, and the rest of the grid stays up.
import {
  DashboardShell,
  DashboardGrid,
  DashboardWidget,
} from "design-baseline/archetypes/analytics-dashboard";
import { StateView } from "@/components/ui/state-view";

type __Name__Metric = { label: string; value: number };

// TODO: replace with the widget's real data hook (one per widget).
function use__Name__Metrics(): {
  data: __Name__Metric[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { data: [], isLoading: false, error: null, refetch: () => {} };
}

function __Name__MetricsWidget() {
  const { data, isLoading, error, refetch } = use__Name__Metrics();

  return (
    <DashboardWidget title="TODO widget" span={1}>
      {isLoading ? (
        <StateView variant="loading" />
      ) : error != null ? (
        <StateView variant="error" error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <StateView variant="empty" message="No data for this period" />
      ) : (
        // TODO: the widget's chart or figures.
        data.map((metric) => (
          <div key={metric.label}>
            {metric.label}: {metric.value}
          </div>
        ))
      )}
    </DashboardWidget>
  );
}

export function __Name__Page() {
  return (
    <DashboardShell title="__Name__">
      <DashboardGrid>
        <__Name__MetricsWidget />
      </DashboardGrid>
    </DashboardShell>
  );
}
