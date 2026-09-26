// Scaffolded by `design-baseline new-page calendar __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/calendar.md
import {
  CalendarShell,
  type CalendarDay,
} from "design-baseline/archetypes/calendar";
import { StateView } from "@/components/ui/state-view";

// TODO: replace with the page's real data hook for the visible range.
function use__Name__Days(): {
  days: CalendarDay[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { days: [], isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { days, isLoading, error, refetch } = use__Name__Days();

  if (isLoading) return <StateView variant="loading" />;
  if (error != null) return <StateView variant="error" error={error} onRetry={refetch} />;
  // An empty day renders `emptyDayLabel`; an empty range is still a calendar.
  return <CalendarShell title="__Name__" days={days} emptyDayLabel="—" />;
}
