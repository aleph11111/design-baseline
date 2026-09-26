// Scaffolded by `design-baseline new-page feed-inbox __Name__`.
// Contract: node_modules/design-baseline/docs/archetypes/feed-inbox.md
import { FeedShell, FeedItem } from "design-baseline/archetypes/feed-inbox";

type __Name__Item = { id: string; title: string; unread: boolean };

// TODO: replace with the page's real data hook.
function use__Name__Items(): { items: __Name__Item[]; isLoading: boolean } {
  return { items: [], isLoading: false };
}

export function __Name__Page() {
  const { items, isLoading } = use__Name__Items();

  return (
    <FeedShell
      title="__Name__"
      // TODO: the consumer's state-view (variant="empty"), per the contract.
      empty={items.length === 0 && !isLoading ? "Nothing here" : undefined}
    >
      {/* TODO: while loading, render a few skeleton rows (never a spinner). */}
      {items.map((item) => (
        <FeedItem key={item.id} title={item.title} unread={item.unread} />
      ))}
    </FeedShell>
  );
}
