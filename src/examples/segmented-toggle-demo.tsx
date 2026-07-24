import * as React from "react";
import { List, LayoutGrid, Clock, Star } from "lucide-react";
import { SegmentedControl } from "@/components/archetypes/segmented-toggle";

/**
 * segmented-toggle demo — a music-library view switcher (domain deliberately far from any
 * source project: no inventory / CRM / finance / controlling nouns). Types are defined here
 * FIRST, then fed to SegmentedControl; the primitive never sees a domain type — only its
 * generic value / options props.
 *
 * Two toggles, the two canonical uses: a VIEW MODE (List · Grid · Timeline) that changes how
 * the collection renders, and a FILTER (All · Starred) that narrows it. Both are compact,
 * always-selected, single-choice — exactly what SegmentedControl owns. Plain controlled state.
 */

type ViewMode = "list" | "grid" | "timeline";
type Filter = "all" | "starred";

interface Album {
  title: string;
  artist: string;
  year: number;
  starred: boolean;
}

const ALBUMS: Album[] = [
  { title: "Blue Reverie", artist: "Marg Vale", year: 2019, starred: true },
  { title: "Paper Cities", artist: "The Longshore", year: 2021, starred: false },
  { title: "Tidal Fen", artist: "Osk", year: 2018, starred: true },
  { title: "Northlight", artist: "Aria Bloom", year: 2023, starred: false },
  { title: "Slow Harbour", artist: "Cove & Kline", year: 2020, starred: true },
];

const VIEW_OPTIONS = [
  { value: "list" as const, label: "List", icon: List },
  { value: "grid" as const, label: "Grid", icon: LayoutGrid },
  { value: "timeline" as const, label: "Timeline", icon: Clock },
];

const FILTER_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "starred" as const, label: "Starred", icon: Star },
];

export function SegmentedToggleDemo(): React.ReactElement {
  const [view, setView] = React.useState<ViewMode>("grid");
  const [filter, setFilter] = React.useState<Filter>("all");

  const albums = filter === "starred" ? ALBUMS.filter((a) => a.starred) : ALBUMS;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Record shelf</h1>
        <p className="text-sm text-muted-foreground">
          Both toggles are a <code>SegmentedControl</code> — one compact, accessible,
          on-token single-choice switch (radiogroup keyboarding, arrow keys to move) instead
          of a hand-rolled row of buttons.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          aria-label="Filter albums"
          value={filter}
          onValueChange={setFilter}
          options={FILTER_OPTIONS}
        />
        <SegmentedControl
          aria-label="Library view"
          value={view}
          onValueChange={setView}
          options={VIEW_OPTIONS}
        />
      </div>

      {view === "grid" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {albums.map((a) => (
            <div key={a.title} className="rounded-md border p-3">
              <div className="aspect-square rounded bg-muted" />
              <p className="mt-2 truncate text-sm font-medium">{a.title}</p>
              <p className="truncate text-xs text-muted-foreground">{a.artist}</p>
            </div>
          ))}
        </div>
      )}

      {view === "list" && (
        <ul className="divide-y rounded-md border">
          {albums.map((a) => (
            <li key={a.title} className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium">{a.title}</span>
              <span className="text-xs text-muted-foreground">{a.artist}</span>
            </li>
          ))}
        </ul>
      )}

      {view === "timeline" && (
        <ol className="space-y-2">
          {[...albums]
            .sort((a, b) => a.year - b.year)
            .map((a) => (
              <li key={a.title} className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {a.year}
                </span>
                <span className="text-sm font-medium">{a.title}</span>
                <span className="text-xs text-muted-foreground">· {a.artist}</span>
              </li>
            ))}
        </ol>
      )}
    </div>
  );
}

SegmentedToggleDemo.displayName = "SegmentedToggleDemo";
