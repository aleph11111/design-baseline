import * as React from "react";
import manifest from "../docs/archetypes/MANIFEST.json";

/**
 * Gallery registry — the single mapping from a baseline archetype to its
 * rendered demo. Archetype metadata (key, slug, displayName, version, spec)
 * comes straight from `docs/archetypes/MANIFEST.json` so this never drifts from
 * the source registry; the gallery only adds the lazily-loaded demo component.
 */

export type ArchetypeEntry = {
  key: string;
  slug: string;
  displayName: string;
  version: string;
  spec: string;
  kind: "page" | "dialog" | "component";
  Demo: React.LazyExoticComponent<React.ComponentType>;
};

function lazyDemo(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
): React.LazyExoticComponent<React.ComponentType> {
  return React.lazy(async () => {
    const mod = await loader();
    return { default: mod[exportName] as React.ComponentType };
  });
}

// slug -> { component loader, kind }. The demo file + export name are the
// MANIFEST's `example` path resolved to its named export.
const DEMOS: Record<
  string,
  { Demo: React.LazyExoticComponent<React.ComponentType>; kind: "page" | "dialog" | "component" }
> = {
  "list-with-detail": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/list-with-detail-demo"), "ListWithDetailDemo"),
  },
  "form-page": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/form-page-demo"), "FormPageDemo"),
  },
  "detail-overview": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/detail-overview-demo"), "DetailOverviewDemo"),
  },
  "settings-table": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/settings-table-demo"), "SettingsTableDemo"),
  },
  "crud-dialog": {
    kind: "dialog",
    Demo: lazyDemo(() => import("@/examples/crud-dialog-demo"), "CrudDialogDemo"),
  },
  "grouped-list": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/grouped-list-demo"), "GroupedListDemo"),
  },
  "matrix-grid": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/matrix-grid-demo"), "MatrixGridDemo"),
  },
  "tabbed-settings": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/tabbed-settings-demo"), "TabbedSettingsDemo"),
  },
  "analytics-dashboard": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/analytics-dashboard-demo"), "AnalyticsDashboardDemo"),
  },
  "import-wizard": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/import-wizard-demo"), "ImportWizardDemo"),
  },
  "feed-inbox": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/feed-inbox-demo"), "FeedInboxDemo"),
  },
  "kanban-board": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/kanban-board-demo"), "KanbanBoardDemo"),
  },
  "report": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/report-demo"), "ReportDemo"),
  },
  "calendar": {
    kind: "page",
    Demo: lazyDemo(() => import("@/examples/calendar-demo"), "CalendarDemo"),
  },
  "skeleton-loader": {
    kind: "component",
    Demo: lazyDemo(() => import("@/examples/skeleton-loader-demo"), "SkeletonLoaderDemo"),
  },
  "raw-input": {
    kind: "component",
    Demo: lazyDemo(() => import("@/examples/raw-input-demo"), "RawInputDemo"),
  },
  "raw-textarea": {
    kind: "component",
    Demo: lazyDemo(() => import("@/examples/raw-textarea-demo"), "RawTextareaDemo"),
  },
  "raw-select": {
    kind: "component",
    Demo: lazyDemo(() => import("@/examples/raw-select-demo"), "RawSelectDemo"),
  },
};

type ManifestArchetype = {
  key: string;
  slug: string;
  displayName?: string;
  version: string;
  spec: string;
};

export const ARCHETYPES: ArchetypeEntry[] = (
  manifest.archetypes as ManifestArchetype[]
)
  .filter((a) => DEMOS[a.slug] !== undefined)
  .map((a) => ({
    key: a.key,
    slug: a.slug,
    displayName: a.displayName ?? a.slug,
    version: a.version,
    spec: a.spec,
    kind: DEMOS[a.slug].kind,
    Demo: DEMOS[a.slug].Demo,
  }));

export function findArchetype(slug: string | undefined): ArchetypeEntry | undefined {
  return ARCHETYPES.find((a) => a.slug === slug);
}
