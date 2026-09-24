/**
 * list-with-detail-demo.tsx
 *
 * Sandbox demo for the A (list-with-detail) archetype. Domain: a podcast
 * library — deliberately far from the source project's domain.
 *
 * The `presentation` axis is the archetype's variant axis. It is NOT a page
 * picker: the demo derives it from the row's data shape (`derivePresentation`),
 * then renders the three column configs that each land in a different
 * presentation bucket — so every surviving surface (table / card-grid /
 * action-row) is visible in the gallery at once. A consumer of the closed API
 * never chooses a presentation by hand; the column config they pass to the
 * shell already encodes the right surface.
 *
 * The data plane (search, loading/error/empty states) is exercised through the
 * consumer's own `isLoading` / `error` / `onRetry` props (the state-view
 * sub-modes), which is data — not a per-page appearance choice.
 */

import { useMemo, useState } from "react";
import {
  ListWithDetailShell,
  ListWithDetailToolbar,
  type ListColumn,
  type SortDirection,
} from "@/components/archetypes/list-with-detail";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

type Podcast = {
  id: string;
  title: string;
  host: string;
  episodeCount: number;
  lastPublishedAt: string;
  category: "interview" | "narrative" | "panel" | "solo";
  isActive: boolean;
};

const PODCASTS: Podcast[] = [
  {
    id: "p1",
    title: "Distributed Coffee",
    host: "Lena Pak",
    episodeCount: 142,
    lastPublishedAt: "2026-05-18",
    category: "interview",
    isActive: true,
  },
  {
    id: "p2",
    title: "Riverbed",
    host: "Olu Adebayo",
    episodeCount: 23,
    lastPublishedAt: "2026-05-20",
    category: "narrative",
    isActive: true,
  },
  {
    id: "p3",
    title: "Three Things",
    host: "Mei Tanaka",
    episodeCount: 89,
    lastPublishedAt: "2026-04-11",
    category: "panel",
    isActive: false,
  },
];

// Categorical status — a shared <Badge> variant per value (Layer 6), not a
// per-page color map.
const CATEGORY_LABELS: Record<Podcast["category"], string> = {
  interview: "Interview",
  narrative: "Narrative",
  panel: "Panel",
  solo: "Solo",
};

const CATEGORY_BADGE_VARIANT: Record<Podcast["category"], "secondary" | "outline"> = {
  interview: "secondary",
  narrative: "outline",
  panel: "secondary",
  solo: "outline",
};

// ---------------------------------------------------------------------------
// The variant axis — derived, not picked
// ---------------------------------------------------------------------------

// The contract's decision table: count the non-identifier data columns the
// row exposes and the presentation follows. This is the closed-API shape —
// a consumer encodes the answer in the columns they pass, the shell never
// asks the page to pick.
function derivePresentation<Row>(
  columns: ListColumn<Row>[],
): "table" | "card-grid" | "action-row" {
  const dataCols = columns.filter((c) => c.isIdentifier !== true).length;
  if (dataCols >= 4) return "table";
  if (dataCols >= 2) return "card-grid";
  return "action-row";
}

// Three column configs, each landing in a different presentation bucket, so
// every surface renders in the gallery. Numeric columns take `align="right"`
// (tabular figures align on units); the categorical badge takes
// `align="center"` (a short token); free text stays left (default).
// `hideBelowMd` follows the Layer 6 role rule: identifier, the status token and
// the one ranked figure (last published) stay on a phone; the context columns
// (host, episode count, category) drop out below `md`.
const TABLE_COLUMNS: ListColumn<Podcast>[] = [
  { key: "title", header: "Show", cell: (p) => p.title, isIdentifier: true, identifierMono: false },
  { key: "host", header: "Host", cell: (p) => p.host, hideBelowMd: true },
  {
    key: "episodes",
    header: "Episodes",
    cell: (p) => <span className="font-mono tabular-nums">{p.episodeCount}</span>,
    align: "right",
    hideBelowMd: true,
    sortable: true,
    sortFn: (a, b) => a.episodeCount - b.episodeCount,
  },
  {
    key: "last",
    header: "Last published",
    cell: (p) => <span className="font-mono tabular-nums">{p.lastPublishedAt}</span>,
    align: "right",
    sortable: true,
    sortFn: (a, b) => a.lastPublishedAt.localeCompare(b.lastPublishedAt),
  },
  {
    key: "category",
    header: "Category",
    cell: (p) => (
      <Badge variant={CATEGORY_BADGE_VARIANT[p.category]}>
        {CATEGORY_LABELS[p.category]}
      </Badge>
    ),
    align: "center",
    hideBelowMd: true,
  },
  {
    key: "status",
    header: "Status",
    cell: (p) => (
      <span className="inline-flex items-center gap-1.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            p.isActive ? "bg-primary" : "bg-muted-foreground",
          )}
        />
        <span className="text-[13px] text-foreground">
          {p.isActive ? "Active" : "On hiatus"}
        </span>
      </span>
    ),
    align: "center",
  },
];
const PRESENTATION_TABLE = derivePresentation(TABLE_COLUMNS); // 5 data cols → table

