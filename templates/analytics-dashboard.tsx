// Scaffolded by `design-baseline new-page analytics-dashboard __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/analytics-dashboard.md
// Loading, empty and error are per widget: each widget fetches on its own and
// degrades inline; the rest of the grid stays up.
import {
  DashboardShell,
  DashboardGrid,
  DashboardWidget,
} from "design-baseline/archetypes/analytics-dashboard";

export function __Name__Page() {
  return (
    <DashboardShell title="__Name__">
      <DashboardGrid>
        <DashboardWidget title="TODO widget" span={1}>
          {/* TODO: widget body with its own loading / empty / error states */}
          No data for this period
        </DashboardWidget>
      </DashboardGrid>
    </DashboardShell>
  );
}
