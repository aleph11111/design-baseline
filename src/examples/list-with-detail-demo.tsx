import { useState } from "react";
import {
  ListWithDetailShell,
  ListWithDetailToolbar,
  type ListColumn,
} from "@/components/archetypes/list-with-detail";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Podcast = {
  id: string;
  title: string;
  host: string;
  episodeCount: number;
  lastPublishedAt: string;
  category: "interview" | "narrative" | "panel" | "solo";
};

const PODCASTS: Podcast[] = [
  {
    id: "p1",
    title: "Distributed Coffee",
    host: "Lena Pak",
    episodeCount: 142,
    lastPublishedAt: "2026-05-18",
    category: "interview",
  },
  {
    id: "p2",
    title: "Riverbed",
    host: "Olu Adebayo",
    episodeCount: 23,
    lastPublishedAt: "2026-05-20",
    category: "narrative",
  },
  {
    id: "p3",
    title: "Three Things",
    host: "Mei Tanaka",
    episodeCount: 89,
    lastPublishedAt: "2026-04-11",
    category: "panel",
  },
];

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
  },
  {
    key: "last",
    header: "Last published",
    cell: (p) => <span className="font-mono tabular-nums">{p.lastPublishedAt}</span>,
  },
  { key: "category", header: "Category", cell: (p) => p.category },
];

const PRESENTATIONS = ["table", "card-grid", "action-row"] as const;

export function ListWithDetailDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [presentation, setPresentation] =
    useState<(typeof PRESENTATIONS)[number]>("table");
  // Detail presentation: a right rail, or a slide-in drawer (Sheet on desktop).
  const [detailMode, setDetailMode] = useState<"rail" | "drawer">("drawer");

  const filtered = PODCASTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

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
        rows={filtered}
        columns={columns}
        getRowId={(p) => p.id}
        onRowSelect={(p) => setSelectedId(p.id)}
        selectedRowId={selectedId}
        presentation={presentation}
        detailPresentation={detailMode}
        detailTitle={selected?.title}
        detailActions={
          <Button size="sm" variant="outline">
            Edit
          </Button>
        }
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
