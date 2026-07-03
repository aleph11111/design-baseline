import * as React from "react";
import { BoardShell, BoardColumn, BoardCard, Badge, IconAvatar, Button } from "design-baseline";
import { Plus } from "lucide-react";

// Two populated columns side by side inside the board's horizontal scroll
// row — the overline header (title + count + trailing add-card action) over
// a card stack, as it renders inside <BoardShell>.
export function ActiveColumns() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <BoardShell>
        <BoardColumn
          title="In progress"
          count={2}
          actions={
            <Button variant="ghost" size="icon" aria-label="Add to In progress">
              <Plus className="h-4 w-4" />
            </Button>
          }
        >
          <BoardCard>
            <div className="font-medium text-foreground">Promote analytics archetype</div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">baseline</Badge>
              <IconAvatar size="xs">CB</IconAvatar>
            </div>
          </BoardCard>
          <BoardCard>
            <div className="font-medium text-foreground">Draft import-wizard</div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">baseline</Badge>
              <IconAvatar size="xs">CB</IconAvatar>
            </div>
          </BoardCard>
        </BoardColumn>
        <BoardColumn title="Review" count={1}>
          <BoardCard>
            <div className="font-medium text-foreground">Variant axes for A/C/M</div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">baseline</Badge>
              <IconAvatar size="xs">AR</IconAvatar>
            </div>
          </BoardCard>
        </BoardColumn>
      </BoardShell>
    </div>
  );
}

// An empty column (no count, dashed "Drop here" placeholder) next to a
// filled "Done" column — the column's own empty affordance in context.
export function EmptyAndDoneColumns() {
  return (
    <div className="rounded-xl bg-muted/30 p-4 sm:p-6">
      <BoardShell>
        <BoardColumn title="Blocked">
          <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
            Drop here
          </div>
        </BoardColumn>
        <BoardColumn title="Done" count={2}>
          <BoardCard>
            <div className="font-medium text-foreground">Audit fleet routes</div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">audit</Badge>
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
      </BoardShell>
    </div>
  );
}
