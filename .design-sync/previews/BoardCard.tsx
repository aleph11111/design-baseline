import * as React from "react";
import { BoardColumn, BoardCard, Badge, IconAvatar } from "design-baseline";

// Tagged cards — title + category badge + assignee avatar, the default card
// body used across the kanban-board demo. Composed inside a <BoardColumn>.
export function TaggedCards() {
  return (
    <div className="w-72 rounded-xl bg-muted/30 p-3">
      <BoardColumn title="In progress" count={2}>
        <BoardCard>
          <div className="font-medium text-foreground">Promote analytics archetype</div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="secondary">baseline</Badge>
            <IconAvatar size="xs">CB</IconAvatar>
          </div>
        </BoardCard>
        <BoardCard>
          <div className="font-medium text-foreground">Tooltip portal fix</div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="secondary">bug</Badge>
            <IconAvatar size="xs">TM</IconAvatar>
          </div>
        </BoardCard>
      </BoardColumn>
    </div>
  );
}

// A minimal card — title only, no badge/avatar row — for a quick note that
// has no owner or tag assigned yet.
export function MinimalCard() {
  return (
    <div className="w-72 rounded-xl bg-muted/30 p-3">
      <BoardColumn title="To do" count={1}>
        <BoardCard>
          <div className="font-medium text-foreground">Jot down retro notes</div>
        </BoardCard>
      </BoardColumn>
    </div>
  );
}
