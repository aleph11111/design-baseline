/**
 * kanban-board-demo.tsx
 *
 * Reference demo for the P (kanban-board) archetype. The board chrome is
 * drag-agnostic — this demo wires plain native HTML5 drag (no library) to prove
 * cards move between columns; a real consumer can swap in dnd-kit by spreading
 * its listeners/refs onto <BoardColumn> / <BoardCard> the same way.
 */

import * as React from "react";
import { Filter, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconAvatar } from "@/components/ui/icon-avatar";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BoardShell,
  BoardColumn,
  BoardCard,
} from "@/components/archetypes/kanban-board";

type ColKey = "todo" | "doing" | "review" | "done";
const COLUMNS: { key: ColKey; title: string }[] = [
  { key: "todo", title: "To do" },
  { key: "doing", title: "In progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
];

type Card = {
  id: string;
  title: string;
  column: ColKey;
  tag: string;
  who: string;
};

const SEED: Card[] = [
  { id: "t1", title: "Wire adopt-ticket action", column: "todo", tag: "dashboard", who: "AR" },
  { id: "t2", title: "Promote analytics archetype", column: "doing", tag: "baseline", who: "CB" },
  { id: "t3", title: "Audit fleet routes", column: "done", tag: "audit", who: "CB" },
  { id: "t4", title: "Variant axes for A/C/M", column: "review", tag: "baseline", who: "AR" },
  { id: "t5", title: "Tooltip portal fix", column: "done", tag: "bug", who: "TM" },
  { id: "t6", title: "Draft import-wizard", column: "doing", tag: "baseline", who: "CB" },
];

// BoardShell/BoardColumn (src/components/archetypes/kanban-board/) have no
// loading prop — the loading plane is page-composed inside each column per
// docs/archetypes/kanban-board.md Layer 7 ("column skeletons; never a single
// page spinner").
function BoardCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-md border bg-card p-3" aria-hidden>
      <Skeleton className="h-3.5 w-3/4" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export function KanbanBoardDemo(): React.ReactElement {
  const [cards, setCards] = React.useState<Card[]>(SEED);
  const [over, setOver] = React.useState<ColKey | null>(null);
  const [state, setState] = React.useState<"Loaded" | "Loading">("Loaded");
  const [query, setQuery] = React.useState("");

  function move(id: string, to: ColKey) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column: to } : c)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-prose text-sm text-muted-foreground">
          <strong>State</strong> — loading renders column skeletons in place
          of cards; <code>BoardShell</code>/<code>BoardColumn</code> have no
          loading prop of their own.
        </p>
        <SegmentedControl
          aria-label="Board state"
          value={state}
          onValueChange={setState}
          options={[
            { value: "Loaded", label: "Loaded" },
            { value: "Loading", label: "Loading" },
          ]}
        />
      </div>

      {/* Plex Ledger board form: title + actions sit ON the bounded surface
         (SurfaceHeader), one frame on a muted mat. */}
      <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
        <BoardShell
          kicker="Board"
          title="Delivery board"
          headerActions={
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add card
            </Button>
          }
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search cards"
              />
              <Button variant="outline" size="sm">
                <Filter className="mr-1 h-4 w-4" />
                Filter
              </Button>
            </div>
          }
        >
          {COLUMNS.map((col) => {
            const colCards = cards.filter(
              (c) =>
                c.column === col.key &&
                c.title.toLowerCase().includes(query.toLowerCase()),
            );
            return (
              <BoardColumn
                key={col.key}
                title={col.title}
                count={state === "Loading" ? undefined : colCards.length}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Add to ${col.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(col.key);
                }}
                onDragLeave={() => setOver((o) => (o === col.key ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) move(id, col.key);
                  setOver(null);
                }}
                className={over === col.key ? "ring-2 ring-ring" : undefined}
              >
                {state === "Loading" ? (
                  <>
                    <BoardCardSkeleton />
                    <BoardCardSkeleton />
                  </>
                ) : (
                  <>
                    {colCards.map((c) => (
                      <BoardCard
                        key={c.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                      >
                        <div className="font-medium text-foreground">{c.title}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="secondary">{c.tag}</Badge>
                          <IconAvatar size="xs">{c.who}</IconAvatar>
                        </div>
                      </BoardCard>
                    ))}
                    {colCards.length === 0 && (
                      <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                        Drop here
                      </div>
                    )}
                  </>
                )}
              </BoardColumn>
            );
          })}
        </BoardShell>
      </div>
    </div>
  );
}
