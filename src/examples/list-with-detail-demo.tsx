import { useState } from "react";
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
// per-page color map. Only secondary/outline are used to keep the category
// axis visually quiet next to the binary status dot.
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

const columns: ListColumn<Podcast>[] = [
  {
    key: "title",
    header: "Show",
    cell: (p) => p.title,
    isIdentifier: true,
    identifierMono: false,
  },
  { key: "host", header: "Host", cell: (p) => p.host },
  {
    key: "episodes",
    header: "Episodes",
    cell: (p) => <span className="font-mono tabular-nums">{p.episodeCount}</span>,
    align: "right",
    sortable: true,
    sortFn: (a, b) => a.episodeCount - b.episodeCount,
  },
  {
    key: "last",
    header: "Last published",
    cell: (p) => <span className="font-mono tabular-nums">{p.lastPublishedAt}</span>,
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
  },
  {
    key: "status",
    header: "Status",
    // Binary toggle (Layer 6) — token-pure dot + label text.
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
  },
];

const PRESENTATIONS = ["table", "card-grid", "action-row"] as const;
const STATES = ["loaded", "loading", "error"] as const;

export function ListWithDetailDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [presentation, setPresentation] =
    useState<(typeof PRESENTATIONS)[number]>("table");
  // Detail presentation: a right rail, or a slide-in drawer (Sheet on desktop).
  const [detailMode, setDetailMode] = useState<"rail" | "drawer">("drawer");
  // State plane: exercises the shell's loading/error StateView, driven by
  // isLoading/error/onRetry (Layer 7).
  const [state, setState] = useState<(typeof STATES)[number]>("loaded");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filtered = PODCASTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const sortCol = columns.find((c) => c.key === sortBy);
  const sorted = sortCol?.sortFn
    ? [...filtered].sort(
        sortDirection === "asc"
          ? sortCol.sortFn
          : (a, b) => -sortCol.sortFn!(a, b),
      )
    : filtered;

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

  const isLoading = state === "loading";
  const error = state === "error" ? new Error("Failed to load podcasts.") : null;

  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <ListWithDetailShell<Podcast>
        kicker="Podcasts"
        title="Podcast Library"
        headerActions={
          <>
            <Button variant="outline" size="sm">
              Import
            </Button>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New show
            </Button>
          </>
        }
        rows={sorted}
        columns={columns}
        getRowId={(p) => p.id}
        onRowSelect={(p) => setSelectedId(p.id)}
        selectedRowId={selectedId}
        presentation={presentation}
        detailPresentation={detailMode}
        onDetailClose={() => setSelectedId(null)}
        detailTitle={selected?.title}
        detailActions={
          <Button size="sm" variant="outline">
            Edit
          </Button>
        }
        isLoading={isLoading}
        error={error}
        onRetry={() => setState("loaded")}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(nextSortBy, nextDirection) => {
          setSortBy(nextSortBy);
          setSortDirection(nextDirection);
        }}
        toolbar={
          <ListWithDetailToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search shows…"
            pageActions={
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedControl
                  value={presentation}
                  onValueChange={(v) =>
                    setPresentation(v as (typeof PRESENTATIONS)[number])
                  }
                  options={PRESENTATIONS.map((p) => ({ value: p, label: p }))}
                  aria-label="Presentation"
                />
                <SegmentedControl
                  value={detailMode}
                  onValueChange={(v) => setDetailMode(v as "rail" | "drawer")}
                  options={[
                    { value: "rail", label: "Rail" },
                    { value: "drawer", label: "Drawer" },
                  ]}
                  aria-label="Detail"
                />
                <SegmentedControl
                  value={state}
                  onValueChange={(v) => setState(v as (typeof STATES)[number])}
                  options={[
                    { value: "loaded", label: "Loaded" },
                    { value: "loading", label: "Loading" },
                    { value: "error", label: "Error" },
                  ]}
                  aria-label="State"
                />
              </div>
            }
          />
        }
        detail={
          selected ? (
            <div className="p-5">
              <p className="text-muted-foreground text-[13px]">by {selected.host}</p>
              <p className="text-muted-foreground text-[13px] mt-2">
                <span className="font-mono tabular-nums">
                  {selected.episodeCount}
                </span>{" "}
                episodes · {selected.category}
              </p>
              <p className="text-muted-foreground text-[13px] mt-2">
                Last published{" "}
                <span className="font-mono tabular-nums">
                  {selected.lastPublishedAt}
                </span>
              </p>
            </div>
          ) : (
            <div className="p-5 text-muted-foreground text-[13px]">
              Select a show to see details.
            </div>
          )
        }
      />
    </div>
  );
}
