import * as React from "react";
import { ListSkeleton } from "@/components/archetypes/skeleton-loader";
import { StateView } from "@/components/ui/state-view";
import { Button } from "@/components/ui/button";

/**
 * skeleton-loader demo — a podcast library (domain deliberately far from any
 * source project). Types are defined here first, then fed to ListSkeleton; the
 * primitive never sees a domain type, only `rows`/`columns`/`avatar` knobs.
 *
 * Toggle "Reload" to watch each surface swap to its skeleton and back.
 */

interface Episode {
  id: string;
  title: string;
  show: string;
}

interface Download {
  id: string;
  episode: string;
  size: string;
  status: string;
}

const EPISODES: Episode[] = [
  { id: "e1", title: "The Deep-Sea Cable That Broke the Internet", show: "Undersea" },
  { id: "e2", title: "Why Sourdough Went Feral in 2020", show: "Kitchen Table" },
  { id: "e3", title: "A Field Guide to Office Plants", show: "Green Desk" },
  { id: "e4", title: "The Last Blockbuster", show: "Rewind" },
];

const DOWNLOADS: Download[] = [
  { id: "d1", episode: "Deep-Sea Cable", size: "48 MB", status: "Done" },
  { id: "d2", episode: "Feral Sourdough", size: "51 MB", status: "Done" },
  { id: "d3", episode: "Office Plants", size: "39 MB", status: "Queued" },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="border-b px-4 py-2 text-sm font-medium text-foreground">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function SkeletonLoaderDemo(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);

  // Simulate a fetch: flip to loaded shortly after each reload.
  React.useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Podcast library</h1>
          <p className="text-sm text-muted-foreground">
            Each surface shows a <code>ListSkeleton</code> while loading, then the real content.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLoading(true)} disabled={loading}>
          {loading ? "Loading…" : "Reload"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Avatar rows — the primitive owns the loading plane directly. */}
        <Panel title="Episodes (avatar rows)">
          {loading ? (
            <ListSkeleton rows={4} avatar label="Loading episodes…" />
          ) : (
            <ul className="space-y-3">
              {EPISODES.map((ep) => (
                <li key={ep.id} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                    {ep.show.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{ep.title}</p>
                    <p className="text-xs text-muted-foreground">{ep.show}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Table grid — routed through StateView's loadingSkeleton slot. */}
        <Panel title="Downloads (table, via StateView)">
          {loading ? (
            <StateView
              variant="loading"
              loadingSkeleton={<ListSkeleton rows={3} columns={3} showHeader label="Loading downloads…" />}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Episode</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {DOWNLOADS.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="py-2">{d.episode}</td>
                    <td className="py-2 tabular-nums">{d.size}</td>
                    <td className="py-2 text-muted-foreground">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      {/* Plain stacked rows, always shown, so the base shape is visible. */}
      <Panel title="Stacked rows (base shape)">
        <ListSkeleton rows={3} />
      </Panel>
    </div>
  );
}

SkeletonLoaderDemo.displayName = "SkeletonLoaderDemo";
