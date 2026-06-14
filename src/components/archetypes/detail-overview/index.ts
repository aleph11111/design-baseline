export { DetailOverviewShell } from "./DetailOverviewShell";
export type { DetailOverviewShellProps } from "./DetailOverviewShell";

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

export { KeyValueList } from "./KeyValueList";
export type { KeyValueListProps } from "./KeyValueList";

export { KeyValueRow } from "./KeyValueRow";
export type { KeyValueRowProps } from "./KeyValueRow";
