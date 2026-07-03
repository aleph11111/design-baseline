import * as React from "react";
import { ListWithDetailShell, ListWithDetailToolbar, Badge, Button, type ListColumn } from "design-baseline";
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
  { id: "p1", title: "Distributed Coffee", host: "Lena Pak", episodeCount: 142, lastPublishedAt: "2026-05-18", category: "interview", isActive: true },
  { id: "p2", title: "Riverbed", host: "Olu Adebayo", episodeCount: 23, lastPublishedAt: "2026-05-20", category: "narrative", isActive: true },
  { id: "p3", title: "Three Things", host: "Mei Tanaka", episodeCount: 89, lastPublishedAt: "2026-04-11", category: "panel", isActive: false },
];

const CATEGORY_LABELS: Record<Podcast["category"], string> = {
  interview: "Interview",
  narrative: "Narrative",
  panel: "Panel",
  solo: "Solo",
};

const columns: ListColumn<Podcast>[] = [
  { key: "title", header: "Show", cell: (p) => p.title, isIdentifier: true, identifierMono: false },
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
  {
    key: "category",
    header: "Category",
    cell: (p) => <Badge variant="secondary">{CATEGORY_LABELS[p.category]}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    cell: (p) => (
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${p.isActive ? "bg-primary" : "bg-muted-foreground"}`} />
        <span className="text-[13px] text-foreground">{p.isActive ? "Active" : "On hiatus"}</span>
      </span>
    ),
  },
];

// Table presentation + a right detail rail — the default master/detail form.
// One row is selected so the rail shows real content next to the table.
export function PodcastLibraryTable() {
  const selected = PODCASTS[0]!;
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
        rows={PODCASTS}
        columns={columns}
        getRowId={(p) => p.id}
        selectedRowId={selected.id}
        onRowSelect={() => {}}
        toolbar={
          <ListWithDetailToolbar
            searchValue=""
            onSearchChange={() => {}}
            searchPlaceholder="Search shows…"
          />
        }
        detailTitle={selected.title}
        detailActions={
          <Button size="sm" variant="outline">
            Edit
          </Button>
        }
        detail={
          <div className="p-5">
            <p className="text-[13px] text-muted-foreground">by {selected.host}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              <span className="font-mono tabular-nums">{selected.episodeCount}</span> episodes ·{" "}
              {selected.category}
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Last published{" "}
              <span className="font-mono tabular-nums">{selected.lastPublishedAt}</span>
            </p>
          </div>
        }
      />
    </div>
  );
}

// card-grid presentation — rows as cards (identifier as title, remaining
// columns as label/value pairs), for browse-y lists.
export function PodcastLibraryCardGrid() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <ListWithDetailShell<Podcast>
        kicker="Podcasts"
        title="Podcast Library"
        rows={PODCASTS}
        columns={columns}
        getRowId={(p) => p.id}
        presentation="card-grid"
        toolbar={
          <ListWithDetailToolbar
            searchValue=""
            onSearchChange={() => {}}
            searchPlaceholder="Search shows…"
          />
        }
      />
    </div>
  );
}

// action-row presentation — full-width stacked rows with a chevron, the
// mobile / pick-an-item shape.
export function PodcastLibraryActionRow() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <ListWithDetailShell<Podcast>
        kicker="Podcasts"
        title="Podcast Library"
        rows={PODCASTS}
        columns={columns}
        getRowId={(p) => p.id}
        presentation="action-row"
        onRowSelect={() => {}}
      />
    </div>
  );
}
