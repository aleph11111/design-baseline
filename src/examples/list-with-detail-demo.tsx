import { useState } from "react";
import {
  ListWithDetailShell,
  ListWithDetailToolbar,
  type ListColumn,
} from "@/components/archetypes/list-with-detail";

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
    cell: (p) => p.episodeCount,
    align: "right",
  },
  { key: "last", header: "Last published", cell: (p) => p.lastPublishedAt },
  { key: "category", header: "Category", cell: (p) => p.category },
];

export function ListWithDetailDemo() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = PODCASTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

  return (
    <ListWithDetailShell<Podcast>
      rows={filtered}
      columns={columns}
      getRowId={(p) => p.id}
      onRowSelect={(p) => setSelectedId(p.id)}
      selectedRowId={selectedId}
      toolbar={
        <ListWithDetailToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search shows…"
        />
      }
      detail={
        selected ? (
          <div className="p-4">
            <h3 className="font-medium">{selected.title}</h3>
            <p className="text-muted-foreground text-sm">by {selected.host}</p>
            <p className="text-muted-foreground text-sm mt-2">
              {selected.episodeCount} episodes · {selected.category}
            </p>
          </div>
        ) : (
          <div className="p-4 text-muted-foreground text-sm">
            Select a show to see details.
          </div>
        )
      }
    />
  );
}