const CARD_COLUMNS: ListColumn<Podcast>[] = [
  { key: "title", header: "Show", cell: (p) => p.title, isIdentifier: true, identifierMono: false },
  { key: "host", header: "Host", cell: (p) => p.host },
  {
    key: "episodes",
    header: "Episodes",
    cell: (p) => <span className="font-mono tabular-nums">{p.episodeCount}</span>,
  },
  {
    key: "category",
    header: "Category",
    cell: (p) => (
      <Badge variant={CATEGORY_BADGE_VARIANT[p.category]}>
        {CATEGORY_LABELS[p.category]}
      </Badge>
    ),
  },
];
const PRESENTATION_CARD_GRID = derivePresentation(CARD_COLUMNS); // 3 data cols → card-grid

const ACTION_ROW_COLUMNS: ListColumn<Podcast>[] = [
  { key: "title", header: "Show", cell: (p) => p.title, isIdentifier: true, identifierMono: false },
  { key: "host", header: "Host", cell: (p) => p.host },
];
const PRESENTATION_ACTION_ROW = derivePresentation(ACTION_ROW_COLUMNS); // 1 data col → action-row

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------

const STATES = ["loaded", "empty", "loading", "error"] as const;

export function ListWithDetailDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Data plane (Layer 7) — the state-view sub-modes, driven by the consumer's
  // own `isLoading`/`error` props. Not a per-page appearance axis; it shows
  // the loading/empty/error chrome the shell hands to the state-view.
  const [state, setState] = useState<(typeof STATES)[number]>("loaded");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filtered = PODCASTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  // Sort is table-only (the contract's "sortable headers are table-only"
  // boundary). The table config's `sortFn` drives it; the other panels get
  // the filtered rows as-is.
  const tableRows = useMemo(() => {
    const col = TABLE_COLUMNS.find((c) => c.key === sortBy);
    if (!col?.sortFn) return filtered;
    return [...filtered].sort(
      sortDirection === "asc" ? col.sortFn : (a, b) => -col.sortFn!(a, b),
    );
  }, [filtered, sortBy, sortDirection]);

  const isEmpty = state === "empty";
  const selected = filtered.find((p) => p.id === selectedId) ?? null;
  const isLoading = state === "loading";
  const error = state === "error" ? new Error("Failed to load podcasts.") : null;

  // The shell's detail surface: a right rail on desktop (the `detail` slot),
  // a Sheet on mobile (the overlay, handled by `useIsMobile` inside the
  // shell). `detailTitle`/`detailActions` are data, not appearance.
  const detail = selected ? (
    <div className="space-y-4 p-5">
      <div>
        <p className="text-muted-foreground text-[13px]">Host</p>
        <p className="text-[15px] font-medium">{selected.host}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-muted-foreground text-[13px]">Episodes</p>
        <p className="font-mono tabular-nums text-[15px] font-medium">
          {selected.episodeCount}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-[13px]">Last published</p>
        <p className="font-mono tabular-nums text-[15px]">{selected.lastPublishedAt}</p>
      </div>
      <Badge variant={CATEGORY_BADGE_VARIANT[selected.category]}>
        {CATEGORY_LABELS[selected.category]}
      </Badge>
    </div>
  ) : (
    <div className="p-5 text-muted-foreground text-[13px]">
      Select a show to see details.
    </div>
  );

  const shellProps = {
    rows: filtered,
    getRowId: (p: Podcast) => p.id,
    onRowSelect: (p: Podcast) => setSelectedId(p.id),
    selectedRowId: selectedId,
    onDetailClose: () => setSelectedId(null),
    detailTitle: selected ? selected.title : undefined,
    detailActions: (
      <Button size="sm" variant="outline">
        Edit
      </Button>
    ),
    detail,
    isLoading,
    error,
    onRetry: () => setState("loaded"),
    // The empty-state CTA (Layer 7) — visible in the "empty" state.
    emptyStateAction: (
      <Button size="sm" onClick={() => setState("loaded")}>
        <Plus className="mr-1 h-4 w-4" />
        New show
      </Button>
    ),
  };

  return (
    <div className="space-y-8">
      <div>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-prose text-sm text-muted-foreground">
            The A-archetype's variant axis (`presentation`) is <strong>derived
            from the row's data shape</strong>, not picked: three column
            configs each land in a different presentation bucket and the three
            surfaces — table, card grid, stacked action row — render
            side-by-side so the demo is self-evident in the gallery.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              aria-label="State"
              value={state}
              onValueChange={(v) => setState(v as (typeof STATES)[number])}
              options={STATES.map((s) => ({ value: s, label: s }))}
            />
          </div>
        </header>

        <div className="space-y-4">
          {[
            {
              label: "Table (dense, 4+ data cols)",
              kicker: "Podcasts · full",
              title: "Podcast Library",
              columns: TABLE_COLUMNS,
              presentation: PRESENTATION_TABLE,
              rows: tableRows,
              sortBy,
              sortDirection,
              onSortChange: (next: string, dir: SortDirection) => {
                setSortBy(next);
                setSortDirection(dir);
              },
              // Row-derived label + disabled: the one actions list serves
              // every row, so the toggle's label and the delete gate read it.
              rowActions: [
                {
                  label: (p: Podcast) => (p.isActive ? "Pause show" : "Resume show"),
                  onSelect: () => {},
                },
                {
                  label: "Delete",
                  destructive: true,
                  disabled: (p: Podcast) => p.isActive,
                  onSelect: () => {},
                },
              ],
              // The footer band (Layer 5) — a paged list's "Load more" row.
              footer: (
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">
                    Load more
                  </Button>
                </div>
              ),
            },
            {
              label: "Card grid (browse-y, 2–3 data cols)",
              kicker: "Podcasts · grid",
              title: "Browse Podcasts",
              columns: CARD_COLUMNS,
              presentation: PRESENTATION_CARD_GRID,
              rows: filtered,
            },
            {
              label: "Action row (pick-an-item, 1 data col)",
              kicker: "Podcasts · pick",
              title: "Continue listening",
              columns: ACTION_ROW_COLUMNS,
              presentation: PRESENTATION_ACTION_ROW,
              rows: filtered,
            },
          ].map((panel) => (
            <section key={panel.label} className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                {panel.label}
              </h3>
              <div className="rounded-xl bg-muted/30 p-4 sm:p-5">
                <ListWithDetailShell<Podcast>
                  kicker={panel.kicker}
                  title={panel.title}
                  headerActions={
                    panel.presentation === "table" ? (
                      <>
                        <Button variant="outline" size="sm">
                          Import
                        </Button>
                        <Button size="sm">
                          <Plus className="mr-1 h-4 w-4" />
                          New show
                        </Button>
                      </>
                    ) : undefined
                  }
                  columns={panel.columns}
                  presentation={panel.presentation}
                  sortBy={panel.sortBy}
                  sortDirection={panel.sortDirection}
                  onSortChange={panel.onSortChange}
                  rowActions={panel.rowActions}
                  footer={panel.footer}
                  toolbar={
                    <ListWithDetailToolbar
                      searchValue={search}
                      onSearchChange={setSearch}
                      searchPlaceholder="Search shows…"
                    />
                  }
                  {...shellProps}
                  rows={isEmpty ? [] : panel.rows}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
