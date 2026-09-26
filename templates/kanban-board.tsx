// Scaffolded by `design-baseline new-page kanban-board __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/kanban-board.md
import {
  BoardShell,
  BoardColumn,
  BoardCard,
} from "design-baseline/archetypes/kanban-board";
import { StateView } from "@/components/ui/state-view";

type __Name__Card = { id: string; title: string };
type __Name__Column = { id: string; title: string; cards: __Name__Card[] };

// TODO: replace with the page's real data hook.
function use__Name__Board(): {
  columns: __Name__Column[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  return { columns: [], isLoading: false, error: null, refetch: () => {} };
}

export function __Name__Page() {
  const { columns, isLoading, error, refetch } = use__Name__Board();

  return (
    <BoardShell title="__Name__">
      {/* The board's column shape is known ahead of the fetch, so column
          skeletons may replace the text loader via `loadingSkeleton`. */}
      {isLoading ? (
        <StateView variant="loading" />
      ) : error != null ? (
        <StateView variant="error" error={error} onRetry={refetch} />
      ) : columns.length === 0 ? (
        <StateView variant="empty" message="No __Name__ yet" />
      ) : (
        columns.map((column) => (
          <BoardColumn
            key={column.id}
            title={column.title}
            count={column.cards.length}
            empty={column.cards.length === 0}
          >
            {column.cards.map((card) => (
              <BoardCard key={card.id}>{card.title}</BoardCard>
            ))}
          </BoardColumn>
        ))
      )}
    </BoardShell>
  );
}
