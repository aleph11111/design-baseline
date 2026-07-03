import * as React from "react";
import { Filter, Plus } from "lucide-react";
import { BoardShell, BoardColumn, BoardCard, Badge, Button, IconAvatar } from "design-baseline";

type ColKey = "todo" | "doing" | "review" | "done";
const COLUMNS: { key: ColKey; title: string }[] = [
  { key: "todo", title: "To do" },
  { key: "doing", title: "In progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
];

type Card = { id: string; title: string; column: ColKey; tag: string; who: string };

const CARDS: Card[] = [
  { id: "t1", title: "Wire adopt-ticket action", column: "todo", tag: "dashboard", who: "AR" },
  { id: "t2", title: "Promote analytics archetype", column: "doing", tag: "baseline", who: "CB" },
  { id: "t3", title: "Draft import-wizard", column: "doing", tag: "baseline", who: "CB" },
  { id: "t4", title: "Variant axes for A/C/M", column: "review", tag: "baseline", who: "AR" },
  { id: "t5", title: "Audit fleet routes", column: "done", tag: "audit", who: "CB" },
  { id: "t6", title: "Tooltip portal fix", column: "done", tag: "bug", who: "TM" },
];

// Full delivery board — on-surface header (kicker + title + Filter/Add card
// actions) over four columns, ported from the kanban-board demo's seed data.
export function DeliveryBoard() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <BoardShell
        kicker="Board"
        title="Delivery board"
        headerActions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add card
            </Button>
          </>
        }
      >
        {COLUMNS.map((col) => {
          const colCards = CARDS.filter((c) => c.column === col.key);
          return (
            <BoardColumn
              key={col.key}
              title={col.title}
              count={colCards.length}
              actions={
                <Button variant="ghost" size="icon" aria-label={`Add to ${col.title}`}>
                  <Plus className="h-4 w-4" />
                </Button>
              }
            >
              {colCards.map((c) => (
                <BoardCard key={c.id}>
                  <div className="font-medium text-foreground">{c.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="secondary">{c.tag}</Badge>
                    <IconAvatar size="xs">{c.who}</IconAvatar>
                  </div>
                </BoardCard>
              ))}
            </BoardColumn>
          );
        })}
      </BoardShell>
    </div>
  );
}

// Two-column personal backlog, no header actions — the "Blocked" column is
// empty, showing the column's own dashed drop affordance next to real cards.
export function PersonalBacklog() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <BoardShell kicker="My work" title="This sprint">
        <BoardColumn title="Doing" count={1}>
          <BoardCard>
            <div className="font-medium text-foreground">Finish onboarding checklist copy</div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">onboarding</Badge>
              <IconAvatar size="xs">CB</IconAvatar>
            </div>
          </BoardCard>
        </BoardColumn>
        <BoardColumn title="Blocked" count={0}>
          <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
            Nothing blocked
          </div>
        </BoardColumn>
      </BoardShell>
    </div>
  );
}
