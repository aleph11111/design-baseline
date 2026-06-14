/**
 * kanban-board-demo.tsx
 *
 * Reference demo for the P (kanban-board) archetype. The board chrome is
 * drag-agnostic — this demo wires plain native HTML5 drag (no library) to prove
 * cards move between columns; a real consumer can swap in dnd-kit by spreading
 * its listeners/refs onto <BoardColumn> / <BoardCard> the same way.
 */

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
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

export function KanbanBoardDemo(): React.ReactElement {
  const [cards, setCards] = React.useState<Card[]>(SEED);
  const [over, setOver] = React.useState<ColKey | null>(null);

  function move(id: string, to: ColKey) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column: to } : c)));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery board" subtitle="Drag cards between columns." />

      <BoardShell>
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col.key);
          return (
            <BoardColumn
              key={col.key}
              title={col.title}
              count={colCards.length}
              actions={
                <button
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Add to ${col.title}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
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
              {colCards.map((c) => (
                <BoardCard
                  key={c.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                >
                  <div className="font-medium text-foreground">{c.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="secondary">{c.tag}</Badge>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                      {c.who}
                    </span>
                  </div>
                </BoardCard>
              ))}
              {colCards.length === 0 && (
                <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                  Drop here
                </div>
              )}
            </BoardColumn>
          );
        })}
      </BoardShell>
    </div>
  );
}
