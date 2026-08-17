export { DetailOverviewShell } from "./DetailOverviewShell";
export type {
  DetailOverviewShellProps,
  StatItem,
} from "./DetailOverviewShell";

export { DetailOverviewHeader } from "./DetailOverviewHeader";
export type { DetailOverviewHeaderProps } from "./DetailOverviewHeader";

export { DetailSection } from "./DetailSection";
export type { DetailSectionProps } from "./DetailSection";

// StatTile / StatTileRow were promoted to shared layout primitives so the
// analytics-dashboard (G) archetype can reuse them without depending on
// detail-overview. Re-exported here for back-compat — existing
// `@/components/archetypes/detail-overview` imports keep working.
export { StatTileRow, type StatTileRowProps } from "@/components/layout";
export { StatTile, type StatTileProps } from "@/components/layout";

// ProgressTracker (lifecycle stepper) + MetricList/MetricRow (the rail's compact
// "figures at a glance" readout) are shared layout primitives, re-exported here
// as part of the Command Rail vocabulary (Amendment v2.3).
export {
  ProgressTracker,
  type ProgressStep,
  type ProgressTrackerProps,
} from "@/components/layout";
export {
  MetricList,
  MetricRow,
  type MetricListProps,
  type MetricRowProps,
} from "@/components/layout";

export { KeyValueList } from "./KeyValueList";
export type { KeyValueListProps } from "./KeyValueList";

export { KeyValueRow } from "./KeyValueRow";
export type { KeyValueRowProps } from "./KeyValueRow";
